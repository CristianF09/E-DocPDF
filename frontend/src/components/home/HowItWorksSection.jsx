import React from 'react';
import { Upload, FileEdit, Download, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: Upload,
    number: '01',
    title: 'Încarcă sau Alege',
    description: 'Încarcă un document existent sau alege un șablon din biblioteca noastră de documente legale și de business.',
    color: 'from-emerald-500 to-blue-500',
    iconColor: 'text-emerald-400'
  },
  {
    icon: FileEdit,
    number: '02',
    title: 'Editează și Personalizează',
    description: 'Completează câmpurile, convertește formatul, traduce în limba dorită sau adaugă semnătura digitală.',
    color: 'from-blue-500 to-purple-500',
    iconColor: 'text-blue-400'
  },
  {
    icon: Download,
    number: '03',
    title: 'Descarcă sau Partajează',
    description: 'Descarcă documentul final în formatul dorit sau partajează-l direct cu echipa ta.',
    color: 'from-purple-500 to-pink-500',
    iconColor: 'text-purple-400'
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-28 px-4 sm:px-6 relative">
      {/* Background gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-blue-500/5 to-transparent -z-10" />
      
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-card mb-6"
          >
            <span className="text-sm font-medium">Proces Simplu</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-space mb-6"
          >
            Începe în <span className="gradient-text">3 Pași Simpli</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Crearea documentelor profesionale nu a fost niciodată mai ușoară. Doar trei pași și ești gata.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="relative"
            >
              <div className="glass-card p-10 rounded-3xl text-center h-full">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} mb-8 shadow-lg`}>
                  <step.icon className={`w-10 h-10 text-white ${step.iconColor}`} />
                </div>
                <div className="text-lg font-bold gradient-text mb-3">{step.number}</div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-4 translate-x-0 -translate-y-1/2 z-10 items-center justify-center w-8 h-8 rounded-full bg-background border border-border shadow-lg">
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}