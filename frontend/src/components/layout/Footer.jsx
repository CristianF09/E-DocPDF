import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-background/50 border-t border-white/10 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-space">
                File<span className="gradient-text">Fusion</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Platformă completă de gestionare a documentelor pentru IMM-uri din România și UE.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-5 text-foreground">Produse</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/converter" className="hover:text-foreground transition-colors hover:pl-1 duration-300">Convertor</Link></li>
              <li><Link to="/translate" className="hover:text-foreground transition-colors hover:pl-1 duration-300">Traduceri</Link></li>
              <li><Link to="/sign" className="hover:text-foreground transition-colors hover:pl-1 duration-300">Semnături electronice</Link></li>
              <li><Link to="/compressor" className="hover:text-foreground transition-colors hover:pl-1 duration-300">Comprimare PDF</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-5 text-foreground">Companie</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition-colors hover:pl-1 duration-300">Despre Noi</Link></li>
              <li><Link to="/pricing" className="hover:text-foreground transition-colors hover:pl-1 duration-300">Prețuri</Link></li>
              <li><a href="#" className="hover:text-foreground transition-colors hover:pl-1 duration-300">Contact</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors hover:pl-1 duration-300">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-5 text-foreground">Legal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors hover:pl-1 duration-300">Termeni și Condiții</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors hover:pl-1 duration-300">Politica de Confidențialitate</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors hover:pl-1 duration-300">GDPR</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors hover:pl-1 duration-300">Cookies</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 FileFusion. Toate drepturile rezervate.
          </p>
          <p className="text-xs text-muted-foreground">
            Conform legislației UE/RO privind semnăturile electronice
          </p>
        </div>
      </div>
    </footer>
  );
}