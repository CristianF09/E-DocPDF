import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await login(username, password);
    if (result.success) {
      toast.success('Autentificare reușită!');
      navigate('/my-documents');
    } else {
      toast.error(result.error || 'Autentificare eșuată');
    }
    setIsLoading(false);
  };

  const handleQuickTestLogin = async () => {
    setIsLoading(true);
    const result = await login('testuser', 'testpass123');
    if (result.success) {
      toast.success('Bun venit, testuser');
      navigate('/my-documents');
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Autentificare</CardTitle>
          <CardDescription>Conectează-te la contul tău E-DocPDF</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nume utilizator</Label>
              <Input id="username" type="text" placeholder="testuser" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Parolă</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? 'Se procesează...' : 'Autentificare'}
            </Button>
          </form>
          <Separator />
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 font-medium mb-2">🔑 Cont de test</p>
            <p className="text-xs text-blue-700 mb-1">Username: testuser</p>
            <p className="text-xs text-blue-700 mb-3">Parolă: testpass123</p>
            <Button variant="secondary" size="sm" className="w-full text-xs" onClick={handleQuickTestLogin} disabled={isLoading}>
              Login rapid
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-center text-xs text-gray-500">
          Prin autentificare, ești de acord cu Termenii și Condițiile E-DocPDF
        </CardFooter>
      </Card>
    </div>
  );
}