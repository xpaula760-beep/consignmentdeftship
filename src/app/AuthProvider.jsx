"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/axios";

const AuthContext = createContext({
  admin: null,
  loading: true,
  refresh: async () => {},
  login: async () => {},
  logout: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await api.get('/auth/me');
      setAdmin(res.data?.admin || null);
    } catch (e) {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      if (path && path.startsWith('/paynow')) {
        // Public page - skip auth refresh to avoid unnecessary 401s for public visitors
        setAdmin(null);
        setLoading(false);
        return;
      }
    } catch (e) {
      // ignore
    }

    refresh();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    await refresh();
    return res;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, refresh, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
