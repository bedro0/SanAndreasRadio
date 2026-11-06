import type { APIRoute } from "astro";
import { activeClients, broadcastUserCount} from "@/lib/userCount";

export const prerender = false;

export const GET: APIRoute = async ()=>{
    let currentController: ReadableStreamDefaultController;

    const stream = new ReadableStream({
        start(controller) {
            currentController = controller;
            activeClients.add(controller);

            broadcastUserCount();
        },
        cancel(){
            if(currentController){
                activeClients.delete(currentController);
                broadcastUserCount();
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