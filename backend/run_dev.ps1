# run_dev.ps1 - Activate venv and run the backend dev server
if (-not (Test-Path ".venv")) {
    Write-Error ".venv not found. Run .\setup_dev.ps1 first."; exit 1
}

. .\.venv\Scripts\Activate.ps1
Write-Host "Starting uvicorn backend.main:app on http://0.0.0.0:8000"
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
