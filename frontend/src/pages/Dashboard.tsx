import { useState, useEffect, FC } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Paper, 
  Container, 
  Grid, 
  Divider
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import SlackConnect from '../components/SlackConnect';

// Simple placeholder for MessageForm - will be replaced with actual component
const MessageForm: FC = () => (
  <Paper sx={{ p: 3 }}>
    <Typography variant="body1">Message form will be implemented here</Typography>
  </Paper>
);

// Simple placeholder for ScheduledMessagesList - will be replaced with actual component
const ScheduledMessagesList: FC = () => (
  <Paper sx={{ p: 3 }}>
    <Typography variant="body1">Scheduled messages list will be implemented here</Typography>
  </Paper>
);

const Dashboard: FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isSlackConnected, setIsSlackConnected] = useState<boolean>(false);

  // Temporarily hardcode isSlackConnected to false for testing
  // In a real app, you would get this from your auth context or API
  useEffect(() => {
    // Check if user is authenticated and has Slack connected
    if (isAuthenticated) {
      // This would normally come from an API call or auth context
      setIsSlackConnected(false);
    }
  }, [isAuthenticated]);

  // Show loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Not connected to Slack
  if (!isSlackConnected) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <SlackConnect fullWidth={true} size="large" />
      </Container>
    );
  }

  // User is authenticated and connected to Slack
  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Divider sx={{ mb: 4 }} />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
          <Typography variant="h5" gutterBottom>
            Send a Message
          </Typography>
          <MessageForm />
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
          <Typography variant="h5" gutterBottom>
            Scheduled Messages
          </Typography>
          <ScheduledMessagesList />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
