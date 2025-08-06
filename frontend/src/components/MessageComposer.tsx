import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Stack,
  CircularProgress
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { format } from 'date-fns';

interface MessageComposerProps {
  onSendMessage: (message: string) => void;
  onScheduleMessage: (message: string, scheduledTime: string) => void;
  disabled: boolean;
}

const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  onScheduleMessage,
  disabled
}) => {
  const [message, setMessage] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState<Date | null>(
    new Date(Date.now() + 30 * 60000) // Default 30 minutes from now
  );
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (message.trim() === '') return;
    
    setLoading(true);
    try {
      if (isScheduled && scheduledDateTime) {
        const formattedDateTime = format(scheduledDateTime, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
        await onScheduleMessage(message, formattedDateTime);
      } else {
        await onSendMessage(message);
      }
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here..."
        variant="outlined"
        margin="normal"
        disabled={loading || disabled}
      />
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
        <FormControlLabel
          control={
            <Switch
              checked={isScheduled}
              onChange={(e) => setIsScheduled(e.target.checked)}
              disabled={loading || disabled}
            />
          }
          label="Schedule for later"
        />
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          disabled={message.trim() === '' || loading || disabled}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
        >
          {isScheduled ? 'Schedule Message' : 'Send Now'}
        </Button>
      </Box>
      
      {isScheduled && (
        <Box mt={2}>
          <DateTimePicker
            label="Schedule Time"
            value={scheduledDateTime}
            onChange={(newValue) => setScheduledDateTime(newValue)}
            disabled={loading || disabled}
          />
        </Box>
      )}
    </Box>
  );
};

export default MessageComposer;
