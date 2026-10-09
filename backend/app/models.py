from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
import uuid

class InjuryBase(BaseModel):
    anatomical_region: str = Field(..., description="e.g. Forehead, Right Forearm, Left Knee")
    body_side: Literal["anterior", "posterior"] = Field("anterior", description="Front or back of body")
    x_coord: float = Field(0.0, description="X percentage on 2D body diagram (0-100)")
    y_coord: float = Field(0.0, description="Y percentage on 2D body diagram (0-100)")
    injury_type: str = Field(..., description="Abrasion, Contusion/Hematoma, Laceration, Incised Wound, Stab Wound, Fracture, Burn, Deformity")
    length_cm: float = Field(0.0, description="Length in centimeters")
    width_cm: float = Field(0.0, description="Width in centimeters")
    depth_cm: Optional[float] = Field(None, description="Depth in centimeters if applicable")
    depth_layer: Optional[str] = Field("Skin", description="Skin, Subcutaneous, Muscle, Bone, Cavity")
    shape: Optional[str] = Field("Linear", description="Linear, Oval, Irregular, Spindle, Circular")
    margins: Optional[str] = Field("Clean-cut", description="Clean-cut, Ragged, Contused, Inverted, Everted")
    age_of_injury: Optional[str] = Field("Fresh / Red", description="Fresh / Red, Bluish-black (2-4 days), Greenish-yellow (4-7 days), Healed/Scabbed")
    suspected_weapon: Optional[str] = Field("Blunt force", description="Blunt force, Sharp cutting, Sharp pointed, Thermal/Burn, Friction")
    clinical_notes: Optional[str] = Field("", description="Doctor's descriptive clinical note")

class InjuryCreate(InjuryBase):
    pass

class Injury(InjuryBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    case_id: str
    created_at: datetime = Field(default_factory=datetime.now)

class CaseBase(BaseModel):
    mlc_number: Optional[str] = None
    patient_name: str
    age: int
    gender: Literal["Male", "Female", "Other"]
    guardian_name: Optional[str] = ""
    address: Optional[str] = ""
    brought_by: Optional[str] = "Self / Relatives"
    police_station: Optional[str] = "Casualty Outpost"
    constable_details: Optional[str] = ""
    incident_history: Optional[str] = ""
    examination_date_time: Optional[str] = ""
    doctor_name: str = "Dr. S. Sharma, MD (Forensic Medicine / EMO)"
    doctor_reg_no: str = "MCI-489201"
    status: Literal["draft", "analyzed", "certified"] = "draft"

class CaseCreate(CaseBase):
    pass

class Case(CaseBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    injuries: List[Injury] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class VagueWordingFlag(BaseModel):
    phrase: str
    context: str
    category: str
    severity: Literal["high", "medium", "low"]
    issue: str
    suggestion: str

class StatutoryClauseCitation(BaseModel):
    section: str
    clause_number: Optional[int] = None
    clause_title: str
    verbatim_text: str
    relevance_score: float
    applies_to_injuries: List[str]

class LegalClassification(BaseModel):
    suggested_category: Literal["Simple Hurt", "Grievous Hurt", "Pending Investigation", "No Hurt Documented"]
    confidence: float
    primary_bns_section: str
    cited_clauses: List[StatutoryClauseCitation]
    rationale: str
    pending_investigations: List[str] = []
    doctor_decision: Optional[str] = None
    doctor_override_notes: Optional[str] = None

class CaseAnalysisResponse(BaseModel):
    case_id: str
    vague_wording_flags: List[VagueWordingFlag]
    legal_classification: LegalClassification
    summary: str

class WordingCheckRequest(BaseModel):
    text: str

class WordingCheckResponse(BaseModel):
    flags: List[VagueWordingFlag]
    cleaned_score: float
    total_issues: int

class CertificateVerificationResponse(BaseModel):
    is_valid: bool
    status: Literal["VERIFIED", "TAMPERED", "NOT_FOUND"]
    message: str
    case_id: Optional[str] = None
    mlc_number: Optional[str] = None
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None
    sha256_hash: Optional[str] = None
    generated_at: Optional[str] = None
    injuries_count: Optional[int] = None
    legal_opinion: Optional[str] = None

class CertificateGenerateRequest(BaseModel):
    doctor_name: Optional[str] = None
    doctor_reg_no: Optional[str] = None
    doctor_decision: Optional[str] = None
    doctor_notes: Optional[str] = None
    base_url: Optional[str] = "http://localhost:5173"

class CertificateResponse(BaseModel):
    certificate_id: str
    case_id: str
    mlc_number: str
    patient_name: str
    doctor_name: str
    sha256_hash: str
    pdf_filename: str
    pdf_url: str
    generated_at: str
    legal_opinion: str
    injuries_count: int

class VerifyHashRequest(BaseModel):
    sha256_hash: str

