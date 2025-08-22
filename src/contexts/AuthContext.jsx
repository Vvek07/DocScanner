import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we have real Firebase config
    const isRealConfig = import.meta.env.VITE_FIREBASE_API_KEY && 
                         import.meta.env.VITE_FIREBASE_API_KEY !== "YOUR_API_KEY";

    if (isRealConfig) {
      // Use real Firebase auth
      import('../config/firebase').then(({ auth }) => {
        if (auth) {
          const { onAuthStateChanged } = require('firebase/auth');
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
          });
          return unsubscribe;
        }
      });
    } else {
      // Demo mode - simulate logged in user
      setTimeout(() => {
        setUser({
          uid: 'demo-user-123',
          email: 'demo@example.com',
          displayName: 'Demo User'
        });
        setLoading(false);
      }, 1000);
    }
  }, []);

  const login = async (email, password) => {
    const isRealConfig = import.meta.env.VITE_FIREBASE_API_KEY && 
                         import.meta.env.VITE_FIREBASE_API_KEY !== "YOUR_API_KEY";

    if (isRealConfig) {
      const { auth } = await import('../config/firebase');
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      return signInWithEmailAndPassword(auth, email, password);
    } else {
      // Demo mode - simulate successful login
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockUser = {
            uid: 'demo-user-123',
            email: email,
            displayName: 'Demo User'
          };
          setUser(mockUser);
          resolve({ user: mockUser });
        }, 1000);
      });
    }
  };

  const register = async (email, password) => {
    const isRealConfig = import.meta.env.VITE_FIREBASE_API_KEY && 
                         import.meta.env.VITE_FIREBASE_API_KEY !== "YOUR_API_KEY";

    if (isRealConfig) {
      const { auth } = await import('../config/firebase');
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      return createUserWithEmailAndPassword(auth, email, password);
    } else {
      // Demo mode - simulate successful registration
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockUser = {
            uid: 'demo-user-123',
            email: email,
            displayName: 'Demo User'
          };
          setUser(mockUser);
          resolve({ user: mockUser });
        }, 1000);
      });
    }
  };

  const logout = async () => {
    const isRealConfig = import.meta.env.VITE_FIREBASE_API_KEY && 
                         import.meta.env.VITE_FIREBASE_API_KEY !== "YOUR_API_KEY";

    if (isRealConfig) {
      const { auth } = await import('../config/firebase');
      const { signOut } = await import('firebase/auth');
      return signOut(auth);
    } else {
      // Demo mode - simulate logout
      return new Promise((resolve) => {
        setTimeout(() => {
          setUser(null);
          resolve();
        }, 500);
      });
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
