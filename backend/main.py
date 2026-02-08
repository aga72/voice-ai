from pathlib import Path
import os

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import firebase_admin
from firebase_admin import firestore

from google import genai
from google.genai import types

GEM_API_KEY = os.getenv("GEMINI_API_KEY")
gemini_client = genai.Client(api_key=GEM_API_KEY)

app = FastAPI()

# Firebase Admin SDK (uses Cloud Run service account when deployed)
firebase_admin.initialize_app()
db = firestore.client()

# ---- Serve the website ----
ROOT = Path(__file__).resolve().parent.parent      # /app
FRONTEND_DIR = ROOT / "frontend"                  # /app/frontend

app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")  # /static/style.css, /static/app.js [web:496]

@app.get("/", include_in_schema=False)
def index():
    return FileResponse(str(FRONTEND_DIR / "index.html"))  # serve the page at / [web:491]

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