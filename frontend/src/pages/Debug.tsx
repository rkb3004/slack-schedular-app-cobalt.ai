import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Debug: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Debug Page</Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Environment Variables</Typography>
        <pre style={{ whiteSpace: 'pre-wrap' }}>
          {JSON.stringify({
            VITE_API_URL: import.meta.env.VITE_API_URL,
            MODE: import.meta.env.MODE,
          }, null, 2)}
        </pre>
      </Paper>
    </Box>
  );
};

export default Debug;
