import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Globe, Shield, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function Settings() {
  const [language, setLanguage] = useState('ro');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    toast.success('Setarile au fost salvate!');
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6 pb-24 md:pb-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col"
      >
        <h1 className="font-space text-3xl font-bold">Setari</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestioneaza contul si preferintele de sistem.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-primary" /> Profil utilizator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Nume</Label>
              <Input value="Demo User" disabled className="bg-background/50 border-white/10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input value="demo@example.com" disabled className="bg-background/50 border-white/10" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-primary" /> Preferinte lingvistice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Limba interfetei</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="bg-background/50 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ro">Romana</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Francais</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="es">Espanol</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card overflow-hidden border-white/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-primary" /> Securitate si confidentialitate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-xl border border-primary/10 bg-primary/5 p-4 backdrop-blur-sm">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Contul este protejat prin autentificare securizata. Datele sunt criptate cu SSL/TLS si procesate conform GDPR.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" size="sm" className="border-destructive/30 text-destructive transition-all hover:bg-destructive/10">
              Deconectare
            </Button>
            <Button onClick={handleSave} disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salveaza modificarile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
