// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verify existing session on mount (reads HttpOnly cookie automatically)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setUser(res.data);
    return res.data;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    // Auto-login after successful registration
    const loginRes = await api.post('/auth/login', { email: data.email, password: data.password });
    setUser(loginRes.data);
    return loginRes.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Even if the network call fails, clear local state
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

