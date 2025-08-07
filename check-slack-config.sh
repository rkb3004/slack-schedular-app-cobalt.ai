#!/bin/bash

# Script to detect and fix common issues with Slack OAuth configuration
# Specifically focused on redirect URI mismatches

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===== Slack OAuth Configuration Analyzer =====${NC}"
echo "This script will analyze your Slack OAuth configuration and help fix common issues."

# Determine backend directory
BACKEND_DIR="./backend"
if [ ! -d "$BACKEND_DIR" ]; then
  # Try to find backend directory
  if [ -d "../backend" ]; then
    BACKEND_DIR="../backend"
  else
    echo -e "${RED}Error: Backend directory not found.${NC}"
    echo "Please run this script from the project root or frontend directory."
    exit 1
  fi
fi

# Check if .env file exists
ENV_FILE="$BACKEND_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${YELLOW}Warning: .env file not found at $ENV_FILE${NC}"
  
  # Ask user if they want to create a new one
  read -p "Do you want to create a new .env file? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Creating new .env file..."
    touch "$ENV_FILE"
  else
    echo "Exiting..."
    exit 1
  fi
fi

# Function to extract redirect URI from .env file
get_redirect_uri() {
  grep "REDIRECT_URI" "$ENV_FILE" | sed 's/.*=//' | tr -d '"' | tr -d "'"
}

# Get current redirect URI
REDIRECT_URI=$(get_redirect_uri)

# Check if redirect URI exists
if [ -z "$REDIRECT_URI" ]; then
  echo -e "${YELLOW}No REDIRECT_URI found in .env file.${NC}"
  
  # Ask user to enter a redirect URI
  echo -e "${BLUE}Your application appears to be hosted at:${NC}"
  BASE_URL=$(grep "FRONTEND_URL" "$ENV_FILE" | sed 's/.*=//' | tr -d '"' | tr -d "'")
  if [ -z "$BASE_URL" ]; then
    BASE_URL="https://slack-schedular-app-cobalt-ai.onrender.com"
  fi
  echo "  $BASE_URL"
  
  echo -e "\n${BLUE}Please choose a redirect URI pattern:${NC}"
  echo "1) $BASE_URL/api/auth/slack/callback (recommended)"
  echo "2) $BASE_URL/api/slack/callback (alternate)"
  echo "3) Enter custom URI"
  
  read -p "Enter your choice (1-3): " choice
  
  case $choice in
    1)
      USER_REDIRECT_URI="$BASE_URL/api/auth/slack/callback"
      ;;
    2)
      USER_REDIRECT_URI="$BASE_URL/api/slack/callback"
      ;;
    3)
      read -p "Enter your custom redirect URI: " USER_REDIRECT_URI
      ;;
    *)
      echo -e "${RED}Invalid choice. Using recommended pattern.${NC}"
      USER_REDIRECT_URI="$BASE_URL/api/auth/slack/callback"
      ;;
  esac
  
  # Add redirect URI to .env file
  echo "REDIRECT_URI=$USER_REDIRECT_URI" >> "$ENV_FILE"
  echo -e "${GREEN}Added REDIRECT_URI to .env file.${NC}"
  REDIRECT_URI=$USER_REDIRECT_URI
fi

echo -e "${BLUE}Analyzing redirect URI pattern...${NC}"
echo "Current redirect URI: $REDIRECT_URI"

# Check if the URI matches expected patterns
if [[ "$REDIRECT_URI" == *"/api/auth/slack/callback"* ]]; then
  echo -e "${GREEN}✓ Redirect URI matches the pattern '/api/auth/slack/callback'${NC}"
  echo "  This is the primary pattern expected by your application."
elif [[ "$REDIRECT_URI" == *"/api/slack/callback"* ]]; then
  echo -e "${GREEN}✓ Redirect URI matches the alternate pattern '/api/slack/callback'${NC}"
  echo "  This is an alternate pattern supported by your application."
else
  echo -e "${RED}✗ Redirect URI does not match any expected patterns${NC}"
  echo "  Expected patterns:"
  echo "    - /api/auth/slack/callback"
  echo "    - /api/slack/callback"
  
  # Ask if the user wants to fix it
  read -p "Would you like to update the redirect URI to match the expected pattern? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Extract base URL from current redirect URI
    BASE_URL=$(echo "$REDIRECT_URI" | sed -E 's|(https?://[^/]+).*|\1|')
    
    # Show options for fixing
    echo -e "\n${BLUE}Choose a redirect URI pattern:${NC}"
    echo "1) $BASE_URL/api/auth/slack/callback (recommended)"
    echo "2) $BASE_URL/api/slack/callback (alternate)"
    
    read -p "Enter your choice (1-2): " fix_choice
    
    case $fix_choice in
      1)
        FIXED_URI="$BASE_URL/api/auth/slack/callback"
        ;;
      2)
        FIXED_URI="$BASE_URL/api/slack/callback"
        ;;
      *)
        echo -e "${RED}Invalid choice. Using recommended pattern.${NC}"
        FIXED_URI="$BASE_URL/api/auth/slack/callback"
        ;;
    esac
    
    # Update .env file
    sed -i.bak "s|REDIRECT_URI=.*|REDIRECT_URI=$FIXED_URI|" "$ENV_FILE"
    echo -e "${GREEN}Updated REDIRECT_URI in .env file to: $FIXED_URI${NC}"
    
    # Reminder about Slack App configuration
    echo -e "${YELLOW}Important:${NC} Remember to update the Redirect URL in your Slack App configuration as well!"
    echo "Go to api.slack.com/apps > Your App > OAuth & Permissions > Redirect URLs"
  fi
fi

# Check if the URI is registered in the Slack App
echo -e "\n${BLUE}Verification Checklist:${NC}"
echo "1. Make sure this exact redirect URI is registered in your Slack App:"
echo "   $REDIRECT_URI"
echo "2. Verify you've copied the Client ID and Client Secret correctly"
echo "3. Check that your app has the required scopes: channels:read, chat:write, channels:history"

echo -e "\n${BLUE}For further debugging:${NC}"
echo "- Access the client ID verification tool: /api/slack/verify-client-id"
echo "- Check server logs for detailed error messages"
echo "- Use the browser developer console to see network requests/responses"

echo -e "\n${GREEN}Configuration analysis complete.${NC}"
