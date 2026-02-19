import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, usersAPI } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    usersAPI
      .getMe()
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (phone, password) => {
    const { data } = await authAPI.login(phone, password);
    localStorage.setItem('token', data.token);
    setUser({ ...data.user, id: data.user._id || data.user.id });
    return data;
  };

  const register = async (phone, password, name) => {
    const { data } = await authAPI.register(phone, password, name);
    localStorage.setItem('token', data.token);
    setUser({ ...data.user, id: data.user._id || data.user.id });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = async () => {
    const { data } = await usersAPI.getMe();
    setUser({ ...data, id: data._id || data.id });
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
