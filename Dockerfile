# Build Stage
FROM node:23-alpine3.19 AS build

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma
COPY . .

# Prevent interactive prompts
ENV CI=true

# Install dependencies and build in one step to reduce layers
RUN npm install vite && \
    npm install prisma && \
    npx prisma generate && \
    npm run build

# Production Stage
FROM node:22-slim AS production

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/prisma ./prisma
COPY --from=build /usr/src/app/.env ./
COPY wait-for-it.sh /usr/src/app/wait-for-it.sh

# Install Python, OpenSSL, and other dependencies
RUN apt-get update -y && \
    apt-get install -y \
    openssl \
    bash \
    curl

# Install Prisma CLI globally
RUN npm install -g prisma

# Make wait-for-it.sh executable and install production dependencies
RUN chmod +x /usr/src/app/wait-for-it.sh && npm ci --omit=dev
ENV NODE_ENV=production

# Expose the application port
EXPOSE 3000

# Command to start the application
CMD ["sh", "-c", "./wait-for-it.sh db:5432 -- npx prisma migrate deploy && node dist/index.js"]
