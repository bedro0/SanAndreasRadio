FROM node:26-slim AS base

COPY . /radiosa/frontend
WORKDIR /radiosa/frontend
RUN chmod -R u+rwx /radiosa

RUN npm install

ENV HOST="0.0.0.0"
ENV PORT="4321"

EXPOSE 4321

ENTRYPOINT ["/radiosa/frontend/docker-entrypoint.sh"]

# Dev image: skips the production build and runs the Astro dev server
# instead, with interactive shell tooling installed. Only built via
# `docker compose -f compose.yml -f compose.dev.yml ...` (which sets
# build.target: dev) — it is never the default build target, so these
# tools never ship in the production image.
FROM base AS dev
RUN apt update && apt install -y --no-install-recommends vim tmux \
    && rm -rf /var/lib/apt/lists/*
ENV DEV_MODE_ENABLED="true"

# Production image: the default build target (last stage, used whenever
# --target is not passed) — what compose.yml builds.
FROM base AS prod
RUN npm run build
ENV DEV_MODE_ENABLED="false"
