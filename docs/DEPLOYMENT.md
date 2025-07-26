# 🚀 Team Vault - Deployment Guide

## 📖 Table of Contents

- [Deployment Overview](#-deployment-overview)
- [Environment Setup](#️-environment-setup)
- [Production Deployment](#-production-deployment)
- [Docker Deployment](#-docker-deployment)
- [Database Migration](#️-database-migration)
- [Monitoring Setup](#-monitoring-setup)
- [Backup Strategy](#-backup-strategy)
- [Troubleshooting](#-troubleshooting)

---

## 🌐 Deployment Overview

### 🎯 **Deployment Strategy**

```mermaid
graph TB
    LocalDev[Local Development]
    GitRepo[GitHub Repository]
    CICD[CI/CD Pipeline<br/>GitHub Actions]
    Vercel[Vercel<br/>Frontend]
    Railway[Railway<br/>Backend]
    Supabase[Supabase<br/>PostgreSQL]

    LocalDev --> GitRepo
    GitRepo --> CICD
    CICD --> Vercel
    CICD --> Railway
    Railway <--> Supabase
    Vercel <--> Railway

    style LocalDev fill:#f7fafc
    style GitRepo fill:#2d3748
    style CICD fill:#4a5568
    style Vercel fill:#00d4aa
    style Railway fill:#5b67d8
    style Supabase fill:#38a169
```

### 🏗️ **Infrastructure Components**

| Component | Service | Purpose | Scaling |
|-----------|---------|---------|---------|
| **Frontend** | Vercel / Docker | Static site hosting / Containerized | Global CDN / Horizontal |
| **Backend** | Railway / Docker | API server hosting / Containerized | Auto-scaling / Horizontal |
| **Database** | Supabase / PostgreSQL | PostgreSQL hosting | Managed scaling |
| **Email** | SendGrid | Email delivery | External service |
| **Container Orchestration** | Docker Compose / Kubernetes | Container management | Horizontal scaling |
| **Monitoring** | Uptime Robot | Health monitoring | External service |
| **CI/CD** | GitHub Actions | Automated deployment | GitHub-hosted |

---

## ⚙️ Environment Setup

### 🔧 **Environment Variables**

#### **Backend Environment (.env.production)**

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@hostname:5432/teamvault_prod"

# JWT Configuration
JWT_SECRET="your-super-secure-jwt-secret-must-be-32-chars-minimum"
JWT_REFRESH_SECRET="your-super-secure-refresh-secret-different-from-above"

# Encryption Configuration
ENCRYPTION_KEY="your-32-byte-encryption-master-key-for-aes-256-encryption"

# Email Configuration
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
EMAIL_FROM="noreply@teamvault.app"

# CORS Configuration
CORS_ORIGIN="https://teamvault.app,https://www.teamvault.app"

# Application Configuration
NODE_ENV="production"
PORT="3000"
LOG_LEVEL="info"

# Rate Limiting (Redis)
REDIS_URL="redis://username:password@hostname:6379"

# Monitoring
SENTRY_DSN="your-sentry-dsn-for-error-tracking"
```

#### **Frontend Environment (.env.production)**

```bash
# API Configuration
VITE_API_BASE_URL="https://api.teamvault.app/api"

# Feature Flags
VITE_ENCRYPTION_ENABLED="true"
VITE_ENVIRONMENT="production"

# Analytics (Optional)
VITE_GOOGLE_ANALYTICS_ID="GA-XXXXXXXXXX"

# Monitoring
VITE_SENTRY_DSN="your-frontend-sentry-dsn"
```

### 🔒 **Security Environment Setup**

```bash
# Generate secure secrets
# Use these commands to generate secure values:

# JWT Secret (32+ characters)
openssl rand -base64 32

# Encryption Key (exactly 32 bytes)
openssl rand -hex 32

# Database password (if self-hosting)
openssl rand -base64 24
```

---

## 🚀 Production Deployment

### 📦 **GitHub Actions Workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Team Vault

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '22'

jobs:
  test:
    name: Test and Lint
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install backend dependencies
        run: |
          cd backend
          npm ci
      
      - name: Install frontend dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Run backend tests
        run: |
          cd backend
          npm run test
          npm run test:coverage
      
      - name: Run frontend tests
        run: |
          cd frontend
          npm run test
      
      - name: Run backend linting
        run: |
          cd backend
          npm run lint
      
      - name: Run frontend linting
        run: |
          cd frontend
          npm run lint
      
      - name: Type checking
        run: |
          cd backend && npm run type-check
          cd ../frontend && npm run type-check
      
      - name: Security audit
        run: |
          cd backend && npm audit --audit-level high
          cd ../frontend && npm audit --audit-level high

  deploy-backend:
    name: Deploy Backend
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Deploy to Railway
        uses: railway-app/railway-action@v1
        with:
          api-token: ${{ secrets.RAILWAY_TOKEN }}
          project-id: ${{ secrets.RAILWAY_PROJECT_ID }}
          service: backend
      
      - name: Wait for deployment
        run: sleep 30
      
      - name: Run database migrations
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.RAILWAY_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{"command": "npx prisma migrate deploy"}' \
            https://api.railway.app/projects/${{ secrets.RAILWAY_PROJECT_ID }}/run

  deploy-frontend:
    name: Deploy Frontend
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Build frontend
        run: |
          cd frontend
          npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
          VITE_ENCRYPTION_ENABLED: true
          VITE_ENVIRONMENT: production
      
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}

  notify:
    name: Notify Deployment
    needs: [deploy-backend, deploy-frontend]
    runs-on: ubuntu-latest
    if: always()
    
    steps:
      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 🏗️ **Railway Backend Configuration**

Create `railway.json` in the backend directory:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

---

## 🐳 **Docker Deployment**

### 🚀 **Production Docker Setup**

Team Vault includes production-ready Docker configurations for scalable deployment:

```bash
# Copy and customize production environment
cp .env.prod.template .env.prod

# Edit .env.prod with your production values
# IMPORTANT: Change all secrets and passwords!

# Build and deploy with production compose
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Run initial database setup
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

### 🏗️ **Container Architecture**

```mermaid
graph TB
    LB[Load Balancer/Nginx]
    FE[Frontend Container<br/>Nginx + React]
    BE[Backend Container<br/>Node.js + Express]
    DB[PostgreSQL Container]
    REDIS[Redis Container]
    
    LB --> FE
    LB --> BE
    BE --> DB
    BE --> REDIS
    
    style LB fill:#e3f2fd
    style FE fill:#f3e5f5
    style BE fill:#e8f5e8
    style DB fill:#fff3e0
    style REDIS fill:#fce4ec
```

### 📦 **Container Services**

| Service | Image | Purpose | Ports |
|---------|-------|---------|-------|
| **nginx** | nginx:alpine | Reverse proxy & SSL | 80, 443 |
| **frontend** | team-vault/frontend | React SPA | Internal |
| **backend** | team-vault/backend | API server | Internal |
| **postgres** | postgres:15-alpine | Database | Internal |
| **redis** | redis:7-alpine | Cache/sessions | Internal |

### 🔧 **Production Environment Variables**

Create `.env.prod` with production values:

```bash
# Database
POSTGRES_USER=teamvault_prod
POSTGRES_PASSWORD=your-strong-production-password
DATABASE_URL=postgresql://teamvault_prod:password@postgres:5432/team_vault_prod

# Security (CHANGE THESE!)
JWT_SECRET=your-super-secure-jwt-secret-must-be-32-chars-minimum-prod
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-different-from-above-prod
ENCRYPTION_KEY=your-32-byte-encryption-master-key-for-aes-256-encryption-prod

# Application
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
VITE_API_BASE_URL=https://your-domain.com/api
```

### 🚀 **Deployment Commands**

```bash
# Production deployment
npm run docker:prod         # Start production environment
npm run docker:prod:build   # Rebuild and start
npm run docker:prod:down    # Stop production environment

# Manual commands
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
docker-compose -f docker-compose.prod.yml logs -f
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

### 🔄 **Container Orchestration Options**

#### **Docker Swarm**
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.prod.yml team-vault
```

#### **Kubernetes**
```yaml
# Example kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: team-vault-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: team-vault-backend
  template:
    metadata:
      labels:
        app: team-vault-backend
    spec:
      containers:
      - name: backend
        image: team-vault/backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: team-vault-secrets
              key: database-url
```

### 📊 **Monitoring & Health Checks**

```bash
# Check container health
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Health endpoints
curl https://your-domain.com/health         # Frontend
curl https://your-domain.com/api/health     # Backend
```

### 🔐 **Security Considerations**

- **Network Security**: Containers communicate on isolated bridge network
- **Secrets Management**: Use Docker secrets or external secret managers
- **SSL/TLS**: Terminated at nginx reverse proxy
- **Image Security**: Regularly update base images and scan for vulnerabilities
- **Non-root Users**: All containers run as non-root users

### 📈 **Scaling**

```bash
# Scale backend horizontally
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Load balancer automatically distributes traffic
```

For complete Docker documentation, see [DOCKER.md](./DOCKER.md).

---

### 🌐 **Vercel Frontend Configuration**

Create `vercel.json` in the frontend directory:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 🗄️ Database Migration

### 📋 **Migration Scripts**

Create `scripts/migrate.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

async function runMigrations() {
  console.log('🚀 Starting database migration...');
  
  try {
    // Check database connection
    await prisma.$connect();
    console.log('✅ Database connection established');
    
    // Run Prisma migrations
    console.log('📦 Running Prisma migrations...');
    await execAsync('npx prisma migrate deploy');
    console.log('✅ Prisma migrations completed');
    
    // Generate Prisma client
    console.log('🔄 Generating Prisma client...');
    await execAsync('npx prisma generate');
    console.log('✅ Prisma client generated');
    
    // Run data migrations if needed
    await runDataMigrations();
    
    console.log('🎉 Database migration completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
    
  } finally {
    await prisma.$disconnect();
  }
}

async function runDataMigrations() {
  console.log('📝 Running data migrations...');
  
  // Example: Create default admin user
  const adminExists = await prisma.user.findFirst({
    where: { role: 'GLOBAL_ADMIN' }
  });
  
  if (!adminExists) {
    console.log('👤 Creating default admin user...');
    await prisma.user.create({
      data: {
        email: process.env.ADMIN_EMAIL || 'admin@teamvault.app',
        name: 'System Administrator',
        passwordHash: process.env.ADMIN_PASSWORD_HASH!,
        role: 'GLOBAL_ADMIN',
        emailVerified: true
      }
    });
    console.log('✅ Default admin user created');
  }
  
  // Add other data migrations here
}

// Run if called directly
if (require.main === module) {
  runMigrations();
}

export { runMigrations };
```

### 🔄 **Migration Rollback Strategy**

Create `scripts/rollback.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

async function rollbackMigration(migrationName?: string) {
  console.log('⚠️  Starting migration rollback...');
  
  try {
    // Create backup before rollback
    await createBackup();
    
    // Reset to specific migration or last known good state
    if (migrationName) {
      await execAsync(`npx prisma migrate reset --force --skip-generate`);
      await execAsync(`npx prisma migrate deploy --to ${migrationName}`);
    } else {
      // Reset to last known good migration
      await execAsync('npx prisma migrate reset --force');
    }
    
    console.log('✅ Migration rollback completed');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    process.exit(1);
  }
}

async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = `backup-${timestamp}.sql`;
  
  console.log(`💾 Creating backup: ${backupFile}`);
  
  // Create database backup (implementation depends on database provider)
  // For PostgreSQL:
  await execAsync(`pg_dump ${process.env.DATABASE_URL} > ${backupFile}`);
  
  console.log('✅ Backup created successfully');
}
```

---

## 📊 Monitoring Setup

### 🔍 **Health Check Endpoint**

Create `src/routes/health.ts`:

```typescript
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: boolean;
    redis: boolean;
    memory: boolean;
    disk: boolean;
  };
  metrics?: {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: number;
  };
}

router.get('/health', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    const checks = await performHealthChecks();
    const allHealthy = Object.values(checks).every(check => check === true);
    
    const health: HealthStatus = {
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      checks,
      metrics: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage().user / 1000000 // Convert to seconds
      }
    };
    
    const statusCode = allHealthy ? 200 : 503;
    res.status(statusCode).json(health);
    
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      checks: {
        database: false,
        redis: false,
        memory: false,
        disk: false
      }
    });
  }
});

async function performHealthChecks() {
  const checks = {
    database: false,
    redis: false,
    memory: false,
    disk: false
  };
  
  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }
  
  // Redis check (if using Redis)
  try {
    // Implementation depends on Redis client
    checks.redis = true;
  } catch (error) {
    console.error('Redis health check failed:', error);
  }
  
  // Memory check
  const memUsage = process.memoryUsage();
  const memLimit = 1024 * 1024 * 1024; // 1GB limit
  checks.memory = memUsage.heapUsed < memLimit;
  
  // Disk check (basic check)
  checks.disk = true; // Implementation depends on requirements
  
  return checks;
}

export default router;
```

### 📈 **Application Metrics**

Create `src/utils/metrics.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';

export class MetricsCollector {
  private static instance: MetricsCollector;
  private metrics: Map<string, any> = new Map();
  
  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }
  
  // Middleware to collect request metrics
  collectRequestMetrics() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        const route = req.route?.path || req.path;
        const method = req.method;
        const statusCode = res.statusCode;
        
        this.recordRequestMetric({
          route,
          method,
          statusCode,
          duration,
          timestamp: new Date()
        });
      });
      
      next();
    };
  }
  
  private recordRequestMetric(metric: any) {
    const key = `${metric.method}:${metric.route}`;
    const existing = this.metrics.get(key) || { count: 0, totalDuration: 0 };
    
    existing.count++;
    existing.totalDuration += metric.duration;
    existing.lastRequest = metric.timestamp;
    existing.averageDuration = existing.totalDuration / existing.count;
    
    this.metrics.set(key, existing);
  }
  
  getMetrics() {
    return {
      requests: Object.fromEntries(this.metrics),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      }
    };
  }
}
```

---

## 💾 Backup Strategy

### 🗄️ **Database Backup Script**

Create `scripts/backup.ts`:

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export class BackupService {
  private backupDir = process.env.BACKUP_DIR || './backups';
  
  async createBackup(): Promise<string> {
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupDir, `teamvault-${timestamp}.sql`);
    
    console.log(`📦 Creating database backup: ${backupFile}`);
    
    try {
      // Create database dump
      await execAsync(`pg_dump "${process.env.DATABASE_URL}" > "${backupFile}"`);
      
      // Compress backup
      await execAsync(`gzip "${backupFile}"`);
      const compressedFile = `${backupFile}.gz`;
      
      console.log(`✅ Backup created successfully: ${compressedFile}`);
      
      // Clean old backups (keep last 30 days)
      await this.cleanOldBackups();
      
      return compressedFile;
      
    } catch (error) {
      console.error('❌ Backup failed:', error);
      throw error;
    }
  }
  
  async restoreBackup(backupFile: string): Promise<void> {
    console.log(`🔄 Restoring from backup: ${backupFile}`);
    
    try {
      // Decompress if needed
      if (backupFile.endsWith('.gz')) {
        await execAsync(`gunzip -c "${backupFile}" > "${backupFile.slice(0, -3)}"`);
        backupFile = backupFile.slice(0, -3);
      }
      
      // Restore database
      await execAsync(`psql "${process.env.DATABASE_URL}" < "${backupFile}"`);
      
      console.log('✅ Database restored successfully');
      
    } catch (error) {
      console.error('❌ Restore failed:', error);
      throw error;
    }
  }
  
  private async cleanOldBackups(): Promise<void> {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    const files = fs.readdirSync(this.backupDir);
    
    for (const file of files) {
      const filePath = path.join(this.backupDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime.getTime() < thirtyDaysAgo) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Deleted old backup: ${file}`);
      }
    }
  }
}

// Schedule daily backups
const backupService = new BackupService();

// Run backup daily at 2 AM
setInterval(async () => {
  const now = new Date();
  if (now.getHours() === 2 && now.getMinutes() === 0) {
    try {
      await backupService.createBackup();
    } catch (error) {
      console.error('Scheduled backup failed:', error);
    }
  }
}, 60000); // Check every minute
```

### ☁️ **Cloud Backup Integration**

```typescript
import AWS from 'aws-sdk';

export class CloudBackupService {
  private s3: AWS.S3;
  
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });
  }
  
  async uploadBackup(localFile: string, remoteKey: string): Promise<void> {
    const fileStream = fs.createReadStream(localFile);
    
    const uploadParams = {
      Bucket: process.env.S3_BACKUP_BUCKET!,
      Key: remoteKey,
      Body: fileStream,
      ServerSideEncryption: 'AES256',
      StorageClass: 'STANDARD_IA' // Infrequent access for backups
    };
    
    try {
      await this.s3.upload(uploadParams).promise();
      console.log(`☁️  Backup uploaded to S3: ${remoteKey}`);
    } catch (error) {
      console.error('S3 upload failed:', error);
      throw error;
    }
  }
  
  async downloadBackup(remoteKey: string, localFile: string): Promise<void> {
    const downloadParams = {
      Bucket: process.env.S3_BACKUP_BUCKET!,
      Key: remoteKey
    };
    
    try {
      const data = await this.s3.getObject(downloadParams).promise();
      fs.writeFileSync(localFile, data.Body as Buffer);
      console.log(`📥 Backup downloaded from S3: ${localFile}`);
    } catch (error) {
      console.error('S3 download failed:', error);
      throw error;
    }
  }
}
```

---

## 🔧 Troubleshooting

### 🚨 **Common Issues and Solutions**

#### **Database Connection Issues**

```typescript
// Debug database connection
async function debugDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    console.log('Database URL:', process.env.DATABASE_URL?.replace(/password=[^&]+/, 'password=***'));
    
    const prisma = new PrismaClient();
    await prisma.$connect();
    
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Database connected successfully:', result);
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    
    // Check common issues
    if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Check: Database hostname is correct');
    }
    if (error.message.includes('authentication failed')) {
      console.log('💡 Check: Database credentials are correct');
    }
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Check: Database port is correct and accessible');
    }
  }
}
```

#### **Environment Variable Validation**

```typescript
function validateEnvironment() {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'ENCRYPTION_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    process.exit(1);
  }
  
  // Validate JWT secret length
  if (process.env.JWT_SECRET!.length < 32) {
    console.error('❌ JWT_SECRET must be at least 32 characters');
    process.exit(1);
  }
  
  // Validate encryption key
  if (process.env.ENCRYPTION_KEY!.length !== 64) { // 32 bytes in hex
    console.error('❌ ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)');
    process.exit(1);
  }
  
  console.log('✅ Environment validation passed');
}
```

#### **Memory and Performance Issues**

```typescript
function monitorPerformance() {
  setInterval(() => {
    const memUsage = process.memoryUsage();
    const memUsageInMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    };
    
    console.log('📊 Memory usage (MB):', memUsageInMB);
    
    // Alert on high memory usage
    if (memUsageInMB.heapUsed > 512) {
      console.warn('⚠️  High memory usage detected');
    }
    
  }, 60000); // Every minute
}
```

### 📋 **Deployment Checklist**

```markdown
## Pre-Deployment Checklist

### Security
- [ ] All environment variables configured
- [ ] Secrets are properly encrypted
- [ ] Database credentials are secure
- [ ] HTTPS is enforced
- [ ] Security headers are configured

### Database
- [ ] Database backups are configured
- [ ] Migration scripts are tested
- [ ] Connection pooling is configured
- [ ] Indexes are optimized

### Monitoring
- [ ] Health check endpoint is working
- [ ] Error tracking is configured
- [ ] Performance monitoring is set up
- [ ] Alerts are configured

### Testing
- [ ] All tests pass
- [ ] Security audit passes
- [ ] Load testing completed
- [ ] Integration tests pass

### Documentation
- [ ] API documentation is updated
- [ ] Deployment documentation is current
- [ ] Emergency procedures are documented
- [ ] Team access is configured
```

---

*This deployment guide provides comprehensive instructions for deploying Team Vault to production. Follow the checklist and monitor the application closely after deployment.*
