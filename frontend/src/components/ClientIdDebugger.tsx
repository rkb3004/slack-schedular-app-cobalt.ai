import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Paper, 
  Link,
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { getBackendUrl } from '../api/config';

interface ClientIDDebugInfo {
  currentId?: string;
  isValid?: boolean;
  error?: string;
}

const ClientIdDebugger: React.FC = () => {
  const [clientId, setClientId] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<ClientIDDebugInfo>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testUrl, setTestUrl] = useState<string>('');
  
  // Get backend URL for verification page
  const backendUrl = getBackendUrl();
  const verificationUrl = `${backendUrl}/slack/verify-client-id`;
  
  // Handle client ID verification
  const verifyClientId = async () => {
    setIsLoading(true);
    try {
      setTestUrl(`${verificationUrl}?test_client_id=${encodeURIComponent(clientId.trim())}`);
    } catch (error) {
      setDebugInfo({
        error: 'Failed to generate test URL'
      });
    }
    setIsLoading(false);
  };
  
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Slack Client ID Debugger
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This tool helps diagnose issues with your Slack Client ID. If you're experiencing
        "Invalid client_id parameter" errors, use this tool to check your client ID format.
      </Alert>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Enter Client ID to Test
          </Typography>
          
          <TextField
            fullWidth
            label="Slack Client ID"
            variant="outlined"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Enter your Slack Client ID"
            margin="normal"
          />
          
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              onClick={verifyClientId}
              disabled={!clientId.trim() || isLoading}
            >
              Verify Client ID
            </Button>
            
            <Button 
              variant="outlined"
              component="a"
              href={verificationUrl}
              target="_blank"
            >
              Open Server Verification Tool
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      {testUrl && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Test URL
            </Typography>
            
            <Alert severity="success" sx={{ mb: 2 }}>
              Test URL generated successfully. Click the button below to test this client ID with Slack.
            </Alert>
            
            <Box sx={{ 
              p: 2, 
              bgcolor: 'background.paper', 
              borderRadius: 1,
              overflowX: 'auto',
              wordBreak: 'break-all',
              mb: 2
            }}>
              <Typography variant="body2" component="code">
                {testUrl}
              </Typography>
            </Box>
            
            <Button 
              variant="contained" 
              color="primary"
              component="a"
              href={testUrl}
              target="_blank"
            >
              Test This Client ID
            </Button>
          </CardContent>
        </Card>
      )}
      
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Common Client ID Issues
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Typography variant="body1" component="div">
          <ul>
            <li>
              <strong>Whitespace:</strong> Ensure your client ID doesn't have any leading or trailing spaces
            </li>
            <li>
              <strong>Format:</strong> Slack client IDs are typically 32 characters long and alphanumeric
            </li>
            <li>
              <strong>Environment Variables:</strong> Check that your .env file is properly loading the client ID
            </li>
            <li>
              <strong>App Configuration:</strong> Verify that you're using the correct client ID from your Slack App's Basic Information page
            </li>
            <li>
              <strong>URL Encoding:</strong> Make sure the client ID is properly URL-encoded when used in requests
            </li>
          </ul>
        </Typography>
        
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          If issues persist, try creating a new Slack App and using the new client ID.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ClientIdDebugger;
