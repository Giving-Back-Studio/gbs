'use client'

import React, { createContext, useState, useContext, useEffect } from 'react'
import { User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      console.warn('Auth is not initialized');
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    if (auth) {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      throw new Error('Auth is not initialized');
    }
  };

  const signup = async (email: string, password: string) => {
    if (auth) {
      await createUserWithEmailAndPassword(auth, email, password);
    } else {
      throw new Error('Auth is not initialized');
    }
  };

  const logout = async () => {
    if (auth) {
      await signOut(auth);
    } else {
      throw new Error('Auth is not initialized');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

