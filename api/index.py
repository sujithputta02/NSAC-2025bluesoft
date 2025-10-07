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

# Set environment for backend
os.environ.setdefault("PYTHONPATH", str(backend_path))

# Import the FastAPI app
from main import app

# Export the app for Vercel
handler = app
application = app