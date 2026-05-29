import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import Home from './pages/Home';
import TemplateEditor from './pages/TemplateEditor';
import Templates from './pages/Templates';
import Sign from './pages/Sign';
import DocumentEditor from './pages/DocumentEditor';
import MyDocuments from './pages/MyDocuments';
import Converter from './pages/Converter';
import Translate from './pages/Translate';
import Tools from './pages/Tools';
import Pricing from './pages/Pricing';
import Settings from './pages/Settings';
import Login from './pages/Login';

const Layout = ({ children }) => (
  <div className="min-h-screen bg-background flex flex-col">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

const AuthenticatedApp = () => {
  const { isLoadingAuth, authError, navigateToLogin } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Se încarcă E-DocPDF...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
      <Route path="/login" element={<Login />} />
      <Route path="/my-documents" element={<Layout><MyDocuments /></Layout>} />
      <Route path="/editor" element={<Layout><DocumentEditor /></Layout>} />
      <Route path="/templates" element={<Layout><Templates /></Layout>} />
      <Route path="/templates/:templateId" element={<Layout><TemplateEditor /></Layout>} />
      <Route path="/converter" element={<Layout><Converter /></Layout>} />
      <Route path="/translate" element={<Layout><Translate /></Layout>} />
      <Route path="/sign" element={<Layout><Sign /></Layout>} />
      <Route path="/tools" element={<Layout><Tools /></Layout>} />
      <Route path="/settings" element={<Layout><Settings /></Layout>} />
      <Route path="/tools/compress" element={<Layout><Converter /></Layout>} />
      <Route path="/tools/merge" element={<Layout><Converter /></Layout>} />
      <Route path="/tools/split" element={<Layout><Converter /></Layout>} />
      <Route path="/tools/rotate" element={<Layout><Converter /></Layout>} />
      <Route path="/tools/watermark" element={<Layout><Converter /></Layout>} />
      <Route path="/tools/protect" element={<Layout><Converter /></Layout>} />
      <Route path="/tools/unlock" element={<Layout><Converter /></Layout>} />
      <Route path="/tools/ai-edit" element={<Layout><Converter /></Layout>} />
      <Route path="*" element={<Layout><PageNotFound /></Layout>} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
  <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <AuthenticatedApp />
  </Router>
}

export default App;