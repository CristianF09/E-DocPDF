import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileType, ArrowRight, Download, Loader2, FileText, X, Eye, FileImage, FileSpreadsheet, Presentation } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '@/lib/api';

// Configurare worker PDF.js
import { Document, Page, pdfjs } from 'react-pdf';

// Folosește CDN-ul oficial care suportă CORS
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// NOTĂ: Am eliminat importurile CSS care cauzau eroare.
// Previzualizarea funcționează și fără ele.

const conversionMap = {
  'pdf-to-docx': { method: 'convertToWord', outputExt: 'docx', label: 'PDF → Word' },
  'pdf-to-xlsx': { method: 'convertToExcel', outputExt: 'xlsx', label: 'PDF → Excel' },
  'pdf-to-txt': { method: 'extractText', outputExt: 'txt', label: 'PDF → Text' },
};

export default function Converter() {
  const [searchParams] = useSearchParams();
  const toolParam = searchParams.get('tool');
  const [file, setFile] = useState(null);
  const [targetFormat, setTargetFormat] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFile, setConvertedFile] = useState(null);
  const [convertedFileUrl, setConvertedFileUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const fileInputRef = useRef(null);
  const currentOp = conversionMap[toolParam] || null;
  const getFileIcon = () => {
    if (!file) return <FileType className="w-12 h-12 text-gray-400" />;
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch(ext) {
      case 'pdf': return <FileText className="w-12 h-12 text-red-500" />;
      case 'docx':
      case 'doc':
      case 'word':
        return <FileText className="w-12 h-12 text-blue-500" />;
      case 'xlsx':
      case 'xls':
      case 'csv':
      case 'excel':
        return <FileSpreadsheet className="w-12 h-12 text-green-500" />;
      case 'pptx':
      case 'ppt':
        return <Presentation className="w-12 h-12 text-orange-500" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
        return <FileImage className="w-12 h-12 text-purple-500" />;
      default: return <FileType className="w-12 h-12 text-gray-400" />;
    }
  };

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFileType(file.name.split('.').pop()?.toLowerCase());
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
      setFileType(null);
    }
  }, [file]);

  useEffect(() => {
    return () => {
      if (convertedFileUrl) URL.revokeObjectURL(convertedFileUrl);
    };
  }, [convertedFileUrl]);

  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

  const handleConvert = async () => {
    if (!file) {
      toast.error('Selectează un fișier.');
      return;
    }

    if (currentOp) {
      setIsConverting(true);
      try {
        let blob;
        if (currentOp.method === 'convertToWord') {
          blob = await apiService.convertToWord(file);
        } else if (currentOp.method === 'convertToExcel') {
          blob = await apiService.convertToExcel(file);
        } else if (currentOp.method === 'extractText') {
          const result = await apiService.extractTextFromPDF(file);
          blob = new Blob([result.text || ''], { type: 'text/plain' });
        } else {
          throw new Error('Operație necunoscută');
        }
        const url = URL.createObjectURL(blob);
        setConvertedFile(blob);
        setConvertedFileUrl(url);
        toast.success(`✅ Conversie reușită! ${currentOp.label}`);
      } catch (err) {
        console.error(err);
        toast.error(err.message || 'Conversie eșuată');
      } finally {
        setIsConverting(false);
      }
      return;
    }

    if (!targetFormat) {
      toast.error('Selectează un format țintă.');
      return;
    }

    const sourceExt = file.name.split('.').pop()?.toLowerCase();
    const key = `${sourceExt}-to-${targetFormat}`;
    const op = conversionMap[key];

    if (!op) {
      toast.error(`Conversia din ${sourceExt.toUpperCase()} în ${targetFormat.toUpperCase()} nu este suportată momentan.`);
      return;
    }

    setIsConverting(true);
    try {
      let blob;
      if (op.method === 'convertToWord') blob = await apiService.convertToWord(file);
      else if (op.method === 'convertToExcel') blob = await apiService.convertToExcel(file);
      else if (op.method === 'extractText') {
        const result = await apiService.extractTextFromPDF(file);
        blob = new Blob([result.text || ''], { type: 'text/plain' });
      } else throw new Error('Metodă necunoscută');
      const url = URL.createObjectURL(blob);
      setConvertedFile(blob);
      setConvertedFileUrl(url);
      toast.success(`✅ Conversie reușită! ${op.label}`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Conversie eșuată');
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedFile) return;
    const url = URL.createObjectURL(convertedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted_${file.name}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer?.files?.[0];
    if (droppedFile) setFile(droppedFile);
  };

  const renderPreview = () => {
    if (!previewUrl || !fileType) return null;
    return (
      <Card className="mt-6 overflow-hidden">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5" /> Previzualizare document
          </h3>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg min-h-[300px] flex items-center justify-center overflow-auto p-4">
            {['jpg', 'jpeg', 'png'].includes(fileType) && (
              <img src={previewUrl} alt="Preview" className="max-w-full max-h-[500px] object-contain" />
            )}
            {fileType === 'pdf' && (
              <Document file={previewUrl} onLoadSuccess={onDocumentLoadSuccess}>
                <Page pageNumber={1} width={Math.min(600, window.innerWidth - 100)} />
              </Document>
            )}
            {!['jpg', 'jpeg', 'png', 'pdf'].includes(fileType) && (
              <div className="text-center">
                {getFileIcon()}
                <p className="mt-2 text-sm text-muted-foreground">{file.name}</p>
                <p className="text-xs">Previzualizare disponibilă după conversie</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderConvertedPreview = () => {
    if (!convertedFileUrl) return null;
    const ext = (convertedFile?.type?.split('/')[1] || '').toLowerCase();
    return (
      <Card className="mt-6 overflow-hidden border-green-200">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-green-800 mb-4">Fișier convertit</h3>
          <div className="bg-white dark:bg-gray-900 rounded-lg min-h-[200px] flex items-center justify-center p-4">
            {ext === 'pdf' && (
              <Document file={convertedFileUrl}>
                <Page pageNumber={1} width={400} />
              </Document>
            )}
            {ext === 'plain' && (
              <pre className="text-xs overflow-auto max-h-96 w-full whitespace-pre-wrap">Text extras disponibil la descărcare</pre>
            )}
            {!['pdf', 'plain'].includes(ext) && (
              <div className="text-center">
                <FileType className="w-12 h-12 text-green-600 mx-auto" />
                <p className="mt-2 text-sm">Fișier convertit gata pentru descărcare</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-space gradient-text">
          {currentOp ? currentOp.label : 'Convertor Documente'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {currentOp 
            ? `Conversie rapidă folosind serverul local E-DocPDF.`
            : 'Selectează fișierul și formatul dorit. Conversiile sunt procesate local, fără a părăsi serverul.'}
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-8">
        {/* Drop area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
            file ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/30'
          }`}
        >
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm font-medium mb-1">Trage fișierul aici</p>
                <p className="text-xs text-muted-foreground mb-4">sau</p>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
                  <Upload className="w-4 h-4" /> Încarcă de pe dispozitiv
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                  onChange={(e) => setFile(e.target.files?.[0])}
                />
              </motion.div>
            ) : (
              <motion.div key="file" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-4">
                {getFileIcon()}
                <div className="text-left">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button onClick={() => { setFile(null); setConvertedFile(null); setConvertedFileUrl(null); }} className="text-muted-foreground hover:text-destructive">
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {file && !currentOp && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="bg-secondary rounded-lg px-4 py-2 text-sm">
                {file.name.split('.').pop()?.toUpperCase()}
              </div>
              <ArrowRight className="w-5 h-5 text-primary" />
              <Select value={targetFormat} onValueChange={setTargetFormat}>
                <SelectTrigger className="w-48 bg-secondary/50">
                  <SelectValue placeholder="Format țintă" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="docx">Word (DOCX)</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  <SelectItem value="txt">Text (TXT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleConvert} disabled={isConverting || !targetFormat} className="gap-2 w-full sm:w-auto">
              {isConverting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileType className="w-4 h-4" />}
              {isConverting ? 'Se convertește...' : 'Convertește'}
            </Button>
          </motion.div>
        )}

        {file && currentOp && (
          <div className="mt-6 flex justify-center">
            <Button onClick={handleConvert} disabled={isConverting} className="gap-2 px-8 py-6 text-lg">
              {isConverting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              {isConverting ? 'Se procesează...' : `Convertește în ${currentOp.outputExt.toUpperCase()}`}
            </Button>
          </div>
        )}

        {file && renderPreview()}

        {convertedFileUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-4">
            {renderConvertedPreview()}
            <Button onClick={handleDownload} className="w-full bg-green-600 hover:bg-green-700 gap-2 py-6 text-lg">
              <Download className="w-5 h-5" /> Descarcă fișierul convertit
            </Button>
          </motion.div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-primary mb-3">Convertește din PDF</h3>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li>PDF → Word (DOCX)</li>
            <li>PDF → Excel (XLSX)</li>
            <li>PDF → Text (TXT)</li>
          </ul>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-primary mb-3">Convertește în PDF</h3>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li>Word (DOCX) → PDF</li>
            <li>Excel (XLSX) → PDF</li>
            <li>Imagine (PNG/JPG) → PDF</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-2">(în curând)</p>
        </div>
      </div>
    </div>
  );
}