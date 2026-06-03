import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0">
        <div className="float absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="float-delay-1 absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 inline-flex items-center gap-2 rounded-full glass-card px-5 py-2"
        >
          <Shield className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-medium">Conform legislatiei UE/RO - semnaturi calificate</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 font-space text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-7xl"
        >
          Creeaza, converteste si <span className="gradient-text">semneaza</span> documente
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mb-12 max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-2xl"
        >
          Platforma completa pentru gestionarea documentelor legale si de business.
          Conversie intre formate, traduceri si semnaturi digitale calificate, toate intr-un singur loc.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-20 flex items-center justify-center"
        >
          <Link to="/tools">
            <div className="animated-border">
              <Button size="lg" className="h-14 rounded-[calc(var(--radius)+1px)] bg-background px-14 text-base font-semibold text-foreground hover:bg-background/90">
                Incepe gratuit
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mx-auto grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3"
        >
          <div className="flex items-center justify-center gap-3 rounded-xl glass-card px-6 py-4">
            <Zap className="h-5 w-5 text-emerald-400" />
            <span className="text-base font-medium">Conversie instantanee</span>
          </div>
          <div className="flex items-center justify-center gap-3 rounded-xl glass-card px-6 py-4">
            <Shield className="h-5 w-5 text-blue-400" />
            <span className="text-base font-medium">Securitate bancara</span>
          </div>
          <div className="flex items-center justify-center gap-3 rounded-xl glass-card px-6 py-4">
            <Globe className="h-5 w-5 text-purple-400" />
            <span className="text-base font-medium">Toate limbile UE</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
