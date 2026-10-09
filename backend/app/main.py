from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from .config import APP_TITLE, APP_VERSION, APP_DESCRIPTION, CERTIFICATES_DIR
from .database import init_db
from .routes import cases, analysis, legal, certificates, verify

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title=APP_TITLE,
    version=APP_VERSION,
    description=APP_DESCRIPTION,
    lifespan=lifespan
)

# Enable CORS for React frontend (Vite default :5173 / localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve generated certificate PDFs statically if directory exists
if CERTIFICATES_DIR.exists():
    app.mount("/static/certificates", StaticFiles(directory=str(CERTIFICATES_DIR)), name="certificates")

# Register API Routers
app.include_router(cases.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(legal.router, prefix="/api")
app.include_router(certificates.router, prefix="/api")
app.include_router(verify.router, prefix="/api")


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": APP_TITLE,
        "version": APP_VERSION,
        "mode": "local",
        "features": [
            "2D SVG Body Diagram Capture",
            "BNS Statutory Legal Classification (RAG)",
            "Real-Time Vague Wording Linter",
            "SHA-256 Tamper-Evident Certification"
        ]
    }
