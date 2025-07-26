# 🔐 Team Vault

> A secure web application for teams to store, manage, and share credentials with role-based access controls, encryption, and intelligent expiration management.

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Security Features](#-security-features)
- [Tech Stack](#️-tech-stack)
- [Core Entities](#️-core-entities)
- [User Roles & Permissions](#-user-roles--permissions)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Development Roadmap](#-🗺️-development-roadmap)
- [Contributing](#-contributing)

## 🎯 Overview

Team Vault eliminates the security risk of sharing sensitive credentials through chat platforms, emails, or insecure documents. It provides a centralized, encrypted repository where teams can securely store, organize, and share credentials with granular access controls.

### 🚨 Problem Statement

- **Insecure Sharing**: Teams frequently share passwords, API keys, and sensitive credentials through chat platforms (Slack, Teams, Discord), email, shared documents, and text messages
- **No Access Control**: No centralized way to track who has access to what credentials, inability to revoke access when team members leave
- **Manual Processes**: Manual credential rotation processes, no automated expiration tracking, forgotten credentials leading to service disruptions
- **Organizational Risks**: Compliance violations, security breaches from exposed credentials, productivity loss from locked-out services

### ✅ Solution

- **Secure Storage**: AES-256 encrypted credential storage with optional client-side encryption for zero-knowledge architecture
- **Granular Access Control**: Role-based permissions (User, Team Admin, Global Admin) with resource-based access control for individual credentials
- **Intelligent Expiration**: Automated notifications, risk assessment based on credential age and usage, rotation reminders and history tracking
- **Complete Audit Trail**: Comprehensive logging of all access and modifications with user activity tracking and compliance reporting
- **Flexible Sharing**: Direct user sharing with permission levels, team-based access management, one-time sharing links for external users

## 🚀 Key Features

### 🔑 Credential Management

- ✅ Secure credential creation with encryption for various types (passwords, API keys, certificates)
- ✅ Categorization and tagging system with rich metadata (URLs, descriptions, notes)
- ✅ Advanced search and filtering with favorites and recent access
- ✅ Set expiration dates with automated notifications and renewal reminders
- ✅ Track credential rotation history and risk level assessment based on usage patterns

### 👥 Team Collaboration

- ✅ Create and manage teams with hierarchical permission structure
- ✅ Invite users via email with role assignment and bulk user management
- ✅ Share credentials with individuals or entire teams with defined access levels
- ✅ Resource-level access control with temporary access grants
- ✅ Access request and approval workflows with instant revocation capabilities

### 🔗 Secure Sharing

- ✅ Generate time-limited, one-use sharing links with usage tracking and analytics
- ✅ Password-protected external sharing for contractors and external users
- ✅ Granular access levels (view-only or edit permissions) with expiration dates
- ✅ Batch sharing for multiple credentials with time-limited access capabilities

### 📊 Monitoring & Compliance

- ✅ Complete access and modification history with user activity tracking and timestamps
- ✅ Export capabilities for compliance reporting and real-time security event monitoring
- ✅ Credential usage analytics and expiration dashboard with automated alerts
- ✅ Team activity reports, compliance status tracking, and custom report generation

## 🔒 Security Features

| Feature | Implementation | Status |
|---------|---------------|--------|
| **Encryption at Rest** | AES-256 encryption for all secrets | 🔄 Planned |
| **Client-Side Encryption** | Optional zero-knowledge architecture | 🔄 Planned |
| **Authentication** | JWT-based with refresh tokens | 🔄 Planned |
| **Authorization** | Role-based + resource-based permissions | 🔄 Planned |
| **Rate Limiting** | API throttling and brute-force protection | 🔄 Planned |
| **Audit Logging** | Complete access and modification history | 🔄 Planned |
| **Secure Headers** | HTTPS enforcement, CSP, HSTS | 🔄 Planned |

## 🛠️ Tech Stack

### 🧑‍💻 Frontend

| Technology            | Purpose                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------- |
| **Framework**         | ✅ **React + Vite** – Lightning-fast dev server, optimized build, ideal for MVP velocity. |
| **Styling**           | ✅ **TailwindCSS** – Utility-first styling for rapid UI development.                      |
| **Form Handling**     | ✅ **React Hook Form** – Lightweight, performant forms for credential and user flows.     |
| **Components/UI Kit** | ✅ **Headless UI + Heroicons** – Accessible, customizable UI primitives.                  |
| **Routing**           | ✅ **React Router DOM** – Declarative routing with nested routes support.                 |
| **Encryption**        | ✅ **WebCrypto API** – Native browser encryption for frontend-level security.             |

### 🖥️ Backend

| Technology              | Purpose                                                                                 |
| ----------------------- | --------------------------------------------------------------------------------------- |
| **Framework**           | ✅ **Node.js + Express** – Minimal setup, mature ecosystem, excellent for MVPs.          |
| **ORM**                 | ✅ **Prisma** – Type-safe DB access, auto migration, developer-friendly with PostgreSQL. |
| **Authentication**      | ✅ **JWT (jsonwebtoken)** – Secure stateless token-based authentication.                 |
| **Password Hashing**    | ✅ **bcrypt / argon2** – Secure storage of user credentials.                             |
| **Email Notifications** | ✅ **Nodemailer** – Simple SMTP integration for alerts and invites.                      |
| **Background Jobs**     | ✅ **node-cron** – Scheduled checks for credential expiration reminders.                 |
| **Encryption**          | ✅ **Node.js `crypto` module** – Encrypt secrets on backend before DB storage.           |

### 🗄️ Database

| Technology          | Purpose                                                                     |
| ------------------- | --------------------------------------------------------------------------- |
| **Database**        | ✅ **PostgreSQL** – Reliable relational database, ideal for structured data. |
| **Hosting**         | ✅ **Supabase / Railway** – Instant PostgreSQL hosting with free tiers.      |
| **ORM Integration** | ✅ **Prisma** – Works seamlessly with hosted PostgreSQL services.            |

### ☁️ Hosting & DevOps

| Technology                      | Purpose                                                                      |
| ------------------------------- | ---------------------------------------------------------------------------- |
| **Frontend Hosting**            | ✅ **Vercel** – Fast CI/CD, Git-based deployments, automatic HTTPS.           |
| **Backend Hosting**             | ✅ **Render / Railway** – Simple deployment of Express apps, background jobs. |
| **CI/CD**                       | ✅ **GitHub Actions** – Automate testing, builds, and deployments.            |
| **Containerization (optional)** | ✅ **Docker** – Local dev and production parity if needed later.              |

### 🔐 Security Essentials

| Technology                | Purpose                                                   |
| ------------------------- | --------------------------------------------------------- |
| **Helmet.js**             | Adds standard security headers in Express apps.           |
| **Rate-limiter-flexible** | Prevent brute-force attacks on login or invite endpoints. |
| **HTTPS Enforcement**     | ✅ Managed automatically by Vercel / Render / Railway.     |
| **WebCrypto / crypto**    | Secure client-side and server-side encryption mechanisms. |

### 📧 Notifications

| Technology                  | Purpose                                                                    |
| --------------------------- | -------------------------------------------------------------------------- |
| **Email Delivery**          | ✅ **SendGrid / Resend / SMTP** – For expiration alerts, invites.           |
| **Scheduler**               | ✅ **node-cron** – Daily background jobs to check for expiring credentials. |
| **Local Dev Email Testing** | ✅ **Mailtrap** – Sandbox email delivery for development/debugging.         |

## 🔧 MVP Stack Summary

| Layer           | Technology Stack                                         |
| --------------- | -------------------------------------------------------- |
| Frontend        | React + Vite + TailwindCSS + React Hook Form             |
| Backend         | Node.js + Express + Prisma + JWT + Nodemailer            |
| Database        | PostgreSQL (hosted via Supabase or Railway)              |
| Hosting         | Vercel (frontend) + Render/Railway (backend)             |
| Background Jobs | node-cron for expiration notification                    |
| Auth            | JWT + bcrypt / argon2                                    |
| Encryption      | WebCrypto (frontend) + Node.js `crypto` module (backend) |

## ⚡ Why This Stack?

- 🛠️ **Rapid Setup**: You can go from idea to working app in hours.
- 🚀 **Minimal DevOps**: No complex cloud setup needed for MVP.
- 🔐 **Secure Defaults**: JWT, HTTPS, encryption, and rate limiting included.
- 🧪 **Easy to Test**: Prisma + Postman + Vercel/Render simplify debugging.
- 🌍 **Scalable Later**: Migrate to NestJS, ASP.NET Core, or Kubernetes as needed.

## 🗄️ Core Entities

### Credential

```typescript
interface Credential {
  id: string;
  name: string;
  username?: string;
  secret: string; // encrypted
  description?: string;
  category?: string;
  url?: string;
  tags: string[];
  ownerId: string;
  expirationDate?: Date;
  lastRotated?: Date;
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}
 ```bash

### User

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'globalAdmin';
  teams: TeamMembership[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
}
```

### Team

```typescript
interface Team {
  id: string;
  name: string;
  description?: string;
  members: TeamMembership[];
  createdBy: string;
  createdAt: Date;
}

interface TeamMembership {
  userId: string;
  teamId: string;
  role: 'viewer' | 'editor' | 'admin';
  joinedAt: Date;
}
```

### SharedCredential

```typescript
interface SharedCredential {
  id: string;
  credentialId: string;
  sharedWithUserId?: string;
  sharedWithTeamId?: string;
  accessLevel: 'view' | 'edit';
  createdBy: string;
  expiresAt?: Date;
  createdAt: Date;
}
```

## 👥 User Roles & Permissions

| Role | Create Credentials | Share Credentials | Edit Shared | Delete Own | View Audit Logs | Manage Teams |
|------|-------------------|-------------------|-------------|------------|-----------------|--------------|
| **User** | ✅ Personal only | ✅ Own credentials | ✅ If permitted | ✅ Own only | ❌ | ❌ |
| **Team Admin** | ✅ Team scope | ✅ Team credentials | ✅ Team scope | ✅ Team scope | ✅ Team only | ✅ Own teams |
| **Global Admin** | ✅ All scopes | ✅ All credentials | ✅ All scopes | ✅ All scopes | ✅ All logs | ✅ All teams |

## 🚀 Getting Started

### Prerequisites

- Node.js 22+ & npm
- PostgreSQL 18+ (or Supabase/Railway account)
- Git
- Docker Desktop (optional)

### Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/team-vault.git
   cd team-vault
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   npx prisma migrate dev
   npx prisma generate
   npm run dev
   ```

3. **Frontend Setup**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Docker Setup** (Recommended for easy development)

   Using Docker provides a consistent development environment with all services pre-configured:

   ```bash
   # Start all services (PostgreSQL, Redis, Backend, Frontend, MailHog)
   docker-compose up -d
   
   # Wait for all services to start (30-60 seconds), then initialize the database
   # Run database migrations (REQUIRED for first time setup)
   docker-compose exec backend npx prisma migrate dev --name init
   
   # View logs
   docker-compose logs -f
   
   # Access the application
   # Frontend: http://localhost:5173
   # Backend API: http://localhost:3000
   # Email testing: http://localhost:8025
   ```

   **Docker Commands:**

   ```bash
   npm run docker:dev        # Start development environment
   npm run docker:dev:build  # Rebuild and start
   npm run docker:dev:logs   # View logs
   npm run docker:dev:down   # Stop all services
   npm run docker:dev:clean  # Remove volumes and clean state
   ```

   See [docs/DOCKER.md](./docs/DOCKER.md) for complete Docker documentation.

   ```

### Environment Variables

```bash
# Backend (.env)
DATABASE_URL=postgresql://username:password@localhost:5432/teamvault
JWT_SECRET=your-super-secret-key-minimum-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-key
ENCRYPTION_KEY=your-32-byte-encryption-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CORS_ORIGIN=http://localhost:5173

# Frontend (.env)
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ENCRYPTION_ENABLED=true
```

## 📁 Project Structure

```text
team-vault/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── controllers/       # API route handlers
│   │   ├── services/          # Business logic
│   │   ├── models/            # Prisma schema & types
│   │   ├── middleware/        # Auth, validation, security
│   │   ├── utils/             # Encryption, helpers
│   │   └── jobs/              # Background tasks (cron)
│   ├── tests/                 # Unit & integration tests
│   ├── prisma/                # Database schema & migrations
│   ├── package.json
│   └── .env                   # Environment variables
├── frontend/                  # React + Vite application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Route components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API calls & business logic
│   │   ├── utils/             # Encryption, helpers
│   │   ├── types/             # TypeScript interfaces
│   │   └── styles/            # TailwindCSS configurations
│   ├── public/                # Static assets
│   ├── package.json
│   └── .env                   # Environment variables
├── docs/                      # Documentation
├── scripts/                   # Deployment & utility scripts
├── docker-compose.yml         # Multi-container setup
└── README.md                  # This file
```

## 🗺️ Development Roadmap

### Phase 1: Foundation (Weeks 1-3)

- [ ] Project setup and structure
- [ ] Database schema and migrations
- [ ] Basic authentication system
- [ ] User management APIs
- [ ] Frontend shell with routing

### Phase 2: Core Features (Weeks 4-6)

- [ ] Credential CRUD operations
- [ ] Encryption/decryption implementation
- [ ] Basic team management
- [ ] Credential sharing functionality

### Phase 3: Advanced Features (Weeks 7-9)

- [ ] Expiration notifications system
- [ ] One-time sharing links
- [ ] Audit logging
- [ ] Dashboard and analytics

### Phase 4: Polish & Security (Weeks 10-12)

- [ ] Security hardening
- [ ] Performance optimization
- [ ] UI/UX improvements
- [ ] Comprehensive testing

### Phase 5: Deployment (Weeks 13-14)

- [ ] Production deployment
- [ ] CI/CD pipeline
- [ ] Monitoring and alerting
- [ ] Documentation completion

## 📊 Current Status

| Component | Status | Progress |
|-----------|--------|----------|
| **Project Planning** | ✅ Complete | 100% |
| **Backend Setup** | ⏳ In Progress | 0% |
| **Frontend Setup** | ⏳ Pending | 0% |
| **Database Design** | ⏳ Pending | 0% |
| **Authentication** | ⏳ Pending | 0% |
| **Core Features** | ⏳ Pending | 0% |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

For questions, suggestions, or support:

- 📧 Email: [jaimealbertomeza@hotmail.com](mailto:jaimealbertomeza@hotmail.com)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/team-vault/issues)
- 📖 Wiki: [Project Wiki](https://github.com/yourusername/team-vault/wiki)

---

**⚡ Quick Start**: Jump to [Getting Started](#-getting-started) to begin development!
