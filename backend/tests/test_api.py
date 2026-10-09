import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["mode"] == "local"

def test_bns_clauses_endpoint():
    response = client.get("/api/legal/bns-clauses")
    assert response.status_code == 200
    clauses = response.json()
    assert len(clauses) >= 8

def test_seed_demo_cases_and_analyze():
    # 1. Seed the 3 demo cases
    seed_res = client.post("/api/cases/demo/seed")
    assert seed_res.status_code == 200
    seed_data = seed_res.json()
    assert seed_data["success"] is True
    assert len(seed_data["cases"]) == 3

    # Pick the assault case
    assault_case_id = seed_data["cases"][0]["id"]

    # 2. Get case details
    case_res = client.get(f"/api/cases/{assault_case_id}")
    assert case_res.status_code == 200
    case_data = case_res.json()
    assert case_data["patient_name"] == "Rajesh Verma"
    assert len(case_data["injuries"]) == 2

    # 3. Analyze case
    analysis_res = client.post(f"/api/analyze/case/{assault_case_id}")
    assert analysis_res.status_code == 200
    analysis_data = analysis_res.json()
    assert "legal_classification" in analysis_data
    assert "vague_wording_flags" in analysis_data
    assert analysis_data["legal_classification"]["suggested_category"] in ["Pending Investigation", "Simple Hurt"]

def test_live_wording_check():
    res = client.post("/api/analyze/wording", json={"text": "Patient has deep wound and severe injury."})
    assert res.status_code == 200
    data = res.json()
    assert data["total_issues"] >= 2
    assert len(data["flags"]) >= 2
