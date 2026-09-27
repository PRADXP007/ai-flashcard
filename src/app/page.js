"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, BookOpen } from "lucide-react";
import styles from "./page.module.css";

export default function Home() {
  const [content, setContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [decks, setDecks] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      const res = await fetch("/api/decks");
      if (res.ok) {
        const data = await res.json();
        setDecks(data.decks);
      }
    } catch (error) {
      console.error("Failed to fetch decks", error);
    }
  };

  const handleGenerate = async () => {
    if (!content.trim()) return;
    
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      
      if (res.ok) {
        const data = await res.json();
        router.push(`/deck/${data.deckId}`);
      } else {
        alert("Failed to generate flashcards.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container">
      <header className={styles.hero}>
        <h1 className={styles.title}>AI Flashcard Generator</h1>
        <p className={styles.subtitle}>
          Paste your study notes or articles below, and we'll automatically generate a beautifully designed spaced-repetition flashcard deck using AI.
        </p>
      </header>

      <main>
        <section className={`card ${styles.generatorCard}`}>
          <textarea
            className={`input-field ${styles.textArea}`}
            placeholder="Paste your notes, article, or content here to convert them into Q&A flashcards..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isGenerating}
          />
          <div className={styles.formFooter}>
            <span className={styles.status}>
              {content.length > 0 ? `${content.length} characters` : ""}
            </span>
            <button
              className="btn-primary"
              onClick={handleGenerate}
              disabled={isGenerating || !content.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className={styles.loader} size={18} />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Flashcards
                </>
              )}
            </button>
          </div>
        </section>

        {decks.length > 0 && (
          <section className={styles.decksSection}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Your Recent Decks</h2>
            <div className={styles.decksGrid}>
              {decks.map((deck) => (
                <a key={deck._id} href={`/deck/${deck._id}`} className={`card ${styles.deckCard}`}>
                  <div>
                    <h3 className={styles.deckTitle}>{deck.title}</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
                      Generated on {new Date(deck.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={styles.deckMeta}>
                    <BookOpen size={16} />
                    <span>{deck.cards.length} cards</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
