FROM node:20-alpine

WORKDIR /app

# Copy necessary files/folders
COPY package.json pnpm-lock.yaml ./
COPY apps ./apps
COPY packages ./packages

# Install pnpm globally
RUN npm install -g pnpm

# Install all dependencies for monorepo
RUN pnpm install --frozen-lockfile

# OPTIONAL: Run DB migrations before building web app
# Adjust command based on how you run prisma migrate in your monorepo
RUN pnpm --filter @fer-app/db run migrate:dev

# Build web app
RUN pnpm --filter web run build

# Expose the port your app uses
EXPOSE 3000

# Start the web app
CMD ["pnpm", "--filter", "web", "run", "start"]
