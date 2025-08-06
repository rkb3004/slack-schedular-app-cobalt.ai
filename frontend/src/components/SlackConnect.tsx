import React from 'react';
import { Button, Box, Typography, Paper, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const SlackConnect: React.FC = () => {
  const { connectToSlack } = useAuth();
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      await connectToSlack();
    } catch (err) {
      console.error('Failed to connect to Slack:', err);
      setError('Failed to connect to Slack. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

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
          variant="contained"
          color="primary"
          size="large"
          onClick={handleConnect}
          disabled={isConnecting}
          startIcon={isConnecting ? <CircularProgress size={20} color="inherit" /> : null}
          sx={{ px: 3, py: 1.5 }}
        >
          {isConnecting ? 'Connecting...' : 'Connect to Slack'}
        </Button>
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default SlackConnect;
