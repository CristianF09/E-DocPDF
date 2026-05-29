import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { FileText, UploadCloud, Copy, Check } from 'lucide-react';
import apiService from '../lib/api';
import { languages } from '../components/languages'; 

const OcrPage = () => {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState('ron');
  const [isCopied, setIsCopied] = useState(false);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setExtractedText('');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    multiple: false,
  });

  const handleOcr = async () => {
    if (!file) {
      toast.error('Vă rugăm să selectați un fișier.');
      return;
    }
    setIsLoading(true);
    try {
      const text = await apiService.stirlingOcr(file, lang, 'text');
      setExtractedText(text);
      toast.success('Textul a fost extras cu succes!');
    } catch (err) {
      console.error("Eroare OCR:", err);
      toast.error(err.message || 'Extragerea textului a eșuat.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    setIsCopied(true);
    toast.success('Text copiat în clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 md:p-8"
    >
      <h1 className="text-3xl font-bold mb-6 text-center">Recunoaștere Optică a Caracterelor (OCR)</h1>
      <p className="text-muted-foreground text-center mb-8">Extrageți text editabil din fișiere PDF sau imagini.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>1. Încărcați fișierul</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/10' : 'border-border'
              }`}
            >
              <input {...getInputProps()} />
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4">Trageți fișierul aici sau faceți clic pentru a-l selecta.</p>
              <p className="text-sm text-muted-foreground">Suportă PDF, PNG, JPG.</p>
            </div>
            {file && (
              <div className="mt-4 flex items-center justify-center">
                <FileText className="h-5 w-5 mr-2" />
                <span>{file.name}</span>
              </div>
            )}
            <div className="mt-6">
              <label htmlFor="lang-select" className="block text-sm font-medium mb-2">Selectați limba documentului:</label>
              <select 
                id="lang-select"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
              >
                {languages.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            <Button onClick={handleOcr} disabled={!file || isLoading} className="w-full mt-6">
              {isLoading ? 'Se procesează...' : 'Extrage Text'}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>2. Text Extras</CardTitle>
            {extractedText && (
              <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <textarea
              readOnly
              value={extractedText}
              placeholder="Textul extras va apărea aici..."
              className="w-full h-96 p-4 border rounded-md bg-background/50"
            />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default OcrPage;