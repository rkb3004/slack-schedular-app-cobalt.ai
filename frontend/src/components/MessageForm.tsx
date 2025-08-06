import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Paper,
  Tab,
  Tabs,
  CircularProgress,
  FormHelperText,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { addMinutes } from 'date-fns';
import api from '../api';

interface Channel {
  id: string;
  name: string;
  isPrivate: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`message-tabpanel-${index}`}
      aria-labelledby={`message-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const MessageForm: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [message, setMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [scheduledTime, setScheduledTime] = useState<Date | null>(addMinutes(new Date(), 15));
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannels = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await api.get('/slack/channels');
        setChannels(response.data.channels);
      } catch (err: any) {
        console.error('Failed to fetch channels:', err);
        setError('Failed to load Slack channels. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannels();
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSendNow = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      await api.post('/messages/send', {
        channel: selectedChannel,
        text: message
      });
      
      setSuccess('Message sent successfully!');
      setMessage('');
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSchedule = async () => {
    if (!validateForm() || !scheduledTime) return;
    
    if (scheduledTime.getTime() <= Date.now()) {
      setError('Scheduled time must be in the future');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      await api.post('/messages/schedule', {
        channel: selectedChannel,
        text: message,
        scheduledTime: scheduledTime.toISOString()
      });
      
      setSuccess('Message scheduled successfully!');
      setMessage('');
      setScheduledTime(addMinutes(new Date(), 15));
    } catch (err: any) {
      console.error('Failed to schedule message:', err);
      setError(err.response?.data?.error || 'Failed to schedule message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = (): boolean => {
    if (!selectedChannel) {
      setError('Please select a channel');
      return false;
    }
    
    if (!message.trim()) {
      setError('Please enter a message');
      return false;
    }
    
    if (tabValue === 1 && (!scheduledTime || scheduledTime.getTime() <= Date.now())) {
      setError('Please select a future date and time');
      return false;
    }
    
    return true;
  };

  return (
    <Paper elevation={3} sx={{ p: 0, borderRadius: 2 }}>
      <Tabs value={tabValue} onChange={handleTabChange} aria-label="message sending options">
        <Tab label="Send Now" />
        <Tab label="Schedule for Later" />
      </Tabs>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ px: 3, pt: 3 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="channel-select-label">Channel</InputLabel>
              <Select
                labelId="channel-select-label"
                id="channel-select"
                value={selectedChannel}
                label="Channel"
                onChange={(e) => setSelectedChannel(e.target.value)}
                disabled={isSubmitting}
              >
                {channels.map((channel) => (
                  <MenuItem key={channel.id} value={channel.id}>
                    {channel.isPrivate ? '🔒' : '#'} {channel.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Select the channel where you want to send your message</FormHelperText>
            </FormControl>
            
            <TextField
              fullWidth
              id="message-text"
              label="Message"
              multiline
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSubmitting}
              placeholder="Type your message here..."
              sx={{ mb: 3 }}
            />
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleSendNow}
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Send Now'}
            </Button>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <DateTimePicker
                label="Schedule for"
                value={scheduledTime}
                onChange={(newValue) => setScheduledTime(newValue)}
                disablePast
                disabled={isSubmitting}
              />
              <FormHelperText>Select when you want your message to be sent</FormHelperText>
            </FormControl>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleSchedule}
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Schedule Message'}
            </Button>
          </TabPanel>
          
          {error && (
            <Box sx={{ p: 3, pt: 0 }}>
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            </Box>
          )}
          
          {success && (
            <Box sx={{ p: 3, pt: 0 }}>
              <Typography color="success.main" variant="body2">
                {success}
              </Typography>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

export default MessageForm;
