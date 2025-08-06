import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isSlackConnected: boolean;
  connectToSlack: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isSlackConnected, setIsSlackConnected] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if token exists and validate
    const validateToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        // Set the token in api headers
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        // Check Slack connection
        const response = await api.get('/slack/check-connection');
        setIsAuthenticated(true);
        setIsSlackConnected(response.data.connected);
      } catch (error) {
        console.error('Authentication validation error:', error);
        // Don't logout on connection check failure, just set as not connected
        setIsAuthenticated(!!storedToken);
        setIsSlackConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setIsAuthenticated(true);
    navigate('/');
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setIsAuthenticated(false);
    setIsSlackConnected(false);
    navigate('/');
  };

  const connectToSlack = async (): Promise<void> => {
    try {
      const response = await api.get('/auth/slack/url');
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error('Error connecting to Slack:', error);
      throw new Error('Failed to connect to Slack');
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    token,
    login,
    logout,
    isSlackConnected,
    connectToSlack
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
