import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Crown, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const plans = [
  {
    id: 'free',
    name: 'Gratuit',
    price: '0',
    period: '',
    description: 'Pentru testarea platformei',
    features: [
      { text: '5 conversii / luna', included: true },
      { text: '3 sabloane de baza', included: true },
      { text: 'Traducere RO - EN', included: true },
      { text: 'Semnatura simpla', included: true },
      { text: 'Semnatura calificata', included: false },
      { text: 'OCR', included: false },
      { text: 'Export in masa', included: false },
      { text: 'Suport prioritar', included: false },
    ],
    cta: 'Incepe gratuit',
    popular: false,
  },
  {
    id: 'weekly',
    name: 'Saptamanal',
    price: '29',
    period: '/ saptamana',
    description: 'Pentru proiecte scurte',
    features: [
      { text: '50 conversii / saptamana', included: true },
      { text: 'Toate sabloanele', included: true },
      { text: 'Traducere in 5 limbi UE', included: true },
      { text: 'Semnatura simpla', included: true },
      { text: 'Semnatura calificata', included: true },
      { text: 'OCR basic', included: true },
      { text: 'Export in masa', included: false },
      { text: 'Suport prioritar', included: false },
    ],
    cta: 'Aboneaza-te',
    popular: false,
  },
  {
    id: 'monthly',
    name: 'Lunar',
    price: '79',
    period: '/ luna',
    description: 'Cel mai popular pentru IMM-uri',
    features: [
      { text: 'Conversii nelimitate', included: true },
      { text: 'Toate sabloanele + custom', included: true },
      { text: 'Toate limbile UE', included: true },
      { text: 'Semnatura simpla', included: true },
      { text: 'Semnatura calificata', included: true },
      { text: 'OCR avansat', included: true },
      { text: 'Export in masa', included: true },
      { text: 'Suport prioritar', included: false },
    ],
    cta: 'Aboneaza-te',
    popular: true,
  },
  {
    id: 'annual',
    name: 'Anual',
    price: '699',
    period: '/ an',
    description: 'Cea mai buna valoare - economisesti 27%',
    features: [
      { text: 'Conversii nelimitate', included: true },
      { text: 'Toate sabloanele + custom', included: true },
      { text: 'Toate limbile UE', included: true },
      { text: 'Semnatura simpla', included: true },
      { text: 'Semnatura calificata', included: true },
      { text: 'OCR avansat', included: true },
      { text: 'Export in masa', included: true },
      { text: 'Suport prioritar dedicat', included: true },
    ],
    cta: 'Aboneaza-te',
    popular: false,
  },
];

export default function Pricing() {
  return (
    <div className="px-4 pb-16 pt-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full glass-card px-4 py-1.5"
          >
            <Crown className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Preturi transparente</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-3 font-space text-4xl font-bold md:text-5xl"
          >
            Alege planul potrivit
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-lg text-muted-foreground"
          >
            Toate preturile sunt in RON si includ TVA. Poti anula oricand.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex flex-col rounded-2xl glass-card p-6 backdrop-blur-md ${
                plan.popular ? 'border-primary/50 shadow-xl shadow-primary/10 ring-1 ring-primary/20' : 'border-white/10'
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary px-3 text-[10px] text-primary-foreground">
                  <Star className="mr-1 h-3 w-3" /> Cel mai popular
                </Badge>
              )}

              <div className="mb-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-space text-4xl font-bold">{plan.price}</span>
                  <span className="text-xs text-muted-foreground">RON{plan.period}</span>
                </div>
                <p className="mt-2 text-xs italic text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="mb-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-center gap-2">
                    {feature.included ? (
                      <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                    ) : (
                      <X className="h-4 w-4 flex-shrink-0 text-muted-foreground/30" />
                    )}
                    <span className={`text-xs ${feature.included ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className={`h-12 w-full transition-all duration-300 ${
                  plan.popular
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90'
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
}
