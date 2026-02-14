# Project Management API

A REST API for managing projects and tasks, built with FastAPI and PostgreSQL. This API includes modern RESTful design and secure authentication.

**Live Demo:** https://web-production-8f59b.up.railway.app

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)
- [Future Improvements](#future-improvements)

---

## ✨ Features

### Core Functionality
- **User Management**: Registration, authentication, profile management
- **Projects**: Create, read, update, delete projects with ownership-based access control
- **Tasks**: Manage tasks within projects with status and priority tracking
- **Soft Deletes**: Preserve data integrity with soft delete (is_active flag)

### Security & Authentication
- **JWT Bearer Token Authentication**: Secure token-based access
- **Password Hashing**: bcrypt-compatible pbkdf2_sha256 algorithm
- **Authorization Checks**: Ownership validation on protected resources
- **Environment-based Configuration**: Secure secrets management with validation

### Production-Ready
- **Live Deployment**: Running on Railway with PostgreSQL
- **API Documentation**: Auto-generated Swagger UI and ReDoc
- **Health Checks**: Endpoint monitoring support
- **Type Safety**: Full Pydantic validation and SQLAlchemy ORM typing

---

## 🛠 Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | FastAPI | 0.129.0 |
| **Web Server** | Uvicorn | 0.40.0 |
| **Database** | PostgreSQL / SQLite | Latest |
| **ORM** | SQLAlchemy | 2.0.46 |
| **Validation** | Pydantic | 2.12.5 |
| **Authentication** | python-jose (JWT) | 3.5.0 |
| **Password Hashing** | passlib + pbkdf2_sha256 | 1.7.4 |
| **Testing** | pytest | 9.0.2 |
| **Language** | Python | 3.13.9 |

---

## 🏗 Architecture

### Layered Design

```
Request → Route (API Layer) → Schema (Validation) → Model (ORM) → Database
                    ↓
            Dependency Injection
            (Authentication, DB Sessions)
                    ↓
            Security/Core Layer
            (JWT, Password Hashing, Config)
```

### Directory Structure

```
project_management_api/
├── app/
│   ├── api/                    # Route handlers
│   │   ├── users.py           # User endpoints
│   │   ├── projects.py        # Project endpoints
│   │   ├── tasks.py           # Task endpoints
│   │   └── __init__.py
│   ├── models/                 # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── task.py
│   │   └── __init__.py
│   ├── schemas/                # Pydantic validation schemas
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── task.py
│   │   └── __init__.py
│   ├── core/                   # Core utilities
│   │   ├── config.py          # Settings & environment management
│   │   ├── security.py        # JWT & password hashing
│   │   ├── dependencies.py    # Dependency injection
│   │   └── __init__.py
│   ├── database.py            # Database connection & session management
│   └── main.py                # FastAPI app initialization
├── tests/
│   └── test_api.py            # Integration tests
├── conftest.py                # Pytest configuration
├── requirements.txt           # Python dependencies
├── Procfile                   # Railway deployment config
├── runtime.txt                # Python version
├── .env                       # Environment variables (not in Git)
├── .gitignore
└── README.md
```

### Data Model

```
User (1) ──< (Many) Project
  │
  └──< (Many) Task (assigned_to)

Project (1) ──< (Many) Task
```

**Key Relationships:**
- Users own Projects (cascade delete)
- Projects contain Tasks (cascade delete)
- Tasks can be assigned to Users
- Soft deletes preserve historical data

---

## 🚀 Getting Started

### Prerequisites

- Python 3.13.9+
- PostgreSQL (for production) or SQLite (for development)
- Git

### Local Development Setup

#### 1. Clone Repository

```bash
git clone https://github.com/yourusername/project_management_api.git
cd project_management_api
```

#### 2. Create Virtual Environment

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

#### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

#### 4. Create `.env` File

Add to `.env`:
```
DATABASE_URL=sqlite:///./test.db
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**For PostgreSQL (Production):**
```
DATABASE_URL=postgresql://user:password@localhost:5432/project_management
```

#### 5. Run the API

```bash
uvicorn app.main:app --reload
```

Server runs on: `http://localhost:8000`

#### 6. Access Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 📚 API Documentation

### Base URL

**Production**: `https://web-production-8f59b.up.railway.app`

**Local**: `http://localhost:8000`

### Authentication

All protected endpoints require a Bearer token:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://web-production-8f59b.up.railway.app/users/me
```

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/users/register` | Register new user | ❌ |
| POST | `/users/login` | Login (returns JWT token) | ❌ |
| GET | `/users/me` | Get current user profile | ✅ |
| GET | `/users/{user_id}` | Get user by ID | ✅ |
| PUT | `/users/{user_id}` | Update user profile | ✅ |
| DELETE | `/users/me` | Soft delete current user | ✅ |

**Example: Register**

```bash
curl -X POST "https://web-production-8f59b.up.railway.app/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "full_name": "John Doe",
    "password": "SecurePassword123"
  }'
```

**Example: Login**

```bash
curl -X POST "https://web-production-8f59b.up.railway.app/users/login?email=user@example.com&password=SecurePassword123"
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Project Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/projects/` | Create project | ✅ |
| GET | `/projects/` | List user's projects | ✅ |
| GET | `/projects/{project_id}` | Get project details | ✅ |
| PUT | `/projects/{project_id}` | Update project | ✅ |
| DELETE | `/projects/{project_id}` | Delete project | ✅ |

**Example: Create Project**

```bash
curl -X POST "https://web-production-8f59b.up.railway.app/projects/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Website Redesign",
    "description": "Redesign company website"
  }'
```

### Task Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/tasks/` | Create task | ✅ |
| GET | `/tasks/` | List tasks (filterable) | ✅ |
| GET | `/tasks/{task_id}` | Get task details | ✅ |
| PUT | `/tasks/{task_id}` | Update task | ✅ |
| DELETE | `/tasks/{task_id}` | Delete task | ✅ |

**Example: Create Task**

```bash
curl -X POST "https://web-production-8f59b.up.railway.app/tasks/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Design homepage",
    "description": "Create mockups for homepage",
    "project_id": 1,
    "priority": "high",
    "status": "todo"
  }'
```

**Example: List Tasks with Filters**

```bash
# Filter by project
curl "https://web-production-8f59b.up.railway.app/tasks/?project_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by status
curl "https://web-production-8f59b.up.railway.app/tasks/?status=in_progress" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Full Interactive Documentation

Visit https://web-production-8f59b.up.railway.app/docs to test all endpoints interactively with Swagger UI.

---

## 📁 Project Structure Details

### Models (`app/models/`)

**User Model**
- Email (unique, indexed)
- Full name
- Password hash (never exposed)
- is_active flag (soft delete)
- Relationships: owns Projects, assigned Tasks

**Project Model**
- Name, description
- owner_id (FK to User)
- Cascade delete tasks when project deleted
- Timestamps: created_at, updated_at

**Task Model**
- Title, description
- Status enum: TODO, IN_PROGRESS, COMPLETED
- Priority enum: LOW, MEDIUM, HIGH
- project_id (FK to Project)
- assigned_to (optional FK to User)
- Timestamps: created_at, updated_at

### Schemas (`app/schemas/`)

Pydantic models for validation and serialization:
- **Create schemas**: Input validation (request bodies)
- **Update schemas**: Optional fields for partial updates
- **Read schemas**: Output models (never expose password_hash)
- **Detailed schemas**: Include related data (nested objects)

### Routes (`app/api/`)

FastAPI APIRouter instances:
- Dependency injection for authentication
- Ownership checks for authorization
- Proper HTTP status codes (201 for creation, 204 for deletion)
- Error handling with meaningful messages

### Core (`app/core/`)

**config.py**
- Environment variable management
- Pydantic Settings with validation
- Production detection and startup checks
- Secure handling of secrets (SecretStr)

**security.py**
- Password hashing and verification
- JWT token creation and validation
- Token expiration handling

**dependencies.py**
- FastAPI dependency injection functions
- Authentication flow (extract token → validate → fetch user)
- Request-scoped database sessions

### Database (`app/database.py`)

- SQLAlchemy engine initialization
- Session management
- Base model for all ORM models
- get_db() dependency for injecting DB sessions

---

## 🧪 Testing

### Run Tests

```bash
pytest -q
```

### Test Structure

Current test (`tests/test_api.py`):
- Full flow integration test
- Covers: registration → login → create project → create task
- Verifies JWT authentication works end-to-end

### Expand Tests

```bash
# Run with verbose output
pytest -v

# Run specific test
pytest tests/test_api.py::test_full_flow -v

# Run with coverage
pytest --cov=app tests/
```

---

## 🌐 Deployment

### Live Deployment (Railway)

This API is deployed on **Railway** with:
- **Web Service**: Running FastAPI with Uvicorn
- **PostgreSQL Database**: Persistently stored data
- **Auto-deploy**: Updates trigger on GitHub push
- **Logs**: Available in Railway dashboard

**URL**: https://web-production-8f59b.up.railway.app

## 🔐 Security Considerations

### Implemented

✅ Password hashing with pbkdf2_sha256
✅ JWT token-based authentication
✅ Bearer token extraction and validation
✅ Ownership-based authorization
✅ Secure config management (SecretStr for secrets)
✅ Environment variable validation at startup
✅ HTTP status codes indicate auth failures (401, 403)

## 📊 Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR NOT NULL,
  password_hash VARCHAR NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME,
  updated_at DATETIME
);
```

### Projects Table

```sql
CREATE TABLE projects (
  id INTEGER PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  owner_id INTEGER FOREIGN KEY REFERENCES users(id),
  created_at DATETIME,
  updated_at DATETIME
);
```

### Tasks Table

```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  project_id INTEGER FOREIGN KEY REFERENCES projects(id),
  assigned_to INTEGER FOREIGN KEY REFERENCES users(id),
  status ENUM (todo, in_progress, completed),
  priority ENUM (low, medium, high),
  due_date DATETIME,
  created_at DATETIME,
  updated_at DATETIME
);
```

---

## 📈 Performance & Scaling

### Current Performance

- **Response Time**: <100ms for most endpoints (Railway + PostgreSQL)
- **Concurrent Users**: Hundreds (Uvicorn + async FastAPI)
- **Database**: PostgreSQL handles typical workloads

### Scaling Strategies

- **Horizontal**: Multiple Railway replicas
- **Database**: PostgreSQL read replicas
- **API Gateway**: Cloudflare or similar for rate limiting/DDoS
- **Monitoring**: New Relic, DataDog for observability

---

## 🔜 Future Improvements

### High Priority

- [ ] **Refresh Tokens**: Implement token refresh for better UX
- [ ] **Pagination**: Add limit/offset for list endpoints
- [ ] **Search**: Full-text search on projects/tasks
- [ ] **Filtering**: Advanced filtering (date ranges, multiple statuses)
- [ ] **More Tests**: Edge cases, error scenarios, auth failures

### Medium Priority

- [ ] **Alembic Migrations**: Database schema versioning
- [ ] **GitHub Actions CI/CD**: Auto-run tests on push
- [ ] **Docker**: Containerize for consistent deployments
- [ ] **Frontend**: React/Vue app consuming this API
- [ ] **Rate Limiting**: Prevent abuse

### Nice to Have

- [ ] **Comments**: Add comments to tasks
- [ ] **Labels/Tags**: Categorize projects/tasks
- [ ] **User Roles**: Admin, team lead, member roles
- [ ] **Webhooks**: Notify external services on events
- [ ] **Export**: CSV/JSON export of projects/tasks
- [ ] **API Versioning**: Support `/v2/` routes for backward compatibility

---

## 📝 License

This project is open source and available under the MIT License.

---

## 👤 Author

Built as a portfolio project by Dylan McKay, demonstrating full-stack API development with modern technologies.

---

## 📧 Support

For issues or questions:
1. Check existing GitHub issues
2. Review API documentation at `/docs`
3. Check application logs in Railway dashboard

---
