# --- DEPENDENCIES STAGE ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- DEVELOPMENT RUNTIME ---
FROM deps AS development
WORKDIR /app
ENV NODE_ENV=development

ENV HOST=0.0.0.0 
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

# --- BUILD STAGE ---
FROM deps AS builder
WORKDIR /app
COPY . .

RUN npm run build 

# --- PRODUCTION RUNTIME ---
FROM nginx:alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80