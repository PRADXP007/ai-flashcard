import "./globals.css";

export const metadata = {
  title: "AI Flashcards Generator",
  description: "Generate beautiful spaced-repetition flashcards from your notes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
