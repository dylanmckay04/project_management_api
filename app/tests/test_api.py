from fastapi.testclient import TestClient
from app.main import app
import uuid

client = TestClient(app)


def test_full_flow():
    """Test complete flow: register, login, create project, create task, list tasks"""
    unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    
    # Registration
    r = client.post("/users/register", json={
        "email": unique_email,
        "full_name": "Test User",
        "password": "password123"
    })
    assert r.status_code == 201
    user = r.json()
    assert user["email"] == unique_email
    
    # Login
    r = client.post("/users/login", json={
        "email": unique_email,
        "password": "password123"
    })
    assert r.status_code == 200
    data = r.json()
    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create project
    r = client.post("/projects/", headers=headers, json={"name": "Demo Project", "description": "example desc"})
    assert r.status_code == 201
    project = r.json()
    project_id = project["id"]
    
    # Create task
    r = client.post("/tasks/", headers=headers, json={"title": "Task1", "project_id": project_id})
    assert r.status_code == 201
    task = r.json()
    assert task["title"] == "Task1"
    
    # List tasks
    r = client.get("/tasks/", headers=headers)
    assert r.status_code == 200
    tasks = r.json()
    assert any(t["id"] == task["id"] for t in tasks)


def test_register_duplicate_email():
    """Test that registering with duplicate email returns 400 error"""
    unique_email = f"duplicate_{uuid.uuid4().hex[:8]}@example.com"
    
    # Register first user
    r = client.post("/users/register", json={
        "email": unique_email,
        "full_name": "First User",
        "password": "password123"
    })
    assert r.status_code == 201
    
    # Try to register with same email
    r = client.post("/users/register", json={
        "email": unique_email,
        "full_name": "Second User",
        "password": "password123"
    })
    assert r.status_code == 400
    assert "Email already registered" in r.json()["detail"]


def test_login_invalid_password():
    """Test that logging in with invalid password returns 401 error"""
    unique_email = f"login_{uuid.uuid4().hex[:8]}@example.com"
    
    # Register user
    r = client.post("/users/register", json={
        "email": unique_email,
        "full_name": "Test User",
        "password": "correctpassword123"
    })
    assert r.status_code == 201
    
    # Try to login with wrong password
    r = client.post("/users/login", json={
        "email": unique_email,
        "password": "wrongpassword"
    })
    assert r.status_code == 401
    assert "Invalid email or password" in r.json()["detail"]
    
    # Try to login with correct password (should work)
    r = client.post("/users/login", json={
        "email": unique_email,
        "password": "correctpassword123"
    })
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_authorization_checks():
    """Test that users can't access other users' projects"""
    # Create two users
    user1_email = f"user1_{uuid.uuid4().hex[:8]}@example.com"
    user2_email = f"user2_{uuid.uuid4().hex[:8]}@example.com"
    
    # Register user 1
    r = client.post("/users/register", json={
        "email": user1_email,
        "full_name": "User 1",
        "password": "password123"
    })
    assert r.status_code == 201
    
    # Register user 2
    r = client.post("/users/register", json={
        "email": user2_email,
        "full_name": "User 2",
        "password": "password123"
    })
    assert r.status_code == 201
    
    # Login user 1 and get token
    r = client.post("/users/login", json={
        "email": user1_email,
        "password": "password123"
    })
    user1_token = r.json()["access_token"]
    user1_headers = {"Authorization": f"Bearer {user1_token}"}
    
    # Login user 2 and get token
    r = client.post("/users/login", json={
        "email": user2_email,
        "password": "password123"
    })
    user2_token = r.json()["access_token"]
    user2_headers = {"Authorization": f"Bearer {user2_token}"}
    
    # User 1 creates a project
    r = client.post("/projects/", headers=user1_headers, json={
        "name": "User 1's Project",
        "description": "Private project"
    })
    assert r.status_code == 201
    project_id = r.json()["id"]
    
    # User 1 can see their own project
    r = client.get("/projects/", headers=user1_headers)
    assert r.status_code == 200
    projects = r.json()
    assert any(p["id"] == project_id for p in projects)
    
    # User 2 cannot see user 1's project
    r = client.get("/projects/", headers=user2_headers)
    assert r.status_code == 200
    projects = r.json()
    assert not any(p["id"] == project_id for p in projects)
    
    # User 2 cannot access user 1's project directly
    r = client.get(f"/projects/{project_id}", headers=user2_headers)
    assert r.status_code == 404


def test_task_filtering_by_status():
    """Test that task list can be filtered by status"""
    unique_email = f"status_{uuid.uuid4().hex[:8]}@example.com"
    
    # Register and login
    r = client.post("/users/register", json={
        "email": unique_email,
        "full_name": "Status Test User",
        "password": "password123"
    })
    assert r.status_code == 201
    
    r = client.post("/users/login", json={
        "email": unique_email,
        "password": "password123"
    })
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create project
    r = client.post("/projects/", headers=headers, json={
        "name": "Status Test Project",
        "description": "Project for status filtering"
    })
    assert r.status_code == 201
    project_id = r.json()["id"]
    
    # Create tasks with different statuses
    r = client.post("/tasks/", headers=headers, json={
        "title": "Todo Task",
        "project_id": project_id,
        "status": "todo"
    })
    assert r.status_code == 201
    
    r = client.post("/tasks/", headers=headers, json={
        "title": "In Progress Task",
        "project_id": project_id,
        "status": "in_progress"
    })
    assert r.status_code == 201
    
    r = client.post("/tasks/", headers=headers, json={
        "title": "Completed Task",
        "project_id": project_id,
        "status": "completed"
    })
    assert r.status_code == 201
    
    # Test filtering by todo status
    r = client.get("/tasks/?task_status=todo", headers=headers)
    assert r.status_code == 200
    tasks = r.json()
    assert all(t["status"] == "todo" for t in tasks)
    assert any(t["title"] == "Todo Task" for t in tasks)
    
    # Test filtering by in_progress status
    r = client.get("/tasks/?task_status=in_progress", headers=headers)
    assert r.status_code == 200
    tasks = r.json()
    assert all(t["status"] == "in_progress" for t in tasks)
    assert any(t["title"] == "In Progress Task" for t in tasks)
    
    # Test filtering by completed status
    r = client.get("/tasks/?task_status=completed", headers=headers)
    assert r.status_code == 200
    tasks = r.json()
    assert all(t["status"] == "completed" for t in tasks)
    assert any(t["title"] == "Completed Task" for t in tasks)
    
    # Test invalid status returns error
    r = client.get("/tasks/?task_status=invalid_status", headers=headers)
    assert r.status_code == 400
    assert "Invalid status" in r.json()["detail"]


def test_soft_delete_functionality():
    """Test that deleted users are marked as inactive and cannot login"""
    unique_email = f"delete_{uuid.uuid4().hex[:8]}@example.com"
    
    # Register user
    r = client.post("/users/register", json={
        "email": unique_email,
        "full_name": "Delete Test User",
        "password": "password123"
    })
    assert r.status_code == 201
    
    # Login to get token
    r = client.post("/users/login", json={
        "email": unique_email,
        "password": "password123"
    })
    assert r.status_code == 200
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # User can access protected endpoints while active
    r = client.get("/users/me", headers=headers)
    assert r.status_code == 200
    user = r.json()
    assert user["is_active"] is True
    
    # Delete user (soft delete)
    r = client.delete("/users/me", headers=headers)
    assert r.status_code == 204
    
    # User is now marked as inactive
    r = client.post("/users/login", json={
        "email": unique_email,
        "password": "password123"
    })
    assert r.status_code == 401
    assert "Invalid email or password" in r.json()["detail"]
    
    # Inactive user cannot access protected endpoints
    r = client.get("/users/me", headers=headers)
    assert r.status_code == 403
    assert "Inactive user" in r.json()["detail"]