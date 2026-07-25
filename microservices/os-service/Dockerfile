FROM node:20-alpine AS base
WORKDIR /app

# Prisma's query engine needs OpenSSL at runtime; Alpine doesn't ship it by default.
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate && npm run build

EXPOSE 3010
CMD ["npm", "run", "start:prod"]

