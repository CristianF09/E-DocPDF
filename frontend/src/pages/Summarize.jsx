import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { UploadCloud, FileText, BrainCircuit, Download } from 'lucide-react';
import apiService from '../lib/api';

const SummarizePage = () => {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setSummary(''); // Reset summary when a new file is uploaded
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, multiple: false });

  const handleSummarize = async () => {
    if (!file) {
      toast.error("Vă rugăm să încărcați un fișier PDF.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiService.aiSummarize(file);
      setSummary(result.summary);
      toast.success("Rezumatul a fost generat cu succes!");
    } catch (err) {
      console.error("Eroare la generarea rezumatului:", err);
      toast.error(err.message || "A apărut o eroare la generarea rezumatului.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!summary) return;
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary_${file.name.replace(/\.pdf$/i, '.txt')}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Rezumat Document AI</h1>
      <p className="text-muted-foreground text-center mb-8">Obțineți un rezumat concis al documentului dumneavoastră PDF folosind inteligența artificială.</p>

      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <div>
          <Card className="glass-card mb-8">
            <CardHeader><CardTitle>1. Încărcați Documentul</CardTitle></CardHeader>
            <CardContent>
              <div {...getRootProps()} className="p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors hover:border-primary">
                <input {...getInputProps()} />
                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4">Trageți fișierul PDF aici sau faceți clic pentru a-l selecta.</p>
              </div>
              {file && <div className="mt-4 flex items-center justify-center"><FileText className="h-5 w-5 mr-2" /><span>{file.name}</span></div>}
            </CardContent>
          </Card>

          <Button onClick={handleSummarize} disabled={!file || isLoading} className="w-full">
            <BrainCircuit className="mr-2 h-4 w-4" />
            {isLoading ? 'Se generează...' : 'Generează Rezumat'}
          </Button>
        </div>

        <div>
          <Card className="glass-card h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>2. Rezumat Generat</CardTitle>
              <Button onClick={handleDownload} disabled={!summary} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Descarcă
              </Button>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-md bg-background/50 h-96 overflow-y-auto">
                {summary ? (
                  <p className="whitespace-pre-wrap">{summary}</p>
                ) : (
                  <p className="text-muted-foreground text-center">Rezumatul va apărea aici după generare.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default SummarizePage;