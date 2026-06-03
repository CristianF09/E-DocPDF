# E-DocPDF Enterprise

Acesta este backend-ul pentru aplicația E-DocPDF Enterprise.

## Cerințe

*   Python 3.9+
*   Docker

## Rulare

1.  **Porniți serviciul Stirling PDF:**

    Aplicația depinde de Stirling PDF pentru majoritatea operațiunilor pe documente. Porniți-l folosind Docker:

    ```bash
    docker run -p 8080:8080 -d frooodle/s-pdf:latest
    ```

2.  **Instalați dependințele Python:**

    ```bash
    pip install -r requirements.txt
    ```

3.  **Porniți serverul FastAPI:**

    ```bash
    uvicorn main:app --reload
    ```

    Serverul va fi disponibil la `http://localhost:8000`.