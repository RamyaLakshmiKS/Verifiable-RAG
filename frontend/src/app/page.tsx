"use client";

import { useEffect, useState } from "react";
import { MetricsPanel } from "@/components/MetricsPanel";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { AnalysisResult, Metric } from "@/types";

const API = "http://localhost:8000";

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeMetric, setActiveMetric] = useState<Metric | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"live" | "demo" | null>(null);

  // Pre-fill the demo transcript on mount
  useEffect(() => {
    fetch(`${API}/demo-transcript`)
      .then((r) => r.json())
      .then((d) => setTranscript(d.transcript))
      .catch(() => {
        // Backend not running yet — show placeholder
        setTranscript(
          "Start the backend (uvicorn main:app --reload) and refresh."
        );
      });

    fetch(`${API}/health`)
      .then((r) => r.json())
      .then((d) => setMode(d.mode))
      .catch(() => {});
  }, []);

  async function analyze() {
    setLoading(true);
    setError(null);
    setResult(null);
    setActiveMetric(null);

    try {
      const res = await fetch(`${API}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail ?? "Unknown error");
      }

      const data: AnalysisResult = await res.json();
      setResult(data);
      setMode(data.mode);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to reach backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 16 16"
              fill="none"
            >
              <rect x="1" y="1" width="6" height="14" rx="1" fill="white" opacity="0.4"/>
              <rect x="9" y="4" width="6" height="3" rx="0.5" fill="white"/>
              <rect x="9" y="9" width="6" height="3" rx="0.5" fill="white"/>
            </svg>
          </div>
          <div>
            <span className="font-semibold text-slate-900">Verifiable RAG</span>
            <span className="ml-2 text-xs text-slate-400">
              AI with a paper trail
            </span>
          </div>
        </div>

        {mode && (
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
              mode === "live"
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-slate-100 text-slate-500 border-slate-200"
            }`}
          >
            {mode === "live" ? "Live (Anthropic API)" : "Demo mode"}
          </span>
        )}
      </header>

      {/* ── How it works banner ─────────────────────────────────── */}
      <div className="bg-blue-600 text-white px-6 py-3 text-sm flex items-center gap-2">
        <span className="opacity-70">How it works:</span>
        <span className="opacity-90">
          1. Paste a transcript below
        </span>
        <span className="opacity-50 mx-1">→</span>
        <span className="opacity-90">2. Click Analyze</span>
        <span className="opacity-50 mx-1">→</span>
        <span className="opacity-90">
          3. Hover any metric to highlight its exact source
        </span>
        <span className="opacity-50 mx-1">→</span>
        <span className="opacity-90">
          4. Unverified rows flag potential hallucinations
        </span>
      </div>

      {/* ── Main ────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
        {/* Input card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">
              Input Transcript
            </h2>
            <button
              onClick={analyze}
              disabled={loading || !transcript.trim()}
              className="
                px-4 py-1.5 text-sm font-medium rounded-lg
                bg-blue-600 text-white
                hover:bg-blue-700 active:bg-blue-800
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-colors duration-150
              "
            >
              {loading ? "Analyzing…" : "Analyze →"}
            </button>
          </div>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={6}
            placeholder="Paste an expert call transcript, earnings call, or any financial text…"
            className="
              w-full px-5 py-4 text-sm font-mono text-slate-700
              placeholder:text-slate-300 resize-none
              focus:outline-none bg-white
            "
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="grid grid-cols-2 gap-5 flex-1" style={{ minHeight: "420px" }}>
            <MetricsPanel
              metrics={result.metrics}
              activeMetric={activeMetric}
              onHover={setActiveMetric}
            />
            <TranscriptPanel
              transcript={result.transcript}
              activeMetric={activeMetric}
            />
          </div>
        )}

        {/* Explainer — shown before first analysis */}
        {!result && !loading && (
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                step: "01",
                title: "Extract",
                body: "The AI reads the transcript and pulls out every financial metric it finds, along with the exact substring it used as evidence.",
              },
              {
                step: "02",
                title: "Verify",
                body: "The backend does a literal string search: if the quote doesn't exist verbatim in the source, the metric is flagged as unverified.",
              },
              {
                step: "03",
                title: "Highlight",
                body: "Hover any metric in the table and the exact sentence lights up in the transcript — your digital yellow highlighter.",
              },
            ].map((c) => (
              <div
                key={c.step}
                className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm"
              >
                <span className="text-xs font-mono font-semibold text-blue-500">
                  STEP {c.step}
                </span>
                <h3 className="mt-1 font-semibold text-slate-800">{c.title}</h3>
                <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-200">
        Verifiable RAG — traceability layer for AI-extracted financial data
      </footer>
    </div>
  );
}
