# Dockerfile for OleVeci Production Deployment on Easypanel / Hostinger VPS
FROM node:22-slim

WORKDIR /app

# Install system dependencies (python3, ffmpeg, curl, ca-certificates) for Linux video extraction
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    ffmpeg \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install official standalone yt-dlp binary into system PATH
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# Install build & runtime dependencies
COPY package*.json ./
RUN npm install --include=optional

# Copy full application source code
COPY . .

# Build Vite client and Express server bundle
RUN npm run build

# Configure runtime environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose both port 80 and port 3000 for zero-configuration Traefik / Easypanel routing
EXPOSE 80 3000

# Health check to ensure Traefik routes only when OleVeci is fully up
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://127.0.0.1:3000/ || curl -f http://127.0.0.1:80/ || exit 1

# Start production server
CMD ["node", "dist/server.cjs"]
