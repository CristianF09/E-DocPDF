// ============================================
// documentProcessing.js - VERSIUNE SIMPLIFICATĂ
// Toate operațiunile sunt delegate backend-ului Python
// Backend: Stirling PDF + Google Gemini AI
// ============================================

import { apiService } from './api';

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const documentProcessor = {
  // ========== CONVERSII ==========
  async convertToPDF(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${apiService.baseURL}/convert/to-pdf`, {
      method: 'POST',
      headers: apiService._getAuthHeaders(),
      body: formData
    });
    if (!response.ok) throw new Error('Conversia în PDF a eșuat');
    return response.blob();
  },
  
  async convertToWord(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${apiService.baseURL}/convert/to-word`, {
      method: 'POST',
      headers: apiService._getAuthHeaders(),
      body: formData
    });
    if (!response.ok) throw new Error('Conversia în Word a eșuat');
    return response.blob();
  },
  
  async convertToExcel(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${apiService.baseURL}/convert/to-excel`, {
      method: 'POST',
      headers: apiService._getAuthHeaders(),
      body: formData
    });
    if (!response.ok) throw new Error('Conversia în Excel a eșuat');
    return response.blob();
  },
  
  // ========== OPERAȚIUNI PDF ==========
  async mergePDFs(files) {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const response = await fetch(`${apiService.baseURL}/process/merge`, {
      method: 'POST',
      headers: apiService._getAuthHeaders(),
      body: formData
    });
    if (!response.ok) throw new Error('Îmbinarea PDF-urilor a eșuat');
    return response.blob();
  },
  
  async splitPDF(file, pageRanges) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('page_ranges', pageRanges);
    
    const response = await fetch(`${apiService.baseURL}/process/split`, {
      method: 'POST',
      headers: apiService._getAuthHeaders(),
      body: formData
    });
    if (!response.ok) throw new Error('Împărțirea PDF-ului a eșuat');
    return response.blob();
  },
  
  async compressPDF(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${apiService.baseURL}/process/compress`, {
      method: 'POST',
      headers: apiService._getAuthHeaders(),
      body: formData
    });
    if (!response.ok) throw new Error('Comprimarea PDF-ului a eșuat');
    return response.blob();
  },
  
  // ========== OCR ȘI EXTRAGERE TEXT ==========
  async extractText(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${apiService.baseURL}/ocr/extract`, {
      method: 'POST',
      headers: apiService._getAuthHeaders(),
      body: formData
    });
    if (!response.ok) throw new Error('Extragerea textului a eșuat');
    return response.json();
  },
  
  // ========== TRADUCERI CU AI ==========
  async translatePDF(file, sourceLang = 'auto', targetLang = 'ro') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('source_lang', sourceLang);
    formData.append('target_lang', targetLang);
    
    const response = await fetch(`${apiService.baseURL}/ocr/translate`, {
      method: 'POST',
      headers: apiService._getAuthHeaders(),
      body: formData
    });
    if (!response.ok) throw new Error('Traducerea documentului a eșuat');
    return response.json();
  },
  
  async translateText(text, targetLang = 'ro', sourceLang = 'auto') {
    const response = await fetch(`${apiService.baseURL}/ai/translate-text`, {
      method: 'POST',
      headers: {
        ...apiService._getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text, target_language: targetLang, source_language: sourceLang })
    });
    if (!response.ok) throw new Error('Traducerea textului a eșuat');
    const data = await response.json();
    return data.translated_text;
  },
  
  async summarizeText(text, maxSentences = 5) {
    const response = await fetch(`${apiService.baseURL}/ai/summarize-text`, {
      method: 'POST',
      headers: {
        ...apiService._getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text, max_sentences: maxSentences })
    });
    if (!response.ok) throw new Error('Generarea rezumatului a eșuat');
    const data = await response.json();
    return data.summary;
  },
  
  async editText(text, instruction) {
    const response = await fetch(`${apiService.baseURL}/ai/edit-text`, {
      method: 'POST',
      headers: {
        ...apiService._getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text, edit_instruction: instruction })
    });
    if (!response.ok) throw new Error('Editarea textului a eșuat');
    const data = await response.json();
    return data.edited_text;
  },
  
  // ========== SEMNĂTURI ==========
  async addSignature(pdfFile, signatureImage, x = 50, y = 50, page = 1) {
    // Try local application first (pdf-lib) when inputs are Blob/File
    try {
      if ((pdfFile instanceof Blob || typeof pdfFile === 'string') && signatureImage instanceof Blob) {
        // If pdfFile is an object URL, fetch bytes
        let pdfBytes;
        if (typeof pdfFile === 'string') {
          // assume object URL
          const r = await fetch(pdfFile);
          pdfBytes = await r.arrayBuffer();
        } else {
          pdfBytes = await pdfFile.arrayBuffer();
        }
        const sigBytes = await signatureImage.arrayBuffer();
        const newPdfBytes = await this.applySignatureLocal(pdfBytes, sigBytes, x, y, page);
        return new Blob([newPdfBytes], { type: 'application/pdf' });
      }
    } catch (e) {
      // fallback to server-side
      console.warn('Local signature application failed, falling back to server:', e);
    }

    const formData = new FormData();
    formData.append('file', pdfFile);
    formData.append('signature_image', signatureImage);
    formData.append('x_position', x);
    formData.append('y_position', y);
    formData.append('page_number', page);
    
    const response = await fetch(`${apiService.baseURL}/signatures/add`, {
      method: 'POST',
      headers: apiService._getAuthHeaders(),
      body: formData
    });
    if (!response.ok) throw new Error('Adăugarea semnăturii a eșuat');
    return response.blob();
  },

  // Local pdf-lib based simple signature applicator
  async applySignatureLocal(pdfArrayBuffer, sigArrayBuffer, x = 50, y = 50, pageNumber = 1) {
    try {
      const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
      const pngImage = await pdfDoc.embedPng(sigArrayBuffer);
      const pages = pdfDoc.getPages();
      const idx = Math.max(0, Math.min(pageNumber - 1, pages.length - 1));
      const page = pages[idx];
      const { width, height } = page.getSize();

      // Default signature width in PDF points
      const sigWidth = Math.min(200, width * 0.25);
      const scale = sigWidth / pngImage.width;
      const sigHeight = pngImage.height * scale;

      // Coordinates: assume origin at bottom-left; if provided coords look like pixels, user should adjust
      const px = Number(x) || 0;
      const py = Number(y) || 0;
      // If coordinates seem large relative to page size, map them proportionally (simple heuristic)
      let drawX = px;
      let drawY = py;
      if (px > width || py > height) {
        // assume px/py are in pixels of typical A4 rendered at 96dpi (approx 1123x1587 px) — map proportionally
        drawX = (px / 1123) * width;
        drawY = (py / 1587) * height;
      }

      // pdf-lib uses bottom-left origin; ensure Y is from bottom
      // If drawY looks small, treat it as distance from top and convert
      if (drawY > height * 0.75) {
        // likely from top coordinate, convert
        drawY = height - drawY;
      }

      page.drawImage(pngImage, {
        x: drawX,
        y: drawY,
        width: sigWidth,
        height: sigHeight,
      });

      const newBytes = await pdfDoc.save();
      return newBytes;
    } catch (e) {
      console.error('applySignatureLocal error:', e);
      throw e;
    }
  },

  // ========== PDF-LIB TEXT & IMAGE TOOLS ==========
  async addTextLocal(pdfArrayBuffer, text, opts = {}) {
    try {
      const {
        pageNumber = 1,
        x = 50,
        y = 700,
        size = 12,
        color = { r: 0, g: 0, b: 0 },
        fontName = 'Helvetica'
      } = opts;

      const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
      const pages = pdfDoc.getPages();
      const idx = Math.max(0, Math.min(pageNumber - 1, pages.length - 1));
      const page = pages[idx];
      const { width, height } = page.getSize();

      let font;
      try {
        font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      } catch (e) {
        font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      }

      // Map coords if they are in px-like large values
      let drawX = Number(x) || 0;
      let drawY = Number(y) || 0;
            if (drawX > width) { drawX = (drawX / 1123) * width; }
            if (drawY > height) { drawY = (drawY / 1587) * height; }
            if (drawY > height * 0.75) { drawY = height - drawY; }

      page.drawText(String(text), {
        x: drawX,
        y: drawY,
        size,
        font,
        color: rgb(color.r || 0, color.g || 0, color.b || 0),
        maxWidth: width - drawX - 20,
        lineHeight: size * 1.15
      });

      const newBytes = await pdfDoc.save();
      return newBytes;
    } catch (e) {
      console.error('addTextLocal error:', e);
      throw e;
    }
  },

  async addImageLocal(pdfArrayBuffer, imageArrayBuffer, opts = {}) {
    try {
      const {
        pageNumber = 1,
        x = 50,
        y = 100,
        width: imgWidth = 150,
        height: imgHeight = null
      } = opts;

      const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
      // detect image type by header bytes (PNG/JPEG)
      const header = new Uint8Array(imageArrayBuffer).subarray(0, 4);
      const isPng = header[0] === 0x89 && header[1] === 0x50;
      const isJpg = header[0] === 0xff && header[1] === 0xd8;

      let embeddedImage;
      if (isPng) embeddedImage = await pdfDoc.embedPng(imageArrayBuffer);
      else if (isJpg) embeddedImage = await pdfDoc.embedJpg(imageArrayBuffer);
      else {
        // try png embedding as fallback
        embeddedImage = await pdfDoc.embedPng(imageArrayBuffer);
      }

      const pages = pdfDoc.getPages();
      const idx = Math.max(0, Math.min(pageNumber - 1, pages.length - 1));
      const page = pages[idx];
      const { width, height } = page.getSize();

      let drawX = Number(x) || 0;
      let drawY = Number(y) || 0;
      if (drawX > width) drawX = (drawX / 1123) * width;
      if (drawY > height) drawY = (drawY / 1587) * height;
      if (drawY > height * 0.75) drawY = height - drawY;

      let drawW = imgWidth;
      let drawH = imgHeight || (embeddedImage.height * (imgWidth / embeddedImage.width));

      page.drawImage(embeddedImage, {
        x: drawX,
        y: drawY,
        width: drawW,
        height: drawH
      });

      const newBytes = await pdfDoc.save();
      return newBytes;
    } catch (e) {
      console.error('addImageLocal error:', e);
      throw e;
    }
  },

  
  async addDigitalSignature(pdfFile, signerName, signerTitle) {
    const formData = new FormData();
    formData.append('file', pdfFile);
    formData.append('signer_name', signerName);
    formData.append('signer_title', signerTitle);
    
    const response = await fetch(`${apiService.baseURL}/signatures/digital`, {
      method: 'POST',
      headers: apiService._getAuthHeaders(),
      body: formData
    });
    if (!response.ok) throw new Error('Adăugarea semnăturii digitale a eșuat');
    return response.blob();
  },
  
  // ========== DOCUMENTE LEGALE ==========
  async getLegalTemplates() {
    const response = await fetch(`${apiService.baseURL}/legal/templates`, {
      method: 'GET',
      headers: apiService._getAuthHeaders()
    });
    if (!response.ok) throw new Error('Nu s-au putut încărca template-urile');
    return response.json();
  },
  
  async generateLegalDocument(templateId, variables) {
    const response = await fetch(`${apiService.baseURL}/legal/generate`, {
      method: 'POST',
      headers: {
        ...apiService._getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ template_id: templateId, variables, format: 'pdf' })
    });
    if (!response.ok) throw new Error('Generarea documentului a eșuat');
    return response.blob();
  },
  
  async generateBusinessDocument(docType, data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => formData.append(key, data[key]));
    formData.append('doc_type', docType);
    
    const response = await fetch(`${apiService.baseURL}/legal/business/generate`, {
      method: 'POST',
      headers: apiService._getAuthHeaders(),
      body: formData
    });
    if (!response.ok) throw new Error('Generarea documentului business a eșuat');
    return response.blob();
  }
};

// Export pentru compatibilitate cu codul existent
export const convertHubAPI = documentProcessor;
export const translationAPI = documentProcessor;
export const ocrService = documentProcessor;
export const pdfService = documentProcessor;
export const esignaturesAPI = documentProcessor;