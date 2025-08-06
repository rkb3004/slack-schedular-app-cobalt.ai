import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Polyfill for process.env
window.process = {
  env: {
    NODE_ENV: import.meta.env.MODE,
  }
};

console.log('Initializing React application');

// Check if root element exists
const rootElement = document.getElementById('root');
console.log('Root element found:', !!rootElement);

if (!rootElement) {
  console.error('Root element with id "root" not found in the document');
  const div = document.createElement('div');
  div.id = 'root';
  document.body.appendChild(div);
  console.log('Created root element dynamically');
}

// Mount the application
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

console.log('React application rendering complete');
