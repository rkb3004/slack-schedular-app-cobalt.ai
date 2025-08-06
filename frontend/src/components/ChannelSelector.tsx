import React from 'react';
import { FormControl, InputLabel, MenuItem, Select, FormHelperText } from '@mui/material';

interface Channel {
  id: string;
  name: string;
}

interface ChannelSelectorProps {
  channels: Channel[];
  selectedChannel: Channel | null;
  onChange: (channel: Channel) => void;
}

const ChannelSelector: React.FC<ChannelSelectorProps> = ({ 
  channels, 
  selectedChannel, 
  onChange 
}) => {
  return (
    <FormControl fullWidth>
      <InputLabel id="channel-select-label">Select Channel</InputLabel>
      <Select
        labelId="channel-select-label"
        id="channel-select"
        value={selectedChannel?.id || ''}
        label="Select Channel"
        onChange={(e) => {
          const channelId = e.target.value;
          const channel = channels.find(c => c.id === channelId);
          if (channel) {
            onChange(channel);
          }
        }}
      >
        {channels.length === 0 ? (
          <MenuItem disabled value="">
            No channels available
          </MenuItem>
        ) : (
          channels.map((channel) => (
            <MenuItem key={channel.id} value={channel.id}>
              #{channel.name}
            </MenuItem>
          ))
        )}
      </Select>
      {channels.length === 0 && (
        <FormHelperText>
          No channels available. Make sure your Slack app has the necessary permissions.
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default ChannelSelector;
