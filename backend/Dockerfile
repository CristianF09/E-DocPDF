FROM python:3.11-slim

WORKDIR /app

# Instalează dependențe sistem
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libfreetype6-dev \
    libpng-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiază requirements și instalează dependențe Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiază codul sursă
COPY . .

# Creează directorul pentru uploads
RUN mkdir -p /app/uploads

# Expune portul
EXPOSE 8000

# Rulează aplicația
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]