# Install dependencies only when needed
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run nginx
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Remove default nginx static files
RUN rm -rf ./*

# Copy built app
COPY --from=builder /app/dist ./

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port 3000
EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]