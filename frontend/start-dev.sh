#!/bin/bash

echo "Starting development environment with proxy..."

# Make sure npm dependencies are installed
if [ ! -d "node_modules" ]; then
  echo "Installing npm dependencies..."
  npm install
fi

# Check if .env file exists, create if not
if [ ! -f ".env" ]; then
  echo "Creating .env file..."
  bash ./setup-env.sh
fi

# Run the proxy and frontend concurrently
echo "Starting proxy server and frontend..."
npm run dev:proxy
