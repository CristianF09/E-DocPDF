// frontend/src/lib/api.js
import { API_BASE_URL } from './app-params';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL || '/api';   // fallback la '/api'
    this.token = localStorage.getItem('edocpdf_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('edocpdf_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('edocpdf_token');
  }

  _getAuthHeaders() {
    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async _authenticatedRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      ...this._getAuthHeaders(),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Cererea a eșuat cu status ${response.status}`);
    }
    return response.json();
  }

  async aiAnalyze(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/api/v1/ai/analyze`, {
      method: 'POST',
      headers: this._getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Analiza documentului a eșuat');
    }

    return response.json();
  }

  // ========== Autentificare ==========
  async login(username, password) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await fetch(`${this.baseURL}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Autentificare eșuată');
      }

      const data = await response.json();
      this.setToken(data.access_token);
      const user = await this.getCurrentUser();
      return { ...data, user };
    } catch (error) {
      console.error('Eroare login:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    return this._authenticatedRequest('/users/me/');
  }

  async getDocuments() {
    return this._authenticatedRequest('/documents/');
  }

  async uploadDocument(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${this.baseURL}/upload/`, {
      method: 'POST',
      headers: this._getAuthHeaders(),
      body: formData
    });
    if (!response.ok) throw new Error('Încărcarea a eșuat');
    return response.json();
  }

  async deleteDocument(documentId) {
    return this._authenticatedRequest(`/documents/${documentId}`, { method: 'DELETE' });
  }

  // ========== Procesare PDF ==========
  async mergePDFs(files) {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    const response = await fetch(`${this.baseURL}/process/merge`, {
      method: 'POST',
      headers: this._getAuthHeaders(),
      body: formData
    });
    if (!response.ok) throw new Error('Îmbinarea PDF-urilor a eșuat');
    return response.blob();
  }

  async aiSummarize(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/api/v1/ai/summarize`, {
      method: 'POST',
      headers: this._getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Generarea rezumatului a eșuat');
    }

    return response.json();
  }

  async stirlingAddWatermark(file, options) {
    const formData = new FormData();
    formData.append('fileInput', file);
    formData.append('watermark_type', options.type);

    if (options.type === 'text') {
      formData.append('text', options.text);
    } else if (options.type === 'image' && options.imageFile) {
      formData.append('imageFile', options.imageFile);
    }

    const response = await fetch(`${this.baseURL}/api/v1/stirling/watermark`, {
      method: 'POST',
      headers: this._getAuthHeaders(),
      body: formData
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Adăugarea watermark-ului a eșuat');
    }
    return response.blob();
  }

  async stirlingOcr(file, lang = 'ron', outputType = 'text') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('lang', lang);
    formData.append('ocr_output_type', outputType);

    const response = await fetch(`${this.baseURL}/api/v1/stirling/ocr`, {
      method: 'POST',
      headers: this._getAuthHeaders(),
      body: formData
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Procesul OCR a eșuat');
    }

    if (outputType === 'text') {
      return response.text(); // Returnează textul extras
    }
    return response.blob(); // Returnează PDF-ul procesat
  }

  async stirlingSign(file, signatureImageBlob, pageNumbers, x, y) {
    const formData = new FormData();
    formData.append('fileInput', file);
    formData.append('signatureImage', signatureImageBlob, 'signature.png');
    formData.append('page_numbers', pageNumbers);
    formData.append('x', x);
    formData.append('y', y);

    const response = await fetch(`${this.baseURL}/api/v1/stirling/sign`, {
      method: 'POST',
      headers: this._getAuthHeaders(),
      body: formData
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Aplicarea semnăturii a eșuat');
    }
    return response.blob();
  }

  async stirlingCompress(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/api/v1/stirling/compress`, {
      method: 'POST',
      headers: this._getAuthHeaders(),
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Comprimarea a eșuat');
    }
    return response.blob();
  }

  async splitPDF(file, pageRanges) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('page_ranges', pageRanges);
    const response = await fetch(`${this.baseURL}/process/split`, {
      method: 'POST',
      headers: this._getAuthHeaders(),
      body: formData
    });
    if (!response.ok) throw new Error('Împărțirea PDF-ului a eșuat');
    return response.blob();
  }

  async compressPDF(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${this.baseURL}/process/compress`, {
      method: 'POST',
      headers: this._getAuthHeaders(),
      body: formData
    });
    if (!response.ok) throw new Error('Comprimarea PDF-ului a eșuat');
    return response.blob();
  }

  async convertToPDF(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${this.baseURL}/convert/to-pdf`, {
      method: 'POST',
      headers: this._getAuthHeaders(),
      body: formData
    });
    if (!response.ok) throw new Error('Conversia în PDF a eșuat');
    return response.blob();
  }

  // ========== Conversii Stirling PDF (Endpoint Unificat) ==========
  async stirlingConvert(file, outputFormat) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('output_format', outputFormat);

    const response = await fetch(`${this.baseURL}/api/v1/stirling/convert`, {
      method: 'POST',
      headers: this._getAuthHeaders(),
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Conversia în ${outputFormat.toUpperCase()} a eșuat`);
    }
    return response.blob();
  }

  // ========== Traducere + OCR ==========
  async translateOCR(file, sourceLang, targetLang) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('source_lang', sourceLang);
    formData.append('target_lang', targetLang);
    const response = await fetch(`${this.baseURL}/process/ocr-translate`, {
      method: 'POST',
      headers: this._getAuthHeaders(),
      body: formData
    });
    if (!response.ok) throw new Error('OCR + traducere a eșuat');
    return response.json();
  }

  // ========== Semnătură ==========
  async addSignature(file, signatureImageBlob, x = 100, y = 100, page = 1) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('signature_image', signatureImageBlob, 'signature.png');
    formData.append('x', String(x));
    formData.append('y', String(y));
    formData.append('page', String(page));
    const response = await fetch(`${this.baseURL}/process/sign`, {
      method: 'POST',
      headers: this._getAuthHeaders(),
      body: formData
    });
    if (!response.ok) throw new Error('Aplicarea semnăturii a eșuat');
    return response.blob();
  }

  // ========== Generare document juridic ==========
  async generateLegalDocument(templateId, variables) {
    const response = await fetch(`${this.baseURL}/legal/generate`, {
      method: 'POST',
      headers: {
        ...this._getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ template_id: templateId, variables })
    });
    if (!response.ok) throw new Error('Generarea documentului a eșuat');
    return response.blob();
  }
}

export const apiService = new ApiService();
export default apiService;