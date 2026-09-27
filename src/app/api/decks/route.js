import { NextResponse } from 'next/server';
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET() {
  try {
    const q = query(
      collection(db, "decks"),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    
    const querySnapshot = await getDocs(q);
    const decks = [];
    
    querySnapshot.forEach((doc) => {
      // document id needs to be mapped to _id for the frontend
      const data = doc.data();
      decks.push({
        _id: doc.id,
        ...data
      });
    });

    return NextResponse.json({ decks });
  } catch (error) {
    console.error("Failed to fetch decks:", error);
    return NextResponse.json({ error: 'Failed to fetch decks' }, { status: 500 });
  }
}
