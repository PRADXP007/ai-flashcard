import { NextResponse } from "next/server";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const prompt = `You are an expert tutor creating study materials. 
    Analyze the following text and generate exactly 5-10 high-quality flashcards based on it.
    Return a JSON object containing a 'title' (a short title for the deck) and a 'cards' array.
    Each item in the 'cards' array should have 'question' and 'answer' properties.
    Ensure questions are clear and answers are concise but informative.

    Text:
    ${content}
    `;

    // Define the expected schema for Structured Outputs
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "A short, descriptive title for the flashcard deck",
        },
        cards: {
          type: Type.ARRAY,
          description: "List of generated flashcards",
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: "The question for the flashcard",
              },
              answer: {
                type: Type.STRING,
                description: "The answer for the flashcard",
              },
            },
            required: ["question", "answer"],
          },
        },
      },
      required: ["title", "cards"],
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      }
    });

    const resultText = response.text;
    const parsedResponse = JSON.parse(resultText);

    if (!parsedResponse.cards || !parsedResponse.title) {
      throw new Error("Invalid format from Gemini");
    }

    // Save to Firebase Firestore
    const deckData = {
      title: parsedResponse.title,
      contentSource: content.substring(0, 500), // save a snippet
      cards: parsedResponse.cards,
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, "decks"), deckData);

    return NextResponse.json({ deckId: docRef.id }, { status: 201 });
  } catch (error) {
    console.error("Generate Error:", error);
    return NextResponse.json(
      { error: "Failed to generate flashcards" },
      { status: 500 }
    );
  }
}
