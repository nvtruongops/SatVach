# SatVach - Hyperlocal Social Network

## Introduction
SatVach is a hyperlocal social network platform with a "Map-First" approach, designed to connect urban communities, optimize the sharing economy, and provide superior real-time interaction experiences. The project addresses the connectivity gap in high-density urban areas by leveraging Vector Map and Vector Tiles technologies.

## Technical Architecture

The project utilizes a fully containerized Microservices architecture:

*   **Frontend**: SolidJS + Vite (High Performance, Reactivity).
*   **Map Engine**: MapLibre GL JS (Vector Tiles rendering).
*   **Backend**: Python FastAPI (Async, High Performance).
*   **Database**: PostgreSQL + PostGIS (Spatial Data Processing).
*   **Storage**: MinIO (S3-compatible Object Storage).
*   **Infrastructure**: Docker Compose, Cloudflare Tunnel.

## System Requirements

*   Docker Desktop (latest version).
*   Git.
*   Node.js 18+ (for local dev environment).
*   Python 3.11+ (for local dev environment).

## Installation Guide

### 1. Initialize Environment

Clone the repository and navigate to the project directory:

```bash
git clone <repo_url>
cd SatVach
```

Copy the environment configuration from the template:

```bash
cp .env.example .env
```

Note: Edit the `.env` file if necessary. Default values are configured to work out-of-the-box in the Docker environment. **Do not commit this file to source control.**

### 2. Start the System

Use Docker Compose to start the entire infrastructure (Database, Backend, Frontend, Storage):

```bash
docker-compose up -d
```

The system will take a few minutes to build Docker images and start the services.

### 3. Access the Application

Once started successfully:

*   **Frontend**: http://localhost
*   **Backend API**: http://localhost:8000
*   **API Documentation**: http://localhost:8000/docs
*   **MinIO Console**: http://localhost:9001
*   **MinIO API**: http://localhost:9000

## Development Workflow

### Backend (src/backend)

The backend is written in Python FastAPI.

*   Package Manager: pip (requirements.txt).
*   Migrations: Alembic.

For local development (without Docker for the app):

```bash
cd src/backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend (src/frontend)

The frontend is written in SolidJS.

*   Package Manager: npm.

For local development:

```bash
cd src/frontend
npm install
npm run dev
```

### Database Migrations

When there are changes to the Database Structure (Models), use Alembic to create a migration script:

```bash
# Inside the container or backend venv
alembic revision --autogenerate -m "description of changes"
alembic upgrade head
```

## Directory Structure

*   **database/**: Database initialization scripts (init.sql).
*   **src/backend/**: Backend API source code.
*   **src/frontend/**: Frontend Web App source code.
*   **docker-compose.yml**: Orchestration configuration.
*   **.agent/skills/**: Technical guidelines for AI agents.

## Security

*   Never store sensitive information (passwords, secret keys) in the code.
*   Use `.env` to manage environment variables.
*   Change default passwords for Database and MinIO when deploying to Production.
*   Keep the Cloudflare Tunnel Token strictly confidential.

## References

See detailed technical guidelines in the `.agent/skills/` directory:

*   Back-end Development Guidelines
*   Front-end Development Guidelines
*   Database Management Guidelines
