"use client";

import { useState } from "react";
import { QAHistoryItem } from "@/types";

interface Props {
  transcript: string;
  history: QAHistoryItem[];
  activeQA: QAHistoryItem | null;
  loading: boolean;
  error: string | null;
  onAsk: (question: string) => void;
  onSelect: (qa: QAHistoryItem) => void;
}

export function QAPanel({
  transcript,
  history,
  activeQA,
  loading,
  error,
  onAsk,
  onSelect,
}: Props) {
  const [question, setQuestion] = useState("");

  function handleAsk() {
    const q = question.trim();
    if (!q || loading) return;
    onAsk(q);
    setQuestion("");
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
      {/* Question input */}
      <div className="px-5 py-4 border-b border-slate-100 flex-shrink-0">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Ask a Question</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            placeholder="e.g. What was the revenue growth? What risks were mentioned?"
            disabled={!transcript.trim()}
            className="
              flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-slate-50 disabled:text-slate-400
              placeholder:text-slate-300
            "
          />
          <button
            onClick={handleAsk}
            disabled={loading || !question.trim() || !transcript.trim()}
            className="
              px-4 py-2 text-sm font-medium rounded-lg
              bg-blue-600 text-white
              hover:bg-blue-700 active:bg-blue-800
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors duration-150 flex-shrink-0
            "
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Thinking
              </span>
            ) : (
              "Ask →"
            )}
          </button>
        </div>

        {error && (
          <p className="mt-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </div>

      {/* Current answer */}
      {activeQA && (
        <div className="px-5 py-4 border-b border-slate-100 flex-shrink-0 bg-slate-50">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Answer
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">{activeQA.answer}</p>

          {activeQA.source_passages.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Sources in transcript
              </p>
              <div className="flex flex-col gap-1.5">
                {activeQA.source_passages.map((p, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2 ${
                      p.verified
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                        : "bg-red-50 text-red-700 border border-red-100"
                    }`}
                  >
                    <span className="mt-0.5 flex-shrink-0">
                      {p.verified ? "✅" : "❌"}
                    </span>
                    <span className="font-mono leading-relaxed break-all">
                      &ldquo;{p.text}&rdquo;
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeQA.source_passages.length === 0 && (
            <p className="mt-2 text-xs text-slate-400 italic">
              No source passages found in transcript.
            </p>
          )}
        </div>
      )}

      {/* Q&A history */}
      {history.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <p className="px-5 pt-4 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Previous Questions
          </p>
          {[...history].reverse().map((item, i) => {
            const isActive = activeQA?.question === item.question;
            const verified = item.source_passages.filter((p) => p.verified).length;
            return (
              <button
                key={i}
                onClick={() => onSelect(item)}
                className={`
                  w-full text-left px-5 py-3 border-b border-slate-50
                  hover:bg-slate-50 transition-colors duration-100
                  ${isActive ? "bg-blue-50 border-l-2 border-l-blue-400" : ""}
                `}
              >
                <p className="text-sm font-medium text-slate-700 truncate">
                  {item.question}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {item.answer.slice(0, 80)}…
                  {verified > 0 && (
                    <span className="ml-2 text-emerald-600">
                      · {verified} source{verified > 1 ? "s" : ""}
                    </span>
                  )}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {history.length === 0 && !activeQA && (
        <div className="flex-1 flex items-center justify-center text-center px-8">
          <div>
            <p className="text-3xl mb-3">💬</p>
            <p className="text-sm font-medium text-slate-600">
              Ask anything about the transcript
            </p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Revenue, risks, strategy, key people, new initiatives — any question.
              <br />
              Every answer is traced back to the exact source sentence.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
