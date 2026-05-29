import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, PenTool, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/lib/api';
import { Document, Page, pdfjs } from 'react-pdf';
// Folosește CDN-ul oficial care suportă CORS
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function Sign() {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [signatureImage, setSignatureImage] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [numPages, setNumPages] = useState(null);
  const [isSigning, setIsSigning] = useState(false);
  const canvasRef = useRef(null);
  const pdfContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

  const startDraw = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => setIsDrawing(false);
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureImage(null);
  };
  const saveSignature = () => {
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      setSignatureImage(blob);
      toast.success('Semnătură salvată!');
    }, 'image/png');
  };

  const handlePdfClick = (e) => {
    if (!isPlacing) return;
    const rect = pdfContainerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setPosition({ x, y });
      setIsPlacing(false);
      toast.success(`Poziție selectată: (${Math.round(x)}, ${Math.round(y)})`);
    }
  };

  const handleApplySignature = async () => {
    if (!file || !signatureImage) {
      toast.error('Încarcă un PDF și desenează o semnătură.');
      return;
    }
    setIsSigning(true);
    try {
      const pdfBlob = await apiService.addSignature(file, signatureImage, position.x, position.y, 1);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `signed_${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF semnat cu succes!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Semnătură Electronică</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">1. Încarcă PDF</h2>
            {!file ? (
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Click pentru a încărca PDF</p>
                <input ref={fileInputRef} type="file" accept=".pdf" hidden onChange={(e) => setFile(e.target.files[0])} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium truncate">{file.name}</span>
                  <button onClick={() => setFile(null)}><X className="w-4 h-4" /></button>
                </div>
                <div ref={pdfContainerRef} className="border rounded-lg p-2 overflow-auto" onClick={handlePdfClick} style={{ cursor: isPlacing ? 'crosshair' : 'default' }}>
                  <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
                    <Page pageNumber={1} width={400} />
                  </Document>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <Button variant={isPlacing ? "default" : "outline"} size="sm" onClick={() => setIsPlacing(!isPlacing)}>
                    {isPlacing ? "Plasează..." : "Selectează poziția"}
                  </Button>
                  <span className="text-xs text-muted-foreground">Poziție: ({Math.round(position.x)}, {Math.round(position.y)})</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">2. Desenează semnătura</h2>
            <canvas
              ref={canvasRef}
              width={500}
              height={200}
              className="w-full border rounded-lg bg-white cursor-crosshair"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={clearCanvas}>Șterge</Button>
              <Button onClick={saveSignature}>Salvează semnătura</Button>
            </div>
            {signatureImage && <p className="text-xs text-green-600 mt-2">✅ Semnătură salvată</p>}
          </CardContent>
        </Card>
      </div>
      {file && signatureImage && (
        <div className="mt-8 text-center">
          <Button onClick={handleApplySignature} disabled={isSigning} className="gap-2">
            {isSigning ? <Loader2 className="animate-spin" /> : <PenTool />}
            Aplică semnătura și descarcă PDF
          </Button>
        </div>
      )}
    </div>
  );
}