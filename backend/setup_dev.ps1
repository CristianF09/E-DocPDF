# setup_dev.ps1 - Windows development setup for backend
# Usage: Run in PowerShell as Administrator if you will install system packages.

Write-Host "1) Creating Python virtual environment (.venv) and installing Python deps..."
if (-not (Test-Path ".venv")) {
    python -m venv .venv
}

Write-Host "Activating virtualenv and upgrading pip..."
. .\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

Write-Host "\nDone. System dependencies required for full functionality:"
Write-Host " - Tesseract OCR (https://github.com/tesseract-ocr/tessdoc)"
Write-Host " - Poppler (for pdf2image) -> windows binaries: https://github.com/oschwartz10612/poppler-windows"
Write-Host " - LibreOffice (headless conversion)"
Write-Host "\nOn Windows you can install these via Chocolatey (requires admin):"
Write-Host "choco install -y tesseract poppler libreoffice"

Write-Host "\nTo run the dev server after setup:"
Write-Host ". .\\.venv\\Scripts\\Activate.ps1"
Write-Host "uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000"
