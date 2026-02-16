# Backend API Documentation

This is the FastAPI backend for Pulse PM, a project management application. For the main project documentation, see the [root README](../README.md).

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database](#database)
- [Authentication & Security](#authentication--security)
- [Testing](#testing)
- [Deployment](#deployment)
- [Development Guide](#development-guide)

---

## Overview

This FastAPI backend provides a RESTful API for project and task management. It implements:

- **MVC-like Architecture**: Separation of routes, schemas, models, and database
- **JWT Authentication**: Stateless bearer token auth with configurable expiration
- **Type Safety**: Full Pydantic validation and SQLAlchemy ORM typing
- **Clean Code**: Well-organized layers with dependency injection
- **Production Ready**: Running on Railway with PostgreSQL

### Live API

**Production**: https://web-production-8f59b.up.railway.app  
**API Docs**: https://web-production-8f59b.up.railway.app/docs

---

## Architecture

### Layered Design

```
Request → Route Handler (api/)
           ↓
       Dependency Injection (core/dependencies.py)
       - Authentication
       - Database Session
           ↓
       Business Logic (implicit in route handlers)
           ↓
       Schema Validation (schemas/)
       - Input validation (create/update)
       - Output serialization
           ↓
       ORM Models (models/)
           ↓
       Database Layer (database.py)
```

### Data Flow

```
Client HTTP Request
    ↓
FastAPI Route Handler
    ↓
Extract & Validate Input (Pydantic Schemas)
    ↓
Check Authentication & Authorization
    ↓
Execute Business Logic
    ↓
Interact with Database (SQLAlchemy ORM)
    ↓
Return Response (Pydantic Schema)
    ↓
Client HTTP Response
```

### Core Components

| Component | Purpose | Location |
|-----------|---------|----------|
| **Routes/APIs** | HTTP request handlers | `api/` |
| **Models** | Database ORM definitions | `models/` |
| **Schemas** | Request/response validation | `schemas/` |
| **Core/Config** | Settings, environment vars | `core/config.py` |  
| **Core/Security** | JWT, password hashing | `core/security.py` |
| **Core/Dependencies** | FastAPI dependency injection | `core/dependencies.py` |
| **Database** | SQLAlchemy setup | `database.py` |
| **Main** | FastAPI app initialization | `main.py` |

---

## Tech Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | FastAPI | 0.129.0 | Web framework |
| **Server** | Uvicorn | 0.40.0 | ASGI server |
| **Language** | Python | 3.13.9 | Backend language |
| **Database** | PostgreSQL | Latest | Production database |
| **ORM** | SQLAlchemy | 2.0.46 | Database abstraction |
| **Validation** | Pydantic | 2.12.5 | Input/output validation |
| **Auth** | python-jose | 3.5.0 | JWT token handling |
| **Hashing** | passlib | 1.7.4 | Password hashing |
| **Testing** | pytest | 9.0.2 | Testing framework |
| **Driver** | psycopg2-binary | 2.9.11 | PostgreSQL driver |

---

## Getting Started

### Prerequisites

- Python 3.13.9+
- PostgreSQL (production) or SQLite (development)
- pip and virtualenv

### Local Development Setup

#### 1. Create Virtual Environment

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
```

#### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

#### 3. Create `.env` File

In project root:
```env
DATABASE_URL=sqlite:///./test.db
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=true
```

#### 4. Run the Server

```bash
uvicorn app.main:app --reload
```

Server starts on `http://localhost:8000`

#### 5. View API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

---

## Project Structure

```
app/
├── api/                        # Route handlers (APIRouter instances)
│   ├── __init__.py            # Exports routers
│   ├── users.py               # User authentication endpoints
│   ├── projects.py            # Project CRUD endpoints
│   └── tasks.py               # Task CRUD endpoints
│
├── models/                     # SQLAlchemy ORM models
│   ├── __init__.py
│   ├── user.py                # User model with relationships
│   ├── project.py             # Project model
│   └── task.py                # Task model with enums
│
├── schemas/                    # Pydantic validation models
│   ├── __init__.py
│   ├── user.py                # User request/response schemas
│   ├── project.py             # Project schemas
│   └── task.py                # Task schemas
│
├── core/                       # Core utilities & configuration
│   ├── __init__.py
│   ├── config.py              # Environment & settings management
│   ├── security.py            # JWT & password functions
│   └── dependencies.py        # FastAPI dependency injection
│
├── database.py                 # Database connection & session
├── main.py                     # FastAPI app initialization
└── README.md                   # This file
```

---

## API Documentation

### Base URL

| Environment | URL |
|-------------|-----|
| **Development** | http://localhost:8000 |
| **Production** | https://web-production-8f59b.up.railway.app |

### Authentication

All protected endpoints require a Bearer token:

```bash
Authorization: Bearer <JWT_TOKEN>
```

Get a token by logging in:

```bash
curl -X POST "http://localhost:8000/users/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### User Endpoints

#### Register

```
POST /users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "full_name": "John Doe",
  "password": "SecurePassword123"
}

Response: 201 Created
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "created_at": "2024-02-15T...",
  "updated_at": "2024-02-15T..."
}
```

**Status Codes:**
- `201`: User created successfully
- `400`: Email already registered or invalid input

#### Login

```
POST /users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}

Response: 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Status Codes:**
- `200`: Login successful
- `401`: Invalid email or password

#### Get Current User

```
GET /users/me
Authorization: Bearer <TOKEN>

Response: 200 OK
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "is_active": true,
  "created_at": "2024-02-15T...",
  "updated_at": "2024-02-15T..."
}
```

**Status Codes:**
- `200`: Success
- `401`: Missing or invalid token

#### Get User by ID

```
GET /users/{user_id}
Authorization: Bearer <TOKEN>

Response: 200 OK
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "is_active": true,
  "created_at": "2024-02-15T...",
  "updated_at": "2024-02-15T..."
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `404`: User not found

### Project Endpoints

#### Create Project

```
POST /projects/
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "Website Redesign",
  "description": "Redesign company website"
}

Response: 201 Created
{
  "id": 1,
  "name": "Website Redesign",
  "description": "Redesign company website",
  "owner_id": 1,
  "created_at": "2024-02-15T...",
  "updated_at": "2024-02-15T..."
}
```

**Status Codes:**
- `201`: Project created
- `401`: Unauthorized
- `422`: Validation error

#### List User's Projects

```
GET /projects/
Authorization: Bearer <TOKEN>

Response: 200 OK
[
  {
    "id": 1,
    "name": "Website Redesign",
    "description": "Redesign company website",
    "owner_id": 1,
    "created_at": "2024-02-15T...",
    "updated_at": "2024-02-15T..."
  }
]
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized

#### Get Project by ID

```
GET /projects/{project_id}
Authorization: Bearer <TOKEN>

Response: 200 OK
{
  "id": 1,
  "name": "Website Redesign",
  "description": "Redesign company website",
  "owner_id": 1,
  "tasks": [...],
  "created_at": "2024-02-15T...",
  "updated_at": "2024-02-15T..."
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `403`: Forbidden (not owner)
- `404`: Project not found

#### Update Project

```
PUT /projects/{project_id}
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "New Project Name",
  "description": "Updated description"
}

Response: 200 OK
{
  "id": 1,
  "name": "New Project Name",
  "description": "Updated description",
  "owner_id": 1,
  "created_at": "2024-02-15T...",
  "updated_at": "2024-02-15T..."
}
```

**Status Codes:**
- `200`: Updated successfully
- `401`: Unauthorized
- `403`: Forbidden (not owner)
- `404`: Project not found

#### Delete Project

```
DELETE /projects/{project_id}
Authorization: Bearer <TOKEN>

Response: 204 No Content
```

**Status Codes:**
- `204`: Deleted successfully
- `401`: Unauthorized
- `403`: Forbidden (not owner)
- `404`: Project not found

### Task Endpoints

#### Create Task

```
POST /tasks/
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "title": "Design homepage",
  "description": "Create mockups for homepage",
  "project_id": 1,
  "priority": "high",
  "status": "todo"
}

Response: 201 Created
{
  "id": 1,
  "title": "Design homepage",
  "description": "Create mockups for homepage",
  "project_id": 1,
  "assigned_to": null,
  "status": "todo",
  "priority": "high",
  "due_date": null,
  "created_at": "2024-02-15T...",
  "updated_at": "2024-02-15T..."
}
```

**Valid Values:**
- `status`: `"todo"`, `"in_progress"`, `"completed"`
- `priority`: `"low"`, `"medium"`, `"high"`

**Status Codes:**
- `201`: Task created
- `401`: Unauthorized
- `404`: Project not found
- `422`: Validation error

#### List Tasks

```
GET /tasks/
Authorization: Bearer <TOKEN>

Optional Query Parameters:
  ?project_id=1          # Filter by project
  ?status=in_progress    # Filter by status
  ?priority=high         # Filter by priority

Response: 200 OK
[
  {
    "id": 1,
    "title": "Design homepage",
    "description": "Create mockups for homepage",
    "project_id": 1,
    "assigned_to": null,
    "status": "todo",
    "priority": "high",
    "due_date": null,
    "created_at": "2024-02-15T...",
    "updated_at": "2024-02-15T..."
  }
]
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized

#### Get Task by ID

```
GET /tasks/{task_id}
Authorization: Bearer <TOKEN>

Response: 200 OK
{
  "id": 1,
  "title": "Design homepage",
  "description": "Create mockups for homepage",
  "project_id": 1,
  "assigned_to": null,
  "status": "todo",
  "priority": "high",
  "due_date": null,
  "created_at": "2024-02-15T...",
  "updated_at": "2024-02-15T..."
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `403`: Forbidden (not owner of project)
- `404`: Task not found

#### Update Task

```
PUT /tasks/{task_id}
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "title": "New title",
  "description": "New description",
  "status": "in_progress",
  "priority": "medium",
  "assigned_to": 2,
  "due_date": "2024-03-01T00:00:00"
}

Response: 200 OK
{
  "id": 1,
  "title": "New title",
  "description": "New description",
  "project_id": 1,
  "assigned_to": 2,
  "status": "in_progress",
  "priority": "medium",
  "due_date": "2024-03-01T00:00:00",
  "created_at": "2024-02-15T...",
  "updated_at": "2024-02-15T..."
}
```

**Status Codes:**
- `200`: Updated successfully
- `401`: Unauthorized
- `403`: Forbidden (not owner of project)
- `404`: Task not found

#### Delete Task

```
DELETE /tasks/{task_id}
Authorization: Bearer <TOKEN>

Response: 204 No Content
```

**Status Codes:**
- `204`: Deleted successfully
- `401`: Unauthorized
- `403`: Forbidden (not owner of project)
- `404`: Task not found

### Health Check

```
GET /health

Response: 200 OK
{
  "status": "healthy"
}
```

---

## Database

### Design

The database uses a relational model with three main tables:

```
┌─────────────────────┐
│       Users         │
├─────────────────────┤
│ id (PK)             │
│ email (UNIQUE)      │
│ full_name           │
│ password_hash       │
│ is_active           │
│ created_at          │
│ updated_at          │
└─────────────────────┘
        │
        │ owns (1:Many)
        │
        └─────────────────────────┐
                                  │
                    ┌─────────────────────────┐
                    │      Projects           │
                    ├─────────────────────────┤
                    │ id (PK)                 │
                    │ name                    │
                    │ description             │
                    │ owner_id (FK) ──────────┼──→ Users.id
                    │ created_at              │
                    │ updated_at              │
                    └─────────────────────────┘
                            │
                            │ contains (1:Many)
                            │
                ┌───────────────────────────────┐
                │         Tasks                 │
                ├───────────────────────────────┤
                │ id (PK)                       │
                │ title                         │
                │ description                   │
                │ project_id (FK) ─────────────→ Projects.id
                │ assigned_to (FK) ────────────→ Users.id
                │ status (Enum)                 │
                │ priority (Enum)               │
                │ due_date                      │
                │ created_at                    │
                │ updated_at                    │
                └───────────────────────────────┘
```

### Schema

#### Users Table

```python
class User(Base):
    __tablename__ = "users"
    
    id: Integer (Primary Key)
    email: String(unique, indexed)
    full_name: String
    password_hash: String
    is_active: Boolean = True
    created_at: DateTime (auto-set)
    updated_at: DateTime (auto-update)
    
    # Relationships
    projects: List[Project]  # One-to-many
    tasks: List[Task]         # One-to-many (assigned_to)
```

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR NOT NULL,
  password_hash VARCHAR NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Projects Table

```python
class Project(Base):
    __tablename__ = "projects"
    
    id: Integer (Primary Key)
    name: String(indexed)
    description: Text
    owner_id: Integer (Foreign Key → Users.id)
    created_at: DateTime (auto-set)
    updated_at: DateTime (auto-update)
    
    # Relationships
    owner: User (Many-to-one)
    tasks: List[Task]  # One-to-many (cascade delete)
```

```sql
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR NOT NULL,
  description TEXT,
  owner_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);
```

#### Tasks Table

```python
class Task(Base):
    __tablename__ = "tasks"
    
    id: Integer (Primary Key)
    title: String(indexed)
    description: Text
    project_id: Integer (Foreign Key → Projects.id)
    assigned_to: Integer (Foreign Key → Users.id, nullable)
    status: Enum = TaskStatus.TODO
    priority: Enum = TaskPriority.MEDIUM
    due_date: DateTime (nullable)
    created_at: DateTime (auto-set)
    updated_at: DateTime (auto-update)
    
    # Relationships
    project: Project (Many-to-one)
    assigned_user: User (Many-to-one)
```

```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR NOT NULL,
  description TEXT,
  project_id INTEGER NOT NULL,
  assigned_to INTEGER,
  status VARCHAR DEFAULT 'todo',
  priority VARCHAR DEFAULT 'medium',
  due_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);
```

### Migrations

Database migrations are managed with **Alembic**:

```bash
# Create a new migration
alembic revision --autogenerate -m "Add new field"

# Apply migrations
alembic upgrade head

# Revert last migration
alembic downgrade -1
```

Migrations run automatically on Railway via the `release` command in `Procfile`:
```
release: alembic upgrade head
```

---

## Authentication & Security

### JWT Authentication

1. **User provides credentials** (email + password)
2. **Backend validates** password against hash
3. **Backend creates JWT token** containing user ID and issued time
4. **Client stores token** in localStorage or secure cookie
5. **Client includes token** in `Authorization: Bearer <TOKEN>` header
6. **Backend validates token** on each protected request

### Token Structure

```python
# Token payload
{
  "sub": "user_id",  # Subject (typically user ID)
  "exp": 1708003200  # Expiration time (Unix timestamp)
}

# Signed with SECRET_KEY using HS256 algorithm
```

### Configuration

In `core/config.py`:

```python
secret_key: SecretStr = SecretStr("your-secret-key")
algorithm: str = "HS256"
access_token_expire_minutes: int = 30
```

**Important**: In production, set `SECRET_KEY` to a strong random value:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Password Hashing

Passwords are hashed using **pbkdf2_sha256** via passlib:

```python
# Hashing
hashed = pwd_context.hash("plaintext_password")

# Verification
is_valid = pwd_context.verify("plaintext_password", hashed)
```

### Authorization

Resources are protected with ownership checks:

```python
# Only the owner of a project can modify it
if project.owner_id != current_user.id:
    raise HTTPException(status_code=403, detail="Forbidden")
```

### Security Best Practices Implemented

✅ **Passwords hashed** - Never stored in plaintext  
✅ **JWT tokens** - Stateless, time-limited  
✅ **Dependency injection** - Clean auth flow  
✅ **Ownership checks** - Authorization at endpoint level  
✅ **SecretStr** - Secrets not logged  
✅ **HTTPS** - Required in production (enforced by Railway/Vercel)  
✅ **CORS** - Configured for trusted origins  
✅ **Type validation** - Pydantic prevents injection attacks  

### Security Considerations

⚠️ **TODO - Future Improvements:**

- Implement refresh token rotation
- Add rate limiting on login endpoint
- Add user session management (revoke tokens)
- Implement CSRF protection if adding form-based auth
- Add logging for security events
- Implement API key authentication for service-to-service communication

---

## Testing

### Running Tests

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_api.py

# Run specific test function
pytest tests/test_api.py::test_full_flow

# Run with coverage report
pytest --cov=app tests/
```

### Current Test Coverage

`tests/test_api.py` includes:

- **test_full_flow**: End-to-end user flow (register → login → create project → create task)
- **test_register_duplicate_email**: Validation of duplicate email prevention
- **test_login_invalid_password**: Authentication failure handling

### Test Structure

```python
# Usually follows this pattern:
def test_something():
    # 1. Setup (create user, authenticate, etc.)
    user = register_user(...)
    token = login_user(...)
    
    # 2. Execute (make API call)
    response = client.post("/endpoint", headers=headers, json=data)
    
    # 3. Assert (verify response)
    assert response.status_code == 200
    assert response.json()["key"] == expected_value
```

### Test Client

Tests use FastAPI's `TestClient`:

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Make requests as if calling the API
response = client.post("/users/register", json={...})
```

### Expanding Tests

Recommended additions:

```python
# Test authorization (403 Forbidden)
def test_cannot_access_others_project():
    # User 1 creates project
    # User 2 tries to view it
    # Should get 403

# Test validation (422 Unprocessable Entity)
def test_invalid_email_format():
    # Register with invalid email
    # Should get 422

# Test missing fields
def test_create_project_missing_name():
    # Try to create project without name
    # Should get 422

# Test pagination
def test_list_projects_pagination():
    # Create many projects
    # Test limit/offset parameters

# Test soft deletes
def test_soft_deleted_project_not_returned():
    # Create project
    # Delete it
    # Verify it's not in list
```

---

## Deployment

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn app.main:app --reload

# Runs on http://localhost:8000
```

### Production Deployment (Railway)

The backend is deployed on **Railway** with these steps:

1. **GitHub Integration**: Railway connects to your GitHub repository
2. **Auto-detection**: Railway detects the Python project from `requirements.txt`
3. **Build**: Installs dependencies
4. **Migrations**: Runs `alembic upgrade head` (from Procfile `release` command)
5. **Start**: Runs `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. **Database**: PostgreSQL database provisioned automatically

**Procfile Config:**
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
release: alembic upgrade head
```

**Railway Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string (provided by Railway)
- `SECRET_KEY`: Strong random string for JWT signing
- `ALGORITHM`: HS256
- `ACCESS_TOKEN_EXPIRE_MINUTES`: 30
- `ENVIRONMENT`: production

### Docker

The backend is containerized with Dockerfile.backend:

```bash
# Build image
docker build -f Dockerfile.backend -t pulse-pm-backend .

# Run container
docker run -p 8000:8000 -e DATABASE_URL=postgresql://... pulse-pm-backend
```

### docker-compose

For local testing with PostgreSQL:

```bash
# Start services
docker-compose up

# PostgreSQL runs on localhost:5432
# API runs on localhost:8000
```

---

## Development Guide

### Adding a New Endpoint

1. **Create Model** (`app/models/new_entity.py`)
   ```python
   class NewEntity(Base):
       __tablename__ = "new_entities"
       id = Column(Integer, primary_key=True)
       # ... fields
   ```

2. **Create Schemas** (`app/schemas/new_entity.py`)
   ```python
   class NewEntityCreate(BaseModel):
       # Input fields
       pass
   
   class NewEntityRead(BaseModel):
       # Output fields
       model_config = ConfigDict(from_attributes=True)
   ```

3. **Create Routes** (`app/api/new_entity.py`)
   ```python
   router = APIRouter(prefix="/new-entities", tags=["new-entities"])
   
   @router.post("/", response_model=NewEntityRead, status_code=201)
   async def create(item: NewEntityCreate, db: Session = Depends(get_db)):
       # Create and return
       pass
   ```

4. **Register Router** (`app/main.py`)
   ```python
   from app.api import new_entity_router
   app.include_router(new_entity_router)
   ```

### Adding Validation

Use Pydantic validators:

```python
from pydantic import BaseModel, field_validator

class TaskCreate(BaseModel):
    title: str
    priority: str
    
    @field_validator('title')
    @classmethod
    def title_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip()
```

### Handling Errors

Use FastAPI's HTTPException:

```python
from fastapi import HTTPException

# Not found
raise HTTPException(status_code=404, detail="Project not found")

# Forbidden
raise HTTPException(status_code=403, detail="You don't own this project")

# Bad request
raise HTTPException(status_code=400, detail="Invalid input")
```

### Database Queries

Using SQLAlchemy ORM:

```python
# Create
new_project = Project(name="Test", owner_id=user_id)
db.add(new_project)
db.commit()

# Read
project = db.query(Project).filter(Project.id == 1).first()

# Update
project.name = "Updated"
db.commit()

# Delete
db.delete(project)
db.commit()

# List with filter
projects = db.query(Project).filter(Project.owner_id == user_id).all()
```

### Dependency Injection

Create reusable dependencies:

```python
from fastapi import Depends

# In core/dependencies.py
async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    # Verify token and return user
    pass

# In route
@router.get("/me")
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user
```

---

## Performance Tips

### Database
- Add indexes on frequently queried columns (done for email, id)
- Use lazy loading for relationships when appropriate
- Batch operations when possible

### API
- Return only needed fields in responses
- Implement pagination for large result sets
- Cache responses in frontend with React Query
- Use async endpoints (FastAPI does this by default)

---

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use different port
uvicorn app.main:app --port 8001
```

### Database Connection Error

```bash
# Check DATABASE_URL is set
echo $DATABASE_URL

# For PostgreSQL, verify PostgreSQL is running
psql postgresql://user:password@localhost:5432/dbname
```

### Import Errors

```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Check PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:/path/to/project"
```

### Tests Failing

```bash
# Clear pytest cache
pytest --cache-clear

# Run with full output
pytest -vv -s
```

---

## Contributing

When adding features:

1. Write tests first (TDD)
2. Follow existing code structure
3. Add type hints to functions
4. Update API documentation
5. Run tests before committing

```bash
# Check for issues
pytest -v
black app/  # Format code
```

---

## Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com
- **SQLAlchemy ORM**: https://docs.sqlalchemy.org
- **Pydantic**: https://docs.pydantic.dev
- **JWT**: https://self-issued.info/specs/draft-ietf-oauth-v2-json-web-token.html
- **PostgreSQL**: https://www.postgresql.org/docs/

---

## License

Part of Pulse PM portfolio project.
