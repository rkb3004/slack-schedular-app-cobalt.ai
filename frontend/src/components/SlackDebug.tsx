import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import api from '../api/api';

const SlackDebug: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const runTests = async () => {
    setIsLoading(true);
    setResults(null);
    setError(null);
    
    let testResults = "=== API CONNECTION TESTS ===\n\n";
    
    const BASE_URL = 'https://slack-schedular-app-cobalt-ai.onrender.com';
    const API_URL = `${BASE_URL}/api`;
    
    try {
      // Test 1: Check environment
      testResults += "1. Environment Variables:\n";
      const env = (window as any).env || {};
      testResults += `- VITE_API_URL: ${env.VITE_API_URL || 'Not defined'}\n`;
      testResults += `- Axios baseURL: ${api.defaults.baseURL}\n\n`;
      
      // Test 2: Basic Backend Test
      testResults += "2. Basic Backend Test:\n";
      try {
        const testResponse = await fetch(`${BASE_URL}/test`, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          headers: {
            'Accept': 'text/plain'
          }
        });
        const testText = await testResponse.text();
        testResults += `- Status: SUCCESS (${testResponse.status})\n`;
        testResults += `- Response: ${testText}\n\n`;
      } catch (err: any) {
        testResults += `- Status: FAILED\n`;
        testResults += `- Error: ${err.message}\n\n`;
      }
      
      // Test 3: CORS Test Endpoint
      testResults += "3. CORS Test Endpoint:\n";
      try {
        const corsTestResponse = await fetch(`${BASE_URL}/test-cors`);
        const corsTestData = await corsTestResponse.json();
        testResults += `- Status: SUCCESS (${corsTestResponse.status})\n`;
        testResults += `- Data: ${JSON.stringify(corsTestData)}\n\n`;
      } catch (err: any) {
        testResults += `- Status: FAILED\n`;
        testResults += `- Error: ${err.message}\n\n`;
      }
      
      // Test 4: Root Health Endpoint Test
      testResults += "4. Root Health Endpoint Test:\n";
      try {
        const healthResponse = await fetch(`${API_URL}/health`);
        const healthData = await healthResponse.json();
        testResults += `- Status: ${healthResponse.status}\n`;
        testResults += `- Data: ${JSON.stringify(healthData, null, 2)}\n\n`;
      } catch (err: any) {
        testResults += `- Status: FAILED\n`;
        testResults += `- Error: ${err.message}\n\n`;
      }
      
      // Test 5: API Health Endpoint Test
      testResults += "5. API Health Endpoint Test:\n";
      try {
        const apiHealthResponse = await fetch(`${API_URL}/health`);
        const apiHealthData = await apiHealthResponse.json();
        testResults += `- Status: ${apiHealthResponse.status}\n`;
        testResults += `- Data: ${JSON.stringify(apiHealthData, null, 2)}\n\n`;
      } catch (err: any) {
        testResults += `- Status: FAILED\n`;
        testResults += `- Error: ${err.message}\n\n`;
      }
      
      // Test 6: Slack Auth URL Endpoint Test
      testResults += "6. Slack Auth URL Endpoint Test:\n";
      try {
        const slackUrlResponse = await fetch(`${API_URL}/auth/slack/url`);
        const slackUrlData = await slackUrlResponse.json();
        testResults += `- Status: ${slackUrlResponse.status}\n`;
        if (slackUrlData.authUrl) {
          const url = slackUrlData.authUrl;
          testResults += `- Auth URL: ${url.substring(0, 50)}...${url.substring(url.length - 20)}\n\n`;
        } else {
          testResults += `- Auth URL: Not found in response\n`;
          testResults += `- Response: ${JSON.stringify(slackUrlData, null, 2)}\n\n`;
        }
      } catch (err: any) {
        testResults += `- Status: FAILED\n`;
        testResults += `- Error: ${err.message}\n\n`;
      }
      
      setResults(testResults);
    } catch (err: any) {
      setError(`Test execution failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Connection Debug
      </Typography>
      
      <Button 
        variant="outlined" 
        onClick={runTests} 
        disabled={isLoading}
        sx={{ mb: 2 }}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Run Connection Tests'}
      </Button>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {results && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Test Results:</Typography>
          <Paper 
            sx={{ 
              p: 2, 
              bgcolor: '#f5f5f5', 
              maxHeight: '300px', 
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              whiteSpace: 'pre-wrap'
            }}
          >
            {results}
          </Paper>
        </Box>
      )}
    </Paper>
  );
};

export default SlackDebug;
