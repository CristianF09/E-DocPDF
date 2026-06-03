import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { Lock, User, Key, FileText, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

const TEST_USER = {
  username: 'testuser',
  password: 'testpass123',
};

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (nextUsername = username, nextPassword = password) => {
    setIsLoading(true);
    const result = await login(nextUsername, nextPassword);

    if (result.success) {
      toast.success('Autentificare reusita!');
      navigate('/my-documents');
    } else {
      toast.error(result.error || 'Autentificare esuata');
    }

    setIsLoading(false);
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
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="flex min-h-screen items-center justify-center px-4 pb-10 pt-28">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md"
        >
          <Card className="glass-card overflow-hidden rounded-2xl border-white/10">
            <CardHeader className="px-8 pt-8 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 shadow-lg">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="font-space text-3xl font-bold tracking-tight">
                Autentificare
              </CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                Conecteaza-te la contul tau E-DocPDF.
              </p>
            </CardHeader>

            <CardContent className="space-y-6 px-8 pt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Nume utilizator
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="username"
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
                  <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Parola
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
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

              <Separator className="bg-white/10" />

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
            </CardContent>

            <CardFooter className="border-t border-white/10 bg-white/5 px-8 py-4 text-center">
              <p className="w-full text-xs text-muted-foreground">
                Prin autentificare, esti de acord cu termenii E-DocPDF.
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
