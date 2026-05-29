import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Download, PenTool, FileText, Loader2 } from 'lucide-react';

const templateConfigs = {
  'emp-contract': {
    name: 'Contract Individual de Muncă',
    category: 'contract',
    fields: [
      { name: 'employer_name', label: 'Numele Angajatorului', type: 'text', required: true, placeholder: 'SC Exemplu SRL' },
      { name: 'employer_cui', label: 'CUI Angajator', type: 'text', required: true, placeholder: 'RO12345678' },
      { name: 'employer_address', label: 'Sediul Angajatorului', type: 'text', required: true, placeholder: 'Str. Exemplu, Nr. 1, București' },
      { name: 'employee_name', label: 'Numele Angajatului', type: 'text', required: true, placeholder: 'Ion Popescu' },
      { name: 'employee_cnp', label: 'CNP Angajat', type: 'text', required: true, placeholder: '1900101123456' },
      { name: 'employee_address', label: 'Domiciliul Angajatului', type: 'text', required: true },
      { name: 'position', label: 'Funcția / Postul', type: 'text', required: true, placeholder: 'Inginer Software' },
      { name: 'department', label: 'Departamentul', type: 'text', placeholder: 'IT' },
      { name: 'salary', label: 'Salariul Brut Lunar (RON)', type: 'number', required: true, placeholder: '5000' },
      { name: 'work_hours', label: 'Program de Lucru (ore/zi)', type: 'number', placeholder: '8' },
      { name: 'start_date', label: 'Data Începerii', type: 'date', required: true },
      { name: 'contract_type', label: 'Tip Contract', type: 'select', options: ['Nedeterminat', 'Determinat - 6 luni', 'Determinat - 12 luni'], required: true },
      { name: 'probation_period', label: 'Perioada de Probă', type: 'select', options: ['30 zile', '60 zile', '90 zile', '120 zile'] },
      { name: 'vacation_days', label: 'Zile Concediu Anual', type: 'number', placeholder: '21' },
      { name: 'additional_clauses', label: 'Clauze Suplimentare', type: 'textarea', placeholder: 'Clauze adiționale...' },
    ]
  },
  'commercial': {
    name: 'Contract Comercial',
    category: 'contract',
    fields: [
      { name: 'party_a_name', label: 'Numele Părții A', type: 'text', required: true },
      { name: 'party_a_cui', label: 'CUI Partea A', type: 'text', required: true },
      { name: 'party_b_name', label: 'Numele Părții B', type: 'text', required: true },
      { name: 'party_b_cui', label: 'CUI Partea B', type: 'text', required: true },
      { name: 'contract_object', label: 'Obiectul Contractului', type: 'textarea', required: true },
      { name: 'contract_value', label: 'Valoarea Contractului (RON)', type: 'number', required: true },
      { name: 'payment_terms', label: 'Termeni de Plată', type: 'text', placeholder: '30 zile de la facturare' },
      { name: 'start_date', label: 'Data Începerii', type: 'date', required: true },
      { name: 'end_date', label: 'Data Finalizării', type: 'date' },
      { name: 'penalties', label: 'Penalități', type: 'textarea' },
    ]
  },
  'nda': {
    name: 'Acord de Confidențialitate (NDA)',
    category: 'contract',
    fields: [
      { name: 'disclosing_party', label: 'Partea Dezvăluitoare', type: 'text', required: true },
      { name: 'receiving_party', label: 'Partea Receptoare', type: 'text', required: true },
      { name: 'purpose', label: 'Scopul Acordului', type: 'textarea', required: true },
      { name: 'duration', label: 'Durata (ani)', type: 'number', placeholder: '2' },
      { name: 'effective_date', label: 'Data Intrării în Vigoare', type: 'date', required: true },
    ]
  },
  'power-attorney': {
    name: 'Procură',
    category: 'legal',
    fields: [
      { name: 'principal_name', label: 'Numele Mandantului', type: 'text', required: true },
      { name: 'principal_cnp', label: 'CNP Mandant', type: 'text', required: true },
      { name: 'agent_name', label: 'Numele Mandatarului', type: 'text', required: true },
      { name: 'agent_cnp', label: 'CNP Mandatar', type: 'text', required: true },
      { name: 'scope', label: 'Obiectul Procurii', type: 'textarea', required: true, placeholder: 'Descrieți acțiunile pentru care se acordă procura...' },
      { name: 'valid_until', label: 'Valabilă Până La', type: 'date' },
    ]
  },
  'attestation': {
    name: 'Adeverință',
    category: 'administrative',
    fields: [
      { name: 'company_name', label: 'Numele Organizației', type: 'text', required: true },
      { name: 'company_cui', label: 'CUI', type: 'text', required: true },
      { name: 'employee_name', label: 'Numele Persoanei', type: 'text', required: true },
      { name: 'employee_cnp', label: 'CNP', type: 'text', required: true },
      { name: 'position', label: 'Funcția', type: 'text', required: true },
      { name: 'purpose', label: 'Scopul Adeverinței', type: 'text', required: true, placeholder: 'Ex: pentru bancă, pentru spital, etc.' },
      { name: 'additional_info', label: 'Informații Suplimentare', type: 'textarea' },
    ]
  },
  'request': {
    name: 'Cerere Tip',
    category: 'administrative',
    fields: [
      { name: 'recipient', label: 'Către (Instituția)', type: 'text', required: true },
      { name: 'applicant_name', label: 'Numele Solicitantului', type: 'text', required: true },
      { name: 'applicant_cnp', label: 'CNP', type: 'text', required: true },
      { name: 'applicant_address', label: 'Domiciliul', type: 'text', required: true },
      { name: 'request_subject', label: 'Subiectul Cererii', type: 'text', required: true },
      { name: 'request_body', label: 'Conținutul Cererii', type: 'textarea', required: true },
    ]
  },
  'invoice': {
    name: 'Factură',
    category: 'financial',
    fields: [
      { name: 'seller_name', label: 'Furnizor - Denumire', type: 'text', required: true },
      { name: 'seller_cui', label: 'Furnizor - CUI', type: 'text', required: true },
      { name: 'seller_iban', label: 'Furnizor - IBAN', type: 'text', required: true, placeholder: 'RO00AAAA0000000000000000' },
      { name: 'buyer_name', label: 'Client - Denumire', type: 'text', required: true },
      { name: 'buyer_cui', label: 'Client - CUI', type: 'text', required: true },
      { name: 'invoice_number', label: 'Număr Factură', type: 'text', required: true },
      { name: 'invoice_date', label: 'Data Facturii', type: 'date', required: true },
      { name: 'items_description', label: 'Descriere Produse/Servicii', type: 'textarea', required: true },
      { name: 'total_amount', label: 'Total (RON)', type: 'number', required: true },
      { name: 'vat_rate', label: 'TVA (%)', type: 'number', placeholder: '19' },
    ]
  },
  'receipt': {
    name: 'Chitanță',
    category: 'financial',
    fields: [
      { name: 'payer_name', label: 'Plătitor', type: 'text', required: true },
      { name: 'receiver_name', label: 'Beneficiar', type: 'text', required: true },
      { name: 'amount', label: 'Suma (RON)', type: 'number', required: true },
      { name: 'purpose', label: 'Reprezentând', type: 'text', required: true },
      { name: 'receipt_date', label: 'Data', type: 'date', required: true },
      { name: 'receipt_number', label: 'Număr Chitanță', type: 'text' },
    ]
  },
};

// Provide fallback config for unmapped template IDs
const fallbackConfig = {
  name: 'Document',
  category: 'custom',
  fields: [
    { name: 'title', label: 'Titlu Document', type: 'text', required: true },
    { name: 'content', label: 'Conținut', type: 'textarea', required: true },
  ]
};

export default function TemplateEditor() {
  const pathParts = window.location.pathname.split('/');
  const templateId = pathParts[pathParts.length - 1];
  
  const config = templateConfigs[templateId] || fallbackConfig;
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (_status = 'draft') => {
    setIsSaving(true);
    setTimeout(() => {
      navigate('/my-documents');
    }, 500);
    setIsSaving(false);
  };

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold font-space">{config.name}</h1>
          <p className="text-sm text-muted-foreground">Completează câmpurile pentru a genera documentul</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {config.fields.map(field => (
            <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
              <Label htmlFor={field.name} className="text-sm mb-2 block">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              
              {field.type === 'textarea' ? (
                <Textarea
                  id={field.name}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="bg-secondary/50 border-border min-h-[100px]"
                />
              ) : field.type === 'select' ? (
                <Select
                  value={formData[field.name] || ''}
                  onValueChange={(value) => handleChange(field.name, value)}
                >
                  <SelectTrigger className="bg-secondary/50 border-border">
                    <SelectValue placeholder={`Selectează ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.name}
                  type={field.type}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="bg-secondary/50 border-border"
                />
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 pt-6 border-t border-border">
          <Button
            onClick={() => handleSave('draft')}
            disabled={isSaving}
            variant="outline"
            className="w-full sm:w-auto gap-2"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Salvează Ciornă
          </Button>
          <Button
            onClick={() => handleSave('completed')}
            disabled={isSaving}
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Generează Document
          </Button>
          <Button
            onClick={() => handleSave('completed')}
            disabled={isSaving}
            variant="outline"
            className="w-full sm:w-auto gap-2 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
          >
            <PenTool className="w-4 h-4" />
            Generează & Semnează
          </Button>
        </div>
      </div>
    </div>
  );
}