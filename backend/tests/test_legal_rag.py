import pytest
from backend.app.legal_rag.retriever import BNSRetriever
from backend.app.legal_rag.classifier import LegalClassifier

def test_bns_retriever_basic():
    retriever = BNSRetriever()
    results = retriever.search("fracture bone dislocation")
    assert len(results) > 0
    top_doc, score = results[0]
    assert top_doc["section"] == "BNS Section 116"
    assert top_doc["clause_number"] == 7

def test_classifier_simple_hurt():
    classifier = LegalClassifier()
    injuries = [
        {
            "anatomical_region": "Left Cheek",
            "injury_type": "Abrasion",
            "length_cm": 2.0,
            "width_cm": 1.0,
            "depth_layer": "Skin",
            "suspected_weapon": "Blunt force",
            "clinical_notes": "Superficial epidermal graze"
        }
    ]
    result = classifier.classify_case(injuries)
    assert result.suggested_category == "Simple Hurt"
    assert "BNS Section 114" in result.primary_bns_section
    assert len(result.cited_clauses) > 0

def test_classifier_pending_investigation_for_fracture():
    classifier = LegalClassifier()
    injuries = [
        {
            "anatomical_region": "Right Clavicle",
            "injury_type": "Deformity",
            "length_cm": 4.0,
            "width_cm": 2.0,
            "depth_layer": "Bone",
            "suspected_weapon": "Friction / Impact",
            "clinical_notes": "Step deformity with crepitus and local tenderness. X-ray advised."
        }
    ]
    result = classifier.classify_case(injuries)
    assert result.suggested_category == "Pending Investigation"
    assert len(result.pending_investigations) > 0
    assert any("X-Ray" in p or "Radiological" in p for p in result.pending_investigations)
    assert any(c.clause_number == 7 for c in result.cited_clauses)

def test_classifier_dangerous_weapon():
    classifier = LegalClassifier()
    injuries = [
        {
            "anatomical_region": "Forearm",
            "injury_type": "Incised Wound",
            "length_cm": 5.0,
            "width_cm": 1.0,
            "depth_layer": "Subcutaneous",
            "suspected_weapon": "Sharp cutting (Knife)",
            "clinical_notes": "Clean-cut margins with tailing."
        }
    ]
    result = classifier.classify_case(injuries)
    assert "Section 118" in result.primary_bns_section
