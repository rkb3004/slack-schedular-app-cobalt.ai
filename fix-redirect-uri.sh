#!/bin/bash

# Script to fix the redirect URI configuration in the .env file

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===== Slack Redirect URI Fixer =====${NC}"
echo "This script will update your redirect URI to use the correct domain and path."

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
  echo -e "${RED}Error: .env file not found at $ENV_FILE${NC}"
  exit 1
fi

# The correct backend URL
CORRECT_DOMAIN="https://slack-schedular-app-cobalt-ai-1.onrender.com"
CORRECT_PATH="/api/auth/slack/callback"
CORRECT_REDIRECT_URI="${CORRECT_DOMAIN}${CORRECT_PATH}"

# Get current redirect URI
CURRENT_REDIRECT_URI=$(grep "REDIRECT_URI" "$ENV_FILE" | sed 's/.*=//' | tr -d '"' | tr -d "'")

echo -e "${BLUE}Current configuration:${NC}"
echo "Current Redirect URI: $CURRENT_REDIRECT_URI"
echo "Correct Redirect URI: $CORRECT_REDIRECT_URI"

# Check if the current URI is already correct
if [ "$CURRENT_REDIRECT_URI" = "$CORRECT_REDIRECT_URI" ]; then
  echo -e "${GREEN}✓ Your redirect URI is already correctly configured!${NC}"
  exit 0
fi

# Make a backup of the current .env file
cp "$ENV_FILE" "${ENV_FILE}.bak"
echo "Created backup of .env file at ${ENV_FILE}.bak"

# Update the redirect URI in the .env file
sed -i "s|REDIRECT_URI=.*|REDIRECT_URI=${CORRECT_REDIRECT_URI}|" "$ENV_FILE"

# Verify the update worked
UPDATED_REDIRECT_URI=$(grep "REDIRECT_URI" "$ENV_FILE" | sed 's/.*=//' | tr -d '"' | tr -d "'")

if [ "$UPDATED_REDIRECT_URI" = "$CORRECT_REDIRECT_URI" ]; then
  echo -e "${GREEN}✓ Successfully updated redirect URI!${NC}"
  echo "Old: $CURRENT_REDIRECT_URI"
  echo "New: $UPDATED_REDIRECT_URI"
  
  echo -e "\n${YELLOW}Important:${NC} Make sure to:"
  echo "1. Restart your server to apply the changes"
  echo "2. Update the Redirect URL in your Slack App configuration at api.slack.com/apps"
  echo "   with the exact same URL: $CORRECT_REDIRECT_URI"
else
  echo -e "${RED}✗ Failed to update redirect URI.${NC}"
  echo "Please manually edit your .env file and set:"
  echo "REDIRECT_URI=$CORRECT_REDIRECT_URI"
fi
