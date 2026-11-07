#!/bin/bash

if [ "$DEV_MODE_ENABLED" = "false" ]; then
    node /radiosa/frontend/dist/server/entry.mjs
else
    npm run dev -- --host
fi
