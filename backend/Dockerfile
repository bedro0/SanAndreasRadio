FROM node:26-slim AS base

COPY ["config/", "/radiosa/config"]
COPY ["scripts/", "/radiosa/scripts"]
WORKDIR /radiosa
RUN chmod -R u+rwx /radiosa
RUN apt update && apt install -y --no-install-recommends \
    icecast2 \
    mpd \
    && rm -rf /var/lib/apt/lists/*

RUN npm install \
    chance \
    mpc-js

# Unprivileged account that runs the Node helper scripts and long-running
# Node processes, instead of them running as root for the container's life.
# Icecast and MPD keep dropping to their own packaged users (icecast2, mpd)
# via their own config, so this account only needs mpd's group to reach the
# per-station control sockets under /radiosa/socks.
RUN adduser --system --no-create-home --group radiosa \
    && usermod -aG mpd radiosa

# Default Environmental Variables
ENV HOSTNAME="localhost"
ENV DISPLAY_ADMIN="admin"
ENV ADMIN_USER="admin"
ENV ENABLED_STATIONS="bouncefm, csr, kdst, kjah, krose, mastersounds, playbackfm, radiols, radiox, sfur, wctr"

ENTRYPOINT ["/radiosa/scripts/start.sh"]
# ENTRYPOINT [ "tail", "-f", "/dev/null" ]

# Dev image: adds interactive shell tooling for debugging inside the
# container. Only built via `docker compose -f compose.yml -f
# compose.dev.yml ...` (which sets build.target: dev) — it is never the
# default build target, so these tools never ship in the production image.
FROM base AS dev
RUN apt update && apt install -y --no-install-recommends vim mpc tmux \
    && rm -rf /var/lib/apt/lists/*

# Production image: the default build target (last stage, used whenever
# --target is not passed) — what compose.yml builds.
FROM base AS prod
