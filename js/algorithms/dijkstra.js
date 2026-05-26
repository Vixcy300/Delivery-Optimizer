import { MinPriorityQueue } from './priority-queue.js';
import { AppState } from '../utils/helpers.js';

export function runDijkstra(startId, endId) {
    if (AppState.locations.length === 0) return null;

    // 1. Build Adjacency List
    const adjacencyList = {};
    AppState.locations.forEach(loc => adjacencyList[loc.id] = []);
    
    AppState.edges.forEach(edge => {
        adjacencyList[edge.from].push({ node: edge.to, weight: edge.weight });
        adjacencyList[edge.to].push({ node: edge.from, weight: edge.weight }); // Undirected
    });

    // 2. Init state
    const distances = {};
    const previous = {};
    const pq = new MinPriorityQueue();
    let path = []; // to return at end

    // Initial state
    for (let loc of AppState.locations) {
        if (loc.id === startId) {
            distances[loc.id] = 0;
            pq.enqueue(loc.id, 0);
        } else {
            distances[loc.id] = Infinity;
            pq.enqueue(loc.id, Infinity);
        }
        previous[loc.id] = null;
    }

    let smallest;
    while (!pq.isEmpty()) {
        smallest = pq.dequeue().val;
        if (smallest === endId) {
            // We are done, build path
            while (previous[smallest]) {
                path.push(smallest);
                smallest = previous[smallest];
            }
            break;
        }

        if (smallest || distances[smallest] !== Infinity) {
            for (let neighbor in adjacencyList[smallest]) {
                let nextNode = adjacencyList[smallest][neighbor];
                let candidate = distances[smallest] + nextNode.weight;
                let nextNeighbor = nextNode.node;
                
                if (candidate < distances[nextNeighbor]) {
                    // Update new smallest distance to neighbor
                    distances[nextNeighbor] = candidate;
                    // Update previous
                    previous[nextNeighbor] = smallest;
                    // Enqueue in PQ with new priority
                    pq.enqueue(nextNeighbor, candidate);
                }
            }
        }
    }

    if(path.length > 0) {
        path = path.concat(startId).reverse();
    } else if (startId === endId) {
        path = [startId];
    }
    
    // Calculate total time (mock logic: 1km = 1.5 min)
    const totalDistance = distances[endId] !== Infinity ? distances[endId] : 0;
    const totalTime = Math.round(totalDistance * 1.5);

    return {
        path,
        totalDistance: Number(totalDistance.toFixed(2)),
        totalTime
    };
}
