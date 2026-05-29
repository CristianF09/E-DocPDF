import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CTASection() {
  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl glass-card p-12 md:p-16 text-center overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-blue-500/10 rounded-full blur-2xl" />
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold font-space mb-6">
              Gata să îți simplifici<br /><span className="gradient-text">documentele</span> de business?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-10 text-lg">
              Înregistrează-te gratuit și începe să gestionezi documente profesionale în câteva minute. 
              Fără card de credit necesar.
            </p>
            <Link to="/dashboard">
              <div className="animated-border inline-block">
                <Button size="lg" className="bg-background hover:bg-background/90 text-foreground px-14 h-14 text-base font-semibold gap-2 rounded-[calc(var(--radius)+1px)]">
                  Începe Gratuit Acum
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}