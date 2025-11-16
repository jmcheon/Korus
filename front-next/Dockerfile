# Dockerfile.front
FROM node:20-slim AS base
WORKDIR /usr/src/app

# install deps
COPY ./package*.json ./
RUN npm install

# dev stage
FROM base AS development
WORKDIR /usr/src/app
COPY ./ .
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]
EXPOSE 3000
