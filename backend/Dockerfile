# Use a slim Python 3.11 image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app
COPY . .

# Expose the port your FastAPI app runs on
EXPOSE 10000

# Default command to run uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "10000"]