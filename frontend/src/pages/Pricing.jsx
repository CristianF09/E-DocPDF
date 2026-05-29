import React from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Crown, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const plans = [
  {
    id: 'free',
    name: 'Gratuit',
    price: '0',
    period: '',
    description: 'Pentru a testa platforma',
    features: [
      { text: '5 conversii / lună', included: true },
      { text: '3 șabloane de bază', included: true },
      { text: 'Traducere RO ↔ EN', included: true },
      { text: 'Semnătură simplă', included: true },
      { text: 'Semnătură calificată', included: false },
      { text: 'OCR', included: false },
      { text: 'Export în masă', included: false },
      { text: 'Suport prioritar', included: false },
    ],
    cta: 'Începe Gratuit',
    popular: false,
  },
  {
    id: 'weekly',
    name: 'Săptămânal',
    price: '29',
    period: '/ săptămână',
    description: 'Pentru proiecte scurte',
    features: [
      { text: '50 conversii / săptămână', included: true },
      { text: 'Toate șabloanele', included: true },
      { text: 'Traducere 5 limbi UE', included: true },
      { text: 'Semnătură simplă', included: true },
      { text: 'Semnătură calificată', included: true },
      { text: 'OCR basic', included: true },
      { text: 'Export în masă', included: false },
      { text: 'Suport prioritar', included: false },
    ],
    cta: 'Abonează-te',
    popular: false,
  },
  {
    id: 'monthly',
    name: 'Lunar',
    price: '79',
    period: '/ lună',
    description: 'Cel mai popular pentru IMM-uri',
    features: [
      { text: 'Conversii nelimitate', included: true },
      { text: 'Toate șabloanele + custom', included: true },
      { text: 'Toate limbile UE', included: true },
      { text: 'Semnătură simplă', included: true },
      { text: 'Semnătură calificată', included: true },
      { text: 'OCR avansat', included: true },
      { text: 'Export în masă', included: true },
      { text: 'Suport prioritar', included: false },
    ],
    cta: 'Abonează-te',
    popular: true,
  },
  {
    id: 'annual',
    name: 'Anual',
    price: '699',
    period: '/ an',
    description: 'Cea mai bună valoare • Economisești 27%',
    features: [
      { text: 'Conversii nelimitate', included: true },
      { text: 'Toate șabloanele + custom', included: true },
      { text: 'Toate limbile UE', included: true },
      { text: 'Semnătură simplă', included: true },
      { text: 'Semnătură calificată', included: true },
      { text: 'OCR avansat', included: true },
      { text: 'Export în masă', included: true },
      { text: 'Suport prioritar dedicat', included: true },
    ],
    cta: 'Abonează-te',
    popular: false,
  },
];

export default function Pricing() {
  const location = useLocation();
  const isStandalone = !location.pathname.startsWith('/dashboard');

  const content = (
    <div className={isStandalone ? "pt-24 pb-16 px-4 sm:px-6" : "p-6 pb-24 md:pb-6"}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4"
          >
            <Crown className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Prețuri Transparente</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold font-space mb-3"
          >
            Alege Planul Potrivit
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-lg mx-auto"
          >
            Toate prețurile sunt în RON și includ TVA. Anulează oricând.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-card rounded-2xl border p-6 flex flex-col ${
                plan.popular ? 'border-primary/50 shadow-lg shadow-primary/5' : 'border-border'
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] px-3">
                  <Star className="w-3 h-3 mr-1" /> Cel Mai Popular
                </Badge>
              )}
              
              <div className="mb-6">
                <h3 className="font-semibold text-sm">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-bold font-space">{plan.price}</span>
                  <span className="text-xs text-muted-foreground">RON{plan.period}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.map(feature => (
                  <li key={feature.text} className="flex items-center gap-2">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" />
                    )}
                    <span className={`text-xs ${feature.included ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.popular
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isStandalone) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        {content}
        <Footer />
      </div>
    );
  }

  return content;
}