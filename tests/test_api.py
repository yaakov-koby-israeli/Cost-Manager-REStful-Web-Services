import requests

BASE_URL = "http://localhost:3000"

def test_get_about():
    response = requests.get(f"{BASE_URL}/about")
    assert response.status_code == 200

def test_get_user_exists():
    # assuming user 123123 exists
    response = requests.get(f"{BASE_URL}/api/users/123123")
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "first_name" in data
    assert "last_name" in data
    assert "total" in data

def test_get_user_not_exists():
    response = requests.get(f"{BASE_URL}/api/users/999999")
    assert response.status_code == 404

def test_post_add_cost_success():
    payload = {
        "description": "test item",
        "category": "food",
        "userid": 123123,
        "sum": 50,
        "date": "2025-05-30"
    }
    response = requests.post(f"{BASE_URL}/api/add", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["description"] == payload["description"]
    assert data["category"] == payload["category"]
    assert data["userid"] == payload["userid"]
    assert data["sum"] == payload["sum"]

def test_post_add_cost_missing_field():
    payload = {
        "description": "test item",
        "category": "food",
        "userid": 123123
        # missing sum
    }
    response = requests.post(f"{BASE_URL}/api/add", json=payload)
    assert response.status_code == 400

def test_get_report_success():
    response = requests.get(f"{BASE_URL}/api/report?id=123123&year=2025&month=5")
    assert response.status_code == 200
    data = response.json()
    assert "userid" in data
    assert "year" in data
    assert "month" in data
    assert "costs" in data

def test_get_report_user_not_exists():
    response = requests.get(f"{BASE_URL}/api/report?id=999999&year=2025&month=5")
    assert response.status_code == 404