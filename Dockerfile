# Dockerfile
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy backend code
COPY ./backend /app

# Install dependencies
RUN pip install --no-cache-dir -r requirement.txt

# Run FastAPI with reload
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
