import React, { useEffect, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const AuthCallback: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  const { login } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const processAuth = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        
        if (!token) {
          setError('No authentication token received');
          setIsProcessing(false);
          return;
        }
        
        // Call the login function from AuthContext
        login(token);
        setIsProcessing(false);
      } catch (err) {
        console.error('Authentication error:', err);
        setError('Failed to authenticate with Slack');
        setIsProcessing(false);
      }
    };

    processAuth();
  }, [location, login]);

  if (!isProcessing && !error) {
    return <Navigate to="/" />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
      {isProcessing ? (
        <>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Completing authentication...
          </Typography>
        </>
      ) : (
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default AuthCallback;
