"use client";

import { Metric } from "@/types";

interface Props {
  transcript: string;
  activeMetric: Metric | null;
}

export function TranscriptPanel({ transcript, activeMetric }: Props) {
  const hasHighlight =
    activeMetric?.verified &&
    activeMetric.highlight_start !== null &&
    activeMetric.highlight_end !== null;

  const renderText = () => {
    if (!hasHighlight) {
      return <span className="text-slate-600">{transcript}</span>;
    }

    const start = activeMetric!.highlight_start!;
    const end = activeMetric!.highlight_end!;

    return (
      <>
        <span className="text-slate-500">{transcript.slice(0, start)}</span>
        <mark className="bg-yellow-200 border-b-2 border-yellow-400 text-slate-900 rounded px-0.5 not-italic font-medium">
          {transcript.slice(start, end)}
        </mark>
        <span className="text-slate-500">{transcript.slice(end)}</span>
      </>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            Source Transcript
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {hasHighlight
              ? `Showing source for "${activeMetric!.name}"`
              : "Hover a metric on the left to locate its source"}
          </p>
        </div>
        {hasHighlight && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
            Highlighted
          </span>
        )}
      </div>

      <div className="p-5 overflow-y-auto flex-1">
        <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
          {renderText()}
        </pre>
      </div>
    </div>
  );
}
