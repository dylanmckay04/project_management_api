# Pulse PM - Project Management Application

A full-stack project management application for planning, organizing, and tracking projects and tasks. Built with FastAPI, React, TypeScript, and PostgreSQL.

**Live Application:** https://pulsepm.vercel.app  
**Live API:** https://web-production-8f59b.up.railway.app

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Frontend Development](#frontend-development)
- [Backend Development](#backend-development)
- [Deployment](#deployment)
- [Future Roadmap](#future-roadmap)

---

## Overview

Pulse PM is a portfolio project demonstrating a complete full-stack web application with:
- **Frontend**: Modern React SPA with TypeScript, deployed on Vercel
- **Backend**: Production-ready FastAPI REST API, deployed on Railway with PostgreSQL
- **Authentication**: Secure JWT-based authentication with password hashing
- **Architecture**: Clean layered design with proper separation of concerns

This project showcases practical experience with enterprise-grade tooling and best practices.

---

## Features

### User Management
- User registration and login with secure authentication
- JWT token-based session management
- User profile management
- Password hashing with bcrypt-compatible algorithms

### Project Management
- Create, view, update, and delete projects
- Ownership-based access control
- Project descriptions and metadata
- Organize tasks within projects

### Task Management
- Create tasks within projects
- Task status tracking (To Do, In Progress, Completed)
- Task priority levels (Low, Medium, High)
- Task assignments and due dates
- Task descriptions and metadata

### Data Integrity
- Soft delete functionality for data preservation
- Audit timestamps (created_at, updated_at)
- Cascade deletes with proper constraints
- Foreign key relationships

### Production-Ready
- Live deployment (Vercel + Railway)
- Comprehensive API documentation (OpenAPI/Swagger UI, ReDoc)
- Health check endpoints
- Type-safe validation with Pydantic
- Full TypeScript interface definitions

---

## Tech Stack

### Frontend
| Component | Technology | Version |
|-----------|-----------|---------|
| **UI Framework** | React | 18.2.0 |
| **Language** | TypeScript | 5.3.2 |
| **Build Tool** | Vite | 5.0.0 |
| **Routing** | React Router | 6.14.1 |
| **State Management** | TanStack React Query | 5.9.0 |
| **HTTP Client** | Axios | 1.6.0 |
| **Testing** | Vitest | 1.0.0 |
| **Test Library** | React Testing Library | 14.1.0 |
| **Hosting** | Vercel | - |

### Backend
| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | FastAPI | 0.129.0 |
| **Web Server** | Uvicorn | 0.40.0 |
| **Language** | Python | 3.13.9 |
| **Database** | PostgreSQL | Latest |
| **ORM** | SQLAlchemy | 2.0.46 |
| **Validation** | Pydantic | 2.12.5 |
| **Authentication** | python-jose (JWT) | 3.5.0 |
| **Password Hashing** | passlib + pbkdf2_sha256 | 1.7.4 |
| **Testing** | pytest | 9.0.2 |
| **Hosting** | Railway | - |

---

## Getting Started

### Prerequisites

- **For Full Stack**: Git, Node.js 16+, Python 3.13.9+
- **Backend Only**: Python 3.13.9+, PostgreSQL or SQLite
- **Frontend Only**: Node.js 16+

### Full System Setup

#### 1. Clone Repository

```bash
git clone https://github.com/dylanmckay04/pulsepm.git
cd pulsepm
```

#### 2. Setup Backend

```bash
cd app
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
cd ..
pip install -r requirements.txt
```

Create `.env` file in project root:
```
DATABASE_URL=sqlite:///./test.db
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

#### 3. Setup Frontend

```bash
cd frontend
npm install
```

#### 4. Run Both Services

**Terminal 1 - Backend:**
```bash
uvicorn app.main:app --reload
# Runs on http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

#### 5. Access the Application

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Project Structure

```
pulsepm/
├── app/                        # FastAPI backend
│   ├── api/                    # Route handlers
│   ├── models/                 # SQLAlchemy ORM models
│   ├── schemas/                # Pydantic validation
│   ├── core/                   # Config, security, dependencies
│   ├── database.py             # Database setup
│   └── main.py                 # FastAPI app
├── frontend/                   # React TypeScript frontend
│   ├── src/
│   │   ├── api/                # Axios configuration
│   │   ├── auth/               # Authentication context
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── test/               # Test files
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── tests/                      # Backend integration tests
├── alembic/                    # Database migrations
├── requirements.txt            # Python dependencies
├── README.md                   # This file
└── Dockerfile*                 # Docker configuration

See [Backend README](./app/README.md) for backend-specific architecture details.
```

---

## Frontend Development

### Running the Frontend

```bash
cd frontend
npm run dev
```

### Building for Production

```bash
npm run build   # Creates optimized build
npm run preview # Preview production build
```

### Testing

```bash
npm run test       # Run all tests
npm run test:ui    # Run tests in UI mode
```

### Project Structure

- **`src/pages/`**: Main page components (Login, Projects, Tasks, etc.)
- **`src/components/`**: Reusable UI components
- **`src/auth/`**: Authentication context provider
- **`src/api/`**: Axios client configuration
- **`src/types.ts`**: TypeScript interfaces

### Frontend Features

- JWT token-based authentication
- Protected routes via AuthProvider
- React Query for server state management
- React Router for navigation
- Vitest for unit and integration tests
- TypeScript for type safety

---

## Backend Development

For detailed backend documentation, see [Backend README](./app/README.md).

### Quick Start

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### API Endpoints

- **Users**: `/users/register`, `/users/login`, `/users/me`
- **Projects**: `/projects/` (CRUD operations)
- **Tasks**: `/tasks/` (CRUD operations)
- **Health**: `/health`

### Interactive Documentation

Visit http://localhost:8000/docs (OpenAPI/Swagger UI) or http://localhost:8000/redoc for full API documentation.

---

## Deployment

### Frontend - Vercel

The frontend is deployed on Vercel:
1. Connect your GitHub repository to Vercel
2. Vercel automatically detects the React/Vite setup
3. Set environment variable: `VITE_API_URL=YOUR_API_HOST_URL`
4. Deployments trigger on push to main branch

**Live URL**: https://pulsepm.vercel.app

### Backend - Railway

The backend is deployed on Railway with PostgreSQL:
1. Connect GitHub repository
2. Railway detects `Procfile` and `runtime.txt`
3. Release command runs Alembic migrations
4. Production environment variables configured in Railway dashboard
5. Deployments trigger on push to main branch

**Live URL**: https://web-production-8f59b.up.railway.app

### Environment Variables

**Railway (Production Backend)**
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: Strong secret for JWT signing
- `ALGORITHM`: HS256
- `ACCESS_TOKEN_EXPIRE_MINUTES`: 30

**Vercel (Production Frontend)**
- `VITE_API_URL`: Backend API base URL

---

## Testing

### Backend Testing

```bash
pytest -v                          # Run all tests with verbose output
pytest tests/test_api.py -v       # Run specific test file
pytest --cov=app tests/           # Run with coverage report
```

### Frontend Testing

```bash
npm run test                # Run all tests
npm run test:ui             # Interactive test UI
```

---

## Performance & Monitoring

### Backend Performance
- FastAPI async endpoints handle concurrent requests efficiently
- PostgreSQL with indexed queries for fast lookups
- Railway auto-scaling for load distribution
- Response times typically <100ms

### Frontend Performance  
- Vite for fast builds
- React Query for efficient caching and synchronization
- Vercel edge network for fast global delivery
- TypeScript prevents runtime errors

---

## Security

### Authentication
- JWT Bearer tokens with configurable expiration
- bcrypt-compatible password hashing
- Secure token storage in browser (localStorage with HTTPS)

### Authorization
- Ownership-based access control (users own projects)
- Protected routes on frontend
- Authorization checks on all backend API endpoints

### Production Security
- HTTPS enforced on Railway and Vercel
- Environment-based secret management
- CORS properly configured
- Type-safe validation with Pydantic and TypeScript

---

## Future Roadmap

### Phase 2 - Collaboration
- [ ] Project collaborators and permissions
- [ ] Shared team workspaces
- [ ] User roles (admin, member, viewer)
- [ ] Activity logs and audit trails

### Phase 3 - Advanced Features
- [ ] Task comments and discussions
- [ ] File attachments to tasks
- [ ] Recurring tasks
- [ ] Custom task fields
- [ ] Kanban board view

### Phase 4 - Integration & Notifications
- [ ] Email notifications for task assignments
- [ ] Webhook support
- [ ] Third-party integrations (Slack, GitHub)
- [ ] Task reminders

### Phase 5 - Analytics & Reporting
- [ ] Project analytics dashboard
- [ ] Task completion metrics
- [ ] Team productivity Reports
- [ ] Data export (CSV, JSON)

---

## Learning Resources

This project demonstrates:
- **FastAPI**: Modern Python web framework with async support
- **React**: Component-based UI with hooks
- **TypeScript**: Type-safe JavaScript development
- **PostgreSQL**: Production-grade relational database
- **JWT Authentication**: Stateless session management
- **Deployment**: Cloud-native hosting on Vercel and Railway
- **Full-Stack Development**: End-to-end feature development

---

## License

This project is part of a portfolio and is available for reference.

---

## Contact

Built by Dylan McKay as a portfolio demonstration of full-stack web development capabilities.

**GitHub Profile**: https://github.com/dylanmckay04/