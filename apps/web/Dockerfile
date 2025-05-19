FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY packages/db ./packages/db
COPY apps/web ./apps/web
RUN npm install -g pnpm && pnpm install
RUN pnpm turbo build --filter=web
CMD ["pnpm", "start", "--filter=web"]
EXPOSE 3000