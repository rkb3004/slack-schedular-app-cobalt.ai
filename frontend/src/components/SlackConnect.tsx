import { useState, FC } from 'react';
import { 
  Button, 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert 
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import env from '../config';

interface SlackConnectProps {
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  showTitle?: boolean;
}

const SlackConnect: FC<SlackConnectProps> = ({
  variant = 'contained',
  size = 'large',
  fullWidth = false,
  showTitle = true
}) => {
  const { connectToSlack } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      // Log environment for debugging using our simplified config
      console.log('Environment:', {
        API_URL: env.VITE_API_URL,
        BASE_URL: window.location.origin,
        AUTH_URL: `${env.VITE_API_URL}/api/slack/url`
      });
      
      await connectToSlack();
      console.log('Slack connection initiated');
    } catch (err) {
      console.error('Failed to connect to Slack:', err);
      
      // More user-friendly error messages
      if (err instanceof Error) {
        if (err.message.includes('timed out')) {
          setError(
            'Could not connect to the server. The server might be temporarily unavailable or your network connection might be unstable. ' +
            'We tried both the primary and fallback connections. Please try again later.'
          );
        } else if (err.message.includes('Network Error')) {
          setError(
            'Network error occurred. Please check your internet connection and try again. ' +
            'If the problem persists, the server might be down for maintenance.'
          );
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to connect to Slack. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Return just the button if showTitle is false
  if (!showTitle) {
    return (
      <Box sx={{ textAlign: 'center' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Button
          variant={variant}
          color="primary"
          size={size}
          onClick={handleConnect}
          disabled={isConnecting}
          fullWidth={fullWidth}
          startIcon={isConnecting ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isConnecting ? 'Connecting...' : 'Connect to Slack'}
        </Button>
      </Box>
    );
  }

  // Full component with paper container and title
  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Connect to Slack
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          To get started, connect your Slack workspace
        </Typography>
        
        <Button
          variant={variant}
          color="primary"
          size={size}
          onClick={handleConnect}
          disabled={isConnecting}
          fullWidth={fullWidth}
          startIcon={isConnecting ? <CircularProgress size={20} color="inherit" /> : null}
          sx={{ px: 3, py: 1.5 }}
        >
          {isConnecting ? 'Connecting...' : 'Connect to Slack'}
        </Button>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2, textAlign: 'left' }}>
            {error}
            <Box component="pre" sx={{ mt: 1, fontSize: '0.75rem', whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
              API URL: {env.VITE_API_URL || 'Not defined'}
              <br/>
              API Endpoint: {`${env.VITE_API_URL || 'Not defined'}/api/slack/url`}
            </Box>
          </Alert>
        )}
      </Box>
    </Paper>
  );
};

export default SlackConnect;