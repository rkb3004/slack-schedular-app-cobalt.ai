#!/bin/bash

echo "Fixing frontend issues..."

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

# Fix .env file
echo "Creating .env file"
cat > .env << 'EOF'
# Slack credentials
VITE_SLACK_CLIENT_ID=your_slack_client_id
VITE_API_URL=http://localhost:3001
EOF

# Restart the dev server
echo "Fixing complete. Please restart your dev server with: npm run dev"
