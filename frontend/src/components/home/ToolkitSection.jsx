import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  FileText, 
  Sparkles, 
  PenLine,
  RotateCw, 
  Droplets, 
  Signature, 
  Languages, 
  Brain, 
  Building2, 
  Scale, 
  GraduationCap, 
  FileSpreadsheet, 
  Scissors, 
  Combine, 
  LayoutGrid 
} from 'lucide-react';

const toolGroups = [
  {
    title: "📄 Operațiuni PDF",
    icon: FileText,
    tools: [
      { name: "Îmbină PDF", description: "Combină mai multe PDF-uri în unul singur", icon: Combine, path: "/tools#merge" },
      { name: "Împarte PDF", description: "Extrage pagini specifice din PDF", icon: Scissors, path: "/tools#split" },
      { name: "Comprimă PDF", description: "Reduce dimensiunea fișierelor PDF", icon: LayoutGrid, path: "/tools#compress" },
    ]
  },
  {
    title: "🔄 Conversii",
    icon: RotateCw,
    tools: [
      { name: "PDF în Word", description: "Convertește PDF în document editabil Word", icon: FileSpreadsheet, path: "/converter" },
      { name: "PDF în Excel", description: "Extrage tabele în format Excel", icon: FileSpreadsheet, path: "/converter" },
      { name: "PDF în Imagine", description: "Convertește PDF în imagini", icon: FileText, path: "/converter" },
    ]
  },
  {
    title: "✍️ Editare",
    icon: PenLine,
    tools: [
      { name: "Editare text", description: "Modifică textul din PDF", icon: PenLine, path: "/tools#edit" },
      { name: "Adaugă semnătură", description: "Adaugă semnături digitale", icon: Signature, path: "/sign" },
      { name: "Watermark", description: "Adaugă filigran personalizat", icon: Droplets, path: "/tools#watermark" },
    ]
  },
  {
    title: "🤖 AI Avansat",
    icon: Brain,
    tools: [
      { name: "Traducere AI", description: "Traduce documente în peste 100 limbi", icon: Languages, path: "/translate" },
      { name: "Rezumat automat", description: "Generează rezumat inteligent", icon: Sparkles, path: "/translate" },
      { name: "OCR + Traducere", description: "Extrage text din imagini și traduce", icon: Brain, path: "/translate" },
    ]
  },
  {
    title: "🏢 Business",
    icon: Building2,
    tools: [
      { name: "Contracte", description: "Contracte legale conforme", icon: Scale, path: "/templates" },
      { name: "Adeverințe", description: "Adeverințe de muncă, venit", icon: FileText, path: "/templates" },
      { name: "Împuterniciri", description: "Documente administrative", icon: GraduationCap, path: "/templates" },
    ]
  }
];

export default function ToolkitSection() {
  return (
    <section className="py-24 px-4 sm:px-6 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Unelte Profesionale</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tot ce ai nevoie pentru a lucra eficient cu documente
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {toolGroups.map((group, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <group.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold">{group.title}</h3>
              </div>
              
              <div className="space-y-3">
                {group.tools.map((tool, toolIdx) => (
                  <Link
                    key={toolIdx}
                    to={tool.path}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <tool.icon className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{tool.name}</p>
                        <p className="text-xs text-muted-foreground">{tool.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}