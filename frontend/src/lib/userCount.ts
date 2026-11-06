import type { ReadableStreamDefaultController } from 'node:stream/web';

export const activeClients = new Set<ReadableStreamDefaultController>();

export function broadcastUserCount(){
    const data = JSON.stringify({count: activeClients.size});
    const encoder = new TextEncoder();

    for (const controller of activeClients){
        try{
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        }
        catch(error){
            activeClients.delete(controller)
        }
    }
}