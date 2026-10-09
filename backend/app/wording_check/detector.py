import re
from typing import List, Dict, Any
from .rules import VAGUE_RULES
from ..models import VagueWordingFlag

class VagueWordingDetector:
    def __init__(self):
        self.rules = [
            {
                "compiled": re.compile(rule["pattern"], re.IGNORECASE),
                "category": rule["category"],
                "severity": rule["severity"],
                "issue": rule["issue"],
                "suggestion": rule["suggestion"]
            }
            for rule in VAGUE_RULES
        ]

    def detect_flags(self, text: str) -> List[VagueWordingFlag]:
        if not text or not text.strip():
            return []

        flags: List[VagueWordingFlag] = []
        seen_matches = set()

        for rule in self.rules:
            for match in rule["compiled"].finditer(text):
                matched_phrase = match.group(0)
                start, end = match.span()
                
                # Deduplicate overlapping matches
                match_key = (matched_phrase.lower(), start)
                if match_key in seen_matches:
                    continue
                seen_matches.add(match_key)

                # Extract local snippet context (+- 35 characters)
                ctx_start = max(0, start - 35)
                ctx_end = min(len(text), end + 35)
                context = text[ctx_start:ctx_end].strip()
                if ctx_start > 0:
                    context = "..." + context
                if ctx_end < len(text):
                    context = context + "..."

                flags.append(VagueWordingFlag(
                    phrase=matched_phrase,
                    context=context,
                    category=rule["category"],
                    severity=rule["severity"],
                    issue=rule["issue"],
                    suggestion=rule["suggestion"]
                ))

        return flags

    def check_injuries(self, injuries: List[Dict[str, Any]], incident_history: str = "") -> List[VagueWordingFlag]:
        all_flags: List[VagueWordingFlag] = []

        if incident_history:
            all_flags.extend(self.detect_flags(incident_history))

        for idx, inj in enumerate(injuries, start=1):
            notes = inj.get("clinical_notes") or ""
            region = inj.get("anatomical_region") or ""
            itype = inj.get("injury_type") or ""
            
            combined_desc = f"{region} {itype} {notes}".strip()
            detected = self.detect_flags(combined_desc)
            
            # If dimensions are 0, add metric alert
            length = float(inj.get("length_cm") or 0.0)
            width = float(inj.get("width_cm") or 0.0)
            if length <= 0.0 and width <= 0.0 and itype not in ["Fracture", "Deformity"]:
                detected.append(VagueWordingFlag(
                    phrase=f"Injury #{idx} ({region})",
                    context=f"{itype} at {region} with 0 cm dimensions",
                    category="Missing Metric Measurements",
                    severity="high",
                    issue="Zero/missing numerical dimensions recorded for visible wound.",
                    suggestion="Enter precise Length × Breadth (cm) using anatomical measurement standard."
                ))

            all_flags.extend(detected)

        return all_flags
