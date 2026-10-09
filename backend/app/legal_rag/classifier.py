from typing import List, Dict, Any, Tuple
from .retriever import BNSRetriever
from ..models import Injury, LegalClassification, StatutoryClauseCitation

class LegalClassifier:
    def __init__(self):
        self.retriever = BNSRetriever()

    def classify_case(self, injuries: List[Dict[str, Any]], incident_history: str = "") -> LegalClassification:
        if not injuries:
            return LegalClassification(
                suggested_category="No Hurt Documented",
                confidence=1.0,
                primary_bns_section="BNS Section 114",
                cited_clauses=[],
                rationale="No trauma or bodily injuries have been registered for this case.",
                pending_investigations=[]
            )

        pending_investigations: List[str] = []
        cited_clauses_dict: Dict[str, StatutoryClauseCitation] = {}
        has_confirmed_grievous = False
        has_pending_grievous = False
        has_dangerous_weapon = False
        rationale_points: List[str] = []

        # Analyze each injury individually
        for idx, inj in enumerate(injuries, start=1):
            itype = (inj.get("injury_type") or "").lower()
            region = (inj.get("anatomical_region") or "").lower()
            notes = (inj.get("clinical_notes") or "").lower()
            weapon = (inj.get("suspected_weapon") or "").lower()
            depth_layer = (inj.get("depth_layer") or "").lower()
            inj_label = f"Injury #{idx} ({inj.get('injury_type')} - {inj.get('anatomical_region')})"

            # Build clinical query for BM25 retrieval
            search_query = f"{itype} {region} {notes} {weapon} {depth_layer} {incident_history}"
            retrieved_docs = self.retriever.search(search_query, top_k=3)

            for doc, score in retrieved_docs:
                doc_id = doc["id"]
                if doc_id not in cited_clauses_dict:
                    cited_clauses_dict[doc_id] = StatutoryClauseCitation(
                        section=doc["section"],
                        clause_number=doc.get("clause_number"),
                        clause_title=doc["title"],
                        verbatim_text=doc["statutory_text"],
                        relevance_score=score,
                        applies_to_injuries=[inj_label]
                    )
                else:
                    if inj_label not in cited_clauses_dict[doc_id].applies_to_injuries:
                        cited_clauses_dict[doc_id].applies_to_injuries.append(inj_label)

            # Check dangerous weapon
            if any(w in weapon for w in ["sharp", "knife", "blade", "sword", "dagger", "firearm", "acid", "thermal"]):
                has_dangerous_weapon = True

            # Case Rule 1: Fracture / Deformity / Bony crepitus / Dislocation
            if any(k in itype or k in notes or k in region for k in ["fracture", "dislocation", "deformity", "crepitus", "broken bone", "tender rib", "subluxation"]):
                has_pending_grievous = True
                pending_investigations.append(
                    f"Radiological Examination (X-Ray / CT of {inj.get('anatomical_region', 'affected region')}) to confirm cortical breach / fracture line under BNS Sec 116(7)."
                )
                rationale_points.append(
                    f"{inj_label}: Clinical signs suggestive of bony/joint injury. Requires radiological confirmation before final categorization as Grievous Hurt."
                )

            # Case Rule 2: Eye / Hearing / Vision damage
            elif any(k in region or k in notes for k in ["eye", "vision", "cornea", "retina", "globe"]) and any(k in itype or k in notes for k in ["laceration", "perforation", "rupture", "loss of vision"]):
                has_pending_grievous = True
                pending_investigations.append(
                    f"Ophthalmological Assessment & Visual Acuity testing for {inj.get('anatomical_region')} to assess permanent loss of vision under BNS Sec 116(2)."
                )
                rationale_points.append(
                    f"{inj_label}: Direct ocular trauma. Permanent visual privation must be confirmed by ophthalmologist."
                )

            # Case Rule 3: Facial disfigurement
            elif any(k in region for k in ["face", "forehead", "cheek", "nose", "lip", "chin"]) and any(k in itype for k in ["laceration", "incised", "burn", "stab"]) and (inj.get("length_cm", 0) >= 3.0 or depth_layer in ["muscle", "bone"]):
                has_pending_grievous = True
                pending_investigations.append(
                    f"Plastic Surgery / Clinical Review at 30 days post-healing to evaluate permanent facial disfigurement under BNS Sec 116(6)."
                )
                rationale_points.append(
                    f"{inj_label}: Significant facial wound with potential for permanent scar/disfiguration (BNS Sec 116 Clause 6)."
                )

            # Case Rule 4: Life-endangering / Cavity penetration
            elif depth_layer in ["bone", "cavity"] or any(k in notes for k in ["pneumothorax", "hemoperitoneum", "shock", "intracranial", "deep stab"]):
                has_pending_grievous = True
                pending_investigations.append(
                    f"Urgent Contrast CT / Ultrasound (FAST) scan to rule out visceral/intracranial injury endangering life under BNS Sec 116(8)."
                )
                rationale_points.append(
                    f"{inj_label}: Deep trauma extending to body cavity/vital tissue layers; life endangerment criteria invoked."
                )

            # Case Rule 5: Simple superficial hurt
            else:
                rationale_points.append(
                    f"{inj_label}: Superficial tissue injury confined to {depth_layer.lower()} layer without immediate bony or organ compromise (Simple Hurt - BNS Sec 114)."
                )

        # Deduplicate pending investigations
        unique_pending = list(dict.fromkeys(pending_investigations))

        # Determine Final Suggested Category
        if has_pending_grievous or unique_pending:
            category = "Pending Investigation"
            confidence = 0.88
            primary_bns = "BNS Section 116 Clause (7) / Section 117 (Provisional)"
            summary_rationale = (
                "Case contains trauma features that cannot be definitively concluded in the ER. "
                "In accordance with forensic medical jurisprudence, the injury is categorized as "
                "PROVISIONAL / PENDING INVESTIGATION awaiting diagnostic reports."
            )
        elif has_confirmed_grievous:
            category = "Grievous Hurt"
            confidence = 0.95
            primary_bns = "BNS Section 116 / Section 117"
            summary_rationale = (
                "Documented injuries satisfy statutory criteria for Grievous Hurt under Bharatiya Nyaya Sanhita Section 116."
            )
        else:
            category = "Simple Hurt"
            confidence = 0.92
            primary_bns = "BNS Section 114 / Section 115"
            summary_rationale = (
                "Documented injuries are bodily injuries of a superficial nature causing pain/infirmity "
                "without meeting the statutory definitions of grievous hurt (BNS Section 114)."
            )

        if has_dangerous_weapon:
            primary_bns += " read with Section 118 (Dangerous Weapon / Means)"

        full_rationale = f"{summary_rationale}\n\nClinical Breakdown:\n" + "\n".join(f"• {r}" for r in rationale_points)

        # Sort cited clauses by relevance score
        sorted_clauses = sorted(cited_clauses_dict.values(), key=lambda c: c.relevance_score, reverse=True)

        return LegalClassification(
            suggested_category=category,
            confidence=confidence,
            primary_bns_section=primary_bns,
            cited_clauses=sorted_clauses,
            rationale=full_rationale,
            pending_investigations=unique_pending
        )
