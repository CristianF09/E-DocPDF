import React from 'react';
import {
  FileType, Languages, PenTool, ScanLine, FileText,
  Shield, Download, Users
} from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: FileType,
    title: 'Conversie documente',
    description: 'Converteste intre PDF, Word, Excel, PowerPoint, PNG si JPG cu pastrarea formatarii originale.',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10'
  },
  {
    icon: Languages,
    title: 'Traduceri multilingve',
    description: 'Traducere automata in limba romana si limbile UE, cu mentinerea structurii documentului.',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10'
  },
  {
    icon: PenTool,
    title: 'Semnaturi digitale',
    description: 'Semnatura calificata conform legislatiei UE/RO si semnatura simpla pentru documente standard.',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10'
  },
  {
    icon: ScanLine,
    title: 'OCR si extragere date',
    description: 'Extrage text din documente scanate si imagini, cu suport pentru limba romana.',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10'
  },
  {
    icon: FileText,
    title: 'Sabloane legal si business',
    description: 'Contracte de munca, procuri, adeverinte, facturi si alte documente pre-construite.',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10'
  },
  {
    icon: Shield,
    title: 'Securitate completa',
    description: 'Criptare SSL/TLS, protectie cu parola si audit trail complet pentru fiecare document.',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10'
  },
  {
    icon: Download,
    title: 'Export si descarcare',
    description: 'Descarcare PDF de inalta calitate, export in masa si denumire automata a fisierelor.',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10'
  },
  {
    icon: Users,
    title: 'Gestionare echipa',
    description: 'Autentificare securizata, gestionare profil si preferinte de limba la nivel de cont.',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10'
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative px-4 py-28 sm:px-6">
      <div className="absolute left-0 top-1/2 -z-10 h-1/2 w-full bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent" />

      <div className="mx-auto max-w-7xl">
        <div className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 inline-flex items-center gap-2 rounded-full glass-card px-5 py-2"
          >
            <span className="text-sm font-medium">Functionalitati complete</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-6 font-space text-4xl font-bold md:text-5xl"
          >
            Tot ce ai nevoie pentru <span className="gradient-text">documente</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-xl text-muted-foreground"
          >
            O platforma, toate instrumentele. De la creare pana la semnare, totul intr-un singur loc.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group rounded-2xl glass-card p-8 transition-all duration-500 hover:shadow-2xl"
            >
              <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bgColor} transition-transform duration-300 group-hover:scale-110`}>
                <feature.icon className={`h-7 w-7 ${feature.color}`} />
              </div>
              <h3 className="mb-3 text-lg font-bold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
