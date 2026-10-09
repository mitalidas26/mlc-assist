import sqlite3
import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from .config import DB_PATH
from .models import Case, Injury, CertificateVerificationResponse

def get_connection():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Cases table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cases (
            id TEXT PRIMARY KEY,
            mlc_number TEXT,
            patient_name TEXT NOT NULL,
            age INTEGER NOT NULL,
            gender TEXT NOT NULL,
            guardian_name TEXT,
            address TEXT,
            brought_by TEXT,
            police_station TEXT,
            constable_details TEXT,
            incident_history TEXT,
            examination_date_time TEXT,
            doctor_name TEXT,
            doctor_reg_no TEXT,
            status TEXT DEFAULT 'draft',
            created_at TEXT,
            updated_at TEXT
        )
    """)
    
    # Injuries table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS injuries (
            id TEXT PRIMARY KEY,
            case_id TEXT NOT NULL,
            anatomical_region TEXT NOT NULL,
            body_side TEXT DEFAULT 'anterior',
            x_coord REAL DEFAULT 0.0,
            y_coord REAL DEFAULT 0.0,
            injury_type TEXT NOT NULL,
            length_cm REAL DEFAULT 0.0,
            width_cm REAL DEFAULT 0.0,
            depth_cm REAL,
            depth_layer TEXT DEFAULT 'Skin',
            shape TEXT DEFAULT 'Linear',
            margins TEXT DEFAULT 'Clean-cut',
            age_of_injury TEXT DEFAULT 'Fresh / Red',
            suspected_weapon TEXT DEFAULT 'Blunt force',
            clinical_notes TEXT DEFAULT '',
            created_at TEXT,
            FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
        )
    """)
    
    # Certificates & verification registry
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS certificates (
            certificate_id TEXT PRIMARY KEY,
            case_id TEXT NOT NULL UNIQUE,
            mlc_number TEXT,
            patient_name TEXT,
            doctor_name TEXT,
            sha256_hash TEXT NOT NULL UNIQUE,
            pdf_filename TEXT NOT NULL,
            legal_opinion TEXT,
            injuries_count INTEGER DEFAULT 0,
            generated_at TEXT,
            FOREIGN KEY (case_id) REFERENCES cases(id)
        )
    """)
    
    conn.commit()
    conn.close()

# Case CRUD operations
def create_case(case_data: Dict[str, Any]) -> str:
    conn = get_connection()
    cursor = conn.cursor()
    case_id = case_data.get("id")
    now_str = datetime.now().isoformat()
    
    cursor.execute("""
        INSERT INTO cases (
            id, mlc_number, patient_name, age, gender, guardian_name, address,
            brought_by, police_station, constable_details, incident_history,
            examination_date_time, doctor_name, doctor_reg_no, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        case_id,
        case_data.get("mlc_number") or f"MLC/{datetime.now().strftime('%Y%m%d')}/{case_id[:6].upper()}",
        case_data.get("patient_name"),
        case_data.get("age"),
        case_data.get("gender"),
        case_data.get("guardian_name", ""),
        case_data.get("address", ""),
        case_data.get("brought_by", "Self / Relatives"),
        case_data.get("police_station", "Casualty Outpost"),
        case_data.get("constable_details", ""),
        case_data.get("incident_history", ""),
        case_data.get("examination_date_time") or datetime.now().strftime("%d-%m-%Y %H:%M HRS"),
        case_data.get("doctor_name", "Dr. S. Sharma, MD"),
        case_data.get("doctor_reg_no", "MCI-489201"),
        case_data.get("status", "draft"),
        now_str,
        now_str
    ))
    conn.commit()
    conn.close()
    return case_id

def get_case(case_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cases WHERE id = ?", (case_id,))
    case_row = cursor.fetchone()
    if not case_row:
        conn.close()
        return None
    
    case_dict = dict(case_row)
    
    cursor.execute("SELECT * FROM injuries WHERE case_id = ? ORDER BY created_at ASC", (case_id,))
    injury_rows = cursor.fetchall()
    case_dict["injuries"] = [dict(r) for r in injury_rows]
    
    conn.close()
    return case_dict

def list_cases() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cases ORDER BY created_at DESC")
    cases = []
    for row in cursor.fetchall():
        c = dict(row)
        cursor.execute("SELECT COUNT(*) as count FROM injuries WHERE case_id = ?", (c["id"],))
        c["injuries_count"] = cursor.fetchone()["count"]
        cases.append(c)
    conn.close()
    return cases

def add_injury(case_id: str, injury_data: Dict[str, Any]) -> str:
    conn = get_connection()
    cursor = conn.cursor()
    injury_id = injury_data.get("id")
    now_str = datetime.now().isoformat()
    
    cursor.execute("""
        INSERT INTO injuries (
            id, case_id, anatomical_region, body_side, x_coord, y_coord,
            injury_type, length_cm, width_cm, depth_cm, depth_layer,
            shape, margins, age_of_injury, suspected_weapon, clinical_notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        injury_id,
        case_id,
        injury_data.get("anatomical_region"),
        injury_data.get("body_side", "anterior"),
        injury_data.get("x_coord", 0.0),
        injury_data.get("y_coord", 0.0),
        injury_data.get("injury_type"),
        injury_data.get("length_cm", 0.0),
        injury_data.get("width_cm", 0.0),
        injury_data.get("depth_cm"),
        injury_data.get("depth_layer", "Skin"),
        injury_data.get("shape", "Linear"),
        injury_data.get("margins", "Clean-cut"),
        injury_data.get("age_of_injury", "Fresh / Red"),
        injury_data.get("suspected_weapon", "Blunt force"),
        injury_data.get("clinical_notes", ""),
        now_str
    ))
    
    # Update case timestamp
    cursor.execute("UPDATE cases SET updated_at = ? WHERE id = ?", (now_str, case_id))
    conn.commit()
    conn.close()
    return injury_id

def delete_injury(injury_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM injuries WHERE id = ?", (injury_id,))
    conn.commit()
    conn.close()

def save_certificate_record(record: Dict[str, Any]):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO certificates (
            certificate_id, case_id, mlc_number, patient_name, doctor_name,
            sha256_hash, pdf_filename, legal_opinion, injuries_count, generated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        record["certificate_id"],
        record["case_id"],
        record.get("mlc_number"),
        record.get("patient_name"),
        record.get("doctor_name"),
        record["sha256_hash"],
        record["pdf_filename"],
        record.get("legal_opinion", ""),
        record.get("injuries_count", 0),
        record.get("generated_at", datetime.now().isoformat())
    ))
    cursor.execute("UPDATE cases SET status = 'certified' WHERE id = ?", (record["case_id"],))
    conn.commit()
    conn.close()

def find_certificate_by_hash(sha256_hash: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM certificates WHERE sha256_hash = ?", (sha256_hash.strip().lower(),))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

# Initialize database tables on import
init_db()
