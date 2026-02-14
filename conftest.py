import os
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
from app.database import Base
from app.main import app
from fastapi.testclient import TestClient
import pytest

@pytest.fixture(scope="session")
def test_db():
    from sqlalchemy import create_engine
    engine = create_engine("sqlite:///./test.db")
    Base.metadata.create_all(bind=engine)
    yield engine
    os.remove("test.db") if os.path.exists("test.db") else None

@pytest.fixture(scope="session")
def client():
    return TestClient(app)
