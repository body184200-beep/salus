import React, { useState } from 'react';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { LandingPage } from './pages/LandingPage.js';
import { PatientDashboard } from './pages/PatientDashboard.js';
import { PharmacistDashboard } from './pages/PharmacistDashboard.js';
import { AuthPage } from './pages/AuthPage.js';
import { MedicationsView } from './components/MedicationsView.js';
import { VoiceAssistantModal } from './components/VoiceAssistantModal.js';
import { useAuth } from './context/AuthContext.js';
import { useLanguage } from './context/LanguageContext.js';
import { Mic, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { language } = useLanguage();
  const [currentView, setCurrentView] = useState<string>('landing');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-salus-bg selection:bg-salus-teal selection:text-white">
      <Navbar currentView={currentView} onNavigate={handleNavigate} onOpenAssistant={() => setIsAssistantOpen(true)} />

      <main className="flex-1">
        {currentView === 'landing' && <LandingPage onNavigate={handleNavigate} onOpenAssistant={() => setIsAssistantOpen(true)} />}

        {currentView === 'patient' && (
          <div className="animate-fade-in">
            {isAuthenticated ? (
              <PatientDashboard />
            ) : (
              <AuthPage onSuccess={() => setCurrentView('patient')} />
            )}
          </div>
        )}

        {currentView === 'pharmacist' && (
          <div className="animate-fade-in">
            {isAuthenticated ? (
              <PharmacistDashboard />
            ) : (
              <AuthPage onSuccess={() => setCurrentView('pharmacist')} />
            )}
          </div>
        )}

        {currentView === 'medications' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <MedicationsView />
          </div>
        )}

        {currentView === 'auth' && (
          <div className="animate-fade-in">
            <AuthPage onSuccess={(role) => setCurrentView(role === 'pharmacist' ? 'pharmacist' : 'patient')} />
          </div>
        )}
      </main>

      {/* Floating Dr. Samar AI Voice Assistant Button */}
      <button
        onClick={() => setIsAssistantOpen(true)}
        className="fixed bottom-6 end-6 z-40 group flex items-center gap-3 bg-gradient-to-r from-salus-teal to-salus-dark-teal text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl hover:shadow-salus-teal/40 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 animate-pulse-glow"
        title={language === 'ar' ? 'استشر د. سمر السيد محمد هاشم' : 'Consult Dr. Samar Alsayed Mohamed Hashem'}
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
        </span>
        <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white shrink-0 group-hover:rotate-12 transition-transform">
          <Mic className="w-5 h-5 text-emerald-200" />
        </div>
        <div className="hidden sm:flex flex-col text-start">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black tracking-wide text-white">
              {language === 'ar' ? 'د. سمر السيد محمد هاشم' : 'Dr. Samar Hashem'}
            </span>
            <span className="text-[9px] bg-white/20 px-1.5 py-0.2 rounded-full font-bold text-emerald-200">AI</span>
          </div>
          <span className="text-[10.5px] text-salus-light-mint/90 font-medium">
            {language === 'ar' ? 'طبيبة صيدلية معتمدة • استشارة فورية' : 'Clinical Pharmacist • Voice Support'}
          </span>
        </div>
      </button>

      {/* Global Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />

      <Footer />
    </div>
  );
};
