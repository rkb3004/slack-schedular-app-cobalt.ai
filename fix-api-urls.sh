#!/bin/bash

# Script to fix mismatched API URLs between frontend and backend

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===== API URL Configuration Checker =====${NC}"
echo "This script will verify and fix the API URL configuration between frontend and backend."

# Ensure we're in the project root
if [ ! -d "./frontend" ] || [ ! -d "./backend" ]; then
  echo -e "${RED}Error: Run this script from the project root directory${NC}"
  exit 1
fi

# The correct backend URL
CORRECT_BACKEND_URL="https://slack-schedular-app-cobalt-ai-1.onrender.com"

# Check backend .env file
BACKEND_ENV_FILE="./backend/.env"
BACKEND_REDIRECT_URI=$(grep "REDIRECT_URI" "$BACKEND_ENV_FILE" 2>/dev/null | sed 's/.*=//' | tr -d '"' | tr -d "'")

if [[ "$BACKEND_REDIRECT_URI" == *"$CORRECT_BACKEND_URL"* ]]; then
  echo -e "${GREEN}✓ Backend REDIRECT_URI contains the correct domain${NC}"
else
  echo -e "${RED}✗ Backend REDIRECT_URI has incorrect domain${NC}"
  echo "  Current: $BACKEND_REDIRECT_URI"
  echo "  Should contain: $CORRECT_BACKEND_URL"
  
  # Fix the backend redirect URI
  if [[ "$BACKEND_REDIRECT_URI" == *"/api/auth/slack/callback"* ]]; then
    NEW_REDIRECT_URI="${CORRECT_BACKEND_URL}/api/auth/slack/callback"
  else
    NEW_REDIRECT_URI="${CORRECT_BACKEND_URL}/api/slack/callback"
  fi
  
  # Create backup
  cp "$BACKEND_ENV_FILE" "${BACKEND_ENV_FILE}.bak"
  
  # Replace
  sed -i "s|REDIRECT_URI=.*|REDIRECT_URI=${NEW_REDIRECT_URI}|" "$BACKEND_ENV_FILE"
  echo -e "${GREEN}✓ Updated backend REDIRECT_URI to: ${NEW_REDIRECT_URI}${NC}"
fi

# Check frontend .env file
FRONTEND_ENV_FILE="./frontend/.env"
FRONTEND_API_URL=$(grep "VITE_API_URL" "$FRONTEND_ENV_FILE" 2>/dev/null | grep -v '#' | sed 's/.*=//' | tr -d '"' | tr -d "'")

if [[ "$FRONTEND_API_URL" == "$CORRECT_BACKEND_URL" ]]; then
  echo -e "${GREEN}✓ Frontend API URL is correct${NC}"
else
  echo -e "${RED}✗ Frontend API URL is incorrect${NC}"
  echo "  Current: $FRONTEND_API_URL"
  echo "  Should be: $CORRECT_BACKEND_URL"
  
  # Fix frontend API URL
  cp "$FRONTEND_ENV_FILE" "${FRONTEND_ENV_FILE}.bak"
  sed -i "s|VITE_API_URL=.*|VITE_API_URL=${CORRECT_BACKEND_URL}|" "$FRONTEND_ENV_FILE"
  echo -e "${GREEN}✓ Updated frontend VITE_API_URL to: ${CORRECT_BACKEND_URL}${NC}"
fi

echo -e "\n${BLUE}Configuration Summary:${NC}"
echo "  Backend URL: $CORRECT_BACKEND_URL"
echo "  Frontend API URL: $(grep "VITE_API_URL" "$FRONTEND_ENV_FILE" 2>/dev/null | grep -v '#' | sed 's/.*=//' | tr -d '"' | tr -d "'")"
echo "  Redirect URI: $(grep "REDIRECT_URI" "$BACKEND_ENV_FILE" 2>/dev/null | sed 's/.*=//' | tr -d '"' | tr -d "'")"

echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Rebuild and redeploy your frontend application"
echo "2. Restart your backend service"
echo "3. Update your Slack App settings with the correct Redirect URI:"
echo "   $(grep "REDIRECT_URI" "$BACKEND_ENV_FILE" 2>/dev/null | sed 's/.*=//' | tr -d '"' | tr -d "'")"
