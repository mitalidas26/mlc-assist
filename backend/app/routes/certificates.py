from fastapi import APIRouter, HTTPException
from typing import Dict, Any

from ..models import CertificateGenerateRequest, CertificateResponse
from ..pdf_generator.certificate_template import generate_mlc_certificate
from .. import database as db

router = APIRouter(tags=["Certificates"])

@router.post("/cases/{case_id}/certificate", response_model=CertificateResponse)
def generate_case_certificate(case_id: str, req: CertificateGenerateRequest = CertificateGenerateRequest()):
    case = db.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="MLC Case not found")

    # Update doctor info if provided in request
    if req.doctor_name:
        case["doctor_name"] = req.doctor_name
    if req.doctor_reg_no:
        case["doctor_reg_no"] = req.doctor_reg_no

    cert_result = generate_mlc_certificate(
        case_data=case,
        doctor_decision=req.doctor_decision,
        doctor_notes=req.doctor_notes,
        base_url=req.base_url or "http://localhost:5173"
    )

    # Save certificate record in SQLite database
    db.save_certificate_record(cert_result)

    return CertificateResponse(
        certificate_id=cert_result["certificate_id"],
        case_id=case_id,
        mlc_number=cert_result["mlc_number"],
        patient_name=cert_result["patient_name"],
        doctor_name=cert_result["doctor_name"],
        sha256_hash=cert_result["sha256_hash"],
        pdf_filename=cert_result["pdf_filename"],
        pdf_url=cert_result["pdf_url"],
        generated_at=cert_result["generated_at"],
        legal_opinion=cert_result["legal_opinion"],
        injuries_count=cert_result["injuries_count"]
    )

@router.get("/cases/{case_id}/certificate", response_model=Dict[str, Any])
def get_existing_certificate(case_id: str):
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM certificates WHERE case_id = ?", (case_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Certificate has not been generated for this case yet.")
    
    cert_data = dict(row)
    cert_data["pdf_url"] = f"/static/certificates/{cert_data['pdf_filename']}"
    return cert_data
