FROM node:26-slim

COPY ["config/", "/radiosa/config"]
COPY ["scripts/", "/radiosa/scripts"]
WORKDIR /radiosa
RUN chmod -R u+rwx /radiosa
RUN apt update
RUN apt install -y \
    icecast2 \
    mpd

RUN npm install \
    chance \
    mpc-js

ARG DEV_MODE="false"

RUN if [ "$DEV_MODE" = "true" ]; then \
    apt install -y vim mpc tmux; \
    fi

# Default Environmental Variables
ENV HOSTNAME="localhost"
ENV DISPLAY_ADMIN="admin"
ENV ADMIN_USER="admin"
ENV ENABLED_STATIONS="bouncefm, csr, kdst, kjah, krose, mastersounds, playbackfm, radiols, radiox, sfur, wctr"

ENTRYPOINT ["/radiosa/scripts/start.sh"]
# ENTRYPOINT [ "tail", "-f", "/dev/null" ]
