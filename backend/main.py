from pathlib import Path
import os

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import firebase_admin
from firebase_admin import firestore
from google.cloud.firestore_v1 import FieldFilter

from google import genai
from google.genai import types

GEM_API_KEY = os.getenv("GEMINI_API_KEY")
gemini_client = genai.Client(api_key=GEM_API_KEY)

app = FastAPI()

# CORS middleware for development (optional in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev
        "http://localhost:8080",  # Docker / combined frontend+backend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Firebase Admin SDK (uses Cloud Run service account when deployed)
firebase_admin.initialize_app()
db = firestore.client()

# ============================================
# Serve React Build (Static Files)
# ============================================
ROOT = Path(__file__).resolve().parent.parent  # /app
FRONTEND_DIST = ROOT / "frontend" / "dist"     # /app/frontend/dist

# Mount static assets (JS, CSS, images)
app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

# Serve React's index.html for all non-API routes
@app.get("/", include_in_schema=False)
def serve_react_app():
    return FileResponse(str(FRONTEND_DIST / "index.html"))

# Health check
@app.get("/health", include_in_schema=False)
def health():
    return {"ok": True}

# ---- API ----
class MessageIn(BaseModel):
    message: str
    author: str

class ChatIn(BaseModel):
    prompt: str

class CriterionBase(BaseModel):
    title: str
    description: str
    isActive: bool

class CriterionUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    isActive: bool | None = None
    isDeleted: bool | None = None

class CriterionOut(CriterionBase):
    id: str

@app.get("/api/criteria", response_model=list[CriterionOut])
def list_criteria():
    docs = (
        db.collection("criteria")
        .where(filter=FieldFilter("isDeleted", "==", False))
        .stream()
    )

    items: list[CriterionOut] = []

    for doc in docs:
        data = doc.to_dict() or {}
        item = CriterionOut(
            id=doc.id,
            title=data.get("title", ""),
            description=data.get("description", ""),
            isActive=data.get("isActive", True),
        )
        items.append(item)

    return items

@app.patch("/api/criteria/{criterion_id}")
def update_criterion(criterion_id: str, body: CriterionUpdate):
    updates: dict = {}

    if body.title is not None:
        updates["title"] = body.title
    if body.description is not None:
        updates["description"] = body.description
    if body.isActive is not None:
        updates["isActive"] = body.isActive
    if body.isDeleted is not None:
        updates["isDeleted"] = body.isDeleted

    if not updates:
        return {"ok": True}  # nothing to change

    db.collection("criteria").document(criterion_id).update(updates)
    return {"ok": True}

@app.post("/api/criteria", response_model=CriterionOut)
def create_criterion(body: CriterionBase):
    doc_ref = db.collection("criteria").add({
        "title": body.title,
        "description": body.description,
        "isActive": body.isActive,
        "isDeleted": False,
    })

    new_id = doc_ref[1].id

    return CriterionOut(
        id=new_id,
        title=body.title,
        description=body.description,
        isActive=body.isActive,
    )

@app.post("/api/messages")
def create_message(body: MessageIn):
    doc_ref = db.collection("messages").add({
        "message": body.message,
        "author": body.author 
    })
    return {"ok": True, "id": doc_ref[1].id}

@app.post("/api/chat")
def chat(body: ChatIn):
    response = gemini_client.models.generate_content(
        model='gemini-2.5-flash',
        contents=body.prompt
    )
    
    return {"reply": response.text}