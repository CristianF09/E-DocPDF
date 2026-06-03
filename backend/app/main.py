from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os
from pathlib import Path
from . import convert, ocr, sign, translate

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
OUTPUT_DIR = BASE_DIR / "outputs"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="E-DocPDF Backend", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post('/convert/pdf-to-docx')
async def pdf_to_docx(file: UploadFile = File(...)):
    try:
        input_path = UPLOAD_DIR / file.filename
        with open(input_path, 'wb') as f:
            f.write(await file.read())

        output_path = OUTPUT_DIR / (input_path.stem + '.docx')
        convert.pdf_to_docx(str(input_path), str(output_path))

        return FileResponse(str(output_path), filename=output_path.name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/ocr')
async def do_ocr(file: UploadFile = File(...), lang: str = Form('eng')):
    try:
        input_path = UPLOAD_DIR / file.filename
        with open(input_path, 'wb') as f:
            f.write(await file.read())
        text = ocr.perform_ocr(str(input_path), lang=lang)
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/sign')
async def add_signature(file: UploadFile = File(...), signature: UploadFile = File(...), page: int = Form(1), x: float = Form(50.0), y: float = Form(50.0)):
    try:
        input_path = UPLOAD_DIR / file.filename
        sig_path = UPLOAD_DIR / ('sig_' + signature.filename)
        with open(input_path, 'wb') as f:
            f.write(await file.read())
        with open(sig_path, 'wb') as f:
            f.write(await signature.read())

        output_path = OUTPUT_DIR / (input_path.stem + '_signed.pdf')
        sign.stamp_signature(str(input_path), str(sig_path), str(output_path), page=page, x=x, y=y)
        return FileResponse(str(output_path), filename=output_path.name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/translate')
async def translate_text(text: str = Form(...), target_lang: str = Form('ro')):
    try:
        translated = translate.translate_text(text, target_lang)
        return {"translated_text": translated}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/health')
def health():
    return {"status": "ok"}
