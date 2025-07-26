# 🚀 Getting Started with Team Vault

This guide will help you set up and run the Team Vault application locally for development.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **PostgreSQL** (v13 or higher) - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/)

## 🔧 Quick Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/team-vault.git
cd team-vault
```

### 2. Install Dependencies

```bash
# Install root dependencies and set up workspaces
npm install

# This will automatically install dependencies for both frontend and backend
npm run setup
```

### 3. Database Setup

1. **Create a PostgreSQL database:**
   ```sql
   CREATE DATABASE team_vault_dev;
   CREATE USER team_vault_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE team_vault_dev TO team_vault_user;
   ```

2. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Update the `.env` file** with your database credentials:
   ```env
   DATABASE_URL="postgresql://team_vault_user:your_password@localhost:5432/team_vault_dev"
   JWT_SECRET="your-super-secure-jwt-secret-must-be-32-chars-minimum"
   JWT_REFRESH_SECRET="your-super-secure-refresh-secret-different-from-above"
   ENCRYPTION_KEY="your-32-byte-encryption-master-key-for-aes-256-encryption"
   ```

### 4. Database Migration & Seeding

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with sample data
npm run db:seed
```

### 5. Start Development Servers

```bash
# Start both frontend and backend in development mode
npm run dev
```

This will start:
- **Backend API** at `http://localhost:3000`
- **Frontend** at `http://localhost:5173`

## 🔐 Default Login Credentials

After seeding the database, you can log in with:

- **Admin User:**
  - Email: `admin@teamvault.app`
  - Password: `admin123!`

- **Demo User:**
  - Email: `demo@teamvault.app`
  - Password: `demo123!`

## 🛠️ Available Scripts

### Root Scripts
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both applications for production
- `npm run test` - Run tests for both applications
- `npm run setup` - Install dependencies for both applications

### Backend Scripts
- `npm run dev:backend` - Start backend development server
- `npm run build:backend` - Build backend for production
- `npm run test:backend` - Run backend tests
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

### Frontend Scripts
- `npm run dev:frontend` - Start frontend development server
- `npm run build:frontend` - Build frontend for production
- `npm run test:frontend` - Run frontend tests

## 🗂️ Project Structure

```
team-vault/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── server.ts        # Express app entry point
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Database seeding
│   └── package.json
├── frontend/                # React + Vite application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service functions
│   │   ├── types/           # TypeScript type definitions
│   │   └── App.tsx          # React app entry point
│   └── package.json
├── docs/                    # Documentation
└── package.json             # Root package.json
```

## 🔧 Development Workflow

1. **Backend Development:**
   - Make changes to files in `backend/src/`
   - The server will automatically restart (nodemon)
   - API will be available at `http://localhost:3000/api`

2. **Frontend Development:**
   - Make changes to files in `frontend/src/`
   - Hot reload is enabled
   - App will be available at `http://localhost:5173`

3. **Database Changes:**
   - Modify `backend/prisma/schema.prisma`
   - Run `npm run db:migrate` to apply changes
   - Run `npm run db:generate` to update Prisma client

## 🧪 Testing

```bash
# Run all tests
npm test

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend

# Run tests in watch mode
cd backend && npm run test:watch
cd frontend && npm run test:watch
```

## 🚀 Building for Production

```bash
# Build both applications
npm run build

# Build individual applications
npm run build:backend
npm run build:frontend
```

## 📊 Database Management

```bash
# Open Prisma Studio (database GUI)
npm run db:studio

# Reset database (WARNING: This will delete all data)
npm run db:reset

# View database schema
cat backend/prisma/schema.prisma
```

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Error:**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in `.env` file
   - Verify database exists and user has permissions

2. **Port Already in Use:**
   - Backend (3000): Kill process or change PORT in `.env`
   - Frontend (5173): Kill process or change port in `frontend/vite.config.ts`

3. **Dependencies Issues:**
   ```bash
   # Clean install
   rm -rf node_modules backend/node_modules frontend/node_modules
   npm install
   npm run setup
   ```

4. **TypeScript Errors:**
   ```bash
   # Regenerate Prisma client
   npm run db:generate
   
   # Check TypeScript
   cd backend && npx tsc --noEmit
   cd frontend && npx tsc --noEmit
   ```

## 📚 Next Steps

1. **Explore the Documentation:**
   - [System Architecture](docs/ARCHITECTURE.md)
   - [API Documentation](docs/API_DOCUMENTATION.md)
   - [Database Schema](docs/DATABASE_SCHEMA.md)
   - [Security Guide](docs/SECURITY.md)

2. **Start Developing:**
   - Add new API endpoints in `backend/src/routes/`
   - Create new React components in `frontend/src/components/`
   - Implement business logic in `backend/src/services/`

3. **Configure for Production:**
   - Review [Deployment Guide](docs/DEPLOYMENT.md)
   - Set up environment variables for production
   - Configure SSL certificates

## 🆘 Need Help?

- Check the [documentation](docs/)
- Review the [API documentation](docs/API_DOCUMENTATION.md)
- Look at existing code examples in the codebase
- Create an issue in the repository

Happy coding! 🎉
