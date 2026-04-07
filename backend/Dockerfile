# Use Python 3.11 slim as base
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements first for layer caching
COPY requirements.txt .

# Upgrade pip and install dependencies including uvicorn explicitly
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir uvicorn[standard]

# Copy all project files
COPY . .

# Expose the port your app runs on
EXPOSE 10000

# Run the app with uvicorn
CMD ["python", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "10000"]