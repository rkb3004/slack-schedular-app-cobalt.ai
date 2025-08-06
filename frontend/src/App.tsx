import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Dashboard from './pages/Dashboard';
import AuthCallback from './pages/AuthCallback';
import AuthProvider from './context/AuthContext';
import Layout from './components/Layout';

// Add this at the top of the file
console.log('App component is rendering');

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#4A154B', // Slack purple
      light: '#611f63',
      dark: '#3a1039',
      contrastText: '#fff'
    },
    secondary: {
      main: '#36C5F0', // Slack blue
      light: '#4fd1ff',
      dark: '#2b9ebd',
      contrastText: '#fff'
    },
    background: {
      default: '#f9f9f9'
    }
  },
  typography: {
    fontFamily: '"Lato", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700
    },
    h2: {
      fontWeight: 700
    },
    h3: {
      fontWeight: 700
    },
    h4: {
      fontWeight: 700
    },
    h5: {
      fontWeight: 700
    },
    h6: {
      fontWeight: 700
    },
    button: {
      fontWeight: 600,
      textTransform: 'none'
    }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: 8
        }
      }
    }
  }
});

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <AuthProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
              </Routes>
            </Layout>
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
