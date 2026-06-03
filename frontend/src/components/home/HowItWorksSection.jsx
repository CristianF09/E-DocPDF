import React from 'react';
import { Upload, FileEdit, Download, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: Upload,
    number: '01',
    title: 'Incarca sau alege',
    description: 'Incarca un document existent sau alege un sablon din biblioteca de documente legale si de business.',
    color: 'from-emerald-500 to-blue-500',
  },
  {
    icon: FileEdit,
    number: '02',
    title: 'Editeaza si personalizeaza',
    description: 'Completeaza campurile, converteste formatul, traduce in limba dorita sau adauga semnatura digitala.',
    color: 'from-blue-500 to-purple-500',
  },
  {
    icon: Download,
    number: '03',
    title: 'Descarca sau partajeaza',
    description: 'Descarca documentul final in formatul dorit sau partajeaza-l direct cu echipa ta.',
    color: 'from-purple-500 to-pink-500',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="relative px-4 py-28 sm:px-6">
      <div className="absolute left-1/2 top-0 -z-10 h-1/2 w-full -translate-x-1/2 bg-gradient-to-b from-blue-500/5 to-transparent" />

      <div className="mx-auto max-w-6xl">
        <div className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 inline-flex items-center gap-2 rounded-full glass-card px-5 py-2"
          >
            <span className="text-sm font-medium">Proces simplu</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 font-space text-4xl font-bold md:text-5xl"
          >
            Incepe in <span className="gradient-text">3 pasi simpli</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-2xl text-xl text-muted-foreground"
          >
            Crearea documentelor profesionale ramane rapida: trei pasi si documentul este gata.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
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
              <div className="h-full rounded-2xl glass-card p-8 text-center">
                <div className={`mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-lg`}>
                  <step.icon className="h-10 w-10 text-white" />
                </div>
                <div className="mb-3 text-lg font-bold gradient-text">{step.number}</div>
                <h3 className="mb-4 text-2xl font-bold">{step.title}</h3>
                <p className="text-base leading-relaxed text-muted-foreground">{step.description}</p>
              </div>

              {index < steps.length - 1 && (
                <div className="absolute -right-4 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-background/80 shadow-lg backdrop-blur md:flex">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
