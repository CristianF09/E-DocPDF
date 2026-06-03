// frontend/src/lib/app-params.js

// ========== CONFIGURARE BASE URL ==========
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

// ========== ENDPOINT-URI BACKEND SHIFTPDF ==========
export const API_ENDPOINTS = {
  // Autentificare și utilizatori
  login: '/token',
  user: '/users/me/',
  users: '/users/',
  
  // Documente
  documents: '/documents/',
  upload: '/upload/',
  process_text: '/ocr/extract',  // Corectat
  delete_document: '/documents/', // + ID
  
  // Procesare PDF (Stirling)
  merge_pdfs: '/process/merge',
  split_pdf: '/process/split',
  compress_pdf: '/process/compress',
  
  // Conversie documente
  pdf_to_word: '/convert/to-word',  // Corectat
  pdf_to_excel: '/convert/to-excel',  // Corectat
  to_pdf: '/convert/to-pdf',  // Nou - conversie orice în PDF
  
  // AI și OCR
  translate_pdf: '/ocr/translate',  // Corectat
  translate_text: '/ai/translate-text',  // Nou - traducere text simplu
  summarize_text: '/ai/summarize-text',  // Nou - rezumat text
  edit_text: '/ai/edit-text',  // Nou - editare text cu AI
  extract_text: '/ai/extract-text',  // Nou - extracție text din PDF
  
  // Semnături
  detect_signatures: '/signatures/digital',  // Corectat
  add_signature: '/signatures/add',  // Nou - adăugare semnătură
  
  // Documente legale și business
  legal_templates: '/legal/templates',  // Nou
  generate_legal: '/legal/generate',  // Nou
  generate_business: '/legal/business/generate',  // Nou
  
  // Utilitare
  health: '/',
  stirling_health: '/stirling-health'
};



// ========== CONFIGURARE APLICAȚIE ==========
const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

// ========== FUNCȚII HELPER ==========
const toSnakeCase = (str) => {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
};

const toCamelCase = (str) => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

// ========== GESTIONARE PARAMETRI URL ==========
const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false, storageKey = null } = {}) => {
  if (isNode) {
    return defaultValue;
  }
  
  const finalStorageKey = storageKey || `app_${toSnakeCase(paramName)}`;
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get(paramName);
  
  // Elimină din URL dacă se solicită
  if (removeFromUrl && searchParam) {
    urlParams.delete(paramName);
    const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""}${window.location.hash}`;
    window.history.replaceState({}, document.title, newUrl);
  }
  
  // Prioritate: parametru URL
  if (searchParam) {
    storage.setItem(finalStorageKey, searchParam);
    return searchParam;
  }
  
  // Valoare implicită
  if (defaultValue !== undefined) {
    storage.setItem(finalStorageKey, defaultValue);
    return defaultValue;
  }
  
  // Valoare din storage
  const storedValue = storage.getItem(finalStorageKey);
  if (storedValue) {
    return storedValue;
  }
  
  return null;
};

// ========== SETARE PARAMETRU ==========
const setAppParamValue = (paramName, value, { storageKey = null } = {}) => {
  if (isNode) return false;
  
  const finalStorageKey = storageKey || `app_${toSnakeCase(paramName)}`;
  storage.setItem(finalStorageKey, value);
  return true;
};

// ========== ȘTERGERE PARAMETRU ==========
const removeAppParamValue = (paramName, { storageKey = null } = {}) => {
  if (isNode) return false;
  
  const finalStorageKey = storageKey || `app_${toSnakeCase(paramName)}`;
  storage.removeItem(finalStorageKey);
  return true;
};

// ========== OBȚINE TOȚI PARAMETRII ==========
const getAppParams = () => {
  // Verifică și curăță token-ul dacă e necesar
  if (getAppParamValue("clear_access_token") === 'true') {
    storage.removeItem('app_access_token');
    storage.removeItem('edocpdf_token');  // Schimbat din 'token'
    storage.removeItem('auth_token');
  }
  
  // Obține token-ul din diferite surse
  let token = getAppParamValue("access_token", { removeFromUrl: true });
  if (!token) {
    token = storage.getItem('edocpdf_token') || storage.getItem('auth_token');
  }
  
  // Salvează token-ul în storage unificat
  if (token) {
    storage.setItem('edocpdf_token', token);
  }
  
  return {
    // Identificatori aplicație
    appId: getAppParamValue("app_id", { 
      defaultValue: import.meta.env.VITE_APP_ID || 'edocpdf-app'  // Schimbat din filefusion
    }),
    
    // Autentificare
    token: token,
    refreshToken: getAppParamValue("refresh_token", { removeFromUrl: true }),
    
    // Configurare aplicație
    appName: getAppParamValue("app_name", { 
      defaultValue: import.meta.env.VITE_APP_NAME || 'E-DocPDF'
    }),
    appVersion: getAppParamValue("app_version", { 
      defaultValue: import.meta.env.VITE_APP_VERSION || '3.0.0' 
    }),
    
    // URL-uri
    fromUrl: getAppParamValue("from_url", { 
      defaultValue: isNode ? '' : window.location.href 
    }),
    appBaseUrl: getAppParamValue("app_base_url", { 
      defaultValue: import.meta.env.VITE_APP_BASE_URL || (isNode ? '' : window.location.origin) 
    }),
    apiBaseUrl: getAppParamValue("api_base_url", { 
      defaultValue: API_BASE_URL 
    }),
    
    // Feature flags
    functionsVersion: getAppParamValue("functions_version", { 
      defaultValue: import.meta.env.VITE_FUNCTIONS_VERSION || '3.0.0' 
    }),
    
    // Feature toggles
    enableAI: getAppParamValue("enable_ai", { 
      defaultValue: import.meta.env.VITE_ENABLE_AI || 'true' 
    }) === 'true',
    
    enableSignatures: getAppParamValue("enable_signatures", { 
      defaultValue: import.meta.env.VITE_ENABLE_SIGNATURES || 'true' 
    }) === 'true',
    
    enableOCR: getAppParamValue("enable_ocr", { 
      defaultValue: import.meta.env.VITE_ENABLE_OCR || 'true' 
    }) === 'true',
    
    // Mediu
    isDevelopment: import.meta.env.DEV || false,
    isProduction: import.meta.env.PROD || false,
  };
};

// ========== FUNCȚII DE UTILITATE PENTRU TOKEN ==========
export const tokenUtils = {
  getToken: () => {
    return storage.getItem('edocpdf_token') || storage.getItem('auth_token');
  },
  
  setToken: (token) => {
    storage.setItem('edocpdf_token', token);
    return true;
  },
  
  removeToken: () => {
    storage.removeItem('edocpdf_token');
    storage.removeItem('auth_token');
    storage.removeItem('app_access_token');
    return true;
  },
  
  hasToken: () => {
    return !!tokenUtils.getToken();
  }
};

// ========== FUNCȚII DE UTILITATE PENTRU CONFIGURARE ==========
export const configUtils = {
  getApiUrl: (endpoint) => {
    return `${API_BASE_URL}${endpoint}`;
  },
  
  isBackendAvailable: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      return response.ok;
    } catch {
      return false;
    }
  },
  
  isStirlingAvailable: async () => {
    try {
      // Verificarea se face acum printr-un endpoint al backend-ului
      const response = await fetch(`${API_BASE_URL}/stirling-health`);
      return response.ok;
    } catch {
      return false;
    }
  }
};

// ========== EXPORT PARAMETRII APLICAȚIEI ==========
export const appParams = {
  ...getAppParams()
};

// ========== REÎNCARCĂ PARAMETRII (pentru schimbări dinamice) ==========
export const reloadAppParams = () => {
  Object.assign(appParams, getAppParams());
  return appParams;
};

// ========== DEFAULTS PENTRU TESTARE ==========
export const TEST_CREDENTIALS = {
  username: import.meta.env.VITE_TEST_USERNAME || 'testuser',
  password: import.meta.env.VITE_TEST_PASSWORD || 'testpass123',
  adminUsername: import.meta.env.VITE_ADMIN_USERNAME || 'admin',
  adminPassword: import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'
};

// ========== CONFIGURARE DOCUMENTE LEGALE ==========
export const LEGAL_DOCUMENT_TYPES = {
  CONTRACT: 'contract',
  ADEVERINTA: 'adeverinta',
  IMPUTERNICIRE: 'imputernicire',
  CERERE: 'cerere',
  FINANCIAR: 'financiar',
  LEGAL: 'legal'
};

export const BUSINESS_DOCUMENT_TYPES = {
  OFFER: 'ofertă',
  PROFORMA: 'proformă',
  ESTIMATE: 'deviz',
  CONTRACT: 'contract'
};