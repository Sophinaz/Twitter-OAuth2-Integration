# Twitter OAuth2 Integration

A full-stack application demonstrating Twitter OAuth2 authentication with PKCE (Proof Key for Code Exchange) using Go backend and vanilla JavaScript frontend.

## 🏗️ Architecture

- **Backend**: Go with Gin framework
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Database**: PostgreSQL
- **Authentication**: Twitter OAuth2 with PKCE (Plain method)
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- Docker and Docker Compose installed
- Twitter Developer Account with OAuth2 app configured
- `.env` file in the root directory (see setup below)

## 🚀 Quick Start

### 1. Clone and Setup Environment

```bash
# Navigate to project directory
cd testP

# Create .env file from template
cp env.sample .env
```

### 2. Configure Environment Variables

Edit the `.env` file in the root directory:

```env
# Server Configuration
SERVER_HOST=localhost
SERVER_PORT=8080

# Database Configuration
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=ccdevtech
DATABASE_PASSWORD=12345678
DATABASE_NAME=twitter

# Twitter OAuth2 Configuration
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
TWITTER_REDIRECT_URI=http://localhost:3000
```

### 3. Run the Application

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Database**: localhost:5432

## 🔧 Development Setup

### Project Structure

```
testP/
├── .env                          # Environment variables
├── docker-compose.yml            # Docker services configuration
├── README.md                     # This file
├── env.sample                    # Environment template
├── backend/                      # Go backend
│   ├── Dockerfile
│   ├── go.mod
│   ├── cmd/
│   │   ├── main.go
│   │   ├── handlers/
│   │   └── routers/
│   ├── internal/
│   │   ├── configs/
│   │   ├── models/
│   │   ├── services/
│   │   └── repositories/
│   ├── infrastructure/
│   └── migrations/
└── frontend/                     # Frontend assets
    ├── index.html
    ├── script.js
    └── styles.css
```

### Backend Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/twitter/callback` | Handle OAuth callback |
| GET | `/api/v1/user/profile/{user_id}` | Get user profile |

### Frontend Features

- **OAuth Initiation**: Generates PKCE parameters and redirects to Twitter
- **Callback Handling**: Processes OAuth callback and exchanges code for tokens
- **User Profile Display**: Shows authenticated user information
- **Responsive Design**: Works on desktop and mobile devices

