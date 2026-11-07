import type { APIRoute } from "astro";

export const prerender = false;

const NOW_PLAYING_API = process.env.NOW_PLAYING_API ?? "http://backend:8001";

export const GET: APIRoute = ({ url }) => {
    const station = url.searchParams.get("station");
    if (!station) {
        return Promise.resolve(
            new Response(JSON.stringify({ error: "Invalid request" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            }),
        );
    }

    return fetch(
        `${NOW_PLAYING_API}/now-playing?station=${encodeURIComponent(station)}`,
    )
        .then((response) =>
            response.text().then(
                (body) =>
                    new Response(body, {
                        status: response.status,
                        headers: { "Content-Type": "application/json" },
                    }),
            ),
        )
        .catch((error) => {
            console.error("Failed to fetch now-playing data:", error);
            return new Response(
                JSON.stringify({ error: "Failed to reach now-playing service" }),
                {
                    status: 502,
                    headers: { "Content-Type": "application/json" },
                },
            );
        });
};
