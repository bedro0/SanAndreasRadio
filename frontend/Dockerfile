FROM node:26-slim

COPY . /radiosa/frontend
WORKDIR /radiosa/frontend
RUN chmod -R u+rwx /radiosa

RUN npm install

ARG DEV_MODE="false"

RUN if [ "$DEV_MODE" = "false" ]; then \
    npm run build; \
    else \
    apt update && apt install -y vim tmux; \
    fi

ENV DEV_MODE_ENABLED=$DEV_MODE
ENV HOST="0.0.0.0"
ENV PORT="4321"

EXPOSE 4321

ENTRYPOINT ["/radiosa/frontend/docker-entrypoint.sh"]
