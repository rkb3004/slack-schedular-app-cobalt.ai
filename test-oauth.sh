#!/bin/bash

# Quick test to validate that the OAuth flow is working correctly
# This script helps troubleshoot issues with the Slack OAuth integration

# Colors for better output
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
NC="\033[0m" # No Color

echo -e "${YELLOW}=== Slack OAuth Flow Test ===${NC}"

# 1. Check environment variables
BACKEND_ENV="./backend/.env"
if [ -f "$BACKEND_ENV" ]; then
  SLACK_CLIENT_ID=$(grep "SLACK_CLIENT_ID" "$BACKEND_ENV" | sed 's/.*=//' | tr -d '"' | tr -d "'")
  REDIRECT_URI=$(grep "REDIRECT_URI" "$BACKEND_ENV" | sed 's/.*=//' | tr -d '"' | tr -d "'")
  FRONTEND_URL=$(grep "FRONTEND_URL" "$BACKEND_ENV" | sed 's/.*=//' | tr -d '"' | tr -d "'")
  
  echo -e "SLACK_CLIENT_ID: ${GREEN}${SLACK_CLIENT_ID:0:5}...${SLACK_CLIENT_ID: -5}${NC} (Length: ${#SLACK_CLIENT_ID})"
  echo -e "REDIRECT_URI: ${GREEN}$REDIRECT_URI${NC}"
  echo -e "FRONTEND_URL: ${GREEN}$FRONTEND_URL${NC}"
  
  # Check for whitespace in client ID
  if [ "$SLACK_CLIENT_ID" != "$(echo -n "$SLACK_CLIENT_ID" | xargs)" ]; then
    echo -e "${RED}Warning: SLACK_CLIENT_ID contains whitespace!${NC}"
    echo "Original: '$SLACK_CLIENT_ID'"
    echo "Trimmed: '$(echo -n "$SLACK_CLIENT_ID" | xargs)'"
    
    read -p "Fix whitespace issue? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      TRIMMED_ID=$(echo -n "$SLACK_CLIENT_ID" | xargs)
      sed -i "s/SLACK_CLIENT_ID=.*/SLACK_CLIENT_ID=$TRIMMED_ID/" "$BACKEND_ENV"
      echo -e "${GREEN}Fixed whitespace in SLACK_CLIENT_ID${NC}"
    fi
  fi
else
  echo -e "${RED}Backend .env file not found!${NC}"
fi

# 2. Generate test OAuth URL
if [ ! -z "$SLACK_CLIENT_ID" ] && [ ! -z "$REDIRECT_URI" ]; then
  SCOPE="channels:read,chat:write,channels:history"
  AUTH_URL="https://slack.com/oauth/v2/authorize?client_id=$(echo -n "$SLACK_CLIENT_ID" | xargs)&scope=$SCOPE&redirect_uri=$(echo -n "$REDIRECT_URI" | xargs)"
  
  echo -e "\n${YELLOW}Generated OAuth URL:${NC}"
  echo -e "${GREEN}$AUTH_URL${NC}\n"
  
  echo "You can manually test this URL in your browser to verify the OAuth flow."
  echo "If it works, you should see the Slack authorization page."
  echo "After authorization, you should be redirected to your frontend application."
else
  echo -e "${RED}Cannot generate OAuth URL due to missing variables!${NC}"
fi

# 3. Check for known issues
echo -e "\n${YELLOW}Checking for known issues:${NC}"

if [[ "$REDIRECT_URI" != *"https://"* ]]; then
  echo -e "${RED}Error: REDIRECT_URI must use HTTPS${NC}"
fi

if [[ "$REDIRECT_URI" != *"/api/auth/slack/callback"* ]] && [[ "$REDIRECT_URI" != *"/api/slack/callback"* ]]; then
  echo -e "${RED}Error: REDIRECT_URI must end with /api/auth/slack/callback or /api/slack/callback${NC}"
fi

# 4. Make a direct API request to test server
echo -e "\n${YELLOW}Testing API endpoints:${NC}"

API_BASE=$(echo "$REDIRECT_URI" | sed -E 's|(https?://[^/]+).*|\1|')

echo -e "Testing server health at: ${GREEN}$API_BASE${NC}"
curl -s -o /dev/null -w "%{http_code}" "$API_BASE" > /dev/null
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Server is responding${NC}"
else
  echo -e "${RED}✗ Server is not responding${NC}"
fi

# 5. Provide troubleshooting guidance
echo -e "\n${YELLOW}Troubleshooting steps:${NC}"
echo "1. Ensure your Slack app has the correct Redirect URL configured"
echo "   - Go to https://api.slack.com/apps > Your App > OAuth & Permissions"
echo "   - Verify '$REDIRECT_URI' is in the list of Redirect URLs"
echo "2. Make sure your server is running and accessible"
echo "3. Check both backend and frontend logs for error details"
echo "4. Use the '/api/slack/verify-client-id' endpoint to test different configurations"
echo "5. Ensure the scopes are properly configured (channels:read, chat:write, channels:history)"

echo -e "\n${GREEN}Test complete!${NC}"
