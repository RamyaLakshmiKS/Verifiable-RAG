export interface Metric {
  name: string;
  value: string;
  source_quote: string;
  verified: boolean;
  highlight_start: number | null;
  highlight_end: number | null;
  manuallyVerified?: boolean;
}

export interface AnalysisResult {
  transcript: string;
  metrics: Metric[];
  mode: "live" | "demo";
}

export interface SourcePassage {
  text: string;
  verified: boolean;
  highlight_start: number | null;
  highlight_end: number | null;
}

export interface QAHistoryItem {
  question: string;
  answer: string;
  source_passages: SourcePassage[];
}

export interface HighlightRange {
  start: number;
  end: number;
}
