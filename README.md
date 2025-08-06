# README.md

# Slack Scheduler App

## Overview

The Slack Scheduler App is a TypeScript-based application that allows users to schedule messages to be sent on Slack. It consists of a client-side application built with React and a server-side application using Node.js and Express. This project leverages OAuth for authentication and includes features for managing scheduled messages.

## Technology Stack

- **Frontend**: TypeScript, React
- **Backend**: Node.js, Express.js, TypeScript
- **Persistence**: MongoDB (or any lightweight solution like SQLite or LowDB)

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (if using MongoDB for persistence)

### Client Setup

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure your Slack credentials in `client/src/config.ts`.

4. Start the client application:
   ```
   npm start
   ```

### Server Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure your environment variables in a `.env` file based on the `.env.example` provided.

4. Start the server application:
   ```
   npm run dev
   ```

## Architectural Overview

The application is structured into two main parts: the client and the server. The client handles user interactions and displays the dashboard, while the server manages authentication, message scheduling, and database interactions.

- **OAuth**: The application uses OAuth for user authentication with Slack.
- **Token Management**: Tokens are securely stored and managed to ensure user sessions are maintained.
- **Scheduled Task Handling**: Users can create and manage scheduled messages, which are processed by the server.

## Challenges & Learnings

During the development of this project, several challenges were encountered, including:

- Implementing OAuth authentication and managing tokens securely.
- Handling asynchronous operations for scheduling messages.
- Ensuring smooth communication between the client and server.

These challenges provided valuable learning experiences in full-stack development and API integration.

## Live Project Deployment

For brownie points, consider deploying your application online using platforms like Netlify/Vercel for the frontend and Heroku/Render/Glitch for the backend.

## Submission

Please submit your assignment within 7 calendar days from the date you receive this assignment. Email the URLs for your public GitHub repository and (if applicable) your live project deployment to:

- devesh.anand@gocobalt.io
- careers@gocobalt.io
- saroj@gocobalt.io

## Evaluation

Your submission will be assessed based on functionality, correctness (especially refresh token logic and scheduling), code quality, architectural design, and documentation.