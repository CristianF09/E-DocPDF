import React from 'react';
import { Zap, Languages, FileSignature, FileCog, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <FileCog className="h-8 w-8 text-emerald-400" />,
    title: 'Conversie documente',
    description: 'Transforma fisiere PDF in Word, Excel, PowerPoint si invers, pastrand formatarea documentului.',
  },
  {
    icon: <BrainCircuit className="h-8 w-8 text-blue-400" />,
    title: 'AI Analyzer si rezumare',
    description: 'Extrage rapid ideile importante din documente lungi si texte complexe.',
  },
  {
    icon: <Languages className="h-8 w-8 text-purple-400" />,
    title: 'Traducere inteligenta',
    description: 'Traduce documente in mai multe limbi, cu pastrarea contextului si structurii originale.',
  },
  {
    icon: <FileSignature className="h-8 w-8 text-rose-400" />,
    title: 'Semnatura electronica',
    description: 'Aplica semnaturi electronice pentru fluxuri rapide, securizate si conforme.',
  },
  {
    icon: <Zap className="h-8 w-8 text-amber-400" />,
    title: 'Template-uri de documente',
    description: 'Porneste de la modele profesionale pentru contracte, cereri, adeverinte si facturi.',
  },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background pt-24 text-foreground sm:pt-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h1 className="mb-4 font-space text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Revolutionam managementul <span className="gradient-text">documentelor</span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground md:text-xl">
            E-DocPDF simplifica, accelereaza si securizeaza fluxul de lucru cu documente pentru profesionisti si companii.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-start rounded-2xl glass-card border-white/10 p-8"
            >
              <div className="mb-6 rounded-xl bg-background/70 p-3">
                {feature.icon}
              </div>
              <h3 className="mb-3 font-space text-xl font-bold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-10 mt-20 text-center"
        >
          <p className="text-lg text-muted-foreground">
            Descopera uneltele E-DocPDF si transforma modul in care lucrezi cu documentele.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
