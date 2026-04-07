# Nexera AI Challenge

This is a **FastAPI** backend project designed for the Nexera AI Challenge. It is containerized with Docker and can be deployed on platforms like **Render**.

---

## Project Structure


nexera-ai-challenge/
│
├─ app/ # Main application folder (optional)
├─ main.py # FastAPI entry point
├─ requirements.txt # Python dependencies
├─ Dockerfile # Docker setup
├─ README.md
└─ .gitignore


---

## Prerequisites

- Python 3.11+
- Docker
- Git
- Render account (optional, for deployment)

---

## Local Setup

1. **Clone the repository**

```bash
git clone https://github.com/Tami-L/nexera-ai-challenge.git
cd nexera-ai-challenge
Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
Run the app locally
uvicorn main:app --reload --host 0.0.0.0 --port 8000
The API will be available at http://127.0.0.1:8000
Swagger docs: http://127.0.0.1:8000/docs
Docker Setup
Build Docker image
docker build -t nexera-ai-challenge .
Run Docker container
docker run -p 10000:10000 nexera-ai-challenge
Access API at http://localhost:10000