import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import api from '../api';

interface ScheduledMessage {
  id: string;
  channel: string;
  text: string;
  scheduledTime: string;
}

const ScheduledMessagesList: React.FC = () => {
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingIds, setCancellingIds] = useState<Set<string>>(new Set());

  const fetchMessages = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/messages/scheduled');
      setMessages(response.data.messages);
    } catch (err: any) {
      console.error('Failed to fetch scheduled messages:', err);
      setError('Failed to load scheduled messages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleCancelMessage = async (id: string) => {
    setCancellingIds((prev) => new Set([...prev, id]));
    
    try {
      await api.delete(`/messages/scheduled/${id}`);
      setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== id));
    } catch (err: any) {
      console.error('Failed to cancel message:', err);
      setError('Failed to cancel message. Please try again.');
    } finally {
      setCancellingIds((prev) => {
        const newSet = new Set([...prev]);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const formatDateTime = (dateTime: string) => {
    try {
      return format(new Date(dateTime), 'MMM d, yyyy h:mm a');
    } catch (err) {
      return 'Invalid date';
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Scheduled Messages
      </Typography>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ mt: 2 }}>
          <Alert severity="error">{error}</Alert>
          <Button sx={{ mt: 2 }} variant="outlined" onClick={fetchMessages}>
            Try Again
          </Button>
        </Box>
      ) : messages.length === 0 ? (
        <Typography color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>
          No scheduled messages found.
        </Typography>
      ) : (
        <List>
          {messages.map((message, index) => (
            <React.Fragment key={message.id}>
              {index > 0 && <Divider component="li" />}
              <ListItem
                secondaryAction={
                  <Tooltip title="Cancel Message">
                    <IconButton
                      edge="end"
                      aria-label="cancel"
                      onClick={() => handleCancelMessage(message.id)}
                      disabled={cancellingIds.has(message.id)}
                    >
                      {cancellingIds.has(message.id) ? (
                        <CircularProgress size={24} />
                      ) : (
                        <DeleteIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                }
              >
                <ListItemText
                  primary={message.text}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        Scheduled for {formatDateTime(message.scheduledTime)}
                      </Typography>
                      <br />
                      Channel: {message.channel}
                    </>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default ScheduledMessagesList;
