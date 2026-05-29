import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';

// Cont de test configurat
const TEST_USER = {
  email: 'user@test.com',
  password: 'test123',
  name: 'Utilizator Test'
};

const LoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  if (!isOpen) return null;

  // Login cu cont de test
  const handleTestLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Verificăm dacă suntem în contul de test
      if (email === TEST_USER.email && password === TEST_USER.password) {
        login({
          email: TEST_USER.email,
          name: TEST_USER.name,
          provider: 'email'
        });
        toast({
          title: '🎉 Autentificare reușită!',
          description: 'Bun venit înapoi, ' + TEST_USER.name
        });
        onClose();
      } else {
        throw new Error('Email sau parolă incorectă');
      }
    } catch (error) {
      toast({
        title: '❌ Eroare',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Login rapid cu contul de test (pre-completat)
  const handleQuickTestLogin = async () => {
    setIsLoading(true);
    try {
      login({
        email: TEST_USER.email,
        name: TEST_USER.name,
        provider: 'email'
      });
      toast({
        title: '🎉 Autentificare reușită!',
        description: 'Bun venit înapoi, ' + TEST_USER.name
      });
      onClose();
    } catch (error) {
      toast({
        title: '❌ Eroare',
        description: 'Nu s-a putut autentifica',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Autentificare cu Google (mock pentru dezvoltare)
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      login({
        email: 'user@gmail.com',
        name: 'Utilizator Google',
        provider: 'google',
        picture: 'https://ui-avatars.com/api/?name=Google+User'
      });
      toast({
        title: '🎉 Autentificare Google reușită!',
        description: 'Bun venit cu contul Google'
      });
      onClose();
    } catch (error) {
      toast({
        title: '❌ Eroare',
        description: 'Încearcă din nou',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Background overlay with enhanced blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
      
      {/* Main modal with glassmorphism effect */}
      <div 
        className="relative w-full max-w-md glass-card rounded-3xl overflow-hidden transform transition-all duration-500 scale-100 animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated gradient border */}
        <div className="animated-border">
          <div className="bg-background rounded-[calc(var(--radius)+1px)] p-1">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-all duration-300 text-muted-foreground hover:text-foreground z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="pt-10 px-8 pb-4 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-500 flex items-center justify-center shadow-xl animate-pulse-slow">
                <span className="text-4xl">🚀</span>
              </div>
              <h3 className="text-3xl font-bold font-space mb-2">Bun venit înapoi!</h3>
              <p className="text-muted-foreground mt-2">Conectează-te la FileFusion pentru a continua</p>
            </div>

            {/* Conținut */}
            <div className="p-8 pt-4 space-y-6">
              {/* Buton Google */}
              <Button 
                variant="secondary" 
                className="w-full gap-3 glass-card border-0 hover:bg-white/10 transition-all py-7 text-base"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.53c0-.86-.07-1.71-.21-2.53H12v4.78h5.88c-.26 1.38-1.04 2.55-2.21 3.33v2.78h3.53c2.06-1.9 3.25-4.7 3.25-8.36z"/>
                  <path fill="#34A853" d="M12 23c3.04 0 5.59-1 7.43-2.71l-3.53-2.78c-.99.67-2.25 1.07-3.9 1.07-2.99 0-5.53-2.03-6.44-4.77H1.95v3.01C3.78 20.6 7.56 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.56 13.81c-.23-.67-.36-1.39-.36-2.14s.13-1.47.36-2.14V7.52H1.95c-.79 1.58-1.25 3.35-1.25 5.27s.46 3.69 1.25 5.27l3.61-2.73z"/>
                  <path fill="#EA4335" d="M12 5.36c1.67 0 3.17.57 4.35 1.7l3.26-3.26C17.59 1.59 15.04 0 12 0 7.56 0 3.78 2.4 1.95 5.94l3.61 2.73c.91-2.74 3.45-4.77 6.44-4.77z"/>
                </svg>
                Continuă cu Google
              </Button>

              <div className="flex items-center gap-4 my-4">
                <Separator className="flex-1 bg-border/50" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">sau</span>
                <Separator className="flex-1 bg-border/50" />
              </div>

              {/* Formular email/parola */}
              <form onSubmit={handleTestLogin} className="space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="modal-email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="modal-email"
                    type="email"
                    placeholder="user@test.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/5 border-border/50 focus:bg-white/10 transition-all py-6 text-base"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="modal-password" className="text-sm font-medium">Parolă</Label>
                  <Input
                    id="modal-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/5 border-border/50 focus:bg-white/10 transition-all py-6 text-base"
                  />
                </div>

                <div className="animated-border mt-6">
                  <Button 
                    type="submit" 
                    className="w-full bg-background hover:bg-background/90 text-foreground py-7 text-base font-semibold rounded-[calc(var(--radius)+1px)]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 7.938l3-2.647z"/>
                        </svg>
                        Se procesează...
                      </span>
                    ) : 'Autentificare'}
                  </Button>
                </div>
              </form>

              {/* Cont de test - acces rapid */}
              <div className="p-6 glass-card rounded-2xl mt-4">
                <p className="text-sm font-medium mb-3">🔑 Testează rapid cu contul demo:</p>
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-muted-foreground">
                  <span>📧 user@test.com</span>
                  <span>🔒 test123</span>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all py-5 text-base"
                  onClick={handleQuickTestLogin}
                  disabled={isLoading}
                >
                  🚀 Login rapid cu contul demo
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-white/5 text-center text-xs text-muted-foreground border-t border-border/30">
              Prin autentificare, ești de acord cu Termenii și Condițiile FileFusion
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;