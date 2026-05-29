import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/lib/api';

// Lista mock de 150+ template-uri (în realitate, le-ai lua din backend)
const TEMPLATES = [
  { id: 'contract-vanzare', name: 'Contract de vânzare-cumpărare', category: 'Juridic' },
  { id: 'cerere-concediu', name: 'Cerere de concediu', category: 'Business' },
  { id: 'factura', name: 'Factură fiscală', category: 'Financiar' },
  { id: 'declaratie-unică', name: 'Declarație unică', category: 'Fiscal' },
  // ... până la 150+
];

export default function Templates() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [variables, setVariables] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    setIsGenerating(true);
    try {
      const pdfBlob = await apiService.generateLegalDocument(selectedTemplate.id, variables);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTemplate.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Document generat!');
    } catch (error) {
      toast.error('Eroare generare');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Șabloane juridice și de business (150+)</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="space-y-2">
            {TEMPLATES.map(tpl => (
              <Card key={tpl.id} className={`cursor-pointer transition-all ${selectedTemplate?.id === tpl.id ? 'border-primary' : ''}`} onClick={() => setSelectedTemplate(tpl)}>
                <CardContent className="p-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">{tpl.name}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          {selectedTemplate ? (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">{selectedTemplate.name}</h2>
                <p className="text-sm text-muted-foreground mb-4">Completează câmpurile necesare:</p>
                <div className="space-y-4">
                  {/* Câmpuri dinamice – exemplu simplu */}
                  <div><Label>Nume complet</Label><Input placeholder="ex: Ion Popescu" onChange={e => setVariables({ ...variables, nume: e.target.value })} /></div>
                  <div><Label>Dată</Label><Input type="date" onChange={e => setVariables({ ...variables, data: e.target.value })} /></div>
                  <Button onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="animate-spin" /> : 'Generează și descarcă PDF'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center text-muted-foreground p-12">Selectează un șablon din stânga</div>
          )}
        </div>
      </div>
    </div>
  );
}