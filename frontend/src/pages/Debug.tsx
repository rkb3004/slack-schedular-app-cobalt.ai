import React from 'react';
import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import ClientIdDebugger from '../components/ClientIdDebugger';
import SlackDebug from '../components/SlackDebug';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`debug-tabpanel-${index}`}
      aria-labelledby={`debug-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Debug: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Debug Tools</Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="debug tabs">
          <Tab label="Environment" />
          <Tab label="Slack Client ID" />
          <Tab label="Slack Debug" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Environment Variables</Typography>
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify({
              VITE_API_URL: import.meta.env.VITE_API_URL,
              MODE: import.meta.env.MODE,
            }, null, 2)}
          </pre>
        </Paper>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <ClientIdDebugger />
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <SlackDebug />
      </TabPanel>
    </Box>
  );
};

export default Debug;
