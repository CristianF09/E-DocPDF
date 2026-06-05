import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import SignaturePad from 'react-signature-canvas';
import { 
  Bold, Italic, Type, AlignLeft, AlignCenter, AlignRight,
  Undo, Redo, Save, Download, FileText, Eye, X, PenTool, Languages, Move, Loader2, UploadCloud, ServerCrash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { apiService } from '@/lib/api';
import { documentProcessor } from '@/lib/documentProcessing';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function DocumentEditor() {
  const [documentName, setDocumentName] = useState('Niciun document încărcat');
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [stirlingStatus, setStirlingStatus] = useState(null);

  const [showSignModal, setShowSignModal] = useState(false);
  const [showAddTextModal, setShowAddTextModal] = useState(false);
  const [showAddImageModal, setShowAddImageModal] = useState(false);
  const [newTextValue, setNewTextValue] = useState('');
  const [newTextSize, setNewTextSize] = useState(14);
  const [newTextColor, setNewTextColor] = useState('#000000');
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImageWidth, setNewImageWidth] = useState(150);
  const [newImageHeight, setNewImageHeight] = useState(0);
  const [textToTranslate, setTextToTranslate] = useState('');
  const [textX, setTextX] = useState(100);
  const [textY, setTextY] = useState(100);

  // Undo / Redo stacks store ArrayBuffer snapshots of PDF bytes
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const UNDO_LIMIT = 30;

  const fileInputRef = useRef(null);
  const signaturePadRef = useRef(null);
  const imageInputRef = useRef(null);

  // Helper: get current PDF as Blob
  const getPdfBlobFromState = async () => {
    if (!pdfFile) return null;
    if (typeof pdfFile === 'string') {
      const resp = await fetch(pdfFile);
      return await resp.blob();
    }
    return pdfFile;
  };

  // Push current state to undo stack (ArrayBuffer)
  const pushSnapshot = async () => {
    try {
      const blob = await getPdfBlobFromState();
      if (!blob) return;
      const buf = await blob.arrayBuffer();
      setUndoStack(prev => {
        const next = [...prev, buf];
        if (next.length > UNDO_LIMIT) next.shift();
        return next;
      });
      // clear redo when new action taken
      setRedoStack([]);
    } catch (e) {
      console.warn('pushSnapshot failed', e);
    }
  };

  // Apply bytes (ArrayBuffer or Uint8Array) as current PDF
  const applyBytesAsPdf = (bytes, labelPrefix = '') => {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    try { if (typeof pdfFile === 'string' && pdfFile.startsWith('blob:')) URL.revokeObjectURL(pdfFile); } catch(e){}
    setPdfFile(url);
    setDocumentName(prev => labelPrefix ? `${labelPrefix}_${prev}` : prev);
  };

  const handleUndo = async () => {
    if (undoStack.length === 0) {
      toast.info('Niciun pas pentru undo');
      return;
    }
    try {
      const last = undoStack[undoStack.length - 1];
      const currentBlob = await getPdfBlobFromState();
      const currentBuf = currentBlob ? await currentBlob.arrayBuffer() : null;
      // move last to redo
      setRedoStack(prev => currentBuf ? [...prev, currentBuf] : prev);
      // pop undo
      setUndoStack(prev => prev.slice(0, prev.length - 1));
      applyBytesAsPdf(last, 'undo');
      toast.success('Undo aplicat');
    } catch (e) {
      console.error('Undo failed', e);
      toast.error('Undo eșuat');
    }
  };

  const handleRedo = async () => {
    if (redoStack.length === 0) {
      toast.info('Niciun pas pentru redo');
      return;
    }
    try {
      const last = redoStack[redoStack.length - 1];
      const currentBlob = await getPdfBlobFromState();
      const currentBuf = currentBlob ? await currentBlob.arrayBuffer() : null;
      // move current to undo
      setUndoStack(prev => currentBuf ? [...prev, currentBuf] : prev);
      // pop redo
      setRedoStack(prev => prev.slice(0, prev.length - 1));
      applyBytesAsPdf(last, 'redo');
      toast.success('Redo aplicat');
    } catch (e) {
      console.error('Redo failed', e);
      toast.error('Redo eșuat');
    }
  };

  const handleLoadPdf = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setDocumentName(file.name);
      setPdfFile(file);
      setCurrentPage(1);
      setNumPages(null); // Reset on new file
    } else {
      toast.error('Vă rugăm să încărcați un fișier valid de tip PDF.');
    }
  };

  const onDocumentLoadSuccess = ({ numPages: nextNumPages }) => {
    setNumPages(nextNumPages);
  };

  const handleApplySignature = async () => {
    if (signaturePadRef.current.isEmpty()) {
      return toast.error('Semnătura este goală. Vă rugăm să desenați o semnătură.');
    }
    const signatureImage = signaturePadRef.current.getTrimmedCanvas().toDataURL('image/png');

    const fetchRes = await fetch(signatureImage);
    const signatureBlob = await fetchRes.blob();

    setIsProcessing(true);
    toast.info('Se aplică semnătura pe document...');

    try {
        // Snapshot before change
        await pushSnapshot();

        // Prefer local application using pdf-lib
        let resultBlob = null;
        try {
          // pdfFile may be a File, Blob or object URL string
          resultBlob = await documentProcessor.addSignature(pdfFile, signatureBlob, textX, textY, currentPage);
        } catch (localErr) {
          console.warn('Local signature failed, falling back to server:', localErr);
        }

        if (resultBlob) {
          const url = URL.createObjectURL(resultBlob);
          try { if (typeof pdfFile === 'string' && pdfFile.startsWith('blob:')) URL.revokeObjectURL(pdfFile); } catch(e){}
          setPdfFile(url);
          setDocumentName((prev) => `signed_${prev}`);
          setCurrentPage(1);
          setShowSignModal(false);
          toast.success('Semnătura a fost aplicată local cu succes!');
        } else {
          // If local failed, send to backend
          const formData = new FormData();
          formData.append('file', pdfFile);
          formData.append('signature_image', signatureBlob, 'signature.png');
          formData.append('page', currentPage);
          formData.append('x', textX);
          formData.append('y', textY);

          const response = await apiService.post('/process/sign', formData, {
            responseType: 'blob',
          });
          const newPdfBlob = response.data;
          const url = URL.createObjectURL(newPdfBlob);
          try { if (typeof pdfFile === 'string' && pdfFile.startsWith('blob:')) URL.revokeObjectURL(pdfFile); } catch(e){}
          setPdfFile(url);
          setDocumentName((prev) => `signed_${prev}`);
          setCurrentPage(1);
          setShowSignModal(false);
          toast.success('Semnătura a fost aplicată pe server.');
        }

      } catch (error) {
        console.error('Eroare la aplicarea semnăturii:', error);
        toast.error(error.message || 'A apărut o eroare la aplicarea semnăturii.');
        // on error remove last snapshot
        setUndoStack(prev => prev.slice(0, prev.length - 1));
      } finally {
        setIsProcessing(false);
      }
    };

  const checkStirlingHealth = async () => {
    toast.info("Se verifică starea serviciului Stirling PDF...");
    try {
        const response = await apiService.get('/stirling-health');
        if (response.data.status === 'ok') {
            setStirlingStatus('online');
            toast.success("Serviciul Stirling PDF este online și funcțional.");
        } else {
            setStirlingStatus('offline');
            toast.error("Serviciul Stirling PDF este offline.");
        }
    } catch (error) {
        setStirlingStatus('offline');
        toast.error("Nu s-a putut contacta serviciul Stirling PDF.");
    }
  };

  const handleTranslate = async () => {
    if (!textToTranslate) return;
    setIsProcessing(true);
    toast.info("Se traduce textul...");
    try {
      const formData = new FormData();
      formData.append('text', textToTranslate);
      formData.append('target_lang', 'ro');

      const response = await apiService.post('/api/v1/ai/translate-text', formData);
      setTextToTranslate(response.data.translated_text);
      toast.success("Traducere finalizată!");
    } catch (error) {
      console.error('Eroare la traducere:', error);
      toast.error(error.message || "S-a produs o eroare la traducerea textului.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadCurrentPdf = async () => {
    try {
      const blob = await getPdfBlobFromState();
      if (!blob) { toast.error('Niciun PDF disponibil pentru descărcare'); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = documentName && !documentName.startsWith('blob:') ? documentName : 'document.pdf';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Fișierul a fost descărcat');
    } catch (e) {
      console.error('Download failed', e);
      toast.error('Descărcarea fișierului a eșuat');
    }
  };


  return (
    <div className="min-h-screen bg-muted/40 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        <Card className="mb-4 shadow-sm border border-border">
          <CardContent className="p-3 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-medium text-sm max-w-[200px] truncate">{documentName}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="default" size="sm" onClick={() => fileInputRef.current.click()}>
                <UploadCloud className="w-4 h-4 mr-2"/>
                Încarcă PDF
              </Button>
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleLoadPdf} />
              
              <Button variant="outline" size="sm" onClick={() => setShowSignModal(true)} disabled={!pdfFile}>
                <PenTool className="w-4 h-4 mr-2 text-blue-600" />
                Semnează Document
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowAddTextModal(true)} disabled={!pdfFile} className="ml-2">
                <Type className="w-4 h-4 mr-2 text-green-600" />
                Adaugă Text
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowAddImageModal(true)} disabled={!pdfFile} className="ml-2">
                <UploadCloud className="w-4 h-4 mr-2 text-purple-600" />
                Adaugă Imagine
              </Button>
              <Button variant="default" size="sm" onClick={() => handleDownloadCurrentPdf()} disabled={!pdfFile} className="ml-2">
                <Download className="w-4 h-4 mr-2" />
                              Descarcă
              </Button>
                            <Button variant="secondary" size="sm" onClick={async () => {
                              // Save current PDF to server
                              try {
                                const blob = await getPdfBlobFromState();
                                if (!blob) { toast.error('Niciun PDF de salvat'); return; }
                                const form = new FormData();
                                form.append('file', blob, documentName || 'document.pdf');
                                // if the document is part of documents_db, include id (optional)
                                const docIdMatch = (documentName || '').match(/^(.+)_(.+)$/);
                                if (docIdMatch) {
                                  // not guaranteed; leave document_id empty by default
                                }
                                const res = await fetch(`${apiService.baseURL}/documents/save`, {
                                  method: 'POST',
                                  headers: apiService._getAuthHeaders(),
                                  body: form
                                });
                                if (!res.ok) {
                                  const err = await res.json().catch(() => ({}));
                                  throw new Error(err.detail || 'Save failed');
                                }
                                const data = await res.json();
                                toast.success('Document salvat pe server');
                              } catch (e) {
                                console.error('Save failed', e);
                                toast.error(e.message || 'Salvare eșuată');
                              }
                            }} className="ml-2">
                              <Save className="w-4 h-4 mr-2" />
                              Salvează pe server
                            </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* PANOU DE CONTROL (STÂNGA) */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold text-sm">Navigare Document</h3>
                <div className="flex items-center justify-between text-sm">
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    Anterior
                  </Button>
                  <span>{currentPage} / {numPages || '?'}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={currentPage >= numPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, numPages))}
                  >
                    Următor
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-sm">Traducere Rapidă Text (RO)</h3>
                <textarea 
                  value={textToTranslate} 
                  onChange={(e) => setTextToTranslate(e.target.value)} 
                  placeholder="Introduceți text sau fraze legale pentru traducere instantanee..." 
                  className="w-full text-xs p-2.5 rounded-lg border bg-background resize-none h-24 focus:ring-1 focus:ring-blue-500 outline-none" 
                />
                <Button className="w-full" size="sm" disabled={isProcessing || !textToTranslate} onClick={handleTranslate}>
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Languages className="w-4 h-4 mr-2"/>}
                  Traducere Automată
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-sm">Poziționare Semnătură (A4 Px)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Coordonata X</label>
                    <Input type="number" value={textX} onChange={(e) => setTextX(Number(e.target.value) || 0)} className="h-8 text-xs" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Coordonata Y</label>
                    <Input type="number" value={textY} onChange={(e) => setTextY(Number(e.target.value) || 0)} className="h-8 text-xs" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
                <CardContent className="p-4">
                    <Button variant="secondary" className="w-full" onClick={checkStirlingHealth}>
                        Verifică Stare Stirling Engine
                    </Button>
                    {stirlingStatus && (
                        <div className="flex items-center mt-3 text-sm">
                            <span className={`h-2 w-2 rounded-full mr-2 ${stirlingStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            {stirlingStatus === 'online' ? 'Serviciu Online' : 'Serviciu Offline'}
                        </div>
                    )}
                </CardContent>
            </Card>

          </div>

          {/* ZONĂ CENTRALĂ DE AFIȘARE GRAFICĂ (DREAPTA) */}
          <div className="lg:col-span-3 bg-white dark:bg-neutral-900 border rounded-lg shadow-inner flex items-center justify-center min-h-[80vh]">
            {pdfFile ? (
              <Document
                file={pdfFile}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(error) => toast.error(`Eroare la încărcarea PDF: ${error.message}`)}
                loading={<Loader2 className="w-8 h-8 animate-spin text-primary"/>}
                noData="Niciun PDF încărcat."
              >
                <Page pageNumber={currentPage} renderTextLayer={false} />
              </Document>
            ) : (
              <div className="text-center text-muted-foreground p-8">
                <ServerCrash className="w-16 h-16 mx-auto mb-4 text-gray-400"/>
                <h3 className="font-semibold text-lg">Niciun document activ</h3>
                <p className="text-sm mt-2">
                  Încărcați un fișier de tip PDF din panoul superior pentru a activa motorul de randare grafică și semnare electronică.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* MODAL DRAW SIGNATURE PAD BOARD */}
        {showSignModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Panou Semnătură Electronică</h2>
                  <button onClick={() => setShowSignModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Desenează semnătura ta olografă în spațiul de mai jos folosind mausul sau ecranul tactil:
                </p>
                <div className="bg-muted rounded-lg border border-dashed">
                  <SignaturePad
                    ref={signaturePadRef}
                    canvasProps={{
                      className: 'w-full h-[200px] rounded-lg'
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-2 flex justify-between">
                    <span>Securizat local</span>
                    <span>Pagina: {currentPage} • Poz: X:{textX}, Y:{textY}</span>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" size="sm" onClick={() => signaturePadRef.current?.clear()}>
                    Curăță Canvas
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowSignModal(false)}>
                    Anulează
                  </Button>
                  <Button size="sm" onClick={handleApplySignature} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
                    Aplică pe PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* MODAL ADD TEXT */}
        {showAddTextModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Adaugă Text pe PDF</h2>
                  <button onClick={() => setShowAddTextModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <label className="text-sm">Text</label>
                  <textarea value={newTextValue} onChange={(e) => setNewTextValue(e.target.value)} className="w-full p-2 rounded border" rows={4} />

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm">Mărime</label>
                      <input type="number" value={newTextSize} onChange={(e) => setNewTextSize(Number(e.target.value) || 12)} className="w-full p-2 rounded border" />
                    </div>
                    <div>
                      <label className="text-sm">Culoare</label>
                      <input type="color" value={newTextColor} onChange={(e) => setNewTextColor(e.target.value)} className="w-full p-1 rounded border" />
                    </div>
                    <div>
                      <label className="text-sm">Pagina</label>
                      <input type="number" value={currentPage} onChange={(e) => setCurrentPage(Number(e.target.value) || 1)} className="w-full p-2 rounded border" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm">X</label>
                      <input type="number" value={textX} onChange={(e) => setTextX(Number(e.target.value) || 0)} className="w-full p-2 rounded border" />
                    </div>
                    <div>
                      <label className="text-sm">Y</label>
                      <input type="number" value={textY} onChange={(e) => setTextY(Number(e.target.value) || 0)} className="w-full p-2 rounded border" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="ghost" size="sm" onClick={() => setShowAddTextModal(false)}>Anulează</Button>
                  <Button size="sm" onClick={async () => {
                    if (!newTextValue) { toast.error('Introduceți textul.'); return; }
                    setIsProcessing(true); toast.info('Se aplică textul...');
                    try {
                      // prepare pdf bytes
                      let pdfBuf;
                      if (typeof pdfFile === 'string') { pdfBuf = await (await fetch(pdfFile)).arrayBuffer(); }
                      else { pdfBuf = await pdfFile.arrayBuffer(); }

                      const colorObj = {
                        r: parseInt(newTextColor.slice(1,3),16)/255,
                        g: parseInt(newTextColor.slice(3,5),16)/255,
                        b: parseInt(newTextColor.slice(5,7),16)/255,
                      };

                      const newBytes = await documentProcessor.addTextLocal(pdfBuf, newTextValue, { pageNumber: currentPage, x: textX, y: textY, size: newTextSize, color: colorObj });
                      const blob = new Blob([newBytes], { type: 'application/pdf' });
                      const url = URL.createObjectURL(blob);
                      try { if (typeof pdfFile === 'string' && pdfFile.startsWith('blob:')) URL.revokeObjectURL(pdfFile); } catch(e){}
                      setPdfFile(url);
                      setDocumentName((prev) => `texted_${prev}`);
                      setShowAddTextModal(false);
                      toast.success('Textul a fost aplicat!');
                    } catch (e) {
                      console.error('Add text failed', e);
                      toast.error('Aplicarea textului a eșuat.');
                    } finally { setIsProcessing(false); }
                  }}>Aplică Text</Button>
                </div>

              </CardContent>
            </Card>
          </div>
        )}
        {/* MODAL ADD TEXT */}
        {showAddTextModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Adaugă Text pe PDF</h2>
                  <button onClick={() => setShowAddTextModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <label className="text-sm">Text</label>
                  <textarea value={newTextValue} onChange={(e) => setNewTextValue(e.target.value)} className="w-full p-2 rounded border" rows={4} />

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm">Mărime</label>
                      <input type="number" value={newTextSize} onChange={(e) => setNewTextSize(Number(e.target.value) || 12)} className="w-full p-2 rounded border" />
                    </div>
                    <div>
                      <label className="text-sm">Culoare</label>
                      <input type="color" value={newTextColor} onChange={(e) => setNewTextColor(e.target.value)} className="w-full p-1 rounded border" />
                    </div>
                    <div>
                      <label className="text-sm">Pagina</label>
                      <input type="number" value={currentPage} onChange={(e) => setCurrentPage(Number(e.target.value) || 1)} className="w-full p-2 rounded border" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm">X</label>
                      <input type="number" value={textX} onChange={(e) => setTextX(Number(e.target.value) || 0)} className="w-full p-2 rounded border" />
                    </div>
                    <div>
                      <label className="text-sm">Y</label>
                      <input type="number" value={textY} onChange={(e) => setTextY(Number(e.target.value) || 0)} className="w-full p-2 rounded border" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="ghost" size="sm" onClick={() => setShowAddTextModal(false)}>Anulează</Button>
                  <Button size="sm" onClick={async () => {
                    if (!newTextValue) { toast.error('Introduceți textul.'); return; }
                    setIsProcessing(true); toast.info('Se aplică textul...');
                    try {
                      // prepare pdf bytes
                      let pdfBuf;
                      if (typeof pdfFile === 'string') { pdfBuf = await (await fetch(pdfFile)).arrayBuffer(); }
                      else { pdfBuf = await pdfFile.arrayBuffer(); }

                      const colorObj = {
                        r: parseInt(newTextColor.slice(1,3),16)/255,
                        g: parseInt(newTextColor.slice(3,5),16)/255,
                        b: parseInt(newTextColor.slice(5,7),16)/255,
                      };

                      const newBytes = await documentProcessor.addTextLocal(pdfBuf, newTextValue, { pageNumber: currentPage, x: textX, y: textY, size: newTextSize, color: colorObj });
                      const blob = new Blob([newBytes], { type: 'application/pdf' });
                      const url = URL.createObjectURL(blob);
                      try { if (typeof pdfFile === 'string' && pdfFile.startsWith('blob:')) URL.revokeObjectURL(pdfFile); } catch(e){}
                      setPdfFile(url);
                      setDocumentName((prev) => `texted_${prev}`);
                      setShowAddTextModal(false);
                      toast.success('Textul a fost aplicat!');
                    } catch (e) {
                      console.error('Add text failed', e);
                      toast.error('Aplicarea textului a eșuat.');
                    } finally { setIsProcessing(false); }
                  }}>Aplică Text</Button>
                </div>

              </CardContent>
            </Card>
          </div>
        )}
      {/* ADD IMAGE MODAL (fallback/alternate placement) */}
      {showAddImageModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Adaugă Imagine pe PDF</h2>
                <button onClick={() => setShowAddImageModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-sm">Imagine</label>
                <input type="file" ref={imageInputRef} accept="image/*" onChange={(e) => setNewImageFile(e.target.files[0] || null)} className="w-full p-2 rounded border" />

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm">Lățime</label>
                    <input type="number" value={newImageWidth} onChange={(e) => setNewImageWidth(Number(e.target.value) || 150)} className="w-full p-2 rounded border" />
                  </div>
                  <div>
                    <label className="text-sm">Înălțime (opțional)</label>
                    <input type="number" value={newImageHeight} onChange={(e) => setNewImageHeight(Number(e.target.value) || 0)} className="w-full p-2 rounded border" />
                  </div>
                  <div>
                    <label className="text-sm">Pagina</label>
                    <input type="number" value={currentPage} onChange={(e) => setCurrentPage(Number(e.target.value) || 1)} className="w-full p-2 rounded border" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm">X</label>
                    <input type="number" value={textX} onChange={(e) => setTextX(Number(e.target.value) || 0)} className="w-full p-2 rounded border" />
                  </div>
                  <div>
                    <label className="text-sm">Y</label>
                    <input type="number" value={textY} onChange={(e) => setTextY(Number(e.target.value) || 0)} className="w-full p-2 rounded border" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="ghost" size="sm" onClick={() => setShowAddImageModal(false)}>Anulează</Button>
                <Button size="sm" onClick={async () => {
                  if (!newImageFile) { toast.error('Selectați o imagine.'); return; }
                  setIsProcessing(true); toast.info('Se aplică imaginea...');
                  try {
                    let pdfBuf;
                    if (typeof pdfFile === 'string') { pdfBuf = await (await fetch(pdfFile)).arrayBuffer(); }
                    else { pdfBuf = await pdfFile.arrayBuffer(); }

                    await pushSnapshot();
                    const imgBuf = await newImageFile.arrayBuffer();
                    const newBytes = await documentProcessor.addImageLocal(pdfBuf, imgBuf, { pageNumber: currentPage, x: textX, y: textY, width: newImageWidth, height: newImageHeight || null });
                    const blob = new Blob([newBytes], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob);
                    try { if (typeof pdfFile === 'string' && pdfFile.startsWith('blob:')) URL.revokeObjectURL(pdfFile); } catch(e){}
                    setPdfFile(url);
                    setDocumentName((prev) => `imged_${prev}`);
                    setShowAddImageModal(false);
                    toast.success('Imaginea a fost aplicată!');
                  } catch (e) {
                    console.error('Add image failed', e);
                    toast.error('Aplicarea imaginii a eșuat.');
                  } finally { setIsProcessing(false); }
                }}>Aplică Imagine</Button>
              </div>

            </CardContent>
          </Card>
        </div>
      )}

      </div>
    </div>
  );
}