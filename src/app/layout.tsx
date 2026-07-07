import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumina AI | Smart Document AI",
  description: "Advanced RAG analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased flex flex-col min-h-screen bg-white text-black">
        <main className="flex-1 flex flex-col relative w-full h-full animate-fadeIn">
          {children}
        </main>
      </body>
    </html>
  );
}
