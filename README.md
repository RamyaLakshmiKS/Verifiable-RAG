# Verifiable RAG

> AI that shows its work — trace every extracted metric back to its exact source.

## ✨ Highlights

- 🔍 **Source traceability** — every AI-extracted metric is pinned to its verbatim quote in the original document
- 🟡 **Yellow-highlighter UI** — hover any metric and the exact sentence lights up in the transcript panel
- 🚨 **Hallucination detection** — quotes that don't exist in the source are flagged in red automatically
- ⚡ **Powered by Groq + Llama 3.3** — fast, free-tier inference with deterministic JSON output
- 🔄 **Demo mode** — works out of the box without an API key using simulated data

## 📖 Overview

Verifiable RAG is a prototype that solves the trust problem in AI-generated financial summaries. When an AI reads a 100-page earnings call transcript and hands you "Revenue grew 15%", you shouldn't have to take its word for it.

This tool forces the model to return the **exact verbatim substring** it used as evidence alongside every metric. A traceability engine then does a literal string search to verify the quote exists in the source — if the AI paraphrased or fabricated it, verification fails and the metric is flagged.

The result is a side-by-side UI: a clean metrics table on the left, the raw transcript on the right, and a yellow highlight connecting the two the moment you hover.

Built with a **FastAPI** backend (Python) and a **Next.js** frontend (TypeScript).

## 🖥️ Usage

Paste any financial transcript into the input box and click **Analyze**.

| Panel | What it shows |
|---|---|
| **Metrics table** (left) | Extracted metrics with verified ✅ or hallucinated ❌ badges |
| **Transcript** (right) | Raw source text — highlighted on hover |

Hover a metric row → the exact source sentence lights up in yellow.
A red "Hallucinated" badge means the model's quote could not be found verbatim in the source.

## 🚀 Installation

**Requirements:** Python 3.10+, Node.js 18+

**1. Clone the repo**

```bash
git clone https://github.com/RamyaLakshmi/Verifiable-RAG.git
cd Verifiable-RAG
```

**2. Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # add your GROQ_API_KEY
uvicorn main:app --reload
```

**3. Frontend**

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **No API key?** The app runs in demo mode with a pre-loaded sample transcript — no setup required.

## 🔑 Environment variables

Copy `backend/.env.example` to `backend/.env` and fill in your values.

| Variable | Default | Description |
|---|---|---|
| `GROQ_API_KEY` | — | Free key from [console.groq.com](https://console.groq.com) |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Swap to `llama-3.1-8b-instant` for lower latency |

## 💬 Feedback & contributions

Found a bug or have an idea? Open an issue — questions, suggestions, and pull requests are all welcome.
