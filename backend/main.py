from pathlib import Path
import os
import json

from fastapi import FastAPI, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel, Field

from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone

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
    criterion_id: str 


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

class CriterionAnalysisSchema(BaseModel):
    match_percentage: int = Field(
        description="Level of alignment between the target company and the acquisition criterion, from 0 to 100."
    )
    confidence_score: str = Field(
        description="Gemini's Confidence in the assessment based strictly on available content, available options low, med, high."
    )
    reasoning: str = Field(
        description="Detailed, professional explanation of why the match_percentage was assigned, referencing specific aspects of the company and the criterion. 200 words minimum."
    )
    quoted_evidence: List[str] = Field(
        description='List of evidence strings like: "<Exact quoted excerpt from the website content>"'
    )
    sources: List[str] = Field(
        description='List of source URLs corresponding to the quoted evidence, in the same order. So sources[i] is the source for quoted_evidence[i].'
    )

class SearchFilters(BaseModel):
    region: str
    headcount: str
    maxCompanies: int

class SearchIn(BaseModel):
    query: str
    filters: SearchFilters

class CompanySchema(BaseModel):
    name: str = Field(description="Full legal or trading name of the company")
    website: str = Field(description="Company website URL, e.g. https://www.example.com")
    industry: str = Field(description="Primary industry or vertical the company operates in")
    region: str = Field(description="Geographic region or country where the company is headquartered")
    headcount: str = Field(description="Approximate employee headcount range, e.g. 51-200")
    matchReason: str = Field(description="One sentence explaining why this company directly matches the search query")

class SearchResultSchema(BaseModel):
    companies: List[CompanySchema]

class EvaluationCompanyIn(BaseModel):
    name: str
    website: str

class EvaluationIn(BaseModel):
    searchId: str | None
    companies: List[EvaluationCompanyIn]

class EvaluationNameUpdate(BaseModel):
    name: str

def analyze_company_against_criterion(company_url: str, criterion: dict) -> dict:
    full_prompt = f"""
    You are an expert Mergers and Acquisitions (M&A) analyst AI assisting JDM Technology Group. JDM Technology Group employs a "buy and build" strategy, acquiring vertical market B2B software companies, specifically within the architecture, engineering, construction, maintenance, and operations industries. Your objective is to evaluate a potential target company against a specific JDM Technology Group acquisition criterion by analyzing the company's website content and any supplemental web sources you can find.

    Inputs:
    - Target Company website link: {company_url}
    - Criterion title: {criterion["title"]}
    - Criterion description: {criterion["description"]}

    Instructions:
    1. Thoroughly crawl the provided Target Company website to gather comprehensive information: About Us, Product/Service Offerings, Pricing, Customer Testimonials, Case Studies, Press Releases, and any other relevant sections.
    2. Use your web search capability to find supplemental public information about the company including recent news, financial data, customer reviews, and industry analyses.
    3. Evaluate how well the target company aligns with the provided criterion. Consider products/services, market position, financial performance, customer base, and growth trajectory.
    4. Determine a Match Percentage (0-100) where 0% means no alignment and 100% means perfect alignment.
    5. Determine a Confidence Score (low, med, high) based strictly on available content.
    6. Extract exact quotes from the website that justify your evaluation, and provide source links for each quote.

    ### CRITICAL JSON OUTPUT CONSTRAINTS
    - Fill out all fields of the JSON schema you were given.
    - Pure JSON output only — no explanation, commentary, or extra text.
    - No JSON comments.
    - Ensure all string values have proper escape characters.
    - DO NOT WRITE OUT THINKING.
    """

    response = gemini_client.models.generate_content(
        model="gemini-3.1-pro-preview",
        contents=full_prompt,
        config=GenerateContentConfig(
            response_mime_type="application/json",
            response_json_schema=CriterionAnalysisSchema.model_json_schema(),
        ),
    )

    analysis = CriterionAnalysisSchema.model_validate_json(response.text)

    return {
        "criterionId": criterion["id"],
        "criterionTitle": criterion["title"],
        "companyName": criterion.get("companyName", ""),
        "companyWebsite": company_url,
        "matchPercentage": analysis.match_percentage,
        "confidenceScore": analysis.confidence_score,
        "reasoning": analysis.reasoning,
        "quotedEvidence": analysis.quoted_evidence,
        "sources": analysis.sources,
    }

def run_evaluation_task(evaluation_id: str, companies: list, criteria: list):
    for company in companies:  # sequential per company
        with ThreadPoolExecutor(max_workers=len(criteria)) as executor:
            futures = {
                executor.submit(
                    analyze_company_against_criterion,
                    company["website"],
                    {**criterion, "companyName": company["name"]}
                ): criterion
                for criterion in criteria
            }

            for future in as_completed(futures):
                try:
                    result = future.result()
                    result["companyName"] = company["name"]
                    result["companyWebsite"] = company["website"]

                    db.collection("evaluations").document(evaluation_id).update({
                        "results": firestore.ArrayUnion([result]),
                        "completedItems": firestore.Increment(1),
                    })
                except Exception as e:
                    print(f"Error evaluating {company['website']}: {e}")
                    db.collection("evaluations").document(evaluation_id).update({
                        "completedItems": firestore.Increment(1),
                    })

    db.collection("evaluations").document(evaluation_id).update({
        "status": "complete"
    })


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
    doc_ref = db.collection("criteria").document(body.criterion_id)
    doc = doc_ref.get()
    if not doc.exists:
        return {"error": f"Criterion {body.criterion_id} not found"}

    data = doc.to_dict() or {}

    active_criterion = {
        "title": data.get("title", ""),
        "description": data.get("description", ""),
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
    5. Determine a Confidence Score (low, med, high) indicating how confident you are in your assessment based strictly on the crawled content (e.g., if the website lacks pricing/revenue data for a financial criterion, the confidence score should be low).
    6. Extract exact quotes from the website content that justify your evaluation, and provide the source links for each quote.

    ### CRITICAL JSON OUTPUT CONSTRAINTS
    - Fill out all fields of the JSON schema you were given.
    - Do not add explanation, commentary, or extra text to JSON output; keep it pure JSON output
    - Do not add JSON comments in between, whatever has to be written within the  values
    - Ensure you add escape characters to all the string values wherever applicable
    - DO NOT WRITE OUT THINKING.
    - Pure JSON output is expected and any deviation from that will be considered a failure in adhering to the output format.
    - Double check if the JSON is valid and has all the escape characters in place for values, all field names and structures matches to given JSON output sample, no JSON comments, etc.
    """


    response = gemini_client.models.generate_content(
        model="gemini-3.1-pro-preview",
        contents=full_prompt,
        config=GenerateContentConfig(
            response_mime_type="application/json",
            response_json_schema=CriterionAnalysisSchema.model_json_schema(),
        ),
    )

    analysis = CriterionAnalysisSchema.model_validate_json(response.text)
    return {"analysis": analysis}

@app.post("/api/search")
def search(body: SearchIn):
    prompt = f"""
    You are a precise M&A research assistant helping identify acquisition targets for JDM Technology Group, a private equity firm that acquires vertical market B2B software companies.

    Your task: Find real, verifiable companies that are a STRONG match for the following search query. Use Google Search to verify each company exists and matches before including it.

    Search Query: "{body.query}"

    Filters to apply:
    - Region: {body.filters.region} (if "Global", include companies from any region)
    - Headcount: {body.filters.headcount} (if "Any", include companies of any size)
    - Target count: up to {body.filters.maxCompanies} companies

    Strict rules:
    1. ONLY include companies whose PRIMARY product or service directly matches the search query. Do not include adjacent, related, or partially-matching companies.
    2. If a company's core product does not match the query, exclude it — even if it fills a similar market need.
    3. It is better to return FEWER high-quality matches than to pad the list with weak matches. If only 7 strong matches exist, return 7.
    4. Every company must be real and verifiable via web search with a working website.
    5. Do not repeat the same company twice.
    6. Apply region and headcount filters strictly — exclude companies that don't meet them.
    7. Return results as pure JSON. No commentary, no explanation.

    Example of what NOT to do:
    - Query: "Electrical estimating software" → do NOT include generic construction estimating software, project management software, or field service software. Only include software whose primary purpose is estimating for electrical contractors.
    """

    response = gemini_client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt,
        config=GenerateContentConfig(
            tools=[Tool(google_search=GoogleSearch())],
            response_mime_type="application/json",
            response_json_schema=SearchResultSchema.model_json_schema(),
        ),
    )

    result = SearchResultSchema.model_validate_json(response.text)

    # Persist to Firestore
    doc_ref = db.collection("searches").add({
        "query": body.query,
        "filters": body.filters.model_dump(),
        "createdAt": firestore.SERVER_TIMESTAMP,
        "companies": [c.model_dump() for c in result.companies],
    })

    search_id = doc_ref[1].id

    return {
        "searchId": search_id,
        "companies": result.companies,
    }

@app.post("/api/evaluations")
def create_evaluation(body: EvaluationIn, background_tasks: BackgroundTasks):
    # Fetch all active, non-deleted criteria
    criteria_docs = (
        db.collection("criteria")
        .where(filter=FieldFilter("isActive", "==", True))
        .where(filter=FieldFilter("isDeleted", "==", False))
        .stream()
    )

    criteria = []
    for doc in criteria_docs:
        data = doc.to_dict() or {}
        criteria.append({
            "id": doc.id,
            "title": data.get("title", ""),
            "description": data.get("description", ""),
        })

    if not criteria:
        return {"error": "No active criteria found"}

    companies = [c.model_dump() for c in body.companies]
    total_items = len(companies) * len(criteria)
    now = datetime.now(timezone.utc)
    auto_name = f"Evaluation — {now.strftime('%b %d, %Y %I:%M %p')}"

    doc_ref = db.collection("evaluations").add({
        "name": auto_name,
        "searchId": body.searchId,
        "createdAt": now.isoformat(),
        "status": "running",
        "companies": companies,
        "criteria": [{"id": c["id"], "title": c["title"], "description": c["description"]} for c in criteria],
        "totalItems": total_items,
        "completedItems": 0,
        "results": [],
    })

    evaluation_id = doc_ref[1].id

    # Returns immediately — Gemini processing happens in background
    background_tasks.add_task(run_evaluation_task, evaluation_id, companies, criteria)

    return {"evaluationId": evaluation_id}

@app.get("/api/evaluations/{evaluation_id}")
def get_evaluation(evaluation_id: str):
    doc = db.collection("evaluations").document(evaluation_id).get()
    if not doc.exists:
        return {"error": "Evaluation not found"}
    data = doc.to_dict() or {}
    return {"id": evaluation_id, **data}


@app.patch("/api/evaluations/{evaluation_id}")
def update_evaluation_name(evaluation_id: str, body: EvaluationNameUpdate):
    db.collection("evaluations").document(evaluation_id).update({
        "name": body.name
    })
    return {"ok": True}


# Catch-all: serve React app for any non-API route
# This enables client-side routing (React Router) to work on direct URL access
@app.get("/{full_path:path}", include_in_schema=False)
def serve_react_catchall(full_path: str):
    return FileResponse(str(FRONTEND_DIST / "index.html"))
