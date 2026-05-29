import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Globe, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const [language, setLanguage] = useState('ro');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    toast.success('Setările au fost salvate!');
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-space">Setări</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestionează-ți contul și preferințele</p>
      </div>

      {/* Profile */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs">Nume</Label>
            <Input value="Demo User" disabled className="bg-secondary/50 mt-1" />
          </div>
          <div>
            <Label className="text-xs">Email</Label>
            <Input value="demo@example.com" disabled className="bg-secondary/50 mt-1" />
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" /> Limbă
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="text-xs mb-2 block">Limba preferată a contului</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="bg-secondary/50 w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ro">Română</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
              <SelectItem value="es">Español</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> Securitate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4">
            Contul tău este protejat prin autentificare securizată. 
            Toate datele sunt criptate cu SSL/TLS.
          </p>
          <Button variant="outline" size="sm" onClick={() => toast.info('Deconectare mock')} className="text-destructive border-destructive/30 hover:bg-destructive/10">
            Deconectare
          </Button>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
        Salvează Setările
      </Button>
    </div>
  );
}