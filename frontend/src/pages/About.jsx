import React from 'react';
import { CheckCircle, Zap, Languages, FileSignature, FileCog, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <FileCog className="w-8 h-8 text-emerald-400" />,
    title: 'Conversie Documente',
    description: 'Transformați cu ușurință fișierele PDF în Word, Excel, PowerPoint și invers. Păstrăm formatarea intactă pentru a vă economisi timp prețios.',
  },
  {
    icon: <BrainCircuit className="w-8 h-8 text-blue-400" />,
    title: 'AI Analyzer & Rezumer',
    description: 'Extrageți esențialul din documente lungi în câteva secunde. Inteligența noastră artificială analizează și rezumă texte complexe, oferindu-vă informațiile cheie.',
  },
  {
    icon: <Languages className="w-8 h-8 text-purple-400" />,
    title: 'Traducere Inteligentă',
    description: 'Depășiți barierele lingvistice. Traduceți documente întregi în peste 30 de limbi, păstrând contextul și nuanțele textului original.',
  },
  {
    icon: <FileSignature className="w-8 h-8 text-rose-400" />,
    title: 'Semnătură Electronică',
    description: 'Aplicați semnături electronice calificate, cu valoare legală în toată Uniunea Europeană. Securizat, rapid și conform cu standardele eIDAS.',
  },
  {
    icon: <Zap className="w-8 h-8 text-amber-400" />,
    title: 'Template-uri de Documente',
    description: 'Accelerați crearea de documente cu o bibliotecă de template-uri predefinite. De la contracte la facturi, începeți cu un model profesional.',
  },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground pt-24 sm:pt-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-space leading-tight tracking-tight mb-4">
            Revoluționăm managementul <span className="gradient-text">documentelor</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            E-DocPDF este partenerul digital care simplifică, accelerează și securizează fluxul de lucru cu documente pentru profesioniștii și companiile din România și Europa.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-8 rounded-2xl flex flex-col items-start"
            >
              <div className="p-3 bg-background rounded-xl mb-6 shadow-inner-light">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 font-space">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-20 mb-10"
        >
          <p className="text-lg text-muted-foreground">
            Și multe altele... Descoperiți toate uneltele noastre și transformați modul în care lucrați.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;