from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

ROOT = Path(__file__).resolve().parent.parent
FRONTEND_DIR = ROOT / "frontend"

# Serve frontend assets (style.css, app.js) from /static/...
app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

# Serve the actual page
@app.get("/", include_in_schema=False)
def index():
    return FileResponse(FRONTEND_DIR / "index.html")
