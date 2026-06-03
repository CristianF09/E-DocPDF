import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, FileText, CreditCard, Landmark, Users, Scale } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/lib/api';

const categories = ['All', 'Comercial', 'Servicii', 'Financiar', 'Banking', 'Government', 'Employers', 'Juridice'];

export default function Templates() {
  const [allTemplates, setAllTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [variables, setVariables] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const templates = await apiService.getLegalTemplates();
        setAllTemplates(templates);
        setFilteredTemplates(templates);
      } catch (error) {
        toast.error('Eroare la încărcarea șabloanelor.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    if (category === 'All') {
      setFilteredTemplates(allTemplates);
    } else {
      const filtered = allTemplates.filter(t => t.category === category);
      setFilteredTemplates(filtered);
    }
    setSelectedTemplate(null); // Reset selection when category changes
  };

  const handleVariableChange = (key, value) => {
    setVariables(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;

    // Verificare simplă dacă toate câmpurile sunt completate
    const allFieldsFilled = selectedTemplate.placeholders.every(p => variables[p.key.replace(/[{}]/g, '')]);
    if (!allFieldsFilled) {
      toast.warning('Vă rugăm completați toate câmpurile.');
      return;
    }

    setIsGenerating(true);
    try {
      const cleanVariables = {};
      for (const key in variables) {
        cleanVariables[key] = variables[key];
      }

      const pdfBlob = await apiService.generateLegalDocument(selectedTemplate.id, cleanVariables);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTemplate.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Document generat cu succes!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Eroare la generarea documentului.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    // Inițializăm variabilele goale pentru noul template selectat
    const initialVars = {};
    template.placeholders.forEach(p => {
        initialVars[p.key.replace(/[{}]/g, '')] = '';
    });
    setVariables(initialVars);
  };

  const renderInputField = (placeholder) => {
    const key = placeholder.key.replace(/[{}]/g, '');
    switch (placeholder.type) {
      case 'date':
        return <Input type="date" id={key} value={variables[key] || ''} onChange={e => handleVariableChange(key, e.target.value)} />;
      case 'textarea':
        return <Textarea id={key} placeholder={placeholder.label} value={variables[key] || ''} onChange={e => handleVariableChange(key, e.target.value)} />;
      case 'number':
        return <Input type="number" id={key} placeholder={placeholder.label} value={variables[key] || ''} onChange={e => handleVariableChange(key, e.target.value)} />;
      default:
        return <Input type="text" id={key} placeholder={placeholder.label} value={variables[key] || ''} onChange={e => handleVariableChange(key, e.target.value)} />;
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-screen-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Generator Documente Legale</h1>
      
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="space-y-2 h-[70vh] overflow-y-auto pr-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              filteredTemplates.map(tpl => (
                <Card key={tpl.id} className={`cursor-pointer transition-all hover:border-primary ${selectedTemplate?.id === tpl.id ? 'border-primary bg-muted/50' : ''}`} onClick={() => handleTemplateSelect(tpl)}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      {tpl.category === 'Banking' && <CreditCard className="w-4 h-4 text-blue-500" />}
                      {tpl.category === 'Government' && <Landmark className="w-4 h-4 text-purple-500" />}
                      {tpl.category === 'Employers' && <Users className="w-4 h-4 text-orange-500" />}
                      {tpl.category === 'Juridice' && <Scale className="w-4 h-4 text-red-500" />}
                      {tpl.category === 'Comercial' && <FileText className="w-4 h-4 text-green-500" />}
                      {tpl.category === 'Servicii' && <FileText className="w-4 h-4 text-indigo-500" />}
                      {tpl.category === 'Financiar' && <FileText className="w-4 h-4 text-pink-500" />}
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{tpl.category}</span>
                    </div>
                    <span className="text-sm font-medium">{tpl.name}</span>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
        
        <div className="lg:col-span-8 xl:col-span-9">
          {selectedTemplate ? (
            <Card className="h-full">
              <CardContent className="p-6 h-full flex flex-col">
                <h2 className="text-xl font-semibold mb-1">{selectedTemplate.name}</h2>
                <p className="text-sm text-muted-foreground mb-4">{selectedTemplate.description}</p>
                <div className="flex-grow space-y-4 overflow-y-auto pr-2">
                  {selectedTemplate.placeholders.map(p => (
                    <div key={p.key}>
                      <Label htmlFor={p.key.replace(/[{}]/g, '')}>{p.label}</Label>
                      {renderInputField(p)}
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t">
                  <Button onClick={handleGenerate} disabled={isGenerating} className="w-full md:w-auto">
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isGenerating ? 'Generare în curs...' : 'Generează și Descarcă PDF'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center text-center text-muted-foreground h-full bg-muted/20 rounded-lg">
                <p className="text-lg">Selectează un șablon din stânga pentru a începe.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}