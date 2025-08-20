FROM open-source-cn-shanghai.cr.volces.com/open/bun:1.2 AS base
WORKDIR /app

# 使用BuildKit缓存挂载来缓存bun的依赖缓存
COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    --mount=type=cache,target=/app/node_modules \
    bun install --production

FROM base AS builder
COPY . .
RUN bun run build

FROM open-source-cn-shanghai.cr.volces.com/open/bun:1.2 AS production
WORKDIR /app
COPY --from=builder /app/.output ./.output
CMD ["bun", "run", "./.output/server/index.mjs"]
