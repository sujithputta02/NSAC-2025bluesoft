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

# Import the FastAPI app
from main import app

# Export the FastAPI app for Vercel
# Vercel will automatically handle ASGI applications
app = app