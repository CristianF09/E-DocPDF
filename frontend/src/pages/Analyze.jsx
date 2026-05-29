import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { UploadCloud, FileText, Lightbulb, Download, Wand2 } from 'lucide-react';
import apiService from '../lib/api';

const AnalyzePage = () => {
  const [file, setFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setAnalysisResult(null);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, multiple: false });

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Vă rugăm să încărcați un fișier PDF.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiService.aiAnalyze(file);
      // Încercăm să parsăm sugestiile, care vin ca string JSON
      try {
        result.suggestions = JSON.parse(result.suggestions);
      } catch (e) {
        console.error("Sugestiile nu sunt un JSON valid:", result.suggestions);
        // Dacă parsarea eșuează, păstrăm string-ul pentru a-l afișa
      }
      setAnalysisResult(result);
      toast.success("Analiza a fost finalizată cu succes!");
    } catch (err) {
      console.error("Eroare la analiză:", err);
      toast.error(err.message || "A apărut o eroare la analizarea documentului.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!analysisResult || !analysisResult.text) return;
    const blob = new Blob([analysisResult.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analyzed_${file.name.replace(/\.pdf$/i, '.txt')}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Analiză și Sugestii AI</h1>
      <p className="text-muted-foreground text-center mb-8">Îmbunătățiți-vă documentele cu sugestii de editare generate de inteligența artificială.</p>

      <div className="max-w-6xl mx-auto">
        <Card className="glass-card mb-8">
          <CardHeader><CardTitle>1. Încărcați Documentul</CardTitle></CardHeader>
          <CardContent>
            <div {...getRootProps()} className="p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors hover:border-primary">
              <input {...getInputProps()} />
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4">Trageți fișierul PDF aici sau faceți clic pentru a-l selecta.</p>
            </div>
            {file && <div className="mt-4 flex items-center justify-center"><FileText className="h-5 w-5 mr-2" /><span>{file.name}</span></div>}
            <Button onClick={handleAnalyze} disabled={!file || isLoading} className="w-full mt-6">
              <Wand2 className="mr-2 h-4 w-4" />
              {isLoading ? 'Se analizează...' : 'Analizează Documentul'}
            </Button>
          </CardContent>
        </Card>

        {analysisResult && (
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Textul Original</CardTitle>
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Descarcă Text
                </Button>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-md bg-background/50 h-[60vh] overflow-y-auto">
                  <p className="whitespace-pre-wrap">{analysisResult.text}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader><CardTitle>Sugestii AI</CardTitle></CardHeader>
              <CardContent>
                <div className="p-4 border rounded-md bg-background/50 h-[60vh] overflow-y-auto">
                  {Array.isArray(analysisResult.suggestions) ? (
                    <ul className="space-y-4">
                      {analysisResult.suggestions.map((s, index) => (
                        <li key={index} className="p-3 bg-background/70 rounded-lg">
                          <p className="text-sm text-muted-foreground"><strong>Original:</strong> "{s.original}"</p>
                          <p className="text-sm text-primary"><strong>Sugestie:</strong> "{s.suggestion}"</p>
                          <p className="text-xs mt-2 flex items-start"><Lightbulb className="h-4 w-4 mr-2 flex-shrink-0" /> {s.explanation}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-center">{analysisResult.suggestions || "Nicio sugestie generată sau format invalid."}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AnalyzePage;