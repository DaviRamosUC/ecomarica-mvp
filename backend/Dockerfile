# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app
# Prisma's query engine binary needs OpenSSL, not present by default on alpine.
RUN apk add --no-cache openssl

# ---- dev: what docker-compose.yml builds for local development ----
FROM base AS dev
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
EXPOSE 3333
CMD ["npm", "run", "start:dev"]

# ---- deps: full install (incl. devDependencies), reused by build ----
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ---- build: compile TypeScript + generate the Prisma client ----
FROM deps AS build
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- production: lean runtime image (default target) ----
FROM base AS production
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma
EXPOSE 3333
# Applies pending migrations before starting — fine for a single-instance
# deploy; a multi-replica setup should run `prisma migrate deploy` as its
# own release step instead of on every container start.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
