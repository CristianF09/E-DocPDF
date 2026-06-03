import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background pt-24 sm:pt-32">
      <div className="container mx-auto max-w-2xl py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
            Contactează-ne
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Ai o întrebare sau o propunere? Completează formularul de mai jos și îți vom răspunde în cel mai scurt timp.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card/50 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl"
        >
          <form className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Nume complet
              </label>
              <Input id="name" type="text" placeholder="ex: Ion Popescu" className="bg-background/70 border-white/10 focus:border-primary/50" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Adresă de email
              </label>
              <Input id="email" type="email" placeholder="ex: ion.popescu@email.com" className="bg-background/70 border-white/10 focus:border-primary/50" />
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                Mesajul tău
              </label>
              <Textarea id="message" placeholder="Scrie aici mesajul tău..." rows={6} className="bg-background/70 border-white/10 focus:border-primary/50" />
            </div>
            <Button type="submit" className="w-full py-6 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" size="lg">
              Trimite Mesajul
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
