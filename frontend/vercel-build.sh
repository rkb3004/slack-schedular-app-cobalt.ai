#!/bin/bash
echo "Starting Vercel build process..."
echo "Skipping TypeScript checks for build"

# Install dependencies
echo "Installing dependencies..."
npm ci || npm install

# Build the application without TypeScript checks
echo "Building the application..."
npm run build

echo "Build process completed!"
