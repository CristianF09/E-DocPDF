import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, User, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import LoginModal from '@/components/auth/LoginModal';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  const handleLogout = () => {
    logout();
  };

  const navLinks = [
    { label: 'Acasă', href: '/' },
    { label: 'Tool-uri', href: '/tools' },
    { label: 'Prețuri', href: '/pricing' },

  ];

  if (isDashboard) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-4 sm:mx-6 lg:mx-8 mt-4">
        <div className="glass-card rounded-2xl px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-space text-foreground">
                E-<span className="gradient-text">DocPDF</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {user?.name || 'Contul meu'}
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => setLoginModalOpen(true)}>
                    Login
                  </Button>
                  <Link to="/pricing">
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="block text-sm text-muted-foreground hover:text-foreground py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-border flex gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">Dashboard</Button>
                  </Link>
                  <Button 
                    size="sm" 
                    onClick={() => { handleLogout(); setMobileOpen(false); }} 
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => { setMobileOpen(false); setLoginModalOpen(true); }}>
                    Login
                  </Button>
                  <Link to="/pricing" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" className="w-full bg-primary text-primary-foreground">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;