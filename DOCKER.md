# Docker Deployment Guide

This guide walks you through containerizing and deploying the Project Management API with Docker.

## Prerequisites

- Docker (version 20.10+)
- Docker Compose (version 1.29+)
- Git

## Project Structure

```
project_management_api/
├── Dockerfile.backend          # Backend container configuration
├── Dockerfile.frontend         # Frontend container configuration
├── docker-compose.yml          # Docker Compose orchestration
├── .dockerignore               # Files to exclude from Docker build
├── .env.example                # Environment variables template
├── app/                        # FastAPI backend code
├── frontend/                   # React frontend code
│   └── nginx.conf             # Nginx configuration for frontend
├── alembic/                    # Database migrations
└── requirements.txt            # Python dependencies
```

## Quick Start

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd project_management_api
```

### 2. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=project_management
ENVIRONMENT=production
SECRET_KEY=your-very-secure-secret-key-here
```

**⚠️ Security Notes:**
- Change `DB_PASSWORD` to a strong password
- Generate a secure `SECRET_KEY`: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- Never commit `.env` file to git

### 3. Build and Run

```bash
# Build images (first time only)
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 4. Verify Installation

Once services are running:

```bash
# Check service health
docker-compose ps

# Run database migrations (happens automatically on startup, but can run manually)
docker-compose exec backend alembic upgrade head

# Test API
curl http://localhost:8000/docs

# Test Frontend
open http://localhost
```

## Service Details

### Backend (FastAPI)
- **Container Name:** `pm-backend`
- **URL:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Database:** PostgreSQL in `pm-db`
- **Port:** 8000

### Frontend (React + Nginx)
- **Container Name:** `pm-frontend`
- **URL:** http://localhost
- **Port:** 80
- **Build Process:** Multi-stage build (optimized for production)

### Database (PostgreSQL)
- **Container Name:** `pm-db`
- **Port:** 5432
- **Default User:** postgres
- **Volume:** `postgres_data` (persists data between restarts)

## Common Commands

```bash
# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Execute commands in containers
docker-compose exec backend python -c "import app; print('Backend OK')"
docker-compose exec backend alembic current

# Access backend shell
docker-compose exec backend bash

# Database operations
docker-compose exec db psql -U postgres -d project_management

# Rebuild images (if you made changes)
docker-compose build --no-cache

# Force recreate containers
docker-compose up -d --force-recreate
```

## Development vs Production

### Development Mode
For local development, you may want to mount source code:

Edit `docker-compose.yml` and uncomment volume mounts:

```yaml
backend:
  volumes:
    - ./app:/app/app
    - ./alembic:/app/alembic

frontend:
  volumes:
    - ./frontend/src:/app/src
```

Then rebuild: `docker-compose up -d --build`

### Production Deployment

For production, follow these best practices:

1. **Use Strong Secrets**
   ```bash
   # Generate secure keys
   openssl rand -base64 32  # For SECRET_KEY
   ```

2. **Set Environment Variables**
   - Use Docker secrets or managed services (AWS Secrets Manager, etc.)
   - Never hardcode secrets in Dockerfiles
   - Use `.env` files only for local development

3. **Configure Database**
   - Use managed PostgreSQL (AWS RDS, Azure Database, etc.) instead of containerized DB
   - Update `DATABASE_URL` in environment variables

4. **Scale Services**
   ```bash
   # Scale backend to 3 instances
   docker-compose up -d --scale backend=3
   ```

5. **Monitor and Log**
   - Configure log drivers (JSON-file, syslog, etc.)
   - Use centralized logging (ELK, Datadog, CloudWatch)
   - Set resource limits:
   
   ```yaml
   services:
     backend:
       deploy:
         resources:
           limits:
             cpus: '0.5'
             memory: 512M
           reservations:
             cpus: '0.25'
             memory: 256M
   ```

6. **Health Checks**
   
   Add to your `docker-compose.yml`:
   
   ```yaml
   backend:
     healthcheck:
       test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
       interval: 30s
       timeout: 10s
       retries: 3
       start_period: 40s
   ```

7. **Security**
   - Scan images: `docker scan --severity high` on each image
   - Use minimal base images (alpine, slim)
   - Don't run as root in containers
   - Keep dependencies updated

## Troubleshooting

### Database Connection Error
```bash
# Check database logs
docker-compose logs db

# Verify database is healthy
docker-compose ps
# Look for "healthy" status on db service
```

### Frontend showing backend errors
```bash
# Check backend logs
docker-compose logs backend

# Verify API is running
curl http://backend:8000/docs
# (from inside frontend container)
```

### Port already in use
```bash
# Find what's using the port
sudo lsof -i :8000
sudo lsof -i :80

# Change ports in docker-compose.yml or use different ports:
docker-compose up -d -p 8001:8000
```

### Data Loss on shutdown
```bash
# Check volume
docker volume ls | grep postgres_data

# Backup data before major changes
docker-compose exec db pg_dump -U postgres project_management > backup.sql

# Restore data
docker-compose exec -T db psql -U postgres project_management < backup.sql
```

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/docker-deploy.yml`:

```yaml
name: Docker Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker images
        run: docker-compose build
      
      - name: Run tests
        run: docker-compose run --rm backend pytest
      
      - name: Push to registry
        run: |
          docker tag pm-backend:latest myregistry/pm-backend:latest
          docker push myregistry/pm-backend:latest
```

## Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove containers, volumes, and images
docker-compose down -v --rmi all

# Clean up unused Docker resources
docker system prune -a
```

## Next Steps

1. **Push to Docker Registry** - Push images to Docker Hub, GitHub Container Registry, or AWS ECR
2. **Deploy to Kubernetes** - Use Helm charts for scaling
3. **Setup Reverse Proxy** - Use Traefik or nginx for multiple environments
4. **Implement Monitoring** - Add Prometheus, Grafana for metrics
5. **Setup Backup Strategy** - Regular database snapshots

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Nginx Configuration](https://nginx.org/en/docs/)
