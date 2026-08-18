# Multi-stage production build for AI Resume Studio
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build production assets (Vite frontend + Express server bundle)
COPY . .
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# ----------------------------------------------------
# Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy only production dependencies and built distribution bundle
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/firebase-applet-config.json ./firebase-applet-config.json

# Non-root security user
USER node

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
