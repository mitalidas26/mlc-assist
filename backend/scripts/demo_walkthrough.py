"""
MLC Assist — End-to-End Demo Script & Verification Walkthrough
Hackyard Build 2026

Demonstrates:
1. Case Registration & Trauma Intake
2. Anatomical Injury Mapping (Metric capture)
3. Speech/Clinical Notes with Vague-Wording Flagging
4. BNS Statutory Legal Grounding & "Pending Investigation" Safeguard
5. Tamper-Evident PDF Certificate Generation (SHA-256 + QR Code)
6. Integrity Verification: Unmodified PDF (PASS) vs Modified PDF (FAIL)
"""

import sys
import json
import io
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from fastapi.testclient import TestClient
from backend.app.main import app

def run_demo():
    client = TestClient(app)
    sep = "=" * 70

    print("\n" + sep)
    print("  🏥 MLC ASSIST — POINT-OF-CARE DEMO & VERIFICATION WALKTHROUGH")
    print(sep)

    # Step 1: Health check
    print("\n[STEP 1] System Health & Corpus Status:")
    res = client.get("/api/health")
    print(f"  • API Status: {res.json()['status'].upper()}")
    print(f"  • Active Modules: {', '.join(res.json()['features'])}")

    # Step 2: Seed the 3 official demo cases
    print("\n[STEP 2] Pre-seeding Official Demo Cases:")
    seed_res = client.post("/api/cases/demo/seed")
    cases = seed_res.json().get("cases", [])
    for idx, c in enumerate(cases, 1):
        print(f"  {idx}. {c['title']} (ID: {c['id']})")

    # Step 3: Select Case 1 (Blunt-Force Assault with Rib Tenderness)
    selected_case_id = cases[0]["id"]
    print(f"\n[STEP 3] Inspecting Case #1: {selected_case_id}")
    case_res = client.get(f"/api/cases/{selected_case_id}")
    case_data = case_res.json()
    print(f"  • Patient: {case_data['patient_name']}, {case_data['age']} Yrs, {case_data['gender']}")
    print(f"  • Police Station: {case_data['police_station']} ({case_data['constable_details']})")
    print(f"  • Incident: \"{case_data['incident_history']}\"")
    print(f"  • Plotted Injuries: {len(case_data['injuries'])}")
    for i, inj in enumerate(case_data['injuries'], 1):
        print(f"    - Injury {i}: {inj['injury_type']} at {inj['anatomical_region']} "
              f"({inj['length_cm']}x{inj['width_cm']} cm, {inj['depth_layer']} layer)")

    # Step 4: Vague Wording Linting
    print("\n[STEP 4] Real-Time Vague-Wording Detector:")
    raw_dictation = (
        "Patient has a deep wound over forearm with severe injury to head. "
        "Complains of bad pain and large cut."
    )
    print(f"  • Sample Dictated Text: \"{raw_dictation}\"")
    lint_res = client.post("/api/analyze/wording", json={"text": raw_dictation})
    lint_data = lint_res.json()
    print(f"  • Cleaned Forensic Score: {lint_data['cleaned_score']}%")
    print(f"  • Issues Flagged: {lint_data['total_issues']}")
    for flag in lint_data['flags']:
        print(f"    ⚠️ Flagged: \"{flag['phrase']}\" [{flag['category']} - {flag['severity'].upper()} RISK]")
        print(f"       Risk: {flag['issue']}")
        print(f"       Suggested Fix: {flag['suggestion']}")

    # Step 5: BNS Statutory Legal Classification (RAG)
    print("\n[STEP 5] BNS Statutory Legal Classification (RAG Grounding):")
    analysis_res = client.post(f"/api/analyze/case/{selected_case_id}")
    analysis = analysis_res.json()
    legal = analysis["legal_classification"]
    print(f"  • Suggested Legal Category: \033[93m{legal['suggested_category'].upper()}\033[0m")
    print(f"  • Primary BNS Section: {legal['primary_bns_section']}")
    print(f"  • Confidence: {int(legal['confidence'] * 100)}%")
    print(f"  • Statutory Rationale:\n    {legal['rationale'].replace(chr(10), chr(10) + '    ')}")
    
    print("\n  • Mandatory ER Safeguards (Pending Investigations):")
    for req in legal['pending_investigations']:
        print(f"    ⏳ {req}")

    print("\n  • Retrieved BNS Statutory Citations:")
    for clause in legal['cited_clauses'][:2]:
        clause_str = f"Clause ({clause['clause_number']})" if clause.get('clause_number') else ""
        print(f"    📖 {clause['section']} {clause_str}: {clause['clause_title']}")
        print(f"       Verbatim: \"{clause['verbatim_text']}\"")

    # Step 6: Certificate Generation with SHA-256 Hashing & QR Code
    print("\n[STEP 6] Generating Tamper-Evident Medico-Legal Certificate PDF:")
    cert_res = client.post(
        f"/api/cases/{selected_case_id}/certificate",
        json={
            "doctor_name": case_data["doctor_name"],
            "doctor_reg_no": case_data["doctor_reg_no"],
            "doctor_decision": "Pending Investigation",
            "doctor_notes": "Suspected rib cage fracture. Radiologist report pending."
        }
    )
    cert_data = cert_res.json()
    pdf_filename = cert_data["pdf_filename"]
    sha256_hash = cert_data["sha256_hash"]
    print(f"  • Certificate Issued: {cert_data['certificate_id']}")
    print(f"  • PDF File: {pdf_filename}")
    print(f"  • Immutable SHA-256 Digest: \033[92m{sha256_hash}\033[0m")

    # Step 7: Verification Check 1 — Original Untouched File (PASS)
    print("\n[STEP 7] Tamper-Evidence Verification — Original File:")
    pdf_bytes = client.get(f"/static/certificates/{pdf_filename}").content
    verify_valid = client.post(
        "/api/verify/upload",
        files={"file": (pdf_filename, io.BytesIO(pdf_bytes), "application/pdf")}
    )
    v1 = verify_valid.json()
    print(f"  • Status: \033[92m{v1['status']}\033[0m (Valid: {v1['is_valid']})")
    print(f"  • Registry Message: {v1['message']}")
    print(f"  • Patient Verified: {v1.get('patient_name')} (Doctor: {v1.get('doctor_name')})")

    # Step 8: Verification Check 2 — Tampered File with 1 modified byte (FAIL)
    print("\n[STEP 8] Tamper-Evidence Verification — Modified PDF (1 altered byte):")
    tampered_bytes = bytearray(pdf_bytes)
    tampered_bytes[len(tampered_bytes) // 2] ^= 0xFF  # Flip bits in middle of file
    
    verify_tampered = client.post(
        "/api/verify/upload",
        files={"file": (pdf_filename, io.BytesIO(tampered_bytes), "application/pdf")}
    )
    v2 = verify_tampered.json()
    print(f"  • Status: \033[91m{v2['status']}\033[0m (Valid: {v2['is_valid']})")
    print(f"  • Registry Message: {v2['message']}")
    print(f"  • Tampered Hash Detected: {v2.get('sha256_hash')}")

    print("\n" + sep)
    print("  ✅ PHASE 4 WALKTHROUGH TEST COMPLETED SUCCESSFULLY!")
    print(sep + "\n")

if __name__ == "__main__":
    run_demo()
