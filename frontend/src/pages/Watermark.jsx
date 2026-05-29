import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { UploadCloud, FileText, Type, Image, Droplets } from 'lucide-react';
import { Input } from '../components/ui/input';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import apiService from '../lib/api';

const WatermarkPage = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [watermarkType, setWatermarkType] = useState('text');
  const [watermarkText, setWatermarkText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const onPdfDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) setPdfFile(acceptedFiles[0]);
  }, []);

  const onImageDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) setImageFile(acceptedFiles[0]);
  }, []);

  const { getRootProps: getPdfRootProps, getInputProps: getPdfInputProps } = useDropzone({ onDrop: onPdfDrop, accept: { 'application/pdf': ['.pdf'] }, multiple: false });
  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps } = useDropzone({ onDrop: onImageDrop, accept: { 'image/*': ['.png', '.jpg', '.jpeg'] }, multiple: false });

  const handleApplyWatermark = async () => {
    if (!pdfFile) {
      toast.error("Vă rugăm să încărcați un fișier PDF.");
      return;
    }
    if (watermarkType === 'text' && !watermarkText) {
      toast.error("Vă rugăm să introduceți textul pentru watermark.");
      return;
    }
    if (watermarkType === 'image' && !imageFile) {
      toast.error("Vă rugăm să încărcați o imagine pentru watermark.");
      return;
    }

    setIsLoading(true);
    try {
      const options = {
        type: watermarkType,
        text: watermarkText,
        imageFile: imageFile,
      };
      const watermarkedBlob = await apiService.stirlingAddWatermark(pdfFile, options);

      const url = URL.createObjectURL(watermarkedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `watermarked_${pdfFile.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Watermark aplicat și PDF-ul descărcat cu succes!");
      setPdfFile(null);
      setImageFile(null);
      setWatermarkText('');

    } catch (err) {
      console.error("Eroare la aplicarea watermark-ului:", err);
      toast.error(err.message || "A apărut o eroare la aplicarea watermark-ului.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Adaugă Watermark pe PDF</h1>
      <p className="text-muted-foreground text-center mb-8">Protejați-vă documentele aplicând un text sau o imagine ca watermark.</p>

      <div className="max-w-2xl mx-auto">
        <Card className="glass-card mb-8">
          <CardHeader><CardTitle>1. Încărcați fișierul PDF</CardTitle></CardHeader>
          <CardContent>
            <div {...getPdfRootProps()} className="p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors hover:border-primary">
              <input {...getPdfInputProps()} />
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4">Trageți fișierul PDF aici sau faceți clic pentru a-l selecta.</p>
            </div>
            {pdfFile && <div className="mt-4 flex items-center justify-center"><FileText className="h-5 w-5 mr-2" /><span>{pdfFile.name}</span></div>}
          </CardContent>
        </Card>

        <Card className="glass-card mb-8">
          <CardHeader><CardTitle>2. Configurați Watermark-ul</CardTitle></CardHeader>
          <CardContent>
            <RadioGroup value={watermarkType} onValueChange={setWatermarkType} className="flex space-x-4 mb-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="text" id="text" />
                <Label htmlFor="text" className="flex items-center"><Type className="mr-2 h-4 w-4"/>Text</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="image" id="image" />
                <Label htmlFor="image" className="flex items-center"><Image className="mr-2 h-4 w-4"/>Imagine</Label>
              </div>
            </RadioGroup>

            {watermarkType === 'text' ? (
              <Input
                type="text"
                placeholder="Introduceți textul pentru watermark..."
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
              />
            ) : (
              <div>
                <div {...getImageRootProps()} className="p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors hover:border-primary">
                  <input {...getImageInputProps()} />
                  <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm">Trageți imaginea aici sau faceți clic.</p>
                </div>
                {imageFile && <div className="mt-4 flex items-center justify-center"><Image className="h-5 w-5 mr-2" /><span>{imageFile.name}</span></div>}
              </div>
            )}
          </CardContent>
        </Card>

        <Button onClick={handleApplyWatermark} disabled={!pdfFile || isLoading} className="w-full">
          <Droplets className="mr-2 h-4 w-4" />
          {isLoading ? 'Se procesează...' : 'Aplică Watermark și Descarcă'}
        </Button>
      </div>
    </motion.div>
  );
};

export default WatermarkPage;