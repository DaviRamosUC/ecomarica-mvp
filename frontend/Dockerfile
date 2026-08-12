# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app

# ---- dev: what docker-compose.yml builds for local development ----
FROM base AS dev
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ---- deps: full install (incl. devDependencies), reused by build ----
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ---- build ----
FROM deps AS build
COPY . .
# NEXT_PUBLIC_* vars are inlined into the client bundle at build time, so
# the backend URL has to be known here, not just at container start.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN NODE_ENV=production npm run build

# ---- production: runtime image (default target) ----
# No `output: "standalone"` here on purpose — that mode is for self-hosted
# Docker deploys and actively breaks Vercel's own build/packaging step
# (Vercel doesn't use this Dockerfile at all, but next.config.ts is shared).
# So this stage just carries the full build output + node_modules instead.
FROM base AS production
ENV NODE_ENV=production
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
COPY --from=build /app/next.config.ts ./next.config.ts
EXPOSE 3000
CMD ["npm", "run", "start"]
