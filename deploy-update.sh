#!/bin/bash

# Quick script to update Render deployment after changes

echo "=== Updating Render Deployment ==="
echo "This script will help you update your Slack app with the latest changes"

# Colors for better output
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
NC="\033[0m" # No Color

echo -e "${YELLOW}Step 1: Verifying configuration${NC}"
echo "Checking your .env files..."

BACKEND_ENV="./backend/.env"
FRONTEND_ENV="./frontend/.env"
BACKEND_REDIRECT_URI=$(grep "REDIRECT_URI" "$BACKEND_ENV" 2>/dev/null | sed 's/.*=//' | tr -d '"' | tr -d "'")
FRONTEND_API_URL=$(grep "VITE_API_URL" "$FRONTEND_ENV" 2>/dev/null | grep -v '#' | sed 's/.*=//' | tr -d '"' | tr -d "'")

echo -e "Backend Redirect URI: ${GREEN}$BACKEND_REDIRECT_URI${NC}"
echo -e "Frontend API URL: ${GREEN}$FRONTEND_API_URL${NC}"

echo -e "\n${YELLOW}Step 2: Prepare for deployment${NC}"
echo "1. Commit and push your changes to GitHub"
echo "   git add ."
echo "   git commit -m \"Fix OAuth configuration\""
echo "   git push origin main"

echo -e "\n${YELLOW}Step 3: Deploy to Render${NC}"
echo "1. Go to your Render dashboard at https://dashboard.render.com/"
echo "2. Select your backend service"
echo "3. Click 'Manual Deploy' and then 'Deploy Latest Commit'"
echo "4. Wait for deployment to complete"

echo -e "\n${YELLOW}Step 4: Deploy to Vercel (Frontend)${NC}"
echo "1. Your frontend should automatically deploy when you push to GitHub"
echo "2. If not, go to https://vercel.com/dashboard and trigger a manual deployment"

echo -e "\n${YELLOW}Step 5: Verify OAuth Configuration in Slack${NC}"
echo "1. Go to https://api.slack.com/apps"
echo "2. Select your Slack app"
echo "3. Go to 'OAuth & Permissions' section"
echo "4. Under 'Redirect URLs', ensure this URL is present:"
echo -e "${GREEN}$BACKEND_REDIRECT_URI${NC}"
echo "5. If not, add it and click 'Save URLs'"

echo -e "\n${YELLOW}Step 6: Test your Slack app${NC}"
echo "1. Open your frontend application"
echo "2. Click on 'Connect to Slack' button"
echo "3. Complete the OAuth flow"
echo "4. Test sending messages"

echo -e "\n${GREEN}Done!${NC}"
echo "If you still encounter issues, check the server logs on Render for more detailed error information."
echo "You can also test your OAuth flow directly at:"
echo -e "${GREEN}$FRONTEND_API_URL/api/slack/verify-client-id${NC}"
