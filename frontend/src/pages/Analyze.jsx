import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, FileText, Lightbulb, Download, Wand2, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { apiService } from '@/lib/api';

export default function AnalyzePage() {
  const [file, setFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setAnalysisResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'application/pdf': ['.pdf'] }, 
    multiple: false 
  });

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Vă rugăm să încărcați un fișier PDF.");
      return;
    }

    setIsLoading(true);
    
    // Pregătim structura corectă Multipart FormData cerută de Python
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Apel direct către endpoint-ul de backend configurat
      const response = await apiService.post('/api/v1/ai/analyze', formData);

      const data = response.data;
      let parsedSuggestions = [];

      // Încercăm să parsăm sugestiile, care vin ca string JSON de la Gemini
      if (data.suggestions) {
        try {
          parsedSuggestions = JSON.parse(data.suggestions);
        } catch (e) {
          console.error("Sugestiile nu sunt un JSON valid:", data.suggestions);
          // Fallback în cazul în care AI-ul returnează text brut în loc de JSON array
          parsedSuggestions = data.suggestions;
        }
      }
      
      setAnalysisResult({
        text: data.text,
        suggestions: parsedSuggestions
      });
      
      toast.success("Analiza documentului a fost finalizată cu succes!");
    } catch (err) {
      console.error("Eroare la analiză:", err);
      const errorMsg = err.response?.data?.detail || "A apărut o eroare la analizarea documentului.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!analysisResult || !analysisResult.text) return;
    const blob = new Blob([analysisResult.text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `text_extras_${file.name.replace(/\.pdf$/i, '.txt')}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }} 
      className="container mx-auto p-4 md:p-8 max-w-7xl"
    >
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Analiză și Sugestii AI</h1>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Optimizați calitatea actelor dumneavoastră. Inteligența Artificială scanează conținutul pentru a depista exprimări ambigue și erori.
        </p>
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Dropzone Card */}
        <Card className="shadow-sm border-neutral-200 dark:border-neutral-800">
          <CardHeader>
            <CardTitle className="text-md font-semibold text-neutral-700 dark:text-neutral-300">1. Încărcați Documentul Sursă</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              {...getRootProps()} 
              className={`p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                isDragActive 
                  ? 'border-blue-500 bg-blue-50/30' 
                  : 'border-neutral-300 hover:border-blue-400 bg-neutral-50/50'
              }`}
            >
              <input {...getInputProps()} />
              <UploadCloud className="mx-auto h-10 w-10 text-neutral-400" />
              <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
                Trageți fișierul **PDF** aici sau faceți clic pentru selecție manuală.
              </p>
              <span className="text-xs text-neutral-400 block mt-1">Sunt suportate doar fișiere electronice PDF textuale</span>
            </div>
            
            {file && (
              <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-between border">
                <div className="flex items-center space-x-2 text-sm text-neutral-700 dark:text-neutral-300 overflow-hidden">
                  <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <span className="truncate font-medium">{file.name}</span>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-red-500 hover:text-red-600" onClick={() => setFile(null)}>
                  Elimină
                </Button>
              </div>
            )}
            
            <Button 
              onClick={handleAnalyze} 
              disabled={!file || isLoading} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Se procesează textul cu Gemini AI...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Analizează Documentul
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Block */}
        {analysisResult && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            {/* Left side: Extracted plain text */}
            <Card className="shadow-sm border-neutral-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b">
                <CardTitle className="text-sm font-semibold">Textul Brut Detectat</CardTitle>
                <Button onClick={handleDownload} variant="outline" size="xs" className="text-xs px-2.5 h-7">
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Export .TXT
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="p-3 border rounded-lg bg-neutral-50 dark:bg-neutral-950 h-[50vh] overflow-y-auto text-xs font-mono leading-relaxed text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                  {analysisResult.text}
                </div>
              </CardContent>
            </Card>

            {/* Right side: AI suggestions */}
            <Card className="shadow-sm border-neutral-200">
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-sm font-semibold text-neutral-700">Recomandări Structurate</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="p-1 h-[50vh] overflow-y-auto space-y-4">
                  {Array.isArray(analysisResult.suggestions) ? (
                    analysisResult.suggestions.length > 0 ? (
                      <ul className="space-y-4">
                        {analysisResult.suggestions.map((s, index) => (
                          <li key={index} className="p-3.5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl space-y-2 shadow-2xs">
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 p-2 rounded border-l-2 border-neutral-400">
                              <span className="font-semibold block mb-0.5 text-neutral-600">Text Original:</span> 
                              "{s.original}"
                            </div>
                            <div className="text-xs text-blue-700 bg-blue-50/50 p-2 rounded border-l-2 border-blue-500">
                              <span className="font-semibold block mb-0.5 text-blue-800">Varianta Recomandată:</span> 
                              "{s.suggestion}"
                            </div>
                            <p className="text-[11px] text-neutral-600 flex items-start gap-1.5 pt-1">
                              <Lightbulb className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" /> 
                              <span><strong>Argumentare:</strong> {s.explanation}</span>
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-12 text-neutral-400 text-xs">
                        <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                        Documentul pare excelent! Nu au fost identificate probleme majore.
                      </div>
                    )
                  ) : (
                  {/* Fallback block if JSON array transformation failed */}
                    <div className="p-3 border rounded-lg bg-amber-50/50 text-amber-900 text-xs flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="whitespace-pre-wrap font-sans">{analysisResult.suggestions}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          </motion.div>
        );
      } 