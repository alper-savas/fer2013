FROM python:3.9-slim

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY apps/fast-api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Set the working directory to the FastAPI app
WORKDIR /app/apps/fast-api

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]