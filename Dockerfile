FROM node:22-alpine AS base

FROM base AS builder

RUN apk add --no-cache gcompat
WORKDIR /app

COPY package*.json tsconfig.json src ./

RUN npm ci && \
    npm run build && \
    npm prune --production

FROM base AS runner
WORKDIR /app

COPY --from=builder  /app/node_modules /app/node_modules
COPY --from=builder  /app/dist /app/dist
COPY --from=builder  /app/package.json /app/package.json


EXPOSE 3000

CMD ["node", "/app/dist/index.js"]