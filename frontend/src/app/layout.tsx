import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verifiable RAG",
  description:
    "Trace every AI-extracted metric back to its exact source in the original document.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
