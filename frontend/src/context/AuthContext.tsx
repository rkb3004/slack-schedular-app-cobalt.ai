import { createContext, useContext, useState, useEffect, ReactNode, FC } from 'react';
import axios from 'axios';
import { AUTH_ENDPOINTS } from '../api/config';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  userId: string | null;
  connectToSlack: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('userId'));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Consider authenticated if token exists
  const isAuthenticated = !!token;
  
  useEffect(() => {
    // Token persistence
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
    
    if (userId) {
      localStorage.setItem('userId', userId);
    } else {
      localStorage.removeItem('userId');
    }
  }, [token, userId]);
  
  const connectToSlack = async (retryCount = 0, maxRetries = 2): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Log environment information for debugging
      console.log('Environment info:', {
        baseUrl: window.location.origin,
        apiEndpoint: AUTH_ENDPOINTS.SLACK_URL,
        apiBaseUrl: import.meta.env.VITE_API_URL || 'Not defined in env'
      });
      console.log('Attempt:', retryCount + 1, 'of', maxRetries + 1);
      
      // Use AUTH_ENDPOINTS directly from the config to avoid path mistakes
      console.log('Requesting auth URL from:', AUTH_ENDPOINTS.SLACK_URL);
      
      const response = await axios.get(AUTH_ENDPOINTS.SLACK_URL, { 
        timeout: 30000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Auth URL response:', response);
      const { authUrl } = response.data;
      console.log('Redirecting to Slack authorization URL');
      
      // Redirect to Slack OAuth flow
      window.location.href = authUrl;
    } catch (error: any) {
      console.error('Slack connection error:', error);
      
      // Get detailed error information
      const errorDetails = {
        message: error.message,
        status: error.response?.status,
        responseData: error.response?.data,
        url: error.config?.url
      };
      console.error('Error details:', JSON.stringify(errorDetails, null, 2));
      
      // Check if it's a timeout error and we haven't exceeded max retries
      if (error.code === 'ECONNABORTED' && retryCount < maxRetries) {
        console.log(`Connection timed out, retrying... (${retryCount + 1}/${maxRetries})`);
        setIsLoading(false);
        // Retry after a short delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return connectToSlack(retryCount + 1, maxRetries);
      }
      
      // Either not a timeout or we've exhausted retries
      if (error.code === 'ECONNABORTED') {
        throw new Error('Server connection timed out. Please try again later or check your network connection.');
      } else if (error.response?.status === 404) {
        throw new Error(`API endpoint not found (404): ${error.config?.url}. Please check your server configuration.`);
      } else if (error.message && error.message.includes('Invalid client_id parameter')) {
        throw new Error('The Slack App client ID is invalid. This usually happens when the client ID in the backend .env file doesn\'t match a valid Slack App. Please check your Slack App configuration.');
      } else if (error.response?.data) {
        throw new Error(`Server error: ${JSON.stringify(error.response.data)}`);
      } else {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    setToken(null);
    setUserId(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
  };
  
  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      token, 
      userId, 
      connectToSlack, 
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;