# Base stage, shared deps
FROM node:20-slim AS base
WORKDIR /usr/src/app

# Install dependencies (cached)
COPY ./package*.json ./
RUN npm install

# Development stage
FROM base AS development
WORKDIR /usr/src/app
COPY ./ .
# Next dev server, hot reload
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]
EXPOSE 3000

# Production stage
FROM base AS production
WORKDIR /usr/src/app

# Copy the rest of the app code
COPY ./ .

# Build the Next.js app
ENV NODE_ENV=production
RUN npm run build

# Start the production server
CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0", "--port", "3000"]
EXPOSE 3000
