import type { ReadableStreamDefaultController } from 'node:stream/web';

const clientsByStation = new Map<string, Set<ReadableStreamDefaultController>>();

export function addClient(station: string, controller: ReadableStreamDefaultController){
    let clients = clientsByStation.get(station);
    if (!clients){
        clients = new Set();
        clientsByStation.set(station, clients);
    }
    clients.add(controller);
}

export function removeClient(station: string, controller: ReadableStreamDefaultController){
    const clients = clientsByStation.get(station);
    if (!clients) return;
    clients.delete(controller);
    if (clients.size === 0) clientsByStation.delete(station);
}

export function broadcastUserCount(station: string){
    const clients = clientsByStation.get(station);
    if (!clients) return;

    for (const controller of clients){
        if (controller.desiredSize === null){
            clients.delete(controller)
        }
    }

    const data = JSON.stringify({count: clients.size});
    const encoder = new TextEncoder();
    const payload = encoder.encode(`data: ${data}\n\n`);

    for (const controller of clients){
        try{
            controller.enqueue(payload)
        }
        catch(error){
            clients.delete(controller)
        }
    }
}