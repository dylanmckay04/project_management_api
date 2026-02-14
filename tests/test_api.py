from fastapi.testclient import TestClient
from app.main import app
import uuid

client = TestClient(app)

def test_full_flow():
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
    r = client.post(f"/users/login?email={unique_email}&password=password123")
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