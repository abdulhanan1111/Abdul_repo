import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_URL } from './constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
        const response = await axios.get(`${API_URL}/users/me`);
        setUser(response.data);
    } catch (error) {
        console.error("Failed to fetch user, token likely expired", error);
        setToken(null);
    } finally {
        setLoading(false);
    }
  };

  const login = async (username, password) => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    
    try {
        const response = await axios.post(`${API_URL}/login`, params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        setToken(response.data.access_token);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.response?.data?.detail || "Login failed" };
    }
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
