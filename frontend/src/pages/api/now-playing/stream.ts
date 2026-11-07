import type { APIRoute } from "astro";

export const prerender = false;

const NOW_PLAYING_API = process.env.NOW_PLAYING_API ?? "http://backend:8001";

export const GET: APIRoute = async ({ url, request }) => {
    const station = url.searchParams.get("station");
    if (!station) {
        return new Response(JSON.stringify({ error: "Invalid request" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    let upstream: Response;
    try {
        upstream = await fetch(
            `${NOW_PLAYING_API}/now-playing/stream?station=${encodeURIComponent(station)}`,
            { signal: request.signal },
        );
    } catch (error) {
        console.error("Failed to open now-playing stream:", error);
        return new Response(
            JSON.stringify({ error: "Failed to reach now-playing service" }),
            { status: 502, headers: { "Content-Type": "application/json" } },
        );
    }

    if (!upstream.ok || !upstream.body) {
        return new Response(
            JSON.stringify({ error: "Failed to reach now-playing service" }),
            { status: 502, headers: { "Content-Type": "application/json" } },
        );
    }

    return new Response(upstream.body, {
        status: 200,
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
};
