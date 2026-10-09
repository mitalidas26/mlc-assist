import pytest
from pathlib import Path
from backend.app.pdf_generator.certificate_template import generate_mlc_certificate
from backend.app.pdf_generator.hasher import compute_sha256_file, compute_sha256_bytes

def test_generate_mlc_certificate():
    dummy_case = {
        "id": "test-case-12345",
        "mlc_number": "MLC/2026/TEST01",
        "patient_name": "Test Patient",
        "age": 30,
        "gender": "Male",
        "guardian_name": "Guardian Name",
        "address": "Guwahati, Assam",
        "brought_by": "Police Constable",
        "police_station": "Dispur PS",
        "constable_details": "Constable #102",
        "incident_history": "Assault with blunt object on forehead.",
        "examination_date_time": "04-10-2026 00:30 HRS",
        "doctor_name": "Dr. S. Sharma, MD",
        "doctor_reg_no": "MCI-489201",
        "injuries": [
            {
                "anatomical_region": "Forehead",
                "body_side": "anterior",
                "injury_type": "Contusion/Hematoma",
                "length_cm": 4.0,
                "width_cm": 3.0,
                "depth_cm": 0.5,
                "depth_layer": "Subcutaneous",
                "shape": "Oval",
                "margins": "Contused",
                "age_of_injury": "Fresh / Red",
                "suspected_weapon": "Blunt force",
                "clinical_notes": "Reddish swelling with local tenderness."
            }
        ]
    }

    result = generate_mlc_certificate(dummy_case)

    assert result["certificate_id"].startswith("CERT-")
    assert result["sha256_hash"] is not None
    assert len(result["sha256_hash"]) == 64
    assert Path(result["pdf_path"]).exists()
    assert Path(result["pdf_path"]).stat().st_size > 1000

    # Verify that recalculating the file hash matches the returned hash
    computed_hash = compute_sha256_file(result["pdf_path"])
    assert computed_hash == result["sha256_hash"]
