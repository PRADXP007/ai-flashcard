"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, RotateCcw, Home } from "lucide-react";
import styles from "./page.module.css";

export default function DeckPage() {
  const { id } = useParams();
  const router = useRouter();
  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const fetchDeck = async () => {
      try {
        const res = await fetch(`/api/decks/${id}`);
        if (res.ok) {
          const data = await res.json();
          setDeck(data.deck);
        } else {
          console.error("Deck not found");
        }
      } catch (error) {
        console.error("Error fetching deck", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchDeck();
    }
  }, [id]);

  if (loading) {
    return (
      <div className={styles.loader}>
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (!deck || !deck.cards || deck.cards.length === 0) {
    return (
      <div className={styles.error}>
        <h2>Deck not found or empty</h2>
        <button className="btn-primary" style={{ marginTop: "1rem" }} onClick={() => router.push("/")}>
          <Home size={18} /> Go Home
        </button>
      </div>
    );
  }

  const currentCard = deck.cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < deck.cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }, 150); // slight delay for animation
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }, 150);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => router.push("/")} className="btn-primary" style={{ background: "transparent", color: "var(--foreground)", border: "1px solid var(--border)" }}>
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className={styles.title}>{deck.title}</h1>
        <div className={styles.progress}>
          {currentIndex + 1} / {deck.cards.length}
        </div>
      </header>

      <div className={styles.flashcardContainer} onClick={() => setIsFlipped(!isFlipped)}>
        <motion.div
          className={styles.flashcard}
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        >
          {/* Front of Card */}
          <div className={`${styles.cardFace} ${styles.cardFaceFront}`}>
            <span className={styles.label}>Question</span>
            <div className={styles.content}>{currentCard.question}</div>
          </div>
          
          {/* Back of Card */}
          <div className={`${styles.cardFace} ${styles.cardFaceBack}`}>
            <span className={styles.label}>Answer</span>
            <div className={styles.content}>{currentCard.answer}</div>
          </div>
        </motion.div>
      </div>

      <div className={styles.controls}>
        <button 
          className={styles.btnSecondary} 
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          disabled={currentIndex === 0}
          aria-label="Previous card"
        >
          <ArrowLeft size={24} />
        </button>
        
        <button 
          className={styles.btnSecondary}
          onClick={(e) => { e.stopPropagation(); setIsFlipped(!isFlipped); }}
          aria-label="Flip card"
        >
          <RotateCcw size={24} />
        </button>
        
        <button 
          className={styles.btnSecondary} 
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          disabled={currentIndex === deck.cards.length - 1}
          aria-label="Next card"
        >
          <ArrowRight size={24} />
        </button>
      </div>

      <p className={styles.hint}>Click the card or the flip button to reveal the answer</p>
    </div>
  );
}
