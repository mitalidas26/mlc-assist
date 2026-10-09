from fastapi import APIRouter, HTTPException
from typing import Dict, Any

from ..models import WordingCheckRequest, WordingCheckResponse, CaseAnalysisResponse
from ..wording_check.detector import VagueWordingDetector
from ..legal_rag.classifier import LegalClassifier
from .. import database as db

router = APIRouter(prefix="/analyze", tags=["Analysis"])

detector = VagueWordingDetector()
classifier = LegalClassifier()

@router.post("/wording", response_model=WordingCheckResponse)
def check_wording(request: WordingCheckRequest):
    flags = detector.detect_flags(request.text)
    total_words = len(request.text.split()) if request.text else 0
    # Cleaned score is a metric from 0 to 100
    cleaned_score = max(0.0, min(100.0, 100.0 - (len(flags) * 15.0)))
    return WordingCheckResponse(
        flags=flags,
        cleaned_score=round(cleaned_score, 1),
        total_issues=len(flags)
    )

@router.post("/case/{case_id}", response_model=CaseAnalysisResponse)
def analyze_full_case(case_id: str):
    case = db.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="MLC Case not found")

    injuries = case.get("injuries", [])
    incident_history = case.get("incident_history", "")

    # 1. Run Vague Wording Linter
    vague_flags = detector.check_injuries(injuries, incident_history)

    # 2. Run BNS Statutory Legal Classifier
    legal_classification = classifier.classify_case(injuries, incident_history)

    summary = (
        f"Case analysis completed: {len(injuries)} injury records evaluated. "
        f"Legal classification suggestion: {legal_classification.suggested_category} "
        f"({legal_classification.primary_bns_section}). "
        f"{len(vague_flags)} vague/imprecise phrase(s) flagged for doctor review."
    )

    return CaseAnalysisResponse(
        case_id=case_id,
        vague_wording_flags=vague_flags,
        legal_classification=legal_classification,
        summary=summary
    )
