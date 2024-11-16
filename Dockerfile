FROM node:22-slim AS build

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma
COPY . .

# Prevent interactive prompts
ENV CI=true

# Install dependencies and build in one step to reduce layers
RUN npm cache clean --force && \
    npm install && \
    npx prisma generate && \
    npm run build

FROM node:22-slim AS production

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/prisma ./prisma
COPY --from=build /usr/src/app/.env ./
RUN npm cache clean --force && \
		npm ci --omit=dev
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/index.js"]
