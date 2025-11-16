# Dockerfile.server
FROM nginx:alpine

# logs dir 
RUN mkdir -p /var/log/nginx

# we won't copy nginx.conf here in dev
# docker-compose will mount server-nginx/nginx.dev.conf
