import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Image as ImageIcon, Loader2, Languages, Download, Copy, Check, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import { apiService } from '@/lib/api';
// Configurare PDF.js worker local (fără CORS)
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const languageOptions = [
  { value: 'eng', label: 'English' },
  { value: 'ron', label: 'Română' },
  { value: 'spa', label: 'Español' },
  { value: 'fra', label: 'Français' },
  { value: 'deu', label: 'Deutsch' },
  { value: 'ita', label: 'Italiano' },
  { value: 'por', label: 'Português' },
  { value: 'rus', label: 'Русский' },
  { value: 'chi_sim', label: '中文 (简体)' },
  { value: 'jpn', label: '日本語' },
];

export default function Translate() {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [fileType, setFileType] = useState('');
  const [sourceLang, setSourceLang] = useState('');
  const [targetLang, setTargetLang] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [numPages, setNumPages] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      setFileType(file.name.split('.').pop().toLowerCase());
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

  const processOCRAndTranslate = async () => {
    if (!file || !sourceLang || !targetLang) {
      toast.error('Selectează un fișier și limbile');
      return;
    }
    setIsProcessing(true);
    try {
      toast.info('Se procesează...');
      const result = await apiService.translateOCR(file, sourceLang, targetLang);
      setExtractedText(result.extracted_text);
      setTranslatedText(result.translated_text);
      toast.success('OCR și traducere finalizate!');
    } catch (error) {
      console.error(error);
      toast.error('Eroare la procesare');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTranslation = async () => {
    const content = `Text extras (${sourceLang}):\n${extractedText}\n\n---\n\nText tradus (${targetLang}):\n${translatedText}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traducere_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Fișier descărcat');
  };

  return (
    <div className="p-6 pb-24 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Traducere Documente cu OCR</h1>
      <div className="bg-card rounded-2xl border p-8 mb-6">
        <div className="border-2 border-dashed rounded-2xl p-12 text-center">
          {!file ? (
            <>
              <ImageIcon className="w-12 h-12 mx-auto mb-4" />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Încarcă fișier</Button>
              <input ref={fileInputRef} type="file" accept="image/*,.pdf" hidden onChange={(e) => setFile(e.target.files[0])} />
            </>
          ) : (
            <div className="flex items-center justify-between">
              <span>{file.name}</span>
              <button onClick={() => setFile(null)}><X /></button>
            </div>
          )}
        </div>
        {file && (
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Select value={sourceLang} onValueChange={setSourceLang}>
              <SelectTrigger><SelectValue placeholder="Limba sursă" /></SelectTrigger>
              <SelectContent>{languageOptions.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={targetLang} onValueChange={setTargetLang}>
              <SelectTrigger><SelectValue placeholder="Limba țintă" /></SelectTrigger>
              <SelectContent>{languageOptions.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
            </Select>
            <Button onClick={processOCRAndTranslate} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="animate-spin" /> : <Languages />}
              Traduce
            </Button>
          </div>
        )}
      </div>

      {/* Previzualizare */}
      {fileUrl && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="flex gap-2"><Eye /> Previzualizare</h3>
            <div className="bg-gray-100 p-2 rounded flex justify-center">
              {fileType === 'pdf' ? (
                <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
                  <Page pageNumber={1} width={400} />
                </Document>
              ) : (
                <img src={fileUrl} className="max-h-96" alt="preview" />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rezultate */}
      {(extractedText || translatedText) && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border p-5">
            <div className="flex justify-between"><h3>Text extras ({sourceLang})</h3><Button variant="ghost" size="sm" onClick={() => copyToClipboard(extractedText)}>{copied ? <Check /> : <Copy />}</Button></div>
            <Textarea value={extractedText} rows={10} readOnly className="resize-none" />
          </div>
          <div className="bg-card rounded-xl border p-5">
            <div className="flex justify-between"><h3>Text tradus ({targetLang})</h3><Button variant="ghost" size="sm" onClick={downloadTranslation}><Download /></Button></div>
            <Textarea value={translatedText} rows={10} readOnly className="resize-none" />
          </div>
        </div>
      )}
    </div>
  );
}