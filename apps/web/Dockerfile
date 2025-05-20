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

# Run Prisma seed from packages/db
RUN pnpm --filter @fer-app/db run seed


ARG DATABASE_URL
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG AWS_S3_BUCKET
ARG AWS_REGION

ENV DATABASE_URL=${DATABASE_URL}
ENV AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
ENV AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
ENV AWS_S3_BUCKET=${AWS_S3_BUCKET}
ENV AWS_REGION=${AWS_REGION}

# Build the web app inside apps/web
RUN pnpm --filter web run build

# Expose port (adjust if needed)
EXPOSE 3000

# Set working directory to the web app to run it
WORKDIR /app/apps/web

# Start the Next.js app
CMD ["pnpm", "start"]
