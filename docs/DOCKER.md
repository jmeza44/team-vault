# Docker Setup for Team Vault

This document explains how to use Docker for local development and production deployment of Team Vault.

## Quick Start (Development)

### Prerequisites

- Docker Desktop installed and running
- Docker Compose v2+ installed

### Start Development Environment

```bash
# Clone and navigate to the project
git clone <your-repo>
cd team-vault

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

This will start:

- PostgreSQL database on port 5432
- Redis cache on port 6379
- Backend API on port 3000
- Frontend on port 5173
- MailHog (email testing) on port 8025

### First Time Setup

```bash
# Wait for all services to start (30-60 seconds), then initialize the database
# Run database migrations (REQUIRED for first time setup)
docker-compose exec backend npx prisma migrate dev --name init

# Seed the database (optional)
docker-compose exec backend npx prisma db seed

# View the application
open http://localhost:5173
```

## Services Overview

### Development Services

| Service  | Port | URL | Description |
|----------|------|-----|-------------|
| Frontend | 5173 | <http://localhost:5173> | React + Vite development server |
| Backend  | 3000 | <http://localhost:3000> | Node.js API server |
| Database | 5432 | postgresql://localhost:5432 | PostgreSQL database |
| Redis    | 6379 | redis://localhost:6379 | Redis cache |
| MailHog  | 8025 | <http://localhost:8025> | Email testing interface |

### Useful Commands

```bash
# View running containers
docker-compose ps

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a specific service
docker-compose restart backend

# Rebuild a service after code changes
docker-compose up -d --build backend

# Execute commands in running containers
docker-compose exec backend npm run prisma:reset
docker-compose exec backend npm test
docker-compose exec frontend npm run build

# Access container shell
docker-compose exec backend sh
docker-compose exec postgres psql -U teamvault team_vault_dev
```

## Development Workflow

### Code Changes

- Frontend and backend code is mounted as volumes
- Changes are automatically reflected (hot reload)
- No need to rebuild containers for code changes

### Database Changes

```bash
# Create and apply migration
docker-compose exec backend npx prisma migrate dev --name your_migration_name

# Reset database (caution: deletes all data)
docker-compose exec backend npx prisma migrate reset

# View database in Prisma Studio
docker-compose exec backend npx prisma studio
```

### Environment Variables

- Development variables are in `docker-compose.yml`
- Override with `.env.docker` file if needed
- Never commit sensitive production values

## Production Deployment

### Environment Setup

```bash
# Copy and customize production environment
cp .env.prod.template .env.prod

# Edit .env.prod with your production values
# IMPORTANT: Change all secrets and passwords!
```

### Deploy with Production Compose

```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Run initial database setup
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

### Production Services

- Services are not exposed to host (except nginx)
- All traffic goes through nginx reverse proxy
- SSL termination at nginx level
- Health checks enabled
- Restart policies configured

## Troubleshooting

### Common Issues

**Containers won't start:**

```bash
# Check if ports are already in use
docker-compose down
lsof -i :5432  # Check if PostgreSQL is running locally

# Clean up and restart
docker-compose down -v
docker-compose up -d
```

**Database connection issues:**

```bash
# Check database logs
docker-compose logs postgres

# Reset database
docker-compose down -v postgres
docker-compose up -d postgres
```

**Frontend not loading:**

```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild with latest changes
docker-compose up -d --build frontend
```

**Permission issues (Linux/Mac):**

```bash
# Fix ownership issues
sudo chown -R $USER:$USER .
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 frontend
```

### Performance Optimization

**Development:**

- Use `.dockerignore` files to exclude unnecessary files
- Mount specific directories instead of entire project
- Use multi-stage builds for faster rebuilds

**Production:**

- Enable nginx caching and compression
- Use health checks for zero-downtime deployments
- Monitor container resource usage
- Set up log rotation

## File Structure

```
team-vault/
├── docker-compose.yml          # Development services
├── docker-compose.prod.yml     # Production services
├── .env.docker                 # Development environment
├── .env.prod.template         # Production template
├── backend/
│   ├── Dockerfile             # Production backend image
│   ├── Dockerfile.dev         # Development backend image
│   └── ...
├── frontend/
│   ├── Dockerfile             # Production frontend image
│   ├── Dockerfile.dev         # Development frontend image
│   ├── nginx.conf             # Production nginx config
│   └── ...
└── docs/
    └── DOCKER.md              # This file
```

## Security Considerations

### Development

- Default passwords are used (safe for local development)
- All ports exposed to localhost
- Debug logging enabled

### Production

- Change all default passwords and secrets
- Use environment variables for sensitive data
- Enable SSL/TLS
- Regular security updates
- Monitor logs for suspicious activity
- Use secrets management in orchestration platforms

## Monitoring and Maintenance

### Health Checks

```bash
# Check container health
docker-compose ps

# Manual health check
curl http://localhost:3000/health
curl http://localhost:5173/health
```

### Backups

```bash
# Database backup
docker-compose exec postgres pg_dump -U teamvault team_vault_dev > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U teamvault team_vault_dev < backup.sql
```

### Updates

```bash
# Update dependencies
docker-compose exec backend npm update
docker-compose exec frontend npm update

# Rebuild with updates
docker-compose up -d --build
```
