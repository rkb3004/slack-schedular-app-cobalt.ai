import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('Starting application...');

// Initialize app
const initApp = () => {
  const rootElement = document.getElementById('root');
  
  // Check if root element exists
  if (!rootElement) {
    console.error('Root element not found');
    
    // Show error message if error element exists
    const errorElement = document.getElementById('root-error');
    if (errorElement) {
      errorElement.style.display = 'block';
    }
    
    // Hide loading indicator if it exists
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
    
    return;
  }

  try {
    // Create root and render app
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log('App rendered successfully');
    
    // Hide loading indicator if it exists
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  } catch (error) {
    console.error('Failed to render application:', error);
    
    // Show error message if error element exists
    const errorElement = document.getElementById('root-error');
    if (errorElement) {
      errorElement.style.display = 'block';
    }
    
    // Hide loading indicator if it exists
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }
};

// Run the app initialization
initApp();