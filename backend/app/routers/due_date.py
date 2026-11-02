"""
Due Date router — simple_task_tracker
Proxies to AINative ZeroDB for storage. Requires AINative JWT in Authorization header.
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List
import httpx

router = APIRouter(prefix="/due-date", tags=["Due Date"])

AINATIVE_API_BASE = "https://api.ainative.studio/api/v1"


async def get_token(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    return authorization.removeprefix("Bearer ").strip()


class ItemCreate(BaseModel):
    content: str
    tags: List[str] = []


class ItemResponse(BaseModel):
    id: str
    content: str
    tags: List[str]
    created_at: str


@router.get("/", response_model=List[ItemResponse])
async def list_items(token: str = Depends(get_token)):
    """List all Due Date items via ZeroMemory recall."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{AINATIVE_API_BASE}/public/memory/v2/recall",
            json={"query": "due_date", "layer": "episodic", "limit": 50},
            headers={"Authorization": f"Bearer {token}"},
            timeout=10,
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail="ZeroMemory recall failed")
    data = resp.json()
    memories = data.get("results") or data.get("memories") or []
    # ZeroMemory's /recall result fields (content, tags, created_at) are typed
    # Optional and can legitimately be None, not just absent -- `or` defaults
    # handle both cases, unlike dict.get(key, default) which only covers "absent".
    return [
        ItemResponse(
            id=m["id"],
            content=m.get("content") or "",
            tags=m.get("tags") or [],
            created_at=m.get("created_at") or "",
        )
        for m in memories
    ]


@router.post("/", response_model=ItemResponse, status_code=201)
async def create_item(body: ItemCreate, token: str = Depends(get_token)):
    """Store a Due Date item via ZeroMemory remember."""
    from datetime import datetime, timezone
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{AINATIVE_API_BASE}/public/memory/v2/remember",
            json={
                "content": body.content,
                "memory_type": "episodic",
                "tags": ["due_date"] + body.tags,
                "importance": 0.7,
            },
            headers={"Authorization": f"Bearer {token}"},
            timeout=10,
        )
    if resp.status_code not in (200, 201):
        raise HTTPException(status_code=resp.status_code, detail="ZeroMemory remember failed")
    m = resp.json()
    # ZeroMemory's /remember response is {memory_id, status, memory_type, ...} --
    # it does NOT echo back content/tags/created_at, so build those from what we
    # already have locally rather than reading them off the response.
    return ItemResponse(
        id=m["memory_id"],
        content=body.content,
        tags=["due_date"] + body.tags,
        created_at=datetime.now(timezone.utc).isoformat(),
    )


@router.delete("/{item_id}")
async def delete_item(item_id: str, token: str = Depends(get_token)):
    """Delete a Due Date item via ZeroMemory forget."""
    async with httpx.AsyncClient() as client:
        resp = await client.delete(
            f"{AINATIVE_API_BASE}/public/memory/v2/forget/{item_id}",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10,
        )
    if resp.status_code not in (200, 204):
        raise HTTPException(status_code=resp.status_code, detail="ZeroMemory forget failed")
    return {"deleted": item_id}
