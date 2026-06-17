"use client";

import { HighlightRange } from "@/types";

interface Props {
  transcript: string;
  highlights: HighlightRange[];
}

interface Segment {
  text: string;
  highlighted: boolean;
}

function buildSegments(text: string, highlights: HighlightRange[]): Segment[] {
  const sorted = [...highlights].sort((a, b) => a.start - b.start);
  const segments: Segment[] = [];
  let pos = 0;

  for (const h of sorted) {
    if (h.start > pos) {
      segments.push({ text: text.slice(pos, h.start), highlighted: false });
    }
    if (h.end > h.start) {
      segments.push({ text: text.slice(h.start, h.end), highlighted: true });
    }
    pos = Math.max(pos, h.end);
  }

  if (pos < text.length) {
    segments.push({ text: text.slice(pos), highlighted: false });
  }

  return segments;
}

export function TranscriptPanel({ transcript, highlights }: Props) {
  const hasHighlights = highlights.length > 0;
  const segments = hasHighlights ? buildSegments(transcript, highlights) : null;

  const subtitle = hasHighlights
    ? `${highlights.length} passage${highlights.length > 1 ? "s" : ""} highlighted`
    : "Hover a metric or ask a question to highlight its source";

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Source Transcript</h2>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        {hasHighlights && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
            Highlighted
          </span>
        )}
      </div>

      <div className="p-5 overflow-y-auto flex-1">
        <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
          {hasHighlights && segments ? (
            segments.map((seg, i) =>
              seg.highlighted ? (
                <mark
                  key={i}
                  className="bg-yellow-200 border-b-2 border-yellow-400 text-slate-900 rounded px-0.5 not-italic font-medium"
                >
                  {seg.text}
                </mark>
              ) : (
                <span key={i} className="text-slate-500">
                  {seg.text}
                </span>
              )
            )
          ) : (
            <span className="text-slate-600">{transcript}</span>
          )}
        </pre>
      </div>
    </div>
  );
}
