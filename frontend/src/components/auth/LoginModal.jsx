import React, { useState } from 'react';
import { X, Lock, User, Key, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';

const TEST_USER = {
  username: 'testuser',
  password: 'testpass123',
};

const LoginModal = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  if (!isOpen) return null;

  const handleLogin = async (nextUsername = username, nextPassword = password) => {
    setIsLoading(true);

    try {
      const result = await login(nextUsername, nextPassword);

      if (result.success) {
        toast({
          title: 'Autentificare reusita',
          description: 'Bun venit in E-DocPDF.',
        });
        onClose();
      } else {
        toast({
          title: 'Autentificare esuata',
          description: result.error || 'Verifica datele si incearca din nou.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  const handleQuickTestLogin = () => {
    setUsername(TEST_USER.username);
    setPassword(TEST_USER.password);
    handleLogin(TEST_USER.username, TEST_USER.password);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-background/70 backdrop-blur-xl" />

      <div
        className="relative w-full max-w-md glass-card rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-xl p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
          aria-label="Inchide modalul de autentificare"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="px-8 pb-6 pt-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 shadow-lg">
            <FileText className="h-7 w-7 text-white" />
          </div>
          <h2 className="font-space text-3xl font-bold tracking-tight">
            Autentificare
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Conecteaza-te la contul tau E-DocPDF.
          </p>
        </div>

        <div className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="modal-username" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Nume utilizator
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="modal-username"
                  type="text"
                  placeholder={TEST_USER.username}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                  className="h-11 bg-background/50 pl-9 border-white/10 focus:border-primary/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Parola
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="modal-password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="h-11 bg-background/50 pl-9 border-white/10 focus:border-primary/50"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="h-12 w-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Se proceseaza...
                </>
              ) : (
                'Intra in cont'
              )}
            </Button>
          </form>

          <Separator className="my-6 bg-white/10" />

          <div className="rounded-xl border border-primary/10 bg-primary/5 p-4 backdrop-blur-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
              <Key className="h-4 w-4" />
              <span>Cont de test rapid</span>
            </div>
            <div className="mb-4 grid grid-cols-1 gap-1 text-xs text-muted-foreground sm:grid-cols-2">
              <span>User: <span className="font-mono text-foreground">{TEST_USER.username}</span></span>
              <span>Pass: <span className="font-mono text-foreground">{TEST_USER.password}</span></span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full border-primary/20 hover:bg-primary/10"
              onClick={handleQuickTestLogin}
              disabled={isLoading}
            >
              Autentificare rapida
            </Button>
          </div>
        </div>

        <div className="border-t border-white/10 bg-white/5 px-8 py-4 text-center text-xs text-muted-foreground">
          Prin autentificare, esti de acord cu termenii E-DocPDF.
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
