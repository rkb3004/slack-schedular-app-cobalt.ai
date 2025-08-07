#!/bin/bash

echo "Setting up frontend environment..."

# Create .env file with necessary environment variables
echo "Creating .env file..."
cat > .env << 'EOF'
# Default API URL - without /api suffix
VITE_API_URL=https://slack-schedular-app-cobalt-ai.onrender.com

# Uncomment the following line to use local proxy
# VITE_API_URL=http://localhost:8080
EOF

echo ".env file created successfully."

# Fix tsconfig.json
echo "Creating tsconfig.json"
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

# Fix tsconfig.node.json
echo "Creating tsconfig.node.json"
cat > tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF

# Create vite.config.ts
echo "Creating vite.config.ts"
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
EOF

# Install dependencies
echo "Installing dependencies..."
npm install --force

echo "Setup complete! Try running 'npm run dev' now."
