# Base stage, shared deps
FROM python:3.12-slim AS base
WORKDIR /code

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps (cached)
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Development stage
FROM base AS development
WORKDIR /code
COPY ./ /code/
# Dev server with reload
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
EXPOSE 8000

# Production stage
FROM base AS production
WORKDIR /code
COPY ./ /code/
ENV PYTHONUNBUFFERED=1
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
EXPOSE 8000
