export interface Metric {
  name: string;
  value: string;
  source_quote: string;
  verified: boolean;
  highlight_start: number | null;
  highlight_end: number | null;
}

export interface AnalysisResult {
  transcript: string;
  metrics: Metric[];
  mode: "live" | "demo";
}
