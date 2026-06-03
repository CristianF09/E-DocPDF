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
    title: 'Operatiuni PDF',
    icon: FileText,
    tools: [
      { name: 'Imbina PDF', description: 'Combina mai multe PDF-uri intr-unul singur', icon: Combine, path: '/tools#merge' },
      { name: 'Imparte PDF', description: 'Extrage pagini specifice din PDF', icon: Scissors, path: '/tools#split' },
      { name: 'Comprima PDF', description: 'Reduce dimensiunea fisierelor PDF', icon: LayoutGrid, path: '/tools#compress' },
    ]
  },
  {
    title: 'Conversii',
    icon: RotateCw,
    tools: [
      { name: 'PDF in Word', description: 'Converteste PDF in document editabil Word', icon: FileSpreadsheet, path: '/converter' },
      { name: 'PDF in Excel', description: 'Extrage tabele in format Excel', icon: FileSpreadsheet, path: '/converter' },
      { name: 'PDF in imagine', description: 'Converteste PDF in imagini', icon: FileText, path: '/converter' },
    ]
  },
  {
    title: 'Editare',
    icon: PenLine,
    tools: [
      { name: 'Editare text', description: 'Modifica textul din PDF', icon: PenLine, path: '/tools#edit' },
      { name: 'Adauga semnatura', description: 'Adauga semnaturi digitale', icon: Signature, path: '/sign' },
      { name: 'Watermark', description: 'Adauga filigran personalizat', icon: Droplets, path: '/tools#watermark' },
    ]
  },
  {
    title: 'AI avansat',
    icon: Brain,
    tools: [
      { name: 'Traducere AI', description: 'Traduce documente in peste 100 de limbi', icon: Languages, path: '/translate' },
      { name: 'Rezumat automat', description: 'Genereaza rezumat inteligent', icon: Sparkles, path: '/tools/ai-summarize' },
      { name: 'OCR si traducere', description: 'Extrage text din imagini si traduce', icon: Brain, path: '/tools/ocr' },
    ]
  },
  {
    title: 'Business',
    icon: Building2,
    tools: [
      { name: 'Contracte', description: 'Contracte legale conforme', icon: Scale, path: '/templates' },
      { name: 'Adeverinte', description: 'Adeverinte de munca sau venit', icon: FileText, path: '/templates' },
      { name: 'Imputerniciri', description: 'Documente administrative', icon: GraduationCap, path: '/templates' },
    ]
  }
];

export default function ToolkitSection() {
  return (
    <section className="bg-gradient-to-b from-background to-muted/20 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            <span className="gradient-text">Unelte profesionale</span>
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Tot ce ai nevoie pentru a lucra eficient cu documente.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {toolGroups.map((group, idx) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="rounded-2xl glass-card p-6 transition-transform duration-300 hover:scale-[1.02]"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <group.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">{group.title}</h3>
              </div>

              <div className="space-y-3">
                {group.tools.map((tool) => (
                  <Link
                    key={tool.name}
                    to={tool.path}
                    className="group flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <tool.icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{tool.name}</p>
                        <p className="text-xs text-muted-foreground">{tool.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
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
