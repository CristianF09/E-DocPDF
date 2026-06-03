from dotenv import load_dotenv
import os

load_dotenv()


from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, status, Response, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import HTMLResponse, FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
import uuid
from pathlib import Path
import requests
import json
from dotenv import load_dotenv
import base64
import httpx

# Încarcă variabilele de mediu
load_dotenv()

# Configurare Stirling PDF
STIRLING_URL = os.getenv("STIRLING_URL", "http://localhost:8080/api/v1")

# Configurare Google Gemini AI
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
AI_AVAILABLE = bool(GOOGLE_API_KEY and "YOUR_GOOGLE_API_KEY" not in GOOGLE_API_KEY)
client = None

if AI_AVAILABLE:
    try:
        import google.genai as genai
        client = genai.Client()
        print("✅ Google Gemini AI client created. Ready to use.")
    except ImportError:
        AI_AVAILABLE = False
        print("⚠️ google.genai is not installed. Run: pip install google-genai")
    except Exception as e:
        AI_AVAILABLE = False
        print(f"⚠️ Failed to create AI client: {e}")
else:
    print("⚠️ GOOGLE_API_KEY not found or invalid. AI features disabled.")

# Încarcă template-uri legale
BASE_DIR = Path(__file__).resolve().parent
TEMPLATES_FILE = BASE_DIR / "templates" / "legal_templates.json"
if TEMPLATES_FILE.exists():
    with open(TEMPLATES_FILE, 'r', encoding='utf-8') as f:
        LEGAL_TEMPLATES = json.load(f)
else:
    LEGAL_TEMPLATES = {}
    print("⚠️ legal_templates.json not found in templates/ directory")

# Configurare securitate
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-keep-it-safe-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI(title="E-DocPDF Enterprise API", version="2.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ========== Modele Pydantic ==========
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class User(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None

class Document(BaseModel):
    id: str
    filename: str
    upload_date: datetime
    file_size: int
    status: str = "processed"

class LegalDocumentRequest(BaseModel):
    template_id: str
    variables: Dict[str, str]
    format: str = "pdf"

class SignatureRequest(BaseModel):
    document_id: str
    signature_data: str  # base64 encoded image
    x_position: int = 100
    y_position: int = 100
    page_number: int = 1

class OCRRequest(BaseModel):
    language: str = "ron"
    output_format: str = "txt"

class TranslationRequest(BaseModel):
    source_language: str = "auto"
    target_language: str = "ro"
    text: Optional[str] = None
    file: Optional[str] = None

# ========== Date utilizatori test ==========
fake_users_db = {}
documents_db = []

# ========== Funcții helper ==========
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Nu se poate valida autentificarea",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    user = fake_users_db.get(token_data.username)
    if user is None:
        raise credentials_exception
    return user

def check_stirling_health():
    try:
        response = requests.get(f"{STIRLING_URL.replace('/api/v1', '')}/health", timeout=5)
        return response.status_code == 200
    except:
        return False

async def create_pdf_from_text_stirling(content: str, filename: str) -> bytes:
    """Creează un PDF dintr-un text folosind Stirling PDF (via HTML)."""
    if not check_stirling_health():
        raise HTTPException(status_code=503, detail="Stirling PDF service is not available")

    # Transformă textul simplu în HTML, păstrând formatarea de bază
    html_content = f"""
    <!DOCTYPE html>
    <html lang="ro">
    <head>
        <meta charset="UTF-8">
        <title>{filename}</title>
        <style>
            body {{ font-family: sans-serif; line-height: 1.6; }}
            pre {{ white-space: pre-wrap; font-family: sans-serif; }}
        </style>
    </head>
    <body>
        <pre>{content}</pre>
    </body>
    </html>
    """

    full_stirling_url = f"{STIRLING_URL}/convert/html/pdf"
    # Stirling se așteaptă la un fișier, deci trimitem HTML-ul ca un fișier
    files = {'fileInput': (f"{filename}.html", html_content.encode('utf-8'), 'text/html')}

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(full_stirling_url, files=files)
            response.raise_for_status()
            return response.content
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"Eroare la crearea PDF-ului via Stirling: {exc}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"O eroare neașteptată a apărut la crearea PDF-ului: {e}")

def create_pdf_from_text(content: str, filename: str):
    """Genereaza un PDF simplu din text folosind ReportLab."""
    from io import BytesIO
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
    from reportlab.lib.units import mm
    from xml.sax.saxutils import escape

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
        title=filename,
    )
    styles = getSampleStyleSheet()
    normal = styles["Normal"]
    normal.fontName = "Helvetica"
    normal.fontSize = 10
    normal.leading = 14

    story = []
    for line in content.splitlines():
        story.append(Paragraph(escape(line) if line.strip() else "&nbsp;", normal))
        story.append(Spacer(1, 4))

    doc.build(story)
    buffer.seek(0)
    return buffer

@app.post("/legal/generate-stirling-legacy", summary="Generează un document legal dintr-un template via Stirling")
async def generate_legal_document_stirling_legacy(request: LegalDocumentRequest, current_user: User = Depends(get_current_user)):
    """
    Generează un document (PDF sau text) pe baza unui template și a variabilelor furnizate.
    """
    template = LEGAL_TEMPLATES.get(request.template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template-ul legal nu a fost găsit.")

    # Înlocuiește variabilele în conținutul template-ului
    content = template["content"]
    for key, value in request.variables.items():
        placeholder = f"{{{{{key}}}}}" # ex: {{nume_companie}}
        content = content.replace(placeholder, value)

    # Verifică dacă toate variabilele au fost înlocuite
    if "{{" in content and "}}" in content:
        import re
        remaining_vars = re.findall(r"\{\{([^}]+)\}\}", content)
        raise HTTPException(
            status_code=400, 
            detail=f"Variabile lipsă în cerere: {', '.join(remaining_vars)}"
        )

    if request.format == "pdf":
        try:
            pdf_content = await create_pdf_from_text_stirling(content, f"{request.template_id}.pdf")
            return Response(
                content=pdf_content,
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename={request.template_id}.pdf"}
            )
        except HTTPException as e:
            # Propagă excepțiile de la funcția de creare PDF
            raise e
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"A apărut o eroare la generarea PDF-ului: {e}")
    
    elif request.format == "txt":
        return Response(
            content=content,
            media_type="text/plain",
            headers={"Content-Disposition": f"attachment; filename={request.template_id}.txt"}
        )
    
    else:
        raise HTTPException(status_code=400, detail="Formatul de ieșire trebuie să fie 'pdf' sau 'txt'.")

# ========== Endpoint-uri ==========
@app.get("/")
async def root():
    stirling_status = "connected" if check_stirling_health() else "disconnected"
    return {
        "message": "E-DocPDF Enterprise API - Sistem complet de documente",
        "version": "3.0.0",
        "status": "active",
        "stirling_pdf": stirling_status,
        "ai_available": AI_AVAILABLE,
        "endpoints": {
            "docs": "/docs",
            "editor": "/editor",
            "legal_templates": "/legal/templates",
            "ocr": "/ocr",
            "signatures": "/signatures"
        }
    }

@app.get("/stirling-health")
async def stirling_health_check():
    if check_stirling_health():
        return {"status": "ok"}
    else:
        raise HTTPException(status_code=503, detail="Stirling PDF service not available")

@app.get("/editor", response_class=HTMLResponse)
async def document_editor():
    """Interfața editorului web complet"""
    with open("templates/editor.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = fake_users_db.get(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nume de utilizator sau parolă incorectă",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me/", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# ========== Documente încărcate ==========
@app.post("/upload/", response_model=Document)
async def upload_document(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)
    
    file_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{file_id}{file_ext}"
    file_path = upload_dir / unique_filename
    
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    
    document = Document(
        id=file_id, 
        filename=file.filename, 
        upload_date=datetime.utcnow(), 
        file_size=len(content)
    )
    documents_db.append(document.dict())
    return document

@app.get("/documents/", response_model=List[Document])
async def get_documents(current_user: User = Depends(get_current_user)):
    return documents_db

@app.delete("/documents/{document_id}")
async def delete_document(document_id: str, current_user: User = Depends(get_current_user)):
    global documents_db
    documents_db = [doc for doc in documents_db if doc["id"] != document_id]
    upload_dir = Path("uploads")
    for file_path in upload_dir.glob(f"{document_id}.*"):
        if file_path.exists():
            file_path.unlink()
    return {"message": "Document șters cu succes"}

# ========== 1. CONVERSIE DOCUMENTE ==========
# ===================== CONVERSII FOLOSIND STIRLING PDF =====================

@app.post("/convert/to-word")
async def convert_to_word(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    if not check_stirling_health():
        raise HTTPException(status_code=503, detail="Stirling PDF service not available")
    
    content = await file.read()
    files = {'fileInput': (file.filename, content, file.content_type)}
    
    # Endpoint corect conform documentației Stirling
    response = requests.post(
        f"{STIRLING_URL}/convert/pdf/word",   # ATENŢIE: cale relativă la base URL
        files=files,
        timeout=60
    )
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Conversion PDF->Word failed")
    
    return Response(
        content=response.content,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename={file.filename.rsplit('.',1)[0]}.docx"}
    )

@app.post("/convert/to-excel")
async def convert_to_excel(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    if not check_stirling_health():
        raise HTTPException(status_code=503, detail="Stirling PDF service not available")
    
    content = await file.read()
    files = {'fileInput': (file.filename, content, file.content_type)}
    
    # Convertim PDF în CSV (poate fi deschis în Excel)
    response = requests.post(
        f"{STIRLING_URL}/convert/pdf/csv",
        files=files,
        timeout=60
    )
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Conversion PDF->Excel failed")
    
    return Response(
        content=response.content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={file.filename.rsplit('.',1)[0]}.csv"}
    )

@app.post("/convert/to-pdf")
async def convert_to_pdf(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    if not check_stirling_health():
        raise HTTPException(status_code=503, detail="Stirling PDF service not available")
    
    content = await file.read()
    files = {'fileInput': (file.filename, content, file.content_type)}
    
    # Determinăm extensia fișierului sursă pentru a alege endpoint-ul corect
    ext = file.filename.split('.')[-1].lower()
    if ext in ['docx', 'doc']:
        endpoint = f"{STIRLING_URL}/convert/docx/pdf"
    elif ext in ['xlsx', 'xls']:
        endpoint = f"{STIRLING_URL}/convert/xlsx/pdf"
    elif ext in ['pptx', 'ppt']:
        endpoint = f"{STIRLING_URL}/convert/pptx/pdf"
    elif ext in ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp']:
        endpoint = f"{STIRLING_URL}/convert/img/pdf"
    elif ext == 'html':
        endpoint = f"{STIRLING_URL}/convert/html/pdf"
    else:
        raise HTTPException(status_code=400, detail="Format sursă nesuportat pentru conversie în PDF")
    
    response = requests.post(endpoint, files=files, timeout=60)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Conversion to PDF failed")
    
    return Response(
        content=response.content,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={file.filename.rsplit('.',1)[0]}.pdf"}
    )

# ===================== ENDPOINT UNIFICAT PENTRU CONVERSII =====================
@app.post("/api/v1/stirling/convert")
async def stirling_convert_unified(
    file: UploadFile = File(...),
    output_format: str = Form(...)
):
    """
    Endpoint unificat pentru a converti fișiere folosind Stirling PDF.
    Determină automat endpoint-ul necesar pe baza extensiilor.
    """
    if not check_stirling_health():
        raise HTTPException(status_code=503, detail="Stirling PDF service is not available")

    input_format = file.filename.split('.')[-1].lower()
    
    # Construiește calea pentru API-ul Stirling
    # Exemplu: /convert/pdf/docx
    stirling_api_path = f"/convert/{input_format}/{output_format}"
    full_stirling_url = f"{STIRLING_URL}{stirling_api_path}"

    content = await file.read()
    files = {'fileInput': (file.filename, content, file.content_type)}

    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            response = await client.post(full_stirling_url, files=files)
            
            if response.status_code == 404:
                 raise HTTPException(
                    status_code=400, 
                    detail=f"Conversia de la '{input_format}' la '{output_format}' nu este suportată de Stirling PDF."
                )

            response.raise_for_status()

            # Determină Content-Type-ul pe baza formatului de ieșire
            # Puteți extinde această listă
            media_type_map = {
                "pdf": "application/pdf",
                "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                "jpg": "image/jpeg",
                "png": "image/png",
                "txt": "text/plain",
                "html": "text/html",
            }
            media_type = media_type_map.get(output_format, "application/octet-stream")
            
            new_filename = f"{file.filename.rsplit('.', 1)[0]}.{output_format}"

            return Response(
                content=response.content,
                media_type=media_type,
                headers={"Content-Disposition": f"attachment; filename={new_filename}"}
            )

        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"Eroare la contactarea serviciului Stirling PDF: {exc}")
        except Exception as e:
            # Prinde alte erori neașteptate
            raise HTTPException(status_code=500, detail=f"O eroare neașteptată a apărut: {e}")


# ===================== COMPRIMARE PDF =====================
@app.post("/api/v1/stirling/compress")
async def stirling_compress(file: UploadFile = File(...)):
    """Comprimă un fișier PDF folosind Stirling PDF."""
    if not check_stirling_health():
        raise HTTPException(status_code=503, detail="Stirling PDF service is not available")

    input_format = file.filename.split('.')[-1].lower()
    if input_format != 'pdf':
        raise HTTPException(status_code=400, detail="Doar fișierele PDF pot fi comprimate.")

    full_stirling_url = f"{STIRLING_URL}/compress"
    content = await file.read()
    files = {'fileInput': (file.filename, content, file.content_type)}

    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            response = await client.post(full_stirling_url, files=files)
            response.raise_for_status()
            
            new_filename = f"compressed_{file.filename}"

            return Response(
                content=response.content,
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename={new_filename}"}
            )
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"Eroare la contactarea serviciului Stirling PDF: {exc}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"O eroare neașteptată a apărut: {e}")

async def extract_text_from_pdf_stirling(file_content: bytes, filename: str) -> str:
    """Extrage text dintr-un PDF folosind Stirling PDF."""
    if not check_stirling_health():
        raise HTTPException(status_code=503, detail="Stirling PDF service is not available")

    full_stirling_url = f"{STIRLING_URL}/extract/text"
    files = {'fileInput': (filename, file_content, 'application/pdf')}

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(full_stirling_url, files=files)
            response.raise_for_status()
            # Răspunsul este un JSON cu cheia "text"
            response_json = response.json()
            return response_json.get("text", "")
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"Eroare la extragerea textului via Stirling: {exc}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"O eroare neașteptată a apărut la extragerea textului: {e}")

@app.post("/api/v1/ai/summarize")
async def ai_summarize(file: UploadFile = File(...)):
    """Generează un rezumat al unui document PDF folosind AI."""
    if not AI_AVAILABLE:
        raise HTTPException(status_code=503, detail="Serviciul AI nu este configurat sau disponibil.")

    try:
        pdf_content = await file.read()
        
        # Extrage textul folosind Stirling PDF
        text = await extract_text_from_pdf_stirling(pdf_content, file.filename)

        if not text.strip():
            raise HTTPException(status_code=400, detail="Nu s-a putut extrage text din PDF folosind Stirling.")

        # Generează rezumatul cu Gemini
        prompt = f"Rezumă următorul text în limba română:\n\n{text[:30000]}"
        response = client.generate_content(
            model="models/gemini-1.5-flash",
            contents=[prompt]
        )
        
        summary = response.text
        return {"summary": summary}

    except Exception as e:
        # Asigură-te că nu expui detalii sensibile în producție
        error_detail = str(e) if os.getenv("ENV") == "development" else "O eroare a apărut la generarea rezumatului."
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=error_detail)

@app.post("/api/v1/ai/analyze")
async def ai_analyze_document(file: UploadFile = File(...)):
    """Analizează un document PDF și sugerează îmbunătățiri."""
    if not AI_AVAILABLE:
        raise HTTPException(status_code=503, detail="Serviciul AI nu este configurat sau disponibil.")

    try:
        pdf_content = await file.read()
        
        # Extrage textul folosind Stirling PDF
        text = await extract_text_from_pdf_stirling(pdf_content, file.filename)

        if not text.strip():
            raise HTTPException(status_code=400, detail="Nu s-a putut extrage text din PDF folosind Stirling.")

        # Prompt pentru analiza si sugestii cu Gemini
        analysis_prompt = f"""You are an expert editor. Analyze the following text for grammar, spelling, punctuation, clarity, and style. Provide a list of suggestions in JSON format. Each suggestion should be an object with three keys: 'original', 'suggestion', and 'explanation'. The text to analyze is in Romanian.

        Text:
        {text}

        Return only the JSON array of suggestions, inside a JSON object with a "suggestions" key. Example: {{"suggestions": [...]}}"""

        response = client.generate_content(
            model="models/gemini-1.5-flash",
            contents=[analysis_prompt]
        )
        
        # Extrage și parsează conținutul JSON din răspuns
        response_text = response.text.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:-3].strip()
        
        suggestions_data = json.loads(response_text)
        suggestions = suggestions_data.get("suggestions", [])

        return {"text": text, "suggestions": json.dumps(suggestions)}

    except Exception as e:
        error_detail = str(e) if os.getenv("ENV") == "development" else "O eroare a apărut la analiza documentului."
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=error_detail)


@app.post("/api/v1/stirling/sign", summary="Adaugă o imagine (semnătură) pe un PDF")
async def stirling_add_signature(
    pdf_file: UploadFile = File(..., alias="fileInput"),
    signature_file: UploadFile = File(..., alias="imageFile"),
    page_number: int = Form(1),
    x_position: float = Form(100.0),
    y_position: float = Form(100.0),
    current_user: User = Depends(get_current_user)
):
    """
    Aplică o imagine (semnătură) pe o anumită pagină a unui document PDF
    folosind endpoint-ul /add-image de la Stirling PDF.
    """
    if not check_stirling_health():
        raise HTTPException(status_code=503, detail="Stirling PDF service is not available")

    full_stirling_url = f"{STIRLING_URL}/add-image"
    
    pdf_content = await pdf_file.read()
    signature_content = await signature_file.read()

    files = {
        'fileInput': (pdf_file.filename, pdf_content, pdf_file.content_type),
        'imageFile': (signature_file.filename, signature_content, signature_file.content_type)
    }
    
    # Stirling primește parametrii ca date de formular
    data = {
        'page': str(page_number),
        'x': str(x_position),
        'y': str(y_position)
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            response = await client.post(full_stirling_url, files=files, data=data)
            response.raise_for_status()
            
            new_filename = f"signed_{pdf_file.filename}"

            return Response(
                content=response.content,
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename='{new_filename}'"}
            )
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"Eroare la contactarea serviciului Stirling PDF: {exc}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"O eroare neașteptată a apărut la adăugarea semnăturii: {e}")


# ===================== WATERMARK =====================
@app.post("/api/v1/stirling/watermark")
async def stirling_watermark(
    file: UploadFile = File(..., alias="fileInput"),
    watermark_type: str = Form(...), # 'text' or 'image'
    text: str = Form(None),
    image_file: UploadFile = File(None, alias="imageFile")
):
    """Adaugă un watermark text sau imagine pe un PDF."""
    if not check_stirling_health():
        raise HTTPException(status_code=503, detail="Stirling PDF service is not available")

    full_stirling_url = f"{STIRLING_URL}/add-watermark"
    pdf_content = await file.read()
    files = {'fileInput': (file.filename, pdf_content, file.content_type)}
    data = {}

    if watermark_type == 'text':
        if not text:
            raise HTTPException(status_code=400, detail="Textul pentru watermark este necesar.")
        data['text'] = text
    elif watermark_type == 'image':
        if not image_file:
            raise HTTPException(status_code=400, detail="Fișierul imagine pentru watermark este necesar.")
        image_content = await image_file.read()
        files['imageFile'] = (image_file.filename, image_content, image_file.content_type)
    else:
        raise HTTPException(status_code=400, detail="Tip de watermark invalid.")

    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            response = await client.post(full_stirling_url, files=files, data=data)
            response.raise_for_status()
            
            new_filename = f"watermarked_{file.filename}"
            return Response(
                content=response.content,
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename={new_filename}"}
            )
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"Eroare la contactarea serviciului Stirling PDF: {exc}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"O eroare neașteptată a apărut: {e}")



# ===================== SEMNĂTURĂ =====================
@app.post("/api/v1/stirling/sign")
async def stirling_sign(
    file: UploadFile = File(..., alias="fileInput"),
    signature_image: UploadFile = File(..., alias="signatureImage"),
    page_numbers: str = Form(...), # ex: "1,3-5"
    x: int = Form(...),
    y: int = Form(...)
):
    """Adaugă o imagine (semnătură) pe un PDF folosind Stirling PDF."""
    if not check_stirling_health():
        raise HTTPException(status_code=503, detail="Stirling PDF service is not available")

    full_stirling_url = f"{STIRLING_URL}/sign"
    
    pdf_content = await file.read()
    sig_content = await signature_image.read()

    files = {
        'fileInput': (file.filename, pdf_content, file.content_type),
        'signatureImage': (signature_image.filename, sig_content, signature_image.content_type)
    }
    
    # Stirling se așteaptă la 'x' și 'y' ca string-uri în 'data'
    data = {
        'pageNumbers': page_numbers,
        'x': str(x),
        'y': str(y)
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            response = await client.post(full_stirling_url, files=files, data=data)
            response.raise_for_status()
            
            new_filename = f"signed_{file.filename}"

            return Response(
                content=response.content,
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename={new_filename}"}
            )
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"Eroare la contactarea serviciului Stirling PDF: {exc}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"O eroare neașteptată a apărut: {e}")



# ===================== OCR =====================
@app.post("/api/v1/stirling/ocr")
async def stirling_ocr(
    file: UploadFile = File(...),
    lang: str = Form("ron"),  # Limba implicită este româna
    ocr_output_type: str = Form("text") # Poate fi 'text' sau 'pdf'
):
    """Rulează OCR pe un fișier folosind Stirling PDF."""
    if not check_stirling_health():
        raise HTTPException(status_code=503, detail="Stirling PDF service is not available")

    full_stirling_url = f"{STIRLING_URL}/ocr"
    content = await file.read()
    files = {'fileInput': (file.filename, content, file.content_type)}
    data = {'lang': lang, 'ocr_output_type': ocr_output_type}

    async with httpx.AsyncClient(timeout=180.0) as client: # Timp mai mare pentru OCR
        try:
            response = await client.post(full_stirling_url, files=files, data=data)
            response.raise_for_status()
            
            if ocr_output_type == "text":
                return Response(
                    content=response.content,
                    media_type="text/plain",
                )
            else: # 'pdf'
                 new_filename = f"ocr_{file.filename}"
                 return Response(
                    content=response.content,
                    media_type="application/pdf",
                    headers={"Content-Disposition": f"attachment; filename={new_filename}"}
                )
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"Eroare la contactarea serviciului Stirling PDF: {exc}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"O eroare neașteptată a apărut: {e}")




# ========== 2. TRADUCERE ȘI OCR ==========
@app.post("/ocr/extract")
async def ocr_extract_text(
    file: UploadFile = File(...), 
    language: str = Form("ron"),
    current_user: User = Depends(get_current_user)
):
    """Extrage text dintr-un PDF scanat folosind OCR"""
    if not check_stirling_health():
        raise HTTPException(status_code=503, detail="Stirling PDF service is not available")
    
    try:
        content = await file.read()
        files = {'fileInput': (file.filename, content, file.content_type)}
        data = {'language': language}
        
        response = requests.post(f"{STIRLING_URL}/ocr/pdf-to-ocr", files=files, data=data, timeout=120)
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="OCR extraction failed")
        
        return {
            "filename": file.filename,
            "extracted_text": response.text,
            "text_length": len(response.text),
            "language": language
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/ocr/translate")
async def ocr_and_translate(
    file: UploadFile = File(...),
    source_lang: str = Form("auto"),
    target_lang: str = Form("ro"),
    current_user: User = Depends(get_current_user)
):
    """Extrage text cu OCR și îl traduce folosind AI"""
    if not AI_AVAILABLE:
        raise HTTPException(status_code=503, detail="AI service not configured")
    if not check_stirling_health():
        raise HTTPException(status_code=503, detail="Stirling PDF service not available")
    
    try:
        # Pas 1: Extrage text cu OCR
        content = await file.read()
        files = {'fileInput': (file.filename, content, file.content_type)}
        ocr_data = {'language': 'ron'}
        
        ocr_response = requests.post(f"{STIRLING_URL}/ocr/pdf-to-ocr", files=files, data=ocr_data, timeout=120)
        
        if ocr_response.status_code != 200:
            raise HTTPException(status_code=ocr_response.status_code, detail="OCR extraction failed")
        
        extracted_text = ocr_response.text
        
        if not extracted_text or len(extracted_text.strip()) < 10:
            return {
                "filename": file.filename,
                "extracted_text": extracted_text,
                "translated_text": "Nu s-a putut extrage text suficient pentru traducere.",
                "status": "no_text"
            }
        
        # Pas 2: Tradu cu Gemini
        prompt = f"""
        Tradu următorul text din {source_lang} în limba {target_lang}.
        Păstrează sensul original și formatarea.
        Textul:
        {extracted_text[:30000]}
        """
        
        response = ai_client.models.generate_content(
            model='gemini-1.5-flash',
            contents=[prompt]
        )
        translated_text = response.text
        
        return {
            "extracted_text": extracted_text[:1000] + "..." if len(extracted_text) > 1000 else extracted_text,
            "translated_text": translated_text,
            "filename": file.filename,
            "source_language": source_lang,
            "target_language": target_lang
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR/Translation failed: {str(e)}")

# ========== 3. SEMNĂTURI ==========
@app.post("/signatures/add")
async def add_signature_to_pdf(
    file: UploadFile = File(...),
    signature_image: UploadFile = File(...),
    x_position: int = Form(100),
    y_position: int = Form(100),
    page_number: int = Form(1),
    current_user: User = Depends(get_current_user)
):
    """Adaugă o semnătură pe un document PDF"""
    if not check_stirling_health():
        raise HTTPException(status_code=503, detail="Stirling PDF service is not available")
    
    try:
        files = {
            'fileInput': (file.filename, await file.read(), file.content_type),
            'imageFile': (signature_image.filename, await signature_image.read(), signature_image.content_type)
        }
        data = {
            'xPosition': x_position, 
            'yPosition': y_position, 
            'pageNumber': page_number
        }
        
        response = requests.post(f"{STIRLING_URL}/general/add-image", files=files, data=data, timeout=60)
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Signature addition failed")
        
        return Response(
            content=response.content, 
            media_type="application/pdf", 
            headers={"Content-Disposition": f"attachment; filename=signed_{file.filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/signatures/digital")
async def add_digital_signature(
    file: UploadFile = File(...),
    signer_name: str = Form(...),
    signer_title: str = Form(...),
    current_user: User = Depends(get_current_user)
):
    """Adaugă o semnătură digitală (text) pe PDF"""
    if not check_stirling_health():
        raise HTTPException(status_code=503, detail="Stirling PDF service is not available")
    
    try:
        # Creează o imagine simplă cu textul semnăturii
        from PIL import Image, ImageDraw, ImageFont
        
        img = Image.new('RGB', (300, 100), color='white')
        d = ImageDraw.Draw(img)
        d.text((10, 30), f"Semnat: {signer_name}", fill='black')
        d.text((10, 50), f"Funcție: {signer_title}", fill='black')
        d.text((10, 70), f"Data: {datetime.now().strftime('%d.%m.%Y')}", fill='black')
        
        img_buffer = BytesIO()
        img.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        
        content = await file.read()
        files = {
            'fileInput': (file.filename, content, file.content_type),
            'imageFile': ('signature.png', img_buffer.getvalue(), 'image/png')
        }
        data = {'xPosition': 100, 'yPosition': 100, 'pageNumber': 1}
        
        response = requests.post(f"{STIRLING_URL}/general/add-image", files=files, data=data, timeout=60)
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Digital signature failed")
        
        return Response(
            content=response.content, 
            media_type="application/pdf", 
            headers={"Content-Disposition": f"attachment; filename=digitally_signed_{file.filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ========== 4. DOCUMENTE LEGALE ȘI DE BUSINESS ==========
@app.get("/legal/templates")
async def get_templates():
    """Returneaza lista completa de template-uri legislative romanesti."""
    return LEGAL_TEMPLATES

@app.post("/legal/generate")
async def generate_document_from_template(request: LegalDocumentRequest):
    """
    Preia un template_id, inlocuieste variabilele trimise de frontend
    si returneaza un fisier PDF generat din text.
    """
    template_id = request.template_id
    if template_id not in LEGAL_TEMPLATES:
        raise HTTPException(status_code=404, detail="Template-ul solicitat nu exista in baza de date.")

    template_data = LEGAL_TEMPLATES[template_id]
    raw_content = template_data["content"]
    user_variables = request.variables

    for key, val in user_variables.items():
        placeholder = f"{{{{{key}}}}}"
        raw_content = raw_content.replace(placeholder, str(val))

    if "{{" in raw_content and "}}" in raw_content:
        import re
        remaining_vars = re.findall(r"\{\{([^}]+)\}\}", raw_content)
        raise HTTPException(
            status_code=400,
            detail=f"Variabile lipsa in cerere: {', '.join(sorted(set(remaining_vars)))}"
        )

    filename = f"document_{uuid.uuid4().hex[:6]}.pdf"
    pdf_buffer = create_pdf_from_text(raw_content, filename)

    return Response(
        content=pdf_buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.get("/legal/templates-nested-legacy")
async def get_legal_templates(current_user: User = Depends(get_current_user)):
    """Returnează toate template-urile disponibile pentru documente legale"""
    categories = {}
    for category, templates in LEGAL_TEMPLATES.items():
        categories[category] = [
            {"id": tid, "name": tpl["name"], "category": tpl["category"]}
            for tid, tpl in templates.items()
        ]
    return categories

@app.post("/legal/generate-nested-legacy")
async def generate_legal_document(
    request: LegalDocumentRequest, 
    current_user: User = Depends(get_current_user)
):
    """Generează documente legale conform legislației române"""
    
    # Parsează template_id (format: "categorie.tip")
    if '.' in request.template_id:
        category, template_key = request.template_id.split('.')
    else:
        # Caută în toate categoriile
        found = False
        for cat, templates in LEGAL_TEMPLATES.items():
            if request.template_id in templates:
                category, template_key = cat, request.template_id
                found = True
                break
        if not found:
            raise HTTPException(status_code=404, detail=f"Template {request.template_id} not found")
    
    if category not in LEGAL_TEMPLATES:
        raise HTTPException(status_code=404, detail=f"Categoria '{category}' nu există")
    
    if template_key not in LEGAL_TEMPLATES[category]:
        raise HTTPException(status_code=404, detail=f"Template-ul '{template_key}' nu există în categoria '{category}'")
    
    template = LEGAL_TEMPLATES[category][template_key]
    template_text = template["template"]
    
    try:
        # Adaugă variabile implicite
        variables = request.variables.copy()
        if "data_azi" not in variables:
            variables["data_azi"] = datetime.now().strftime("%d.%m.%Y")
        if "data_ora" not in variables:
            variables["data_ora"] = datetime.now().strftime("%d.%m.%Y %H:%M")
        
        # Formatează template-ul
        formatted_text = template_text.format(**variables)
        
        # Adaugă antet și subsol
        header = f"E-DocPDF - Document Generat Automat\nData generării: {variables['data_azi']}\n{'-'*50}\n\n"
        footer = f"\n\n{'-'*50}\nDocument generat prin E-DocPDF Enterprise - Sistem oficial de documente\n"
        
        full_content = header + formatted_text + footer
        
        if request.format == "pdf":
            # Creează PDF
            buffer = create_pdf_from_text(full_content, f"{template_key}.pdf")
            return Response(
                content=buffer.getvalue(),
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename={template_key}_{variables['data_azi']}.pdf"}
            )
        else:
            # Returnează text simplu
            return {
                "template_id": request.template_id,
                "template_name": template["name"],
                "content": full_content,
                "format": "text",
                "variables_used": variables
            }
            
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Lipsește variabila obligatorie: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Eroare la generare: {str(e)}")

@app.post("/legal/business/generate")
async def generate_business_document(
    doc_type: str = Form(...),
    company_name: str = Form(...),
    company_cui: str = Form(...),
    company_address: str = Form(...),
    client_name: str = Form(...),
    client_cnp: str = Form(...),
    client_address: str = Form(...),
    service_description: str = Form(...),
    value: str = Form(...),
    currency: str = Form("RON"),
    current_user: User = Depends(get_current_user)
):
    """
    Generator rapid pentru documente de business:
    - Contract prestări servicii
    - Factură proformă
    - Ofertă comercială
    - Deviz lucrări
    """
    
    variables = {
        "data_azi": datetime.now().strftime("%d.%m.%Y"),
        "nume_firma": company_name,
        "cui_firma": company_cui,
        "sediu_firma": company_address,
        "nume_client": client_name,
        "cnp_client": client_cnp,
        "adresa_client": client_address,
        "descriere_servicii": service_description,
        "valoare": value,
        "valuta": currency,
        "nr_document": f"{doc_type.upper()}/{datetime.now().strftime('%Y')}/{uuid.uuid4().hex[:6].upper()}"
    }
    
    templates = {
        "ofertă": """
            OFERTĂ COMERCIALĂ
            Nr. {nr_document} / {data_azi}
            
            Către: {nume_client}
            {adresa_client}
            
            În atenția: {nume_client}
            
            Subsemnata {nume_firma}, CUI {cui_firma}, cu sediul în {sediu_firma}, denumită în continuare Furnizor,
            vă facem următoarea ofertă:
            
            Ofertăm serviciile: {descriere_servicii}
            
            Valoarea totală a ofertei este de {valoare} {valuta}, exclusiv TVA.
            
            Termen de valabilitate: 30 de zile de la data emiterii.
            Termen de livrare: {livrare} zile lucrătoare de la confirmarea comenzii.
            
            Prezenta ofertă este valabilă împreună cu termenii și condițiile anexate.
            
            EMITENT,
            {nume_firma}
            Semnătura autorizată,
            __________________
            """,
        
        "proformă": """
            FACTURĂ PROFORMĂ
            Seria FP {nr_document}
            Data: {data_azi}
            
            Furnizor: {nume_firma}
            CUI: {cui_firma}
            Sediu: {sediu_firma}
            
            Client: {nume_client}
            CUI/CNP: {cnp_client}
            Adresă: {adresa_client}
            
            | # | Denumire produs/serviciu | Cantitate | Preț unitar | Total |
            |---|-------------------------|-----------|-------------|--------|
            | 1 | {descriere_servicii} | 1 | {valoare} | {valoare} |
            
            Subtotal: {valoare} {valuta}
            TVA (19%): {tva} {valuta}
            Total de plată: {total} {valuta}
            
            Plată prin: Ordin de plată / Numerar
            Cont bancar: {cont_bancar}
            
            Valabilitate ofertă: 15 zile
            """,
        
        "deviz": """
            DEVIZ DE LUCRĂRI
            Nr. {nr_document} / {data_azi}
            
            Beneficiar: {nume_client}
            {adresa_client}
            
            Lucrare: {descriere_servicii}
            
            Deviz estimativ:
            
            | Nr. crt. | Denumire lucrare | UM | Cantitate | Preț unitar | Total |
            |----------|-----------------|-----|-----------|-------------|--------|
            | 1 | {descriere_servicii} | buc | 1 | {valoare} | {valoare} |
            
            TOTAL GENERAL: {valoare} {valuta}
            TVA: {tva} {valuta}
            TOTAL cu TVA: {total} {valuta}
            
            Termen execuție: {termen} zile lucrătoare
            Garanție: {garantie} luni
            
            Prezentul deviz este valabil 30 de zile.
            
            Executant,
            {nume_firma}
            """,
        
        "contract": """
            CONTRACT DE PRESTĂRI SERVICII
            Nr. {nr_document} / {data_azi}
            
            Părțile contractante:
            
            1. {nume_firma}, cu sediul în {sediu_firma}, CUI {cui_firma}, reprezentată prin {reprezentant},
            în calitate de PRESTATOR
            
            2. {nume_client}, cu domiciliul/sediul în {adresa_client}, CNP/CUI {cnp_client},
            în calitate de BENEFICIAR
            
            Art. 1. Obiectul contractului
            Prestatorul se obligă să presteze pentru Beneficiar următoarele servicii:
            {descriere_servicii}
            
            Art. 2. Durata contractului
            Contractul este valabil de la data {data_azi} până la data de {data_sfarsit}.
            
            Art. 3. Prețul și plata
            Prețul total al serviciilor este de {valoare} {valuta}, exclusiv TVA.
            Plata se va face în termen de {termen_plata} zile de la emiterea facturii.
            
            Art. 4. Obligațiile părților
            Prestatorul se obligă să execute serviciile cu profesionalism.
            Beneficiarul se obligă să plătească prețul convenit.
            
            Art. 5. Răspunderea contractuală
            Părțile sunt răspunzătoare pentru neîndeplinirea obligațiilor conform legii.
            
            Art. 6. Forța majoră
            Părțile sunt exonerate de răspundere în caz de forță majoră.
            
            Art. 7. Litigii
            Orice dispută se va soluționa pe cale amiabilă, iar în caz contrar de instanțele din România.
            
            Încheiat astăzi, {data_azi}, în 2 exemplare originale.
            
            PRESTATOR,                    BENEFICIAR,
            {nume_firma}                  {nume_client}
            __________________            __________________
            """
    }
    
    template = templates.get(doc_type.lower())
    if not template:
        raise HTTPException(status_code=404, detail=f"Tip document '{doc_type}' necunoscut. Tipuri disponibile: ofertă, proformă, deviz, contract")
    
    # Calculează TVA și total
    try:
        val_numeric = float(value.replace(',', '.'))
        tva_val = val_numeric * 0.19
        total_val = val_numeric + tva_val
        
        variables.update({
            "tva": f"{tva_val:.2f}",
            "total": f"{total_val:.2f}",
            "cont_bancar": os.getenv("COMPANY_BANK_ACCOUNT", "RO00XXXX0000000000"),
            "reprezentant": os.getenv("COMPANY_REPRESENTATIVE", "Administrator"),
            "data_sfarsit": (datetime.now() + timedelta(days=30)).strftime("%d.%m.%Y"),
            "termen_plata": "14",
            "termen": "30",
            "garantie": "12",
            "livrare": "14"
        })
    except:
        pass
    
    try:
        formatted_text = template.format(**variables)
        
        # Creează PDF cu ReportLab
        buffer = create_pdf_from_text(formatted_text, f"{doc_type}.pdf")
        
        return Response(
            content=buffer.getvalue(),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={doc_type}_{variables['nr_document']}.pdf"}
        )
        
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Lipsește câmpul: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========== 5. PROCESARE PDF (Stirling) ==========
@app.post("/process/merge")
async def merge_pdfs(files: List[UploadFile] = File(...), current_user: User = Depends(get_current_user)):
    if not check_stirling_health():
        raise HTTPException(status_code=503, detail="Stirling PDF service is not available")
    
    try:
        stirling_files = []
        for file in files:
            content = await file.read()
            stirling_files.append(('fileInput', (file.filename, content, file.content_type)))
        
        response = requests.post(f"{STIRLING_URL}/general/merge-pdfs", files=stirling_files, timeout=60)
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Stirling error: {response.text}")
        
        return Response(
            content=response.content, 
            media_type="application/pdf", 
            headers={"Content-Disposition": "attachment; filename=merged.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/process/split")
async def split_pdf(file: UploadFile = File(...), page_ranges: str = Form(...), current_user: User = Depends(get_current_user)):
    if not check_stirling_health():
        raise HTTPException(status_code=503, detail="Stirling PDF service is not available")
    
    try:
        content = await file.read()
        files = {'fileInput': (file.filename, content, file.content_type)}
        data = {'pageNumbers': page_ranges}
        
        response = requests.post(f"{STIRLING_URL}/general/split-pages", files=files, data=data, timeout=60)
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Stirling error: {response.text}")
        
        return Response(
            content=response.content, 
            media_type="application/zip", 
            headers={"Content-Disposition": "attachment; filename=split_pages.zip"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/ai/translate-text")
async def translate_text(
    text: str = Form(...),
    source_lang: str = Form("auto"),
    target_lang: str = Form("ro")
):
    """Traduce un text simplu folosind AI."""
    if not AI_AVAILABLE:
        raise HTTPException(status_code=503, detail="Serviciul AI nu este configurat sau disponibil.")

    try:
        prompt = f"Tradu următorul text din {source_lang} în limba {target_lang}. Păstrează sensul original și formatarea.\n\nText: {text}"
        response = client.generate_content(
            model="models/gemini-1.5-flash",
            contents=[prompt]
        )
        return {"translated_text": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Eroare la traducere: {str(e)}")

@app.post("/process/compress")
async def compress_pdf(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    if not check_stirling_health():
        raise HTTPException(status_code=503, detail="Stirling PDF service is not available")

    try:
        content = await file.read()
        files = {'fileInput': (file.filename, content, file.content_type)}

        response = requests.post(f"{STIRLING_URL}/general/compress-pdf", files=files, timeout=60)

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Stirling error: {response.text}")

        return Response(
            content=response.content,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=compressed_{file.filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/process/rotate")
async def rotate_pdf(
    file: UploadFile = File(...),
    rotation: int = Form(90),
    current_user: User = Depends(get_current_user)
):
    """Rotește un document PDF folosind Stirling PDF."""
    if not check_stirling_health():
        raise HTTPException(status_code=503, detail="Stirling PDF service is not available")

    try:
        content = await file.read()
        files = {'fileInput': (file.filename, content, file.content_type)}
        data = {'rotation': str(rotation)}

        response = requests.post(f"{STIRLING_URL}/general/rotate-pdf", files=files, data=data, timeout=60)

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Stirling error: {response.text}")

        return Response(
            content=response.content,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=rotated_{file.filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/process/protect")
async def protect_pdf(
    file: UploadFile = File(...),
    password: str = Form(...),
    current_user: User = Depends(get_current_user)
):
    """Adaugă protecție cu parolă unui document PDF."""
    if not check_stirling_health():
        raise HTTPException(status_code=503, detail="Stirling PDF service is not available")

    try:
        content = await file.read()
        files = {'fileInput': (file.filename, content, file.content_type)}
        data = {'password': password}

        response = requests.post(f"{STIRLING_URL}/general/protect-pdf", files=files, data=data, timeout=60)

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Stirling error: {response.text}")

        return Response(
            content=response.content,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=protected_{file.filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/process/unlock")
async def unlock_pdf(
    file: UploadFile = File(...),
    password: str = Form(...),
    current_user: User = Depends(get_current_user)
):
    """Elimină protecția cu parolă a unui document PDF."""
    if not check_stirling_health():
        raise HTTPException(status_code=503, detail="Stirling PDF service is not available")

    try:
        content = await file.read()
        files = {'fileInput': (file.filename, content, file.content_type)}
        data = {'password': password}

        response = requests.post(f"{STIRLING_URL}/general/unlock-pdf", files=files, data=data, timeout=60)

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Stirling error: {response.text}")

        return Response(
            content=response.content,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=unlocked_{file.filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    
# Alias pentru /process/ocr-translate (asteptat de frontend)
@app.post("/process/ocr-translate")
async def process_ocr_translate(
    file: UploadFile = File(...),
    source_lang: str = Form(...),
    target_lang: str = Form(...),
    current_user: User = Depends(get_current_user)
):
    """Endpoint compatibil cu frontendul - returneaza JSON cu extracted_text si translated_text"""
    # Reutilizam logica din /ocr/translate dar ajustam parametrii
    return await ocr_and_translate(file, source_lang, target_lang, current_user)

@app.post("/process/sign")
async def process_sign(
    file: UploadFile = File(...),
    signature_image: UploadFile = File(...),
    x: int = Form(100),
    y: int = Form(100),
    page: int = Form(1),
    current_user: User = Depends(get_current_user)
):
    """Alias pentru adaugare semnatura (compatibil frontend)"""
    return await add_signature_to_pdf(file, signature_image, x, y, page, current_user)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
