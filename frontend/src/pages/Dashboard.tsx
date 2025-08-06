import React from 'react';
import { Box, Grid, Typography, Paper, Divider, CircularProgress, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import SlackConnect from '../components/SlackConnect';
import MessageForm from '../components/MessageForm';
import ScheduledMessagesList from '../components/ScheduledMessagesList';

const Dashboard: React.FC = () => {
  const { isAuthenticated, isSlackConnected, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ textAlign: 'center', my: 8 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Slack Connect
        </Typography>
        <Typography variant="body1" paragraph>
          Connect your Slack workspace to send and schedule messages.
        </Typography>
        <SlackConnect />
      </Box>
    );
  }

  if (!isSlackConnected) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>
            Almost there!
          </Typography>
          <Typography variant="body1" paragraph>
            Your account is set up, but you need to connect to a Slack workspace to continue.
          </Typography>
          <SlackConnect />
        </Paper>
      </Box>
    );
  }

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Typography variant="h4" component="h1" gutterBottom>
          Slack Connect Dashboard
        </Typography>
        <Divider sx={{ mb: 4 }} />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Typography variant="h5" gutterBottom>
          Send a Message
        </Typography>
        <MessageForm />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <ScheduledMessagesList />
      </Grid>
    </Grid>
  );
};

export default Dashboard;
