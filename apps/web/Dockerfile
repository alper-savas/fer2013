# Use Node.js 18 official image (LTS)
FROM node:18-alpine

# Set working directory to /app (root of your monorepo)
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@8.14.0

# Copy all files including packages and apps directories
COPY . .

# Copy .env explicitly if needed for migrations
COPY .env ./

# Install all dependencies hoisted at root
RUN pnpm install --frozen-lockfile

# Run Prisma migrations from packages/db
RUN pnpm --filter @fer-app/db run migrate:dev

# Build the web app inside apps/web
RUN pnpm --filter web run build

# Expose port (adjust if needed)
EXPOSE 3000

# Set working directory to the web app to run it
WORKDIR /app/apps/web

# Start the Next.js app
CMD ["pnpm", "start"]
