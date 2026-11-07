import type { APIRoute } from "astro";
import { addClient, removeClient, broadcastUserCount } from "@/lib/userCount";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
    const station = url.searchParams.get("station") ?? "global";
    let currentController: ReadableStreamDefaultController;

    const stream = new ReadableStream({
        start(controller) {
            currentController = controller;
            addClient(station, controller);

            broadcastUserCount(station);
        },
        cancel(){
            if(currentController){
                removeClient(station, currentController);
                broadcastUserCount(station);
            }
        }
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    })


}
