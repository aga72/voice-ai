# ============================================
# STAGE 1: Build React Frontend
# ============================================
FROM node:20-slim AS frontend-builder

WORKDIR /app/frontend-react

# Copy package files and install dependencies
COPY frontend-react/package*.json ./
RUN npm ci

# Copy frontend source and build
COPY frontend-react/ ./
RUN npm run build

# Result: /app/frontend-react/dist/ contains built files


# ============================================
# STAGE 2: Python Runtime (Final Image)
# ============================================
FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/frontend-react/dist ./frontend/dist

# Expose port
EXPOSE 8080

# Run FastAPI
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]