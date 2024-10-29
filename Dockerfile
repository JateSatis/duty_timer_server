FROM node:22-alpine3.19 AS build

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build


FROM node:22-alpine3.19 AS production

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/prisma ./prisma

RUN npm ci --omit=dev
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/index.cjs"]
