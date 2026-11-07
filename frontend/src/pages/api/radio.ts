import type { APIRoute } from "astro";

export const prerender = false;

const ICECAST_BASE_URL = process.env.ICECAST_API ?? "http://backend:8000";

const CONTENT_TYPES: Record<string, string> = {
    mp3: "audio/mpeg",
    ogg: "audio/ogg",
};

export const GET: APIRoute = async ({ url }) => {
    const format = url.searchParams.get("format");
    const station = url.searchParams.get("station");
    const contentType = format ? CONTENT_TYPES[format] : undefined;

    if (!station || !contentType) {
        return new Response(JSON.stringify({ error: "Invalid request" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const icecastUrl = `${ICECAST_BASE_URL}/${station}.${format}`;

    try {
        const response = await fetch(icecastUrl);

        return new Response(response.body, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    } catch (err) {
        console.error("Error proxying stream:", err);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
