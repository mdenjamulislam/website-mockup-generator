# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
COPY client/package*.json ./client/
RUN npm ci --workspace client
COPY client ./client
COPY shared ./shared
RUN npm run build --workspace client

# Stage 2: Build Backend
FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm ci --workspace server
COPY server ./server
COPY shared ./shared
RUN npm run build --workspace server

# Stage 3: Production Image
FROM mcr.microsoft.com/playwright:v1.41.0-jammy
WORKDIR /app

# Set Node environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies for backend
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm ci --workspace server --omit=dev

# Copy compiled backend
COPY --from=backend-builder /app/server/dist ./server/dist

# Copy compiled frontend
COPY --from=frontend-builder /app/client/dist ./client/dist

# Expose the application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the server
WORKDIR /app/server
CMD ["node", "dist/server.js"]
