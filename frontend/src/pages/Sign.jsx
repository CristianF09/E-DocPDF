import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';
import SignatureCanvas from 'react-signature-canvas';
import Draggable from 'react-draggable';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { UploadCloud, FileText, Edit, Trash2, Save, MousePointerClick } from 'lucide-react';
import apiService from '../lib/api';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const SignPage = () => {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [signature, setSignature] = useState(null);
  const [isSignaturePlaced, setIsSignaturePlaced] = useState(false);
  const [sigPosition, setSigPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  
  const sigCanvas = useRef({});
  const pdfPageRef = useRef(null);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setFileUrl(URL.createObjectURL(selectedFile));
      setCurrentPage(1);
      setSignature(null);
      setIsSignaturePlaced(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, multiple: false });

  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);
  const clearSignature = () => sigCanvas.current.clear();

  const saveSignature = () => {
    if (sigCanvas.current.isEmpty()) {
      toast.error("Vă rugăm să desenați o semnătură.");
      return;
    }
    const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    setSignature(dataUrl);
    // NU mai setăm isSignaturePlaced aici. Așteptăm ca utilizatorul să o miște.
    toast.success("Semnătură creată. Acum trageți-o pe document pentru a o plasa.");
  };

  const handleDragStop = (e, data) => {
    setSigPosition({ x: data.x, y: data.y });
    if (!isSignaturePlaced) {
      setIsSignaturePlaced(true); // Semnătura a fost plasată de utilizator
    }
  };

  const handleApplySignature = async () => {
    if (!file || !signature) {
      toast.error("Încărcați un PDF și creați o semnătură mai întâi.");
      return;
    }

    const pageElement = pdfPageRef.current;
    if (!pageElement) {
        toast.error("Eroare: Nu s-a putut obține referința paginii PDF.");
        return;
    }

    // Calculează coordonatele relative la pagina PDF
    const pageRect = pageElement.getBoundingClientRect();
    const finalX = sigPosition.x;
    const finalY = sigPosition.y;

    // Validare coordonate
    if (finalX < 0 || finalY < 0 || finalX > pageRect.width || finalY > pageRect.height) {
        toast.warning("Semnătura pare să fie în afara paginii. Vă rugăm să o repoziționați.");
        return;
    }

    setIsLoading(true);
    try {
      const signatureBlob = await (await fetch(signature)).blob();
      const signedPdfBlob = await apiService.stirlingSign(file, signatureBlob, String(currentPage), Math.round(finalX), Math.round(finalY));
      
      const url = URL.createObjectURL(signedPdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `signed_${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("PDF semnat și descărcat cu succes!");
      
      // Reset state
      setFile(null);
      setFileUrl(null);
      setSignature(null);
      setIsSignaturePlaced(false);

    } catch (err) {
      console.error("Eroare la semnare:", err);
      toast.error(err.message || "A apărut o eroare la semnarea documentului.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Semnează Documente PDF</h1>
      <p className="text-muted-foreground text-center mb-8">Desenați o semnătură, plasați-o pe document prin tragere și apoi salvați PDF-ul.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <Card className="glass-card">
            <CardHeader><CardTitle>1. Încărcați PDF-ul</CardTitle></CardHeader>
            <CardContent>
              <div {...getRootProps()} className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-primary' : 'border-border'}`}>
                <input {...getInputProps()} />
                <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2">Trageți fișierul aici sau faceți clic.</p>
              </div>
              {file && <div className="mt-4 flex items-center"><FileText className="h-5 w-5 mr-2" /><span>{file.name}</span></div>}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader><CardTitle>2. Creați Semnătura</CardTitle></CardHeader>
            <CardContent>
              <div className="border rounded-lg bg-white w-full overflow-hidden">
                <SignatureCanvas ref={sigCanvas} penColor='black' canvasProps={{ className: 'sigCanvas w-full h-auto' }} />
              </div>
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={clearSignature}><Trash2 className="mr-2 h-4 w-4"/>Șterge</Button>
                <Button onClick={saveSignature}><Edit className="mr-2 h-4 w-4"/>Creează</Button>
              </div>
            </CardContent>
          </Card>
           <Button onClick={handleApplySignature} disabled={!file || !signature || !isSignaturePlaced || isLoading} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Se procesează...' : 'Aplică Semnătura și Descarcă'}
            </Button>
        </div>

        <div className="lg:col-span-2">
          <Card className="glass-card h-full">
            <CardHeader><CardTitle>3. Previzualizare și Plasare</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 flex items-center"><MousePointerClick className="h-4 w-4 mr-2"/>Trageți semnătura pentru a o repoziționa pe pagină.</p>
              <div ref={pdfPageRef} className="pdf-container relative border rounded-lg overflow-auto bg-gray-200" style={{height: '70vh'}}>
                {fileUrl ? (
                  <>
                    <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess} loading="Se încarcă PDF-ul...">
                      <Page pageNumber={currentPage} renderTextLayer={false} renderAnnotationLayer={false} />
                    </Document>
                    {signature && isSignaturePlaced && (
                      <Draggable bounds="parent" onStop={handleDragStop} position={sigPosition}>
                        <img src={signature} alt="Signature" className="absolute top-0 left-0 cursor-move" style={{ width: '150px', border: '1px dashed #000' }}/>
                      </Draggable>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground"><p>Previzualizarea PDF va apărea aici.</p></div>
                )}
              </div>
              {numPages && (
                <div className="flex justify-center items-center mt-4 space-x-2">
                  <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>Anterior</Button>
                  <span>Pagina {currentPage} din {numPages}</span>
                  <Button onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))} disabled={currentPage >= numPages}>Următor</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default SignPage;