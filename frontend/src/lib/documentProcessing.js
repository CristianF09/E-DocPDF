// ============================================
// documentProcessing.js - VERSIUNE SIMPLIFICATĂ
// Toate operațiunile sunt delegate backend-ului Python
// Backend: Stirling PDF + Google Gemini AI
// ============================================

import { apiService } from './api';

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