"use client";

import { Metric } from "@/types";

interface Props {
  metrics: Metric[];
  activeMetric: Metric | null;
  onHover: (metric: Metric | null) => void;
}

export function MetricsPanel({ metrics, activeMetric, onHover }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            Extracted Metrics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Hover a row to highlight its source in the transcript
          </p>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1 text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Verified
          </span>
          <span className="flex items-center gap-1 text-red-500">
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
            Unverified
          </span>
        </div>
      </div>

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
                  border-t border-slate-100 cursor-pointer transition-colors duration-150
                  ${isActive ? "bg-blue-50" : "hover:bg-slate-50"}
                `}
              >
                <td className="px-5 py-3.5 font-medium text-slate-700">
                  {m.name}
                </td>
                <td className="px-5 py-3.5 text-right font-mono font-semibold text-slate-900">
                  {m.value}
                </td>
                <td className="px-5 py-3.5 text-center">
                  {m.verified ? (
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
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-medium">
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M3 3l6 6M9 3l-6 6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      Hallucinated
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {metrics.some((m) => !m.verified) && (
        <div className="px-5 py-3 bg-red-50 border-t border-red-100 text-xs text-red-600">
          <strong>Warning:</strong> One or more metrics could not be traced back
          to the source text — the AI may have fabricated them.
        </div>
      )}
    </div>
  );
}
