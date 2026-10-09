from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import uuid
from datetime import datetime

from ..models import Case, CaseCreate, Injury, InjuryCreate
from .. import database as db

router = APIRouter(prefix="/cases", tags=["Cases"])

@router.post("", response_model=Dict[str, Any])
def create_new_case(case_in: CaseCreate):
    case_dict = case_in.model_dump()
    case_id = str(uuid.uuid4())
    case_dict["id"] = case_id
    db.create_case(case_dict)
    return {"success": True, "case_id": case_id, "message": "MLC Case initialized successfully"}

@router.get("", response_model=List[Dict[str, Any]])
def get_all_cases():
    return db.list_cases()

@router.get("/{case_id}", response_model=Dict[str, Any])
def get_case_by_id(case_id: str):
    case = db.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="MLC Case not found")
    return case

@router.post("/{case_id}/injuries", response_model=Dict[str, Any])
def add_case_injury(case_id: str, injury_in: InjuryCreate):
    case = db.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="MLC Case not found")
    
    inj_dict = injury_in.model_dump()
    inj_id = str(uuid.uuid4())
    inj_dict["id"] = inj_id
    db.add_injury(case_id, inj_dict)
    return {"success": True, "injury_id": inj_id, "message": "Injury added to case"}

@router.delete("/injuries/{injury_id}", response_model=Dict[str, Any])
def remove_case_injury(injury_id: str):
    db.delete_injury(injury_id)
    return {"success": True, "message": "Injury removed"}

@router.post("/demo/seed", response_model=Dict[str, Any])
def seed_demo_cases():
    """Pre-seeds the three official demo cases from the project specification"""
    seeded_cases = []

    # Case 1: Blunt-force assault
    case_1_id = f"demo-assault-{uuid.uuid4().hex[:6]}"
    case_1 = {
        "id": case_1_id,
        "mlc_number": f"MLC/{datetime.now().strftime('%Y%m%d')}/ASSAULT",
        "patient_name": "Rajesh Verma",
        "age": 34,
        "gender": "Male",
        "guardian_name": "Suresh Verma (Father)",
        "address": "Sector 4, Central Colony, Guwahati",
        "brought_by": "Head Constable Dilip Kumar (Belt #412)",
        "police_station": "Paltan Bazar Police Station",
        "constable_details": "Constable Dilip Kumar, GD No. 84/2026",
        "incident_history": "Alleged physical assault by known persons with wooden lathi and fists following an argument around 18:30 hrs today. Complains of severe pain over left chest and forehead.",
        "examination_date_time": datetime.now().strftime("%d-%m-%Y %H:%M HRS"),
        "doctor_name": "Dr. Ananya Roy, MD (EMO)",
        "doctor_reg_no": "MCI-529144",
        "status": "draft"
    }
    db.create_case(case_1)
    
    # Injuries for Case 1
    db.add_injury(case_1_id, {
        "id": str(uuid.uuid4()),
        "anatomical_region": "Forehead (Right supraorbital)",
        "body_side": "anterior",
        "x_coord": 52.0,
        "y_coord": 8.5,
        "injury_type": "Contusion/Hematoma",
        "length_cm": 4.0,
        "width_cm": 3.0,
        "depth_cm": 0.5,
        "depth_layer": "Subcutaneous",
        "shape": "Oval",
        "margins": "Contused",
        "age_of_injury": "Fresh / Red",
        "suspected_weapon": "Blunt force (Wooden stick / fist)",
        "clinical_notes": "Reddish-purple swelling with focal ecchymosis. Pupils equal and reactive."
    })
    db.add_injury(case_1_id, {
        "id": str(uuid.uuid4()),
        "anatomical_region": "Left 5th-6th Rib (Thorax)",
        "body_side": "anterior",
        "x_coord": 38.0,
        "y_coord": 32.0,
        "injury_type": "Contusion/Hematoma",
        "length_cm": 6.0,
        "width_cm": 2.5,
        "depth_cm": 0.8,
        "depth_layer": "Subcutaneous",
        "shape": "Linear",
        "margins": "Contused",
        "age_of_injury": "Fresh / Red",
        "suspected_weapon": "Blunt force",
        "clinical_notes": "Marked tenderness on palpation and springing of rib cage; crepitus suspected. Referred for urgent PA view chest X-ray to confirm bony fracture."
    })
    seeded_cases.append({"id": case_1_id, "title": "Blunt-force Assault (Forehead contusion + Rib tenderness)"})

    # Case 2: Knife wound
    case_2_id = f"demo-knife-{uuid.uuid4().hex[:6]}"
    case_2 = {
        "id": case_2_id,
        "mlc_number": f"MLC/{datetime.now().strftime('%Y%m%d')}/KNIFE",
        "patient_name": "Amit Sen",
        "age": 28,
        "gender": "Male",
        "guardian_name": "Rina Sen (Spouse)",
        "address": "Bhangagarh Road, Kamrup Metro",
        "brought_by": "Neighbours & Self",
        "police_station": "Bhangagarh PS",
        "constable_details": "ASI B. Borah, GD No. 19/2026",
        "incident_history": "History of armed altercation with a sharp knife at 19:45 hrs. Defensive warding off motion causing deep cut to left forearm.",
        "examination_date_time": datetime.now().strftime("%d-%m-%Y %H:%M HRS"),
        "doctor_name": "Dr. Ananya Roy, MD (EMO)",
        "doctor_reg_no": "MCI-529144",
        "status": "draft"
    }
    db.create_case(case_2)

    db.add_injury(case_2_id, {
        "id": str(uuid.uuid4()),
        "anatomical_region": "Left Forearm (Volar aspect)",
        "body_side": "anterior",
        "x_coord": 32.0,
        "y_coord": 45.0,
        "injury_type": "Incised Wound",
        "length_cm": 6.0,
        "width_cm": 1.5,
        "depth_cm": 2.0,
        "depth_layer": "Muscle",
        "shape": "Spindle",
        "margins": "Clean-cut",
        "age_of_injury": "Fresh / Red",
        "suspected_weapon": "Sharp cutting (Knife / Razor blade)",
        "clinical_notes": "Edges clean-cut and regular. Tailing observed at lower end indicating stroke direction. Deep wound bleeding with exposed subcutaneous fascia; active hemostasis achieved."
    })
    seeded_cases.append({"id": case_2_id, "title": "Knife Wound (Incised wound left forearm, clean margins)"})

    # Case 3: Road Traffic Accident (RTA)
    case_3_id = f"demo-rta-{uuid.uuid4().hex[:6]}"
    case_3 = {
        "id": case_3_id,
        "mlc_number": f"MLC/{datetime.now().strftime('%Y%m%d')}/RTA",
        "patient_name": "Pooja Das",
        "age": 24,
        "gender": "Female",
        "guardian_name": "Mihir Das (Brother)",
        "address": "Jalukbari, Guwahati",
        "brought_by": "108 Ambulance EMRI",
        "police_station": "Jalukbari PS",
        "constable_details": "108 Paramedic Team",
        "incident_history": "Two-wheeler skid against asphalt road after being clipped by a speeding car at 17:15 hrs. Fall on right shoulder and right knee.",
        "examination_date_time": datetime.now().strftime("%d-%m-%Y %H:%M HRS"),
        "doctor_name": "Dr. Ananya Roy, MD (EMO)",
        "doctor_reg_no": "MCI-529144",
        "status": "draft"
    }
    db.create_case(case_3)

    db.add_injury(case_3_id, {
        "id": str(uuid.uuid4()),
        "anatomical_region": "Right Shoulder / Clavicular Region",
        "body_side": "anterior",
        "x_coord": 60.0,
        "y_coord": 24.0,
        "injury_type": "Deformity",
        "length_cm": 5.0,
        "width_cm": 3.0,
        "depth_cm": None,
        "depth_layer": "Bone",
        "shape": "Irregular",
        "margins": "Contused",
        "age_of_injury": "Fresh / Red",
        "suspected_weapon": "Friction / Blunt surface (Road impact)",
        "clinical_notes": "Step deformity noted at lateral third of right clavicle with local tenderness and restricted shoulder abduction. Radiography of right shoulder & clavicle advised to confirm fracture."
    })
    db.add_injury(case_3_id, {
        "id": str(uuid.uuid4()),
        "anatomical_region": "Right Knee (Anterior patellar)",
        "body_side": "anterior",
        "x_coord": 61.0,
        "y_coord": 72.0,
        "injury_type": "Abrasion",
        "length_cm": 5.5,
        "width_cm": 4.0,
        "depth_cm": 0.1,
        "depth_layer": "Skin",
        "shape": "Irregular",
        "margins": "Ragged",
        "age_of_injury": "Fresh / Red",
        "suspected_weapon": "Friction (Rough asphalt)",
        "clinical_notes": "Multiple linear graze abrasions with dirt particles embedded; epidermal peeling present."
    })
    seeded_cases.append({"id": case_3_id, "title": "Road Traffic Accident (Right clavicle deformity + Knee abrasions)"})

    return {
        "success": True,
        "message": "3 Official Demo Cases seeded successfully into SQLite database",
        "cases": seeded_cases
    }
