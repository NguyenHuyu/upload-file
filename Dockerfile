# Use the official Node.js 20 Alpine base image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Install libc6-compat for compatibility reasons
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package manager lockfiles
COPY package.json pnpm-lock.yaml* ./

# Install dependencies using pnpm
RUN pnpm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install pnpm in builder stage
RUN npm install -g pnpm

# Copy the dependency files from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY . .

# Copy the environment file
COPY .env.local .env.local
# Build the project
RUN pnpm build

# Production image, copy all the files and run Next.js
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Install pnpm in runner stage
RUN npm install -g pnpm

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Set the correct permission for prerender cache
RUN chown -R nextjs:nodejs /app/.next

USER nextjs

EXPOSE 8020

ENV PORT 8021
# Set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# Run the Next.js server
CMD ["pnpm", "start"]