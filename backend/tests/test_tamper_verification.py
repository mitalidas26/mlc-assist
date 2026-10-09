import pytest
import io
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_certificate_flow_and_tamper_detection():
    # 1. Seed demo cases
    seed_res = client.post("/api/cases/demo/seed")
    assert seed_res.status_code == 200
    case_id = seed_res.json()["cases"][0]["id"]

    # 2. Generate Certificate
    gen_res = client.post(
        f"/api/cases/{case_id}/certificate",
        json={
            "doctor_name": "Dr. Ananya Roy, MD",
            "doctor_decision": "Pending Investigation",
            "doctor_notes": "Radiology advised for chest rib trauma before final grievous conclusion."
        }
    )
    assert gen_res.status_code == 200
    cert_data = gen_res.json()
    sha256_hash = cert_data["sha256_hash"]
    pdf_filename = cert_data["pdf_filename"]
    assert len(sha256_hash) == 64

    # 3. Test Verify by Hash (Valid)
    verify_hash_res = client.post("/api/verify/hash", json={"sha256_hash": sha256_hash})
    assert verify_hash_res.status_code == 200
    assert verify_hash_res.json()["is_valid"] is True
    assert verify_hash_res.json()["status"] == "VERIFIED"
    assert verify_hash_res.json()["case_id"] == case_id

    # 4. Test Verify by Hash (Fake / Nonexistent Hash)
    fake_hash_res = client.post("/api/verify/hash", json={"sha256_hash": "a" * 64})
    assert fake_hash_res.status_code == 200
    assert fake_hash_res.json()["is_valid"] is False
    assert fake_hash_res.json()["status"] == "TAMPERED"

    # 5. Fetch actual PDF bytes from static mount
    pdf_static_res = client.get(f"/static/certificates/{pdf_filename}")
    assert pdf_static_res.status_code == 200
    original_pdf_bytes = pdf_static_res.content

    # 6. Test Verify Upload (Authentic PDF file upload)
    upload_valid_res = client.post(
        "/api/verify/upload",
        files={"file": (pdf_filename, io.BytesIO(original_pdf_bytes), "application/pdf")}
    )
    assert upload_valid_res.status_code == 200
    assert upload_valid_res.json()["is_valid"] is True
    assert upload_valid_res.json()["status"] == "VERIFIED"
    assert upload_valid_res.json()["patient_name"] == cert_data["patient_name"]

    # 7. Test Verify Upload (Tampered PDF with 1 single modified byte)
    tampered_bytes = bytearray(original_pdf_bytes)
    # Alter one byte inside the PDF content
    tampered_bytes[len(tampered_bytes) // 2] = (tampered_bytes[len(tampered_bytes) // 2] + 1) % 256
    
    upload_tampered_res = client.post(
        "/api/verify/upload",
        files={"file": (pdf_filename, io.BytesIO(tampered_bytes), "application/pdf")}
    )
    assert upload_tampered_res.status_code == 200
    assert upload_tampered_res.json()["is_valid"] is False
    assert upload_tampered_res.json()["status"] == "TAMPERED"
    assert "Integrity check failed" in upload_tampered_res.json()["message"]
