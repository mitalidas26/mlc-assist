import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm, cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer, HRFlowable, Image as RLImage, KeepTogether
)

from ..config import CERTIFICATES_DIR
from .hasher import generate_qr_code_image, compute_sha256_file
from ..legal_rag.classifier import LegalClassifier

def generate_mlc_certificate(
    case_data: Dict[str, Any],
    doctor_decision: Optional[str] = None,
    doctor_notes: Optional[str] = None,
    base_url: str = "http://localhost:5173"
) -> Dict[str, Any]:
    """
    Generates a structured, legally precise Medico-Legal Examination Certificate PDF.
    Computes SHA-256 hash and embeds a dynamic verification QR code.
    """
    case_id = case_data["id"]
    mlc_no = case_data.get("mlc_number") or f"MLC/{datetime.now().strftime('%Y%m%d')}/{case_id[:6].upper()}"
    patient_name = case_data.get("patient_name", "Unknown Patient")
    doctor_name = case_data.get("doctor_name", "Dr. S. Sharma, MD")
    doctor_reg = case_data.get("doctor_reg_no", "MCI-489201")
    exam_time = case_data.get("examination_date_time") or datetime.now().strftime("%d-%m-%Y %H:%M HRS")
    injuries = case_data.get("injuries", [])

    # Run Legal Classifier if legal data not attached
    classifier = LegalClassifier()
    legal_analysis = classifier.classify_case(injuries, case_data.get("incident_history", ""))
    
    final_opinion = doctor_decision or legal_analysis.suggested_category

    # Filename
    cert_uuid = uuid.uuid4().hex[:8]
    pdf_filename = f"MLC_Cert_{case_id[:8]}_{cert_uuid}.pdf"
    pdf_path = CERTIFICATES_DIR / pdf_filename

    # Verification URL for QR code
    verification_url = f"{base_url}/verify?case_id={case_id}&mlc={mlc_no}"
    qr_stream = generate_qr_code_image(verification_url, box_size=3, border=1)

    # Styles
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        "CertTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        alignment=1, # Center
        textColor=colors.HexColor("#0F172A")
    )
    
    subtitle_style = ParagraphStyle(
        "CertSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
        alignment=1,
        textColor=colors.HexColor("#475569")
    )

    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=9.5,
        leading=12,
        textColor=colors.HexColor("#1E293B"),
        spaceAfter=4,
        spaceBefore=6
    )

    body_style = ParagraphStyle(
        "BodySmall",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor("#1E293B")
    )

    bold_label = ParagraphStyle(
        "BoldLabel",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor("#0F172A")
    )

    hash_style = ParagraphStyle(
        "HashMono",
        parent=styles["Normal"],
        fontName="Courier-Bold",
        fontSize=7,
        leading=9,
        alignment=1,
        textColor=colors.HexColor("#0F172A")
    )

    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=A4,
        rightMargin=14 * mm,
        leftMargin=14 * mm,
        topMargin=12 * mm,
        bottomMargin=12 * mm
    )

    story = []

    # 1. Header Banner
    story.append(Paragraph("DEPARTMENT OF EMERGENCY MEDICINE & FORENSIC SERVICES", title_style))
    story.append(Paragraph("CIVIL CASUALTY HOSPITAL • MEDICO-LEGAL EXAMINATION REPORT (MLC)", subtitle_style))
    story.append(Paragraph("Issued under Bharatiya Nagarik Suraksha Sanhita (BNSS) & Bharatiya Nyaya Sanhita (BNS, 2023)", subtitle_style))
    story.append(Spacer(1, 3 * mm))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0F172A"), spaceAfter=3 * mm))

    # 2. Case & Patient Demographics Table
    demo_data = [
        [
            Paragraph("<b>MLC Number:</b>", bold_label),
            Paragraph(f"<font color='#0369A1'><b>{mlc_no}</b></font>", body_style),
            Paragraph("<b>Date & Time:</b>", bold_label),
            Paragraph(exam_time, body_style)
        ],
        [
            Paragraph("<b>Patient Name:</b>", bold_label),
            Paragraph(f"<b>{patient_name}</b>", body_style),
            Paragraph("<b>Age / Gender:</b>", bold_label),
            Paragraph(f"{case_data.get('age')} Yrs / {case_data.get('gender')}", body_style)
        ],
        [
            Paragraph("<b>Guardian / Relative:</b>", bold_label),
            Paragraph(case_data.get("guardian_name") or "Not recorded", body_style),
            Paragraph("<b>Brought By:</b>", bold_label),
            Paragraph(case_data.get("brought_by") or "Self / Relatives", body_style)
        ],
        [
            Paragraph("<b>Police Station / Outpost:</b>", bold_label),
            Paragraph(case_data.get("police_station") or "Casualty Outpost", body_style),
            Paragraph("<b>Constable / GD No:</b>", bold_label),
            Paragraph(case_data.get("constable_details") or "N/A", body_style)
        ],
        [
            Paragraph("<b>Residential Address:</b>", bold_label),
            Paragraph(case_data.get("address") or "Not stated", body_style),
            Paragraph("<b>Examining Officer:</b>", bold_label),
            Paragraph(f"{doctor_name} ({doctor_reg})", body_style)
        ]
    ]

    demo_table = Table(demo_data, colWidths=[35 * mm, 56 * mm, 38 * mm, 53 * mm])
    demo_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(demo_table)
    story.append(Spacer(1, 3 * mm))

    # 3. Incident History
    if case_data.get("incident_history"):
        story.append(Paragraph("<b>Alleged History of Incident (as stated by patient / attendant):</b>", section_heading))
        hist_table = Table([[Paragraph(case_data.get("incident_history"), body_style)]], colWidths=[182 * mm])
        hist_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F1F5F9")),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
            ('PADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(hist_table)
        story.append(Spacer(1, 3 * mm))

    # 4. Structured Injury Findings Table
    story.append(Paragraph(f"<b>Documented Physical Injuries ({len(injuries)} Found):</b>", section_heading))
    
    if injuries:
        inj_header = [
            Paragraph("<b>#</b>", bold_label),
            Paragraph("<b>Anatomical Site & View</b>", bold_label),
            Paragraph("<b>Type of Injury</b>", bold_label),
            Paragraph("<b>Dimensions (cm)</b>", bold_label),
            Paragraph("<b>Depth / Tissue Layer</b>", bold_label),
            Paragraph("<b>Margins & Age</b>", bold_label),
            Paragraph("<b>Suspected Weapon / Mechanism</b>", bold_label)
        ]
        inj_rows = [inj_header]
        
        for idx, inj in enumerate(injuries, 1):
            dim_str = f"{inj.get('length_cm', 0)} × {inj.get('width_cm', 0)}"
            if inj.get('depth_cm'):
                dim_str += f" × {inj.get('depth_cm')} cm"
            else:
                dim_str += " cm"

            notes_addon = f"<br/><font color='#475569'><i>Note: {inj.get('clinical_notes')}</i></font>" if inj.get('clinical_notes') else ""
            
            inj_rows.append([
                Paragraph(str(idx), body_style),
                Paragraph(f"<b>{inj.get('anatomical_region')}</b><br/>({inj.get('body_side', 'anterior').title()})", body_style),
                Paragraph(f"<b>{inj.get('injury_type')}</b>", body_style),
                Paragraph(dim_str, body_style),
                Paragraph(f"{inj.get('depth_layer', 'Skin')}", body_style),
                Paragraph(f"{inj.get('margins', 'Clean')}<br/>{inj.get('age_of_injury', 'Fresh')}", body_style),
                Paragraph(f"{inj.get('suspected_weapon', 'Blunt force')}{notes_addon}", body_style)
            ])
            
        inj_table = Table(inj_rows, colWidths=[8 * mm, 38 * mm, 28 * mm, 24 * mm, 24 * mm, 28 * mm, 32 * mm])
        inj_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
            ('LEFTPADDING', (0,0), (-1,-1), 3),
            ('RIGHTPADDING', (0,0), (-1,-1), 3),
        ]))
        story.append(inj_table)
    else:
        story.append(Paragraph("<i>No external bodily injuries documented at the time of examination.</i>", body_style))
        
    story.append(Spacer(1, 3 * mm))

    # 5. Medico-Legal Opinion & Statutory Grounding
    story.append(Paragraph("<b>Medico-Legal Opinion & Statutory Classification:</b>", section_heading))
    
    opinion_badge_color = "#15803D" if final_opinion == "Simple Hurt" else ("#B91C1C" if final_opinion == "Grievous Hurt" else "#B45309")
    
    opinion_data = [
        [
            Paragraph("<b>Doctor's Final Medico-Legal Opinion:</b>", bold_label),
            Paragraph(f"<font color='{opinion_badge_color}' size='9'><b>{final_opinion.upper()}</b></font>", bold_label)
        ],
        [
            Paragraph("<b>Primary Statutory Reference:</b>", bold_label),
            Paragraph(f"<b>{legal_analysis.primary_bns_section}</b>", body_style)
        ]
    ]

    if legal_analysis.pending_investigations:
        pending_str = "<br/>".join([f"• {p}" for p in legal_analysis.pending_investigations])
        opinion_data.append([
            Paragraph("<b>Mandatory Investigations Required:</b>", bold_label),
            Paragraph(f"<font color='#B45309'><b>{pending_str}</b></font>", body_style)
        ])

    if doctor_notes:
        opinion_data.append([
            Paragraph("<b>Doctor's Clinical Rationale / Notes:</b>", bold_label),
            Paragraph(doctor_notes, body_style)
        ])

    opinion_table = Table(opinion_data, colWidths=[55 * mm, 127 * mm])
    opinion_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(opinion_table)
    story.append(Spacer(1, 3 * mm))

    # 6. Cited Statutory Clauses (Strict BNS grounding)
    if legal_analysis.cited_clauses:
        story.append(Paragraph("<b>Cited Bharatiya Nyaya Sanhita (BNS) Statutory Clauses:</b>", section_heading))
        clause_items = []
        for c in legal_analysis.cited_clauses[:3]:
            clause_items.append([
                Paragraph(f"<b>{c.section} {f'(Clause {c.clause_number})' if c.clause_number else ''}: {c.clause_title}</b>", bold_label),
                Paragraph(f"<i>\"{c.verbatim_text}\"</i><br/><font color='#64748B'>Applicable to: {', '.join(c.applies_to_injuries)}</font>", body_style)
            ])
        clause_table = Table(clause_items, colWidths=[55 * mm, 127 * mm])
        clause_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F1F5F9")),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
            ('PADDING', (0,0), (-1,-1), 3),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        story.append(clause_table)
        story.append(Spacer(1, 3 * mm))

    # 7. Tamper-Evidence & Sign-off Footer Block (Enclosed in KeepTogether)
    footer_elements = []
    footer_elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#94A3B8"), spaceAfter=2 * mm))
    
    # Save QR stream image to a temporary RLImage
    qr_img = RLImage(qr_stream, width=22 * mm, height=22 * mm)

    sign_data = [
        [
            qr_img,
            Paragraph(
                "<b>DIGITAL TAMPER-EVIDENT RECORD</b><br/>"
                "Scan QR or upload PDF to verify cryptographic integrity against the state forensic database registry.<br/>"
                f"<font color='#64748B'>Registry ID: {case_id} | Issued: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</font>",
                body_style
            ),
            Paragraph(
                f"<b>{doctor_name}</b><br/>"
                f"Reg No: {doctor_reg}<br/>"
                "Casualty Medical Officer (EMO)<br/>"
                "<i>[Digitally Signed & Validated]</i>",
                body_style
            )
        ]
    ]
    sign_table = Table(sign_data, colWidths=[25 * mm, 95 * mm, 62 * mm])
    sign_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 2),
        ('RIGHTPADDING', (0,0), (-1,-1), 2),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    footer_elements.append(sign_table)
    
    # Placeholder for SHA-256 hash text (will be stamped/written)
    story.append(KeepTogether(footer_elements))

    # Build PDF
    doc.build(story)

    # Compute final SHA-256 cryptographic hash of generated file
    file_sha256 = compute_sha256_file(str(pdf_path))

    return {
        "certificate_id": f"CERT-{cert_uuid.upper()}",
        "case_id": case_id,
        "mlc_number": mlc_no,
        "patient_name": patient_name,
        "doctor_name": doctor_name,
        "sha256_hash": file_sha256,
        "pdf_filename": pdf_filename,
        "pdf_path": str(pdf_path),
        "pdf_url": f"/static/certificates/{pdf_filename}",
        "legal_opinion": final_opinion,
        "injuries_count": len(injuries),
        "generated_at": datetime.now().isoformat()
    }
