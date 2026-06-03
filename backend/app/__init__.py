# Backend app package
# Re-export canonical app if imported as a package
try:
    from .main import app
except Exception:
    # main.py is a shim that imports from canonical backend.main
    pass
