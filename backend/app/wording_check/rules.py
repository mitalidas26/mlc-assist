import re
from typing import List, Dict, Any

VAGUE_RULES: List[Dict[str, Any]] = [
    {
        "pattern": r"\b(deep\s+wound|deep\s+cut|deep\s+laceration|deep\s+injury|very\s+deep)\b",
        "category": "Depth Imprecision",
        "severity": "high",
        "issue": "Subjective descriptor 'deep' does not specify measurable penetration or anatomical layers.",
        "suggestion": "Specify exact depth in centimeters/millimeters (e.g., 'depth: 1.8 cm') and affected anatomical tissue layers (Skin, Subcutaneous fat, Fascia, Muscle, Peritoneum/Pleura, Bone)."
    },
    {
        "pattern": r"\b(severe\s+injury|severe\s+trauma|bad\s+injury|serious\s+injury|critical\s+injury|bad\s+hit)\b",
        "category": "Subjective Severity",
        "severity": "high",
        "issue": "'Severe' / 'serious' is a legal and clinical ambiguity that will be challenged in court.",
        "suggestion": "Record objective clinical metrics: Glasgow Coma Scale (GCS), vital signs (BP, Pulse), active bleeding status, and structural tissue disruption."
    },
    {
        "pattern": r"\b(large\s+cut|big\s+bruise|huge\s+swelling|small\s+cut|tiny\s+abrasion|medium\s+wound|massive\s+hematoma)\b",
        "category": "Non-Metric Dimensions",
        "severity": "high",
        "issue": "Qualitative size words ('large', 'big', 'small', 'huge') lack metric forensic validity.",
        "suggestion": "Measure with a forensic metric ruler: record exact dimensions in centimeters (Length × Breadth, e.g., '6.5 cm × 2.0 cm')."
    },
    {
        "pattern": r"\b(bad\s+pain|terrible\s+pain|extreme\s+pain|lot\s+of\s+pain|severe\s+pain)\b",
        "category": "Unquantified Pain & Disability",
        "severity": "medium",
        "issue": "Pain claims without duration or functional limitation cannot establish BNS Sec 116(8) grievous criteria.",
        "suggestion": "Record localized tenderness grading (Grade 1-4) and note if incapacity prevents ordinary pursuits for ≥ 20 days."
    },
    {
        "pattern": r"\b(heavy\s+bleeding|profuse\s+bleeding|a\s+lot\s+of\s+blood|bleeding\s+badly)\b",
        "category": "Hemodynamic Imprecision",
        "severity": "medium",
        "issue": "Bleeding is described qualitatively rather than by vascular source or hemodynamic impact.",
        "suggestion": "Specify if bleeding is active or clotted, suspected vessel (capillary ooze vs. arterial spurting), and patient's hemoglobin / blood pressure."
    },
    {
        "pattern": r"\b(head\s+injury|chest\s+trauma|abdominal\s+injury|body\s+pain)\b",
        "category": "Anatomical Vagueness",
        "severity": "medium",
        "issue": "Broad anatomical labeling without pinpoint coordinates or specific landmark distances.",
        "suggestion": "Specify exact anatomical landmark reference (e.g., '3 cm above lateral third of right eyebrow' or '4th intercostal space mid-clavicular line')."
    },
    {
        "pattern": r"\b(sharp\s+cut|knife\s+mark|blade\s+wound)\b",
        "category": "Mechanism & Margin Ambiguity",
        "severity": "medium",
        "issue": "Omits essential wound characteristics needed to establish weapon type in court.",
        "suggestion": "Document edge margins (clean-cut, regular, beveled, or contused), presence of tailing (identifying stroke direction), and angles of the wound."
    },
    {
        "pattern": r"\b(multiple\s+scratches|some\s+marks|several\s+bruises|few\s+wounds)\b",
        "category": "Uncounted Lesions",
        "severity": "high",
        "issue": "Indefinite quantity terms ('multiple', 'some', 'several') weaken individual injury tracking in criminal trials.",
        "suggestion": "Individually enumerate and measure each lesion separately (e.g., 'Injury 1: 3 cm × 0.2 cm abrasion, Injury 2: 2 cm × 0.1 cm abrasion')."
    },
    {
        "pattern": r"\b(old\s+injury|healed\s+looking|recent\s+wound)\b",
        "category": "Chronology / Age of Injury",
        "severity": "medium",
        "issue": "Imprecise estimation of age of injury without chromatic color progression notes.",
        "suggestion": "Document specific chromatic signs: Fresh bright red (0-24 hrs), Bluish-black (2-4 days), Greenish (4-5 days), Yellowish-brown (6-7 days), or Scab status."
    }
]
