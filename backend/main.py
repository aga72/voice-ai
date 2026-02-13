from pathlib import Path
import os
import json

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
from google.genai.types import Tool, GenerateContentConfig, GoogleSearch, UrlContext

GEM_API_KEY = os.getenv("GEMINI_API_KEY")
gemini_client = genai.Client(api_key=GEM_API_KEY)

tools = [
      {"url_context": {}},
      {"google_search": {}}
  ]

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
    company_url: str


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
    docs = (
        db.collection("criteria")
        .where(filter=FieldFilter("isActive", "==", True))
        .where(filter=FieldFilter("isDeleted", "==", False))
        .limit(1)
        .stream()
    )

    active_criterion = None
    for doc in docs:
        data = doc.to_dict() or {}
        active_criterion = {
            "title": data.get("title", ""),
            "description": data.get("description", ""),
        }
        break

    if active_criterion is None:
        # fallback so endpoint doesn’t explode if DB is empty
        active_criterion = {
            "title": "No active criterion found",
            "description": "There were no active criteria in Firestore.",
        }

    full_prompt = f"""
    You are an expert Mergers and Acquisitions (M&A) analyst AI assisting JDM Technology Group. JDM Technology Group employs a "buy and build" strategy, acquiring vertical market B2B software companies, specifically within the architecture, engineering, construction, maintenance, and operations industries. They typically target companies with their own private, critical, and very specific criteria. Your objective is to evaluate a potential target company against a specific JDM Technology Group acquisition criterion by analyzing the company's entire sitemapped website content and any supplemental web sources you are able to find.

    Inputs:
    - Target Company website link: {body.company_url}
    - Criterion title: {active_criterion["title"]}
    - Criterion description: {active_criterion["description"]}

    Instructions:
    1. Thoroughly crawl the provided Target Company Website Content to gather comprehensive information about the company such as About Us, Product/Service Offerings, Pricing, Customer Testimonials, Case Studies, Press Releases, and any other relevant sections.
    2. Utilize your web crawling capabilities to access publicly available information and any relevant supplemental web sources to gather comprehensive information about the company and the sector, industry, and market that it operates in. This includes, but is not limited to, recent news, financial data, customer reviews, and industry analyses.
    3. Based on the above crawled information, evaluate how well the target company aligns with the provided Criterion Title and Criterion Description. Consider all relevant aspects of the company, including its products/services, market position, financial performance, customer base, growth trajectory, and any other factors that are pertinent to the criterion.
    4. Determine a Match Percentage (0-100) indicating the level of alignment between the target company and the acquisition criterion, where 0% means no alignment at all and 100% means perfect alignment. Be sure to weigh all relevant factors appropriately in your assessment.
    5. Determine a Confidence Score (0-100) indicating how confident you are in your assessment based strictly on the crawled content (e.g., if the website lacks pricing/revenue data for a financial criterion, the confidence score should be low).
    6. Extract exact quotes from the website content that justify your evaluation, and provide the source links for each quote.

    Output Format: You must return your response in the following strict JSON format without any markdown formatting or conversational text outside of the JSON block:
    {{ "match_percentage": <integer from 0 to 100>, "confidence_score": <integer from 0 to 100>, "reasoning": "<A detailed, professional explanation of why you assigned the match percentage, analyzing specific aspects of the company as it relates to the criterion.>", "quoted_evidence": [ "<Exact quote 1 from the website content> - <source-link-1>", "<Exact quote 2 from the website content> - <source-link-2>" ] }}
    """


    response = gemini_client.models.generate_content(
        model="gemini-2.5-flash",
        contents=full_prompt,
        config=GenerateContentConfig(tools=tools,)
    )

    candidate = response.candidates[0]
    reply_text = candidate.content.parts[0].text if candidate.content.parts else ""

    # Try to extract the first JSON object from reply_text
    parsed = None
    try:
        parsed = json.loads(reply_text)
    except json.JSONDecodeError:
        # fallback: try to find first '{' and last '}' and parse that slice
        start = reply_text.find("{")
        end = reply_text.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                parsed = json.loads(reply_text[start : end + 1])
            except json.JSONDecodeError:
                parsed = None

    if parsed is None:
        # if everything fails, surface the raw text so you can debug
        return {
            "error": "MODEL_JSON_PARSE_FAILED",
            "raw_reply": reply_text,
        }

    url_context_metadata = getattr(candidate, "url_context_metadata", None)
    grounding_metadata = getattr(candidate, "groundingMetadata", None)

    return {
        "analysis": parsed,
        "url_context_metadata": url_context_metadata,
        "grounding_metadata": grounding_metadata,
    }
