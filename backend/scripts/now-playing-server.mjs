import http from "node:http";
import { MPC } from "mpc-js";

const PORT = process.env.NOW_PLAYING_PORT || 8001;
const ENABLED_STATIONS = new Set((process.env.ENABLED_STATIONS || "").split(",").map((s) => s.trim()).filter(Boolean));

async function getNowPlaying(client) {
    const nowPlaying = await client.status.currentSong();
    const status = await client.status.status();
    const remainingTime = Math.max(0, status.duration - status.elapsed) + 4;
    return { nowPlaying, remainingTime };
}

function writeSseEvent(res, data) {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
}

async function handleNowPlaying(req, res, station) {
    const client = new MPC();
    try {
        await client.connectUnixSocket(`/radiosa/socks/${station}`);
        const data = await getNowPlaying(client);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(data));
    } catch (error) {
        console.error(`Failed to query now-playing data for ${station}:`, error);
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Failed to query station" }));
    } finally {
        client.disconnect();
    }
}

async function handleNowPlayingStream(req, res, station) {
    const client = new MPC();

    const onChangedPlayer = () => {
        getNowPlaying(client)
            .then((data) => writeSseEvent(res, data))
            .catch((error) => {
                console.error(`Failed to query now-playing data for ${station}:`, error);
            });
    };

    const cleanup = () => {
        client.removeListener("changed-player", onChangedPlayer);
        client.removeListener("socket-end", cleanup);
        client.disconnect();
    };

    try {
        await client.connectUnixSocket(`/radiosa/socks/${station}`);
        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        });

        writeSseEvent(res, await getNowPlaying(client));
        client.on("changed-player", onChangedPlayer);
        client.on("socket-end", cleanup);
        req.on("close", cleanup);
    } catch (error) {
        console.error(`Failed to open now-playing stream for ${station}:`, error);
        if (!res.headersSent) {
            res.writeHead(502, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Failed to query station" }));
        } else {
            res.end();
        }
        client.disconnect();
    }
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const station = url.searchParams.get("station");

    if (!station) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid request" }));
        return;
    }

    if (!ENABLED_STATIONS.has(station)) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unknown station" }));
        return;
    }

    if (url.pathname === "/now-playing") {
        await handleNowPlaying(req, res, station);
    } else if (url.pathname === "/now-playing/stream") {
        await handleNowPlayingStream(req, res, station);
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`Now-playing HTTP server listening on port ${PORT}`);
});
