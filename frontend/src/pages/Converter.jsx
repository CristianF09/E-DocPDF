import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileType, ArrowRight, Download, Loader2, X, Eye, ShieldCheck, RotateCcw, Lock, Unlock, Layers, Scissors, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { getFileIcon } from '@/lib/utils';
import { apiService } from '@/lib/api';

import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const conversionOptions = {
  pdf: [
    { value: 'docx', label: 'Word (DOCX)' },
    { value: 'xlsx', label: 'Excel (XLSX)' },
    { value: 'pptx', label: 'PowerPoint (PPTX)' },
    { value: 'txt', label: 'Text (TXT)' },
  ],
  docx: [{ value: 'pdf', label: 'PDF' }],
  doc: [{ value: 'pdf', label: 'PDF' }],
  xlsx: [{ value: 'pdf', label: 'PDF' }],
  xls: [{ value: 'pdf', label: 'PDF' }],
  pptx: [{ value: 'pdf', label: 'PDF' }],
  ppt: [{ value: 'pdf', label: 'PDF' }],
  jpg: [{ value: 'pdf', label: 'PDF' }],
  jpeg: [{ value: 'pdf', label: 'PDF' }],
  png: [{ value: 'pdf', label: 'PDF' }],
};

const TOOL_CONFIG = {
  'convert': {
    title: 'Convertor Documente',
    description: 'Transformă fișierele dintr-un format în altul rapid și eficient.',
    allowMultiple: false,
    icon: <FileType className="w-5 h-5" />,
    actionLabel: 'Convertește'
  },
  'compress': {
    title: 'Comprimare PDF',
    description: 'Redu dimensiunea fișierelor PDF fără a pierde calitatea vizuală.',
    allowMultiple: false,
    icon: <Zap className="w-5 h-5" />,
    actionLabel: 'Comprimă'
  },
  'merge': {
    title: 'Îmbina PDF-uri',
    description: 'Unește mai multe documente PDF într-un singur fișier organizat.',
    allowMultiple: true,
    icon: <Layers className="w-5 h-5" />,
    actionLabel: 'Unește fișierele'
  },
  'split': {
    title: 'Împărțire PDF',
    description: 'Extrage pagini specifice dintr-un document PDF.',
    allowMultiple: false,
    icon: <Scissors className="w-5 h-5" />,
    actionLabel: 'Împarte PDF'
  },
  'rotate': {
    title: 'Rotire PDF',
    description: 'Corectează orientarea paginilor dintr-un document PDF.',
    allowMultiple: false,
    icon: <RotateCcw className="w-5 h-5" />,
    actionLabel: 'Rotește PDF'
  },
  'protect': {
    title: 'Protecție PDF',
    description: 'Securizează documentul tău cu o parolă de acces.',
    allowMultiple: false,
    icon: <Lock className="w-5 h-5" />,
    actionLabel: 'Protejează'
  },
  'unlock': {
    title: 'Deblocare PDF',
    description: 'Elimină restricțiile de editare și parolele de acces.',
    allowMultiple: false,
    icon: <Unlock className="w-5 h-5" />,
    actionLabel: 'Deblochează'
  }
};

export default function Converter() {
  const [searchParams] = useSearchParams();
  const toolMode = searchParams.get('tool') || 'convert';
  const config = TOOL_CONFIG[toolMode] || TOOL_CONFIG['convert'];

  const [files, setFiles] = useState([]);
  const [targetFormat, setTargetFormat] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFileUrl, setProcessedFileUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileType, setFileType] = useState(null);

  // Tool-specific options
  const [rotation, setRotation] = useState('90');
  const [password, setPassword] = useState('');
  const [pageRanges, setPageRanges] = useState('1');

  const fileInputRef = useRef(null);

  useEffect(() => {
    setFiles([]);
    setProcessedFileUrl(null);
    setTargetFormat('');
    setPreviewUrl(null);
    setFileType(null);

    // Auto-set target format if provided in URL
    const formatParam = searchParams.get('format');
    if (formatParam) {
      setTargetFormat(formatParam);
    }
  }, [toolMode, searchParams]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!config.allowMultiple && selectedFiles.length > 1) {
      toast.error('Acest instrument permite încărcarea unui singur fișier.');
      return;
    }
    setFiles(selectedFiles);
    if (selectedFiles.length > 0) {
      const firstFile = selectedFiles[0];
      setFileType(firstFile.name.split('.').pop()?.toLowerCase());
      setPreviewUrl(URL.createObjectURL(firstFile));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (!config.allowMultiple && droppedFiles.length > 1) {
      toast.error('Acest instrument permite încărcarea unui singur fișier.');
      return;
    }
    setFiles(droppedFiles);
    if (droppedFiles.length > 0) {
      const firstFile = droppedFiles[0];
      setFileType(firstFile.name.split('.').pop()?.toLowerCase());
      setPreviewUrl(URL.createObjectURL(firstFile));
    }
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      toast.error('Vă rugăm să selectați cel puțin un fișier.');
      return;
    }

    setIsProcessing(true);
    try {
      let blob;
      const mainFile = files[0];

      switch (toolMode) {
        case 'compress':
          blob = await apiService.stirlingCompress(mainFile);
          break;
        case 'convert':
          if (!targetFormat) throw new Error('Vă rugăm să selectați formatul țintă.');
          blob = await apiService.stirlingConvert(mainFile, targetFormat);
          break;
        default:
          // Pentru celelalte unelte, vom arunca o eroare temporară
          // Până la implementarea completă pe backend
          toast.info(`Instrumentul '${toolMode}' este în curs de dezvoltare.`);
          throw new Error('Instrumentul selectat nu este implementat complet.');
      }

      const url = URL.createObjectURL(blob);
      setProcessedFileUrl(url);
      toast.success('Procesarea a reușit cu succes!');
    } catch (err) {
      console.error('Error processing:', err);
      toast.error(err.message || 'A apărut o eroare în timpul procesării.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedFileUrl) return;
    const a = document.createElement('a');
    a.href = processedFileUrl;
    a.download = `edocpdf_${toolMode}_${files[0]?.name || 'document'}`;
    a.click();
  };

  const renderOptionsPanel = () => {
    if (toolMode === 'convert') {
      const available = fileType ? conversionOptions[fileType] || [] : [];
      if (available.length === 0) return null;
      return (
        <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl border border-border">
          <div className="text-sm font-medium flex items-center gap-2">
            {fileType?.toUpperCase()} <ArrowRight className="w-4 h-4" />
          </div>
          <Select value={targetFormat} onValueChange={setTargetFormat}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Alege formatul" />
            </SelectTrigger>
            <SelectContent>
              {available.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (toolMode === 'split') {
      return (
        <div className="p-4 bg-secondary/50 rounded-xl border border-border flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase text-muted-foreground">Interval pagini</label>
          <Input
            placeholder="Ex: 1, 3-5, 10"
            value={pageRanges}
            onChange={(e) => setPageRanges(e.target.value)}
          />
        </div>
      );
    }

    if (toolMode === 'rotate') {
      return (
        <div className="p-4 bg-secondary/50 rounded-xl border border-border flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase text-muted-foreground">Unghi de rotire</label>
          <Select value={rotation} onValueChange={setRotation}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90">90° Către Dreapta</SelectItem>
              <SelectItem value="180">180° Inversat</SelectItem>
              <SelectItem value="270">270° Către Stânga</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (toolMode === 'protect' || toolMode === 'unlock') {
      return (
        <div className="p-4 bg-secondary/50 rounded-xl border border-border flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase text-muted-foreground">Parolă de securitate</label>
          <Input
            type="password"
            placeholder="Introdu parola..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold font-space gradient-text"
        >
          {config.title}
        </motion.h1>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          {config.description}
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
        {/* Drop Area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
            files.length > 0 ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/30'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <AnimatePresence mode="wait">
            {files.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm font-medium mb-1">Trage fișierele aici</p>
                <p className="text-xs text-muted-foreground mb-4">sau apasă pentru a selecta</p>
                <Button variant="outline" className="gap-2">
                  <Upload className="w-4 h-4" /> Selectează fișiere
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple={config.allowMultiple}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.txt"
                  onChange={handleFileChange}
                />
              </motion.div>
            ) : (
              <motion.div key="files" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
                <div className="flex items-center justify-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-border max-w-md mx-auto">
                  {getFileIcon(files[0].name)}
                  <div className="text-left flex-1 truncate">
                    <p className="text-sm font-medium truncate">{files.length > 1 ? `${files.length} fișiere selectate` : files[0].name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(files.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(2)} MB total
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFiles([]); setProcessedFileUrl(null); }}
                    className="p-1 hover:bg-destructive/10 rounded-full text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span>Conexiune securizată. Fișierele sunt procesate pe server și șterse automat.</span>
        </div>

        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
            {renderOptionsPanel()}

            <Button
              onClick={handleProcess}
              disabled={isProcessing}
              className="w-full py-6 text-lg gap-2"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : config.icon}
              {isProcessing ? 'Se procesează...' : config.actionLabel}
            </Button>
          </motion.div>
        )}

        {processedFileUrl && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800 text-center">
            <div className="flex items-center justify-center gap-2 mb-4 text-green-700 dark:text-green-400 font-semibold">
              <div className="bg-green-500 p-1 rounded-full text-white">
                <Download className="w-4 h-4" />
              </div>
              Fișierul este gata!
            </div>
            <Button onClick={handleDownload} className="w-full bg-green-600 hover:bg-green-700 gap-2 py-6 text-lg">
              <Download className="w-5 h-5" /> Descarcă Rezultatul
            </Button>
          </motion.div>
        )}
      </div>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl border border-border p-5 hover:border-primary/30 transition-colors">
          <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center text-primary mb-4">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-semibold mb-2">Rapid</h3>
          <p className="text-xs text-muted-foreground">Procesare instantanee folosind infrastructura Stirling PDF.</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 hover:border-primary/30 transition-colors">
          <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center text-primary mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-semibold mb-2">Securizat</h3>
          <p className="text-xs text-muted-foreground">Criptare end-to-end și ștergere automată a fișierelor după procesare.</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 hover:border-primary/30 transition-colors">
          <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center text-primary mb-4">
            <FileType className="w-5 h-5" />
          </div>
          <h3 className="font-semibold mb-2">Universal</h3>
          <p className="text-xs text-muted-foreground">Suport complet pentru PDF, Word, Excel, PowerPoint și Imagini.</p>
        </div>
      </div>
    </div>
  );
}