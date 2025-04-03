# Build stage for frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm install

# Copy all frontend-related directories and files
COPY app ./app
COPY components ./components
COPY context ./context
COPY lib ./lib
COPY utils ./utils
COPY public ./public
COPY next.config.mjs ./
COPY tsconfig.json ./
COPY tailwind.config.ts ./
COPY postcss.config.mjs ./
COPY .eslintrc.json ./
COPY components.json ./
COPY next-env.d.ts ./
COPY .env.sample ./
COPY .env ./

# Build the Next.js application
RUN npm run build

# Main image
FROM python:3.11-slim

# Install Node.js
RUN apt-get update && apt-get install -y \
    curl \
    gcc g++ make gfortran \
    libopenblas-dev liblapack-dev \
    libpango-1.0-0 libharfbuzz0b \
    libpangoft2-1.0-0 libharfbuzz-subset0 \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Set up backend
WORKDIR /
COPY backend_server/requirements*.txt ./
RUN pip install -r requirements.txt \
    && pip install -r requirements2.txt

# Copy backend code and credentials
COPY backend_server ./backend_server
# COPY .env.sample ./
# COPY .env ./
COPY backend_server/credentials.json ./credentials.json

# Copy frontend build and all necessary files from builder
COPY --from=frontend-builder /app/.next ./.next
COPY --from=frontend-builder /app/node_modules ./node_modules
COPY --from=frontend-builder /app/package*.json ./
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/components ./components
COPY --from=frontend-builder /app/context ./context
COPY --from=frontend-builder /app/lib ./lib
COPY --from=frontend-builder /app/utils ./utils

# Create start script
WORKDIR /app

RUN echo '#!/bin/bash\n\
cd /app && npm start &\n\
cd /backend_server && ./start_service.sh\n\
wait -n' > start.sh


RUN chmod +x /app/start.sh

# Expose ports
EXPOSE 3000 8011 7771 7770 8501 8502 5091 8156

CMD ["/app/start.sh"]

# gcloud run deploy fullstack-app --image gcr.io/testinggdg-450014/fullstack-app --platform managed --region asia-southeast1 --allow-unauthenticated --memory 2Gi --cpu 2 --port 3000 --set-env-vars "GOOGLE_API_KEY=$(Get-Content .env | Select-String 'GOOGLE_API_KEY' | ForEach-Object { $_ -replace '.*=', '' }),COHERE_API_KEY=$(Get-Content .env | Select-String 'COHERE_API_KEY' | ForEach-Object { $_ -replace '.*=', '' }),TAVILY_API_KEY=$(Get-Content .env | Select-String 'TAVILY_API_KEY' | ForEach-Object { $_ -replace '.*=', '' }),GROQ_API_KEY=$(Get-Content .env | Select-String 'GROQ_API_KEY' | ForEach-Object { $_ -replace '.*=', '' }),GOOGLE_APPLICATION_CREDENTIALS=./credentials.json"
