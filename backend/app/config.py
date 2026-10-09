import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
CERTIFICATES_DIR = DATA_DIR / "certificates"
DB_PATH = DATA_DIR / "mlc_assist.db"

# Ensure runtime directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
CERTIFICATES_DIR.mkdir(parents=True, exist_ok=True)

APP_TITLE = "MLC Assist API"
APP_VERSION = "1.0.0"
APP_DESCRIPTION = (
    "Medico-Legal Trauma Documentation, Legal Classification (BNS), "
    "Vague-Wording Flagging, and Tamper-Evident Certification"
)
