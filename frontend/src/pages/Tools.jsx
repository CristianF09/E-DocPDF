import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, FilePenLine, RotateCw, Droplets,
  Signature, Languages, Brain, FileSpreadsheet, Image,
  Scissors, Combine, Lock, Unlock, Edit3, FileCode,
  Zap, Layers, Sparkles, Search, ShieldCheck, FileJson,
  Presentation, Table, Type, Crop, Hash, Brush, Eye
} from 'lucide-react';
import { Input } from '@/components/ui/input';

// Categorii de tool-uri
const categories = {
  conversie: { label: 'Conversie', icon: FileJson, color: 'from-blue-500 to-cyan-500' },
  editare: { label: 'Editare & Prelucrare', icon: Edit3, color: 'from-orange-500 to-red-500' },
  impartire: { label: 'Împărțire & Îmbinare', icon: Scissors, color: 'from-rose-500 to-pink-500' },
  securitate: { label: 'Securitate', icon: ShieldCheck, color: 'from-slate-500 to-gray-500' },
  semnare: { label: 'Semnare', icon: Signature, color: 'from-emerald-500 to-green-500' },
  ai: { label: 'Inteligență Artificială', icon: Sparkles, color: 'from-violet-500 to-fuchsia-500' },
  template: { label: 'Șabloane', icon: FileSpreadsheet, color: 'from-amber-600 to-orange-500' },
};

// Lista completă a tool-urilor
const allTools = [
  // Conversie
  { name: 'PDF în Word', icon: FileText, category: 'conversie', path: '/converter?tool=convert&format=docx', description: 'Convertește PDF în document Word editabil' },
  { name: 'PDF în Excel', icon: Table, category: 'conversie', path: '/converter?tool=convert&format=xlsx', description: 'Extrage tabelele în format Excel' },
  { name: 'PDF în PowerPoint', icon: Presentation, category: 'conversie', path: '/converter?tool=convert&format=pptx', description: 'Transformă PDF în prezentare PowerPoint' },
  { name: 'PDF în Imagine', icon: Image, category: 'conversie', path: '/converter?tool=convert&format=jpg', description: 'Extrage imagini sau convertește fiecare pagină în JPG/PNG' },
  { name: 'PDF în Text', icon: Type, category: 'conversie', path: '/converter?tool=convert&format=txt', description: 'Extrage textul brut din PDF' },
  { name: 'Word în PDF', icon: FileCode, category: 'conversie', path: '/converter?tool=convert&format=pdf', description: 'Convertește DOC/DOCX în PDF' },
  { name: 'Excel în PDF', icon: FileSpreadsheet, category: 'conversie', path: '/converter?tool=convert&format=pdf', description: 'Convertește XLS/XLSX în PDF' },
  { name: 'Imagine în PDF', icon: Image, category: 'conversie', path: '/converter?tool=convert&format=pdf', description: 'Transformă una sau mai multe imagini în PDF' },
  { name: 'HTML în PDF', icon: FileCode, category: 'conversie', path: '/converter?tool=convert&format=pdf', description: 'Convertește pagini web în PDF' },
  { name: 'Editor Documente', icon: Edit3, category: 'editare', path: '/editor', description: 'Creează și editează documente ca în MS Word' },

  // Editare & Prelucrare
  { name: 'Editare PDF', icon: Edit3, category: 'editare', path: '/editor', description: 'Editează textul și imaginile direct în PDF' },
  { name: 'Rotire PDF', icon: RotateCw, category: 'editare', path: '/converter?tool=rotate', description: 'Rotește paginile PDF (90°, 180°, 270°)' },
  { name: 'Adaugă filigran', icon: Droplets, category: 'editare', path: '/converter?tool=watermark', description: 'Aplică text sau imagine ca filigran' },
  { name: 'Comprimare PDF', icon: Zap, category: 'editare', path: '/converter?tool=compress', description: 'Reduce dimensiunea fișierului păstrând calitatea' },
  { name: 'Redimensionează PDF', icon: Crop, category: 'editare', path: '/converter?tool=resize', description: 'Schimbă dimensiunea paginilor' },
  { name: 'Aplatizare PDF', icon: Layers, category: 'editare', path: '/converter?tool=flatten', description: 'Convertește formularele și anotațiile în conținut static' },
  { name: 'Decupare PDF', icon: Crop, category: 'editare', path: '/converter?tool=crop', description: 'Taie marginile paginilor' },
  { name: 'Adaugă numere de pagină', icon: Hash, category: 'editare', path: '/converter?tool=page-numbers', description: 'Inserează numere de pagină în PDF' },
  { name: 'Elimină pagini', icon: Scissors, category: 'editare', path: '/converter?tool=delete-pages', description: 'Șterge pagini selectate din PDF' },
  { name: 'Organizează pagini', icon: Brush, category: 'editare', path: '/editor', description: 'Rearanjează, duplică sau rotește pagini' },

  // Împărțire & Îmbinare
  { name: 'Împarte PDF', icon: Scissors, category: 'impartire', path: '/converter?tool=split', description: 'Separă PDF-ul în fișiere individuale pe pagini sau intervale' },
  { name: 'Îmbină PDF', icon: Combine, category: 'impartire', path: '/converter?tool=merge', description: 'Combină mai multe PDF-uri într-unul singur' },
  { name: 'Extrage pagini', icon: Eye, category: 'impartire', path: '/converter?tool=extract', description: 'Extrage pagini specifice dintr-un PDF' },

  // Securitate
  { name: 'Protejare PDF', icon: Lock, category: 'securitate', path: '/converter?tool=protect', description: 'Adaugă parolă pentru deschidere sau restricții' },
  { name: 'Deblocare PDF', icon: Unlock, category: 'securitate', path: '/converter?tool=unlock', description: 'Elimină parola unui PDF securizat' },
  { name: 'Certificat digital', icon: ShieldCheck, category: 'securitate', path: '/sign', description: 'Adaugă certificat digital de încredere' },

  // Semnare
  { name: 'Semnătură electronică', icon: Signature, category: 'semnare', path: '/sign', description: 'Adaugă semnătură desenată sau imagine' },
  { name: 'Semnătură digitală', icon: Lock, category: 'semnare', path: '/sign?type=digital', description: 'Semnătură cu certificat digital (conform eIDAS)' },

  // Inteligență Artificială
  { name: 'Traducere PDF', icon: Languages, category: 'ai', path: '/translate', description: 'Traduce documentul în limba dorită (AI)' },
  { name: 'Rezumat AI', icon: Brain, category: 'ai', path: '/translate?action=summarize', description: 'Generează un rezumat inteligent al documentului' },
  { name: 'Corectare gramaticală', icon: Edit3, category: 'ai', path: '/translate?action=grammar', description: 'Îmbunătățește stilul și corectează greșelile' },
  { name: 'OCR – Extrage text', icon: FileCode, category: 'ai', path: '/translate?action=ocr', description: 'Recunoaște textul din documente scanate sau imagini' },
  { name: 'Analiză document', icon: Brain, category: 'ai', path: '/translate?action=analyze', description: 'Analizează conținutul, tone și structura' },

  // Șabloane
  { name: 'Șabloane juridice', icon: FileSpreadsheet, category: 'template', path: '/templates?category=legal', description: 'Contracte, împuterniciri, cereri conforme legii române' },
  { name: 'Șabloane business', icon: FileSpreadsheet, category: 'template', path: '/templates?category=business', description: 'Facturi, oferte, devize, precontracte' },
  { name: 'Șabloane administrative', icon: FileText, category: 'template', path: '/templates?category=admin', description: 'Adeverințe, cerere concediu, referate' },
];

export default function Tools() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  const filteredTools = useMemo(() => {
    let filtered = allTools;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(term) ||
        tool.description.toLowerCase().includes(term)
      );
    }
    if (activeCategory) {
      filtered = filtered.filter(tool => tool.category === activeCategory);
    }
    return filtered;
  }, [searchTerm, activeCategory]);

  const getToolPath = (tool) => {
    return tool.path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 py-8 px-4 sm:py-12 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold font-space mb-4">
            Toate <span className="gradient-text">Instrumentele PDF</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Peste 30 de instrumente profesionale pentru a lucra cu fișiere PDF, sigure și gratuite.
          </p>
        </motion.div>

        <div className="mb-10 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Caută instrument... (ex: comprimare, semnătură, word)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-card/50 backdrop-blur-sm border-white/10 focus:border-primary/50"
            />
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeCategory === null
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              Toate
            </button>
            {Object.entries(categories).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                  activeCategory === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
              >
                <cat.icon className="w-3 h-3" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {filteredTools.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Nu s-au găsit instrumente pentru „{searchTerm}”.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {filteredTools.map((tool, index) => {
              const IconComponent = tool.icon;
              const category = categories[tool.category];
              const gradientColor = category ? category.color : 'from-gray-500 to-gray-600';
              const path = getToolPath(tool);

              return (
                <motion.div
                  key={`${tool.name}-${index}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="glass-card rounded-xl p-4 cursor-pointer group hover:shadow-2xl transition-all duration-300"
                >
                  <Link to={path} className="flex flex-col items-center text-center h-full">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradientColor} flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground mb-1 group-hover:text-primary transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {tool.description}
                    </p>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-20 text-center"
        >
          <div className="glass-card rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold font-space mb-4">
              De ce să folosești <span className="gradient-text">E-DocPDF</span>?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Rapid & Intuitiv</h3>
                <p className="text-muted-foreground text-sm">Procesare direct în browser, fără înregistrare sau instalare. Rezultate în secunde.</p>
              </div>
              <div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Confidențialitate totală</h3>
                <p className="text-muted-foreground text-sm">Fișierele tale nu părăsesc browserul (pentru tool-urile locale) și sunt șterse automat după procesare.</p>
              </div>
              <div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                  <FileSpreadsheet className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Conform legislației RO</h3>
                <p className="text-muted-foreground text-sm">Șabloanele și documentele generate respectă legislația românească în vigoare.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
