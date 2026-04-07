# Use official Python slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy app source code
COPY . .

# Expose the port Render uses
EXPOSE 10000

# Run the FastAPI app
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port $PORT"]