from pathlib import Path
import os

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import firebase_admin
from firebase_admin import firestore

from google import genai
from google.genai import types

GEM_API_KEY = os.getenv("GEMINI_API_KEY")
gemini_client = genai.Client(api_key=GEM_API_KEY)

app = FastAPI()

# CORS middleware for development (optional in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
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