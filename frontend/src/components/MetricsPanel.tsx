"use client";

import { Metric } from "@/types";

interface Props {
  metrics: Metric[];
  activeMetric: Metric | null;
  onHover: (metric: Metric | null) => void;
  onManualVerify: (metric: Metric) => void;
  onAskQA: (metric: Metric) => void;
}

export function MetricsPanel({
  metrics,
  activeMetric,
  onHover,
  onManualVerify,
  onAskQA,
}: Props) {
  const manuallyVerifiedCount = metrics.filter((m) => m.manuallyVerified).length;
  const unverifiedCount = metrics.filter((m) => !m.verified).length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Extracted Metrics</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Hover a row to highlight its source · unverified rows can be reviewed via Q&amp;A
          </p>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs font-medium text-slate-400 uppercase tracking-wider bg-slate-50">
            <th className="px-5 py-3 text-left">Metric</th>
            <th className="px-5 py-3 text-right">Value</th>
            <th className="px-5 py-3 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m, i) => {
            const isActive = activeMetric?.name === m.name;
            return (
              <tr
                key={i}
                onMouseEnter={() => onHover(m)}
                onMouseLeave={() => onHover(null)}
                className={`
                  border-t border-slate-100 transition-colors duration-150
                  ${m.verified ? "cursor-pointer" : "cursor-default"}
                  ${isActive ? "bg-blue-50" : m.verified ? "hover:bg-slate-50" : "bg-red-50/40"}
                `}
              >
                {/* Metric name */}
                <td className="px-5 py-3.5 font-medium text-slate-700">{m.name}</td>

                {/* Value */}
                <td className="px-5 py-3.5 text-right font-mono font-semibold text-slate-900">
                  {m.value}
                </td>

                {/* Status + actions */}
                <td className="px-5 py-3.5 text-center">
                  {m.verified ? (
                    m.manuallyVerified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Human Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        AI Verified
                      </span>
                    )
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-medium">
                        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                          <path
                            d="M3 3l6 6M9 3l-6 6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        Unverified
                      </span>

                      {/* Action buttons */}
                      <div className="flex gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAskQA(m);
                          }}
                          className="
                            text-xs px-2 py-0.5 rounded border
                            border-blue-200 text-blue-600 bg-blue-50
                            hover:bg-blue-100 transition-colors duration-100
                            whitespace-nowrap
                          "
                          title="Switch to Q&A tab and ask about this metric"
                        >
                          Ask Q&amp;A →
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onManualVerify(m);
                          }}
                          className="
                            text-xs px-2 py-0.5 rounded border
                            border-slate-200 text-slate-600 bg-white
                            hover:bg-slate-100 transition-colors duration-100
                            whitespace-nowrap
                          "
                          title="Mark this metric as verified after manual review"
                        >
                          ✓ Mark Verified
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer notes */}
      {unverifiedCount > 0 && (
        <div className="px-5 py-3 bg-red-50 border-t border-red-100 text-xs text-red-600">
          <strong>{unverifiedCount} metric{unverifiedCount > 1 ? "s" : ""} unverified</strong>
          {" "}— use <em>Ask Q&amp;A →</em> to validate against the transcript, then <em>✓ Mark Verified</em> to confirm.
        </div>
      )}
      {manuallyVerifiedCount > 0 && unverifiedCount === 0 && (
        <div className="px-5 py-3 bg-blue-50 border-t border-blue-100 text-xs text-blue-600">
          {manuallyVerifiedCount} metric{manuallyVerifiedCount > 1 ? "s" : ""} manually reviewed and confirmed by user.
        </div>
      )}
    </div>
  );
}
