import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/components/ui/use-toast"
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

const ContactPage = () => {
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // TODO: Implement logic for authenticated users with paid plans
  const isEligible = true; // Placeholder

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !message) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Vă rugăm să completați toate câmpurile.",
      });
      return;
    }

    setIsSending(true);
    // TODO: Add backend API call here
    console.log({ subject, message });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSending(false);
    setSubject('');
    setMessage('');
    toast({
      title: "Mesaj trimis",
      description: "Am primit solicitarea dvs. Vă vom contacta în cel mai scurt timp.",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 sm:pt-32">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold font-space mb-4">Contact Suport Tehnic</h1>
          <p className="text-lg text-muted-foreground">
            Aveți o problemă sau o întrebare? Echipa noastră este aici pentru a vă ajuta.
          </p>
          <p className="text-sm text-amber-500 mt-2">
            Acest serviciu este disponibil doar pentru utilizatorii cu un plan activ.
          </p>
        </motion.div>

        {isEligible ? (
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="glass-card p-8 rounded-2xl space-y-6"
          >
            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium">Subiect</label>
              <Input
                id="subject"
                placeholder="Ex: Eroare la conversia unui fișier"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isSending}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">Mesaj</label>
              <Textarea
                id="message"
                placeholder="Descrieți în detaliu problema întâmpinată..."
                rows={8}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSending}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSending}>
              {isSending ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-background/50 border-t-background rounded-full animate-spin mr-2"></div>
                  <span>Se trimite...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Send className="w-4 h-4 mr-2" />
                  <span>Trimite Mesajul</span>
                </div>
              )}
            </Button>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center glass-card p-8 rounded-2xl"
          >
            <h3 className="text-xl font-bold mb-4">Acces restricționat</h3>
            <p className="text-muted-foreground mb-6">Serviciul de suport tehnic este disponibil exclusiv pentru utilizatorii cu un plan plătit. Vă rugăm să faceți upgrade la unul dintre pachetele noastre pentru a beneficia de asistență prioritară.</p>
            <Link to="/pricing">
              <Button>Vezi Pachetele</Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ContactPage;