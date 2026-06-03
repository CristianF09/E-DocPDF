"""
Compatibility shim: expose the single canonical FastAPI `app` defined in backend/main.py.
This avoids duplicate app definitions when there are multiple main.py files.
"""

# Try to import the canonical app from main.py (when running as backend package or from project root)
try:
    # When uvicorn is started from backend/ directory: `uvicorn main:app`
    from main import app
except Exception:
    try:
        # When module is imported as a package (e.g., backend.app.main), try absolute import
        from backend.main import app
    except Exception as e:
        raise RuntimeError("Could not import canonical FastAPI app from main.py") from e
