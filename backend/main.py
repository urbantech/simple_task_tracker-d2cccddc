"""
simple_task_tracker — Backend API
Built on AINative Platform. Uses ZeroDB for storage, AINative JWT for auth.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.routers.task_creation import router as task_creation_router
from app.routers.task_listing import router as task_listing_router
from app.routers.task_completion import router as task_completion_router
from app.routers.due_date import router as due_date_router

app = FastAPI(
    title="simple_task_tracker API",
    version="0.1.0",
    description="Backend API for simple_task_tracker, powered by AINative platform"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.ainative.studio"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(task_creation_router, prefix='/api/v1')
app.include_router(task_listing_router, prefix='/api/v1')
app.include_router(task_completion_router, prefix='/api/v1')
app.include_router(due_date_router, prefix='/api/v1')

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "simple_task_tracker"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
