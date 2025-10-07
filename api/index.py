"""
Vercel serverless function entry point for FastAPI backend
"""
import sys
import os
from pathlib import Path

# Add backend directory to Python path
current_dir = Path(__file__).parent
backend_path = current_dir.parent / "backend"
sys.path.insert(0, str(backend_path))

try:
    # Import the FastAPI app
    from main import app
    
    # Vercel handler function
    def handler(request):
        return app(request.scope, request.receive, request.send)
    
    # Also export app directly for compatibility
    __all__ = ['app', 'handler']
    
except ImportError as e:
    # Fallback minimal app if main import fails
    from fastapi import FastAPI
    
    app = FastAPI(title="NASA Weather API - Minimal")
    
    @app.get("/")
    async def root():
        return {"message": "NASA Weather API is running (minimal mode)", "status": "ok"}
    
    @app.get("/health")
    async def health():
        return {"status": "healthy", "mode": "minimal"}
    
    def handler(request):
        return app(request.scope, request.receive, request.send)