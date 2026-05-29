import React from 'react';
import { 
  FileType, Languages, PenTool, ScanLine, FileText, 
  Shield, Download, Users
} from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: FileType,
    title: 'Conversie Documente',
    description: 'Convertește între PDF, Word, Excel, PowerPoint, PNG și JPG cu păstrarea formatării originale.',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10'
  },
  {
    icon: Languages,
    title: 'Traduceri Multilingve',
    description: 'Traducere automată în limba română și toate limbile UE, cu menținerea structurii documentului.',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10'
  },
  {
    icon: PenTool,
    title: 'Semnături Digitale',
    description: 'Semnătură calificată conform legislației UE/RO și semnătură simplă pentru documente standard.',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10'
  },
  {
    icon: ScanLine,
    title: 'OCR & Extragere Date',
    description: 'Extrage text din documente scanate și imagini cu suport pentru limba română.',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10'
  },
  {
    icon: FileText,
    title: 'Șabloane Legal & Business',
    description: 'Contracte de muncă, procuri, adeverințe, facturi și alte documente pre-construite.',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10'
  },
  {
    icon: Shield,
    title: 'Securitate Completă',
    description: 'Criptare SSL/TLS, protecție cu parolă și audit trail complet pentru fiecare document.',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10'
  },
  {
    icon: Download,
    title: 'Export & Descărcare',
    description: 'Descărcare PDF de înaltă calitate, export în masă și denumire automată a fișierelor.',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10'
  },
  {
    icon: Users,
    title: 'Gestionare Echipă',
    description: 'Autentificare securizată, gestionare profil și preferințe de limbă la nivel de cont.',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10'
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-28 px-4 sm:px-6 relative">
      {/* Subtle background element */}
      <div className="absolute top-1/2 left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-emerald-500/3 to-transparent -z-10" />
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-card mb-6"
          >
            <span className="text-sm font-medium">Funcționalități Complete</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold font-space mb-6"
          >
            Tot ce ai nevoie pentru <span className="gradient-text">documente</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            O platformă, toate instrumentele. De la creare până la semnare, totul într-un singur loc.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group p-8 rounded-2xl glass-card hover:shadow-2xl transition-all duration-500"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className="font-bold text-lg mb-3">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}