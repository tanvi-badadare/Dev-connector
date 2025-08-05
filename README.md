# Dev Connector

A full-stack MERN application for developers to connect, share posts, and showcase their profiles.

## Environment Setup

### 1. Environment Variables

Copy the `env.example` file to `.env` and fill in your configuration:

```bash
cp env.example .env
```

### 2. Required Environment Variables

```env
# Database Configuration
MONGO_URI=your-mongodb-connection-string

# JWT Configuration
JWT_SECRET=your-jwt-secret-key

# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_SECRET=your-github-secret
GITHUB_TOKEN=your-github-token

# Server Configuration
PORT=5001
NODE_ENV=development
```

### 3. Getting Your Configuration Values

#### MongoDB URI
- Create a MongoDB Atlas account
- Create a new cluster
- Get your connection string from the cluster

#### JWT Secret
- Generate a random string for JWT signing
- Example: `mysecrettoken` (use a more secure value in production)

#### GitHub OAuth
- Go to GitHub Developer Settings
- Create a new OAuth App
- Get Client ID and Secret
- Generate a Personal Access Token

## Installation

### Backend
```bash
npm install
npm start
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## Features

- User authentication (register/login)
- User profiles with social links
- Experience and education management
- GitHub repository integration
- Post creation and interaction (likes/comments)
- Developer search and discovery
- Responsive design with sidebar navigation

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: Next.js, React, Tailwind CSS
- **Authentication**: JWT
- **API Integration**: GitHub API 