FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && pip list  # This will show installed packages in logs

COPY . .

# Explicitly use the full path or ensure uvicorn is in PATH
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "10000"]