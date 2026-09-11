# 1. Base Image
FROM python:3.10-slim

# 2. System Dependencies
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 3. Working Directory
WORKDIR /app

# 4. Dependency Installation
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Application Code
COPY . .

# 6. Execution Command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]