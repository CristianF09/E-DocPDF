Development setup (Windows) — backend

Quick steps:

1. Install Python 3.11+ and Git.
2. (Optional but recommended) Install Chocolatey and system deps:
   choco install -y tesseract poppler libreoffice

3. From backend/ run:
   powershell -ExecutionPolicy Bypass -File setup_dev.ps1

4. Start dev server:
   powershell -ExecutionPolicy Bypass -File run_dev.ps1

Docker (recommended for parity):

1. Set variables in backend/.env (GOOGLE_API_KEY, SECRET_KEY)
2. docker-compose up --build

Notes:
- setup_dev.ps1 installs Python reqs from requirements.txt into .venv.
- System packages (Tesseract, Poppler, LibreOffice) are required for OCR, pdf->image, and LibreOffice conversions.
- If you don't want to install system packages locally, use docker-compose which bundles Stirling PDF service and runs backend in container.
