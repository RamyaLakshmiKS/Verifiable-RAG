"use client";

type Tab = "metrics" | "qa";

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string; description: string }[] = [
  {
    id: "metrics",
    label: "Metrics & Insights",
    description: "Extract and verify financial metrics",
  },
  {
    id: "qa",
    label: "Q&A",
    description: "Ask questions about the transcript",
  },
];

export function TabBar({ active, onChange }: Props) {
  return (
    <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            flex-1 py-2.5 px-4 rounded-lg text-sm font-medium
            transition-all duration-150 text-left
            ${
              active === tab.id
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }
          `}
        >
          {tab.label}
          <span
            className={`block text-xs font-normal mt-0.5 ${
              active === tab.id ? "text-blue-100" : "text-slate-400"
            }`}
          >
            {tab.description}
          </span>
        </button>
      ))}
    </div>
  );
}
