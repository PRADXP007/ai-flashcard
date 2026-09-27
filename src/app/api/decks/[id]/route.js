import { NextResponse } from 'next/server';
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    
    const docRef = doc(db, "decks", id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }
    
    const deck = {
      _id: docSnap.id,
      ...docSnap.data()
    };
    
    return NextResponse.json({ deck });
  } catch (error) {
    console.error("Failed to fetch deck:", error);
    return NextResponse.json({ error: 'Failed to fetch deck' }, { status: 500 });
  }
}
