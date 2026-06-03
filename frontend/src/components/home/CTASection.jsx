import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CTASection() {
  return (
    <section className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl glass-card p-10 text-center md:p-14"
        >
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-blue-500/10 blur-2xl" />

          <div className="relative z-10">
            <h2 className="mb-6 font-space text-3xl font-bold md:text-5xl">
              Gata sa iti simplifici <span className="gradient-text">documentele</span> de business?
            </h2>
            <p className="mx-auto mb-10 max-w-lg text-lg text-muted-foreground">
              Inregistreaza-te gratuit si incepe sa gestionezi documente profesionale in cateva minute.
            </p>
            <Link to="/tools">
              <div className="inline-block animated-border">
                <Button size="lg" className="h-14 rounded-[calc(var(--radius)+1px)] bg-background px-14 text-base font-semibold text-foreground hover:bg-background/90">
                  Incepe gratuit acum
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
