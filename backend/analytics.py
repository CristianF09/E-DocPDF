from datetime import datetime, timedelta
from typing import Dict
from collections import defaultdict

class AnalyticsEngine:
    def __init__(self):
        self.events = []
    
    def track_event(self, event_type: str, user_id: str, metadata: Dict = None):
        event = {
            "event_type": event_type,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": metadata or {}
        }
        self.events.append(event)
    
    def get_user_stats(self, user_id: str) -> Dict:
        user_events = [e for e in self.events if e["user_id"] == user_id]
        return {
            "total_events": len(user_events),
            "event_types": list(set(e["event_type"] for e in user_events)),
            "last_activity": max((e["timestamp"] for e in user_events), default=None)
        }
    
    def get_document_stats(self, user_id: str) -> Dict:
        doc_events = [e for e in self.events if e["user_id"] == user_id and e["event_type"] == "document"]
        return {
            "total_documents": len(doc_events),
            "operations": defaultdict(int)
        }
    
    def get_daily_activity(self, days: int = 7) -> Dict:
        cutoff = datetime.utcnow() - timedelta(days=days)
        recent_events = [
            e for e in self.events 
            if datetime.fromisoformat(e["timestamp"]) >= cutoff
        ]
        daily_counts = defaultdict(int)
        for e in recent_events:
            date = e["timestamp"].split("T")[0]
            daily_counts[date] += 1
        return dict(daily_counts)

analytics = AnalyticsEngine()

# ===================== Resume Analyzer (AI-backed) =====================
import os
import json
import tempfile
from io import BytesIO
from typing import Optional

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
AI_AVAILABLE = False
client = None

try:
    if GOOGLE_API_KEY and 'YOUR_GOOGLE_API_KEY' not in GOOGLE_API_KEY:
        import google.genai as genai
        client = genai.Client()
        AI_AVAILABLE = True
except Exception:
    client = None
    AI_AVAILABLE = False

# Try to import local OCR helper
try:
    from app import ocr as local_ocr
except Exception:
    local_ocr = None

# Import PyPDF2 and python-docx for text extraction
try:
    from PyPDF2 import PdfReader
except Exception:
    PdfReader = None

try:
    import docx
except Exception:
    docx = None

# Transformers fallback
try:
    from transformers import pipeline
    _summarizer = pipeline('text2text-generation', model='google/flan-t5-small')
except Exception:
    _summarizer = None


def _extract_text_from_pdf_bytes(file_bytes: bytes) -> str:
    text_parts = []
    if PdfReader is not None:
        try:
            reader = PdfReader(BytesIO(file_bytes))
            for page in reader.pages:
                try:
                    page_text = page.extract_text() or ''
                except Exception:
                    page_text = ''
                text_parts.append(page_text)
            full_text = "\n\n".join(text_parts).strip()
            return full_text
        except Exception:
            pass
    # If PdfReader failed or returned little, fallback to OCR if available
    if local_ocr is not None:
        # write to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tf:
            tf.write(file_bytes)
            temp_path = tf.name
        try:
            text = local_ocr.perform_ocr(temp_path, lang='ron')
            return text
        finally:
            try:
                os.unlink(temp_path)
            except Exception:
                pass
    return ""


def _extract_text_from_docx_bytes(file_bytes: bytes) -> str:
    if docx is None:
        return ""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.docx') as tf:
            tf.write(file_bytes)
            temp_path = tf.name
        doc = docx.Document(temp_path)
        paragraphs = [p.text for p in doc.paragraphs if p.text]
        try:
            os.unlink(temp_path)
        except Exception:
            pass
        return "\n\n".join(paragraphs)
    except Exception:
        return ""


def _call_gemini(prompt: str) -> str:
    if client is None:
        raise RuntimeError('Gemini client not available')
    resp = client.generate_content(model='models/gemini-1.5-mini', contents=[prompt])
    # client may return object with text property
    try:
        return resp.text
    except Exception:
        return str(resp)


def _call_local_summarizer(prompt: str) -> str:
    if _summarizer is None:
        raise RuntimeError('Local summarizer not available')
    out = _summarizer(prompt, max_length=512)
    if isinstance(out, list) and 'generated_text' in out[0]:
        return out[0]['generated_text']
    return str(out)


def analyze_resume(file_bytes: bytes, filename: str, role: Optional[str] = None, use_ai: bool = True) -> dict:
    """
    Extracts text from the uploaded resume (PDF, DOCX, TXT) and runs a Resume Analyzer that returns:
    - summary
    - key_skills
    - experience_years_estimate
    - suggested_improvements
    - role_fit_score (1-10)
    - recommended_roles
    """
    ext = os.path.splitext(filename)[1].lower()
    text = ''
    if ext == '.pdf':
        text = _extract_text_from_pdf_bytes(file_bytes)
    elif ext in ['.docx', '.doc']:
        text = _extract_text_from_docx_bytes(file_bytes)
    elif ext in ['.txt']:
        try:
            text = file_bytes.decode('utf-8')
        except Exception:
            text = file_bytes.decode('latin-1', errors='ignore')
    else:
        # unknown, try PDF extraction
        text = _extract_text_from_pdf_bytes(file_bytes)

    if not text or len(text.strip()) < 50:
        return {"error": "Could not extract sufficient text from document."}

    # Prepare prompt for structured JSON output
    prompt = f"You are an expert recruiter and resume analyst.\nAnalyze the following Romanian CV/resume and produce a JSON object with keys: summary (1-2 short paragraphs), key_skills (list of top 8 skills), experience_years_estimate (integer), suggested_improvements (list of 5 actionable items), role_fit_score (1-10 integer), recommended_roles (list of roles/titles). Keep answers concise. Maintain Romanian language. The "
    if role:
        prompt += f"Consider candidate fit for role: {role}.\n"
    prompt += "Text to analyze:\n" + text[:40000] + "\n\nReturn only the JSON object."

    ai_text = None
    if use_ai and AI_AVAILABLE:
        try:
            ai_text = _call_gemini(prompt)
        except Exception:
            ai_text = None

    if ai_text is None:
        # local fallback
        try:
            ai_text = _call_local_summarizer(prompt)
        except Exception:
            # final fallback: basic rule-based extraction
            summary = text[:800]
            return {
                "summary": summary,
                "key_skills": [],
                "experience_years_estimate": None,
                "suggested_improvements": [],
                "role_fit_score": None,
                "recommended_roles": []
            }

    # Try to extract JSON from ai_text
    ai_text_str = ai_text.strip()
    # sometimes models wrap in ``` or text, try find first { and last }
    start = ai_text_str.find('{')
    end = ai_text_str.rfind('}')
    if start != -1 and end != -1 and end > start:
        json_str = ai_text_str[start:end+1]
        try:
            data = json.loads(json_str)
            return data
        except Exception:
            pass

    # If cannot parse JSON, return raw ai_text as summary
    return {"summary": ai_text_str}
