import React, { useState } from 'react';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { LandingPage } from './pages/LandingPage.js';
import { PatientDashboard } from './pages/PatientDashboard.js';
import { PharmacistDashboard } from './pages/PharmacistDashboard.js';
import { AuthPage } from './pages/AuthPage.js';
import { MedicationsView } from './components/MedicationsView.js';
import { useAuth } from './context/AuthContext.js';

export const App: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [currentView, setCurrentView] = useState<string>('landing');

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-salus-bg">
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      <main className="flex-1">
        {currentView === 'landing' && <LandingPage onNavigate={handleNavigate} />}

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

      <Footer />
    </div>
  );
};
