import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'patient' | 'pharmacist' | 'admin';
  preferredLanguage: string;
  pharmacistVerificationStatus?: 'pending' | 'verified' | 'rejected';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isPharmacist: boolean;
  isVerifiedPharmacist: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  loginAsDemoPatient: () => Promise<void>;
  loginAsDemoPharmacist: () => Promise<void>;
  loginAsDemoPendingPharmacist: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('salus_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('salus_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (token && user) {
      localStorage.setItem('salus_token', token);
      localStorage.setItem('salus_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('salus_token');
      localStorage.removeItem('salus_user');
    }
  }, [token, user]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('salus_token');
    localStorage.removeItem('salus_user');
  };

  const loginWithCredentials = async (email: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'SalusDemo2026!' }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
      } else {
        alert(data.error || 'Failed to sign in demo user');
      }
    } catch (err) {
      console.error('Demo login error:', err);
      alert('Cannot connect to SALUS API backend. Make sure the server is running on port 4000.');
    }
  };

  const loginAsDemoPatient = async () => {
    await loginWithCredentials('patient@salus.eg');
  };

  const loginAsDemoPharmacist = async () => {
    await loginWithCredentials('pharmacist@salus.eg');
  };

  const loginAsDemoPendingPharmacist = async () => {
    await loginWithCredentials('pending.pharmacist@salus.eg');
  };

  const isAuthenticated = !!token && !!user;
  const isPharmacist = user?.role === 'pharmacist';
  const isVerifiedPharmacist = isPharmacist && user?.pharmacistVerificationStatus === 'verified';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isPharmacist,
        isVerifiedPharmacist,
        login,
        logout,
        loginAsDemoPatient,
        loginAsDemoPharmacist,
        loginAsDemoPendingPharmacist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
