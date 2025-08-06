import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  Box,
  Paper,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';

interface ScheduledMessage {
  id: string;
  channelId: string;
  channelName: string;
  message: string;
  scheduledTime: string;
}

interface ScheduledMessagesProps {
  messages: ScheduledMessage[];
  onCancel: (id: string) => void;
  loading: boolean;
}

const ScheduledMessages: React.FC<ScheduledMessagesProps> = ({ messages, onCancel, loading }) => {
  if (messages.length === 0) {
    return (
      <Box sx={{ py: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No scheduled messages yet
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {messages.map((message, index) => {
        const scheduledDate = new Date(message.scheduledTime);
        const formattedDate = format(scheduledDate, 'MMM d, yyyy h:mm a');
        
        return (
          <React.Fragment key={message.id}>
            {index > 0 && <Divider component="li" />}
            <ListItem
              alignItems="flex-start"
              secondaryAction={
                <IconButton 
                  edge="end" 
                  aria-label="cancel" 
                  onClick={() => onCancel(message.id)}
                  disabled={loading}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography component="span" variant="body1" fontWeight="bold">
                      #{message.channelName}
                    </Typography>
                    <Chip 
                      label={formattedDate} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  </Box>
                }
                secondary={
                  <Box mt={1}>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {message.message}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          </React.Fragment>
        );
      })}
    </List>
  );
};

export default ScheduledMessages;
