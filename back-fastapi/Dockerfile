# Dockerfile.back
FROM python:3.12-slim AS base
WORKDIR /code

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# install deps first (better cache)
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# dev image
FROM base AS development
WORKDIR /code
COPY ./ /code/
# we will run uvicorn from docker-compose, so host must be 0.0.0.0
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
EXPOSE 8000
