import json
import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

# --- Groq integration ---
try:
    from groq import Groq

    _client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))
    HAS_GROQ = bool(os.getenv("GROQ_API_KEY"))
except Exception:
    HAS_GROQ = False

# Default to 70B for better structured-output reliability; override via env.
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

# -----------------------------------------------------------------------
# App setup
# -----------------------------------------------------------------------

app = FastAPI(title="Verifiable RAG API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------
# Models
# -----------------------------------------------------------------------


class TranscriptRequest(BaseModel):
    transcript: str


class QuestionRequest(BaseModel):
    transcript: str
    question: str


# -----------------------------------------------------------------------
# Demo data
# -----------------------------------------------------------------------

DEMO_TRANSCRIPT = """
    Analyst: Can you give us a sense of how the software division performed last year?
    Expert: Yes, absolutely. It was a tough market, but we actually saw 15% revenue growth in Q4.
    Analyst: That is helpful. What about customer retention?
    Expert: The churn rate stayed relatively flat at about 2.5% annually.
    Analyst: Any colour on operational efficiency?
    Expert: We brought headcount costs down significantly — OpEx as a percentage of revenue dropped to 41%.
""".strip()


def _extract_simulated(transcript: str) -> list[dict]:
    """
    Demo mode: two verifiable metrics + one deliberately hallucinated quote
    so the UI can show failed verification in red.
    """
    return [
        {
            "name": "Q4 Revenue Growth",
            "value": "15%",
            "source_quote": "we actually saw 15% revenue growth in Q4",
        },
        {
            "name": "Annual Churn Rate",
            "value": "2.5%",
            "source_quote": "The churn rate stayed relatively flat at about 2.5% annually.",
        },
        {
            # Hallucinated — this exact phrase does not appear in the transcript.
            "name": "EBITDA Margin",
            "value": "32%",
            "source_quote": "EBITDA margins expanded to 32% year-over-year",
        },
    ]


# -----------------------------------------------------------------------
# Extraction — Groq / Llama 3.3
# -----------------------------------------------------------------------

EXTRACTION_PROMPT = """Extract every financial or operational metric mentioned in the transcript below.

For each metric return a JSON object with exactly these fields:
  "name":         a short descriptive label  (e.g. "Q4 Revenue Growth")
  "value":        the numeric figure with unit (e.g. "15%")
  "source_quote": the EXACT verbatim substring from the transcript — copy it character-for-character, do not paraphrase

Return ONLY a valid JSON array of those objects. No explanation, no markdown.

Transcript:
\"\"\"
{transcript}
\"\"\""""


def _extract_groq(transcript: str) -> list[dict]:
    """
    Live mode: calls Llama 3.3 via Groq with JSON mode enabled.
    response_format=json_object makes the model output valid JSON every time.
    """
    response = _client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a financial data extraction assistant. "
                    "Always respond with valid JSON only — no markdown, no prose."
                ),
            },
            {
                "role": "user",
                "content": EXTRACTION_PROMPT.format(transcript=transcript),
            },
        ],
        max_tokens=1024,
        temperature=0,          # deterministic output → consistent quotes
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content.strip()

    parsed = json.loads(raw)

    # Groq's json_object mode wraps the array in a key sometimes; unwrap if so.
    if isinstance(parsed, dict):
        for v in parsed.values():
            if isinstance(v, list):
                return v
        raise ValueError(f"Unexpected JSON shape from model: {list(parsed.keys())}")

    return parsed


# -----------------------------------------------------------------------
# Q&A — simulated vs. live
# -----------------------------------------------------------------------

QA_PROMPT = """You are a financial analyst assistant. Answer the user's question using ONLY the information in the transcript below.

Rules:
1. Answer concisely and directly in 2-3 sentences.
2. For "source_passages", list the EXACT verbatim substrings from the transcript that support your answer — copy them character-for-character, do not paraphrase or summarise.
3. If the answer is not in the transcript, set answer to "This information is not available in the transcript." and return an empty source_passages array.

Return valid JSON only in this exact shape:
{{
  "answer": "your answer here",
  "source_passages": ["exact verbatim substring 1", "exact verbatim substring 2"]
}}

Question: {question}

Transcript:
\"\"\"
{transcript}
\"\"\""""


def _ask_simulated(transcript: str, question: str) -> dict:
    """Demo mode: fixed response that covers all key points in the demo transcript."""
    return {
        "answer": (
            "The software division performed well despite a tough market. "
            "Revenue grew 15% in Q4, churn stayed flat at 2.5% annually, "
            "and operational efficiency improved with OpEx dropping to 41% of revenue."
        ),
        "source_passages": [
            "we actually saw 15% revenue growth in Q4",
            "The churn rate stayed relatively flat at about 2.5% annually.",
            "OpEx as a percentage of revenue dropped to 41%",
        ],
    }


def _ask_groq(transcript: str, question: str) -> dict:
    """Live mode: Llama 3.3 answers the question and returns verbatim source passages."""
    response = _client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a financial analyst assistant. "
                    "Always respond with valid JSON only — no markdown, no prose."
                ),
            },
            {
                "role": "user",
                "content": QA_PROMPT.format(transcript=transcript, question=question),
            },
        ],
        max_tokens=1024,
        temperature=0,
        response_format={"type": "json_object"},
    )

    return json.loads(response.choices[0].message.content.strip())


# -----------------------------------------------------------------------
# Traceability engine
# -----------------------------------------------------------------------


def verify_quotes(transcript: str, metrics: list[dict]) -> list[dict]:
    """
    Locate each source_quote inside the original transcript.
    Plain str.find() — if the AI changed even one character, verification fails.
    """
    verified: list[dict] = []
    for item in metrics:
        quote = item.get("source_quote", "")
        start = transcript.find(quote)

        if start != -1:
            item["verified"] = True
            item["highlight_start"] = start
            item["highlight_end"] = start + len(quote)
        else:
            item["verified"] = False
            item["highlight_start"] = None
            item["highlight_end"] = None

        verified.append(item)
    return verified


def verify_passages(transcript: str, passages: list[str]) -> list[dict]:
    """Same str.find traceability, applied to free-form source passages from Q&A."""
    verified: list[dict] = []
    for text in passages:
        start = transcript.find(text)
        if start != -1:
            verified.append({
                "text": text,
                "verified": True,
                "highlight_start": start,
                "highlight_end": start + len(text),
            })
        else:
            verified.append({
                "text": text,
                "verified": False,
                "highlight_start": None,
                "highlight_end": None,
            })
    return verified


# -----------------------------------------------------------------------
# Routes
# -----------------------------------------------------------------------


@app.get("/health")
def health():
    return {
        "status": "ok",
        "mode": "live" if HAS_GROQ else "demo",
        "model": GROQ_MODEL if HAS_GROQ else None,
    }


@app.get("/demo-transcript")
def demo_transcript():
    return {"transcript": DEMO_TRANSCRIPT}


@app.post("/analyze")
def analyze(request: TranscriptRequest):
    transcript = request.transcript.strip()
    if not transcript:
        raise HTTPException(status_code=400, detail="Transcript cannot be empty.")

    try:
        raw_metrics = _extract_groq(transcript) if HAS_GROQ else _extract_simulated(transcript)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {exc}")

    metrics = verify_quotes(transcript, raw_metrics)

    return {
        "transcript": transcript,
        "metrics": metrics,
        "mode": "live" if HAS_GROQ else "demo",
        "model": GROQ_MODEL if HAS_GROQ else None,
    }


@app.post("/ask")
def ask(request: QuestionRequest):
    transcript = request.transcript.strip()
    question = request.question.strip()

    if not transcript:
        raise HTTPException(status_code=400, detail="Transcript cannot be empty.")
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        result = _ask_groq(transcript, question) if HAS_GROQ else _ask_simulated(transcript, question)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Q&A failed: {exc}")

    source_passages = verify_passages(transcript, result.get("source_passages", []))

    return {
        "question": question,
        "answer": result.get("answer", ""),
        "source_passages": source_passages,
        "mode": "live" if HAS_GROQ else "demo",
        "model": GROQ_MODEL if HAS_GROQ else None,
    }
