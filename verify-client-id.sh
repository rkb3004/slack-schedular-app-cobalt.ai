#!/bin/bash

# Script to analyze and fix common client ID issues in .env files

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===== Slack Client ID Verification Tool =====${NC}"
echo "This script will check your client ID configuration and help fix common issues."

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

# Function to extract client ID from .env file
get_client_id() {
  grep "SLACK_CLIENT_ID" "$ENV_FILE" | sed 's/.*=//' | tr -d '"' | tr -d "'" | tr -d ' '
}

# Get current client ID
CLIENT_ID=$(get_client_id)

# Check if client ID exists
if [ -z "$CLIENT_ID" ]; then
  echo -e "${YELLOW}No SLACK_CLIENT_ID found in .env file.${NC}"
  
  # Ask user to enter a client ID
  read -p "Enter your Slack Client ID: " USER_CLIENT_ID
  
  if [ -z "$USER_CLIENT_ID" ]; then
    echo -e "${RED}No client ID provided. Exiting.${NC}"
    exit 1
  fi
  
  # Add client ID to .env file
  echo "SLACK_CLIENT_ID=$USER_CLIENT_ID" >> "$ENV_FILE"
  echo -e "${GREEN}Added SLACK_CLIENT_ID to .env file.${NC}"
  CLIENT_ID=$USER_CLIENT_ID
fi

# Check client ID for issues
echo -e "${BLUE}Analyzing client ID...${NC}"
echo "Current client ID: $CLIENT_ID"

# Check length
ID_LENGTH=${#CLIENT_ID}
echo "Length: $ID_LENGTH characters"

if [ $ID_LENGTH -lt 10 ]; then
  echo -e "${RED}Warning: Client ID seems too short.${NC}"
  echo "Typical Slack client IDs are longer."
fi

# Check for whitespace
ORIGINAL_ID=$(grep "SLACK_CLIENT_ID" "$ENV_FILE" | sed 's/.*=//')
TRIMMED_ID=$(echo "$ORIGINAL_ID" | xargs)

if [ "$ORIGINAL_ID" != "$TRIMMED_ID" ]; then
  echo -e "${YELLOW}Warning: Client ID has leading or trailing whitespace.${NC}"
  
  # Ask user if they want to fix it
  read -p "Fix whitespace issue? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Replace the line with a trimmed version
    sed -i.bak "s/SLACK_CLIENT_ID=.*/SLACK_CLIENT_ID=$TRIMMED_ID/" "$ENV_FILE"
    echo -e "${GREEN}Fixed whitespace issue in client ID.${NC}"
  fi
fi

# Check for quotes
if [[ "$ORIGINAL_ID" == \"*\" || "$ORIGINAL_ID" == \'*\' ]]; then
  echo -e "${YELLOW}Note: Client ID is wrapped in quotes.${NC}"
  echo "This is generally fine, but if you're having issues, try removing the quotes."
fi

# Offer to test the client ID
echo
echo -e "${BLUE}Would you like to test your client ID?${NC}"
read -p "Run verification test? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Check if backend server is running
  echo "Checking if backend server is running..."
  
  # Try to use curl to check if server is running
  if command -v curl &> /dev/null; then
    BACKEND_URL=$(grep "VITE_API_URL" "./frontend/.env" 2>/dev/null | sed 's/.*=//' | tr -d '"' | tr -d "'" | tr -d ' ')
    
    if [ -z "$BACKEND_URL" ]; then
      BACKEND_URL="http://localhost:8000"
    fi
    
    echo "Testing connection to $BACKEND_URL/api/slack/verify-client-id..."
    curl -s "$BACKEND_URL/api/slack/verify-client-id" > /dev/null
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}Backend server is running.${NC}"
      echo "Visit the client ID verification tool at:"
      echo "$BACKEND_URL/api/slack/verify-client-id"
    else
      echo -e "${YELLOW}Backend server doesn't appear to be running.${NC}"
      echo "Start the server and then visit:"
      echo "http://localhost:8000/api/slack/verify-client-id"
    fi
  else
    echo -e "${YELLOW}curl command not available.${NC}"
    echo "To test your client ID, start the backend server and visit:"
    echo "http://localhost:8000/api/slack/verify-client-id"
  fi
fi

echo
echo -e "${GREEN}Client ID verification complete.${NC}"
echo "If you continue to have issues, please check your Slack App configuration."
