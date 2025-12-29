import os
import re
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="KeepIt", docs_url=None, redoc_url=None)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["Authorization", "Content-Type"],
)

AUTH_TOKEN = os.environ.get("KEEPIT_TOKEN", "")
DATA_DIR = Path(os.environ.get("KEEPIT_DATA_DIR", "/data"))


class ClipRequest(BaseModel):
    url: str
    title: str
    content: str
    timestamp: str


def slugify(text: str, max_len: int = 50) -> str:
    slug = re.sub(r'[^\w\s-]', '', text.lower())
    slug = re.sub(r'[\s_]+', '-', slug).strip('-')
    return slug[:max_len]


@app.post("/clip")
async def clip_page(
    request: ClipRequest,
    authorization: str = Header(None)
):
    if not AUTH_TOKEN:
        raise HTTPException(500, "Server token not configured")
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing or invalid authorization header")
    
    token = authorization[7:]
    if token != AUTH_TOKEN:
        raise HTTPException(403, "Invalid token")
    
    try:
        ts = datetime.fromisoformat(request.timestamp.replace('Z', '+00:00'))
    except ValueError:
        ts = datetime.utcnow()
    
    date_prefix = ts.strftime("%Y-%m-%d_%H%M%S")
    title_slug = slugify(request.title) or "untitled"
    filename = f"{date_prefix}_{title_slug}.md"
    
    markdown_content = f"""---
url: {request.url}
saved: {request.timestamp}
---

# {request.title}

{request.content}
"""
    
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    filepath = DATA_DIR / filename
    filepath.write_text(markdown_content, encoding='utf-8')
    
    return {"status": "saved", "filename": filename}


@app.get("/health")
async def health():
    return {"status": "ok"}

