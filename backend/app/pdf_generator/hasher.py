import hashlib
import io
import qrcode
from PIL import Image

def compute_sha256_bytes(data: bytes) -> str:
    """Computes lowercase SHA-256 hex digest for given bytes."""
    return hashlib.sha256(data).hexdigest().lower()

def compute_sha256_file(filepath: str) -> str:
    """Computes lowercase SHA-256 hex digest for a file."""
    sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            sha256.update(chunk)
    return sha256.hexdigest().lower()

def generate_qr_code_image(data_text: str, box_size: int = 4, border: int = 2) -> io.BytesIO:
    """Generates a QR code image as BytesIO stream."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=box_size,
        border=border,
    )
    qr.add_data(data_text)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#0F172A", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer
