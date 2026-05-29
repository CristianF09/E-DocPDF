import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background effects - already handled by body gradients, add extra sparkle */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge - animated glass style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-card mb-10"
        >
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium">Conform legislației UE/RO • Semnături calificate</span>
        </motion.div>

        {/* Heading with gradient text */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold font-space leading-tight tracking-tight mb-8"
        >
          Creează, Convertește și{' '}
          <span className="gradient-text">
            Semnează
          </span>{' '}
          Documente
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          Platformă completă pentru gestionarea documentelor legale și de business. 
          Conversie între formate, traduceri și semnături digitale calificate, toate într-un singur loc.
        </motion.p>

        {/* CTAs - only "Începe Gratuit" */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-center mb-20"
        >
          <Link to="/dashboard">
            <div className="animated-border">
              <Button size="lg" className="bg-background hover:bg-background/90 text-foreground px-14 h-14 text-base font-semibold gap-2 rounded-[calc(var(--radius)+1px)]">
                Începe Gratuit
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </Link>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
        >
          <div className="glass-card px-6 py-4 rounded-xl flex items-center justify-center gap-3">
            <Zap className="w-5 h-5 text-emerald-400" />
            <span className="text-base font-medium">Conversie Instantanee</span>
          </div>
          <div className="glass-card px-6 py-4 rounded-xl flex items-center justify-center gap-3">
            <Shield className="w-5 h-5 text-blue-400" />
            <span className="text-base font-medium">Securitate Bancară</span>
          </div>
          <div className="glass-card px-6 py-4 rounded-xl flex items-center justify-center gap-3">
            <Globe className="w-5 h-5 text-purple-400" />
            <span className="text-base font-medium">Toate Limbile UE</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}