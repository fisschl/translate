FROM open-source-cn-shanghai.cr.volces.com/open/node:24 AS base
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile --registry=https://registry.npmmirror.com
FROM base AS builder
COPY . .
RUN pnpm run build
FROM open-source-cn-shanghai.cr.volces.com/open/bun:1.2 AS production
WORKDIR /app
COPY --from=builder /app/.output ./.output
CMD ["bun", "run", "./.output/server/index.mjs"]
