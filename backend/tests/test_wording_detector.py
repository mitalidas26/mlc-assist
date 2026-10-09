import pytest
from backend.app.wording_check.detector import VagueWordingDetector

def test_detect_vague_words():
    detector = VagueWordingDetector()
    sample_text = (
        "Patient presented with deep wound over left arm and severe injury on head. "
        "Complains of bad pain and large cut on thigh."
    )
    flags = detector.detect_flags(sample_text)
    assert len(flags) >= 4

    matched_categories = [f.category for f in flags]
    assert "Depth Imprecision" in matched_categories
    assert "Subjective Severity" in matched_categories
    assert "Non-Metric Dimensions" in matched_categories
    assert "Unquantified Pain & Disability" in matched_categories

def test_clean_text_produces_no_flags():
    detector = VagueWordingDetector()
    clean_text = (
        "Incised wound 4.5 cm x 1.2 cm x 0.8 cm over anterior forearm with clean-cut margins. "
        "Bleeding controlled; tenderness Grade 2 without crepitus."
    )
    flags = detector.detect_flags(clean_text)
    assert len(flags) == 0
