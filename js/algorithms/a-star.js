import { MinPriorityQueue } from './priority-queue.js';
import { AppState, calculateDistance } from '../utils/helpers.js';

export function runAStar(startId, endId) {
    if (AppState.locations.length === 0) return null;

    // 1. Build Adjacency List
    const adjacencyList = {};
    const locMap = {};
    
    AppState.locations.forEach(loc => {
        adjacencyList[loc.id] = [];
        locMap[loc.id] = loc;
    });
    
    AppState.edges.forEach(edge => {
        adjacencyList[edge.from].push({ node: edge.to, weight: edge.weight });
        adjacencyList[edge.to].push({ node: edge.from, weight: edge.weight }); // Undirected
    });

    const endLoc = locMap[endId];
    if (!endLoc) return null;

    // Heuristic function: straight-line distance to end node
    const heuristic = (nodeId) => {
        const loc = locMap[nodeId];
        return calculateDistance(loc.lat, loc.lng, endLoc.lat, endLoc.lng);
    };

    // gScore: Cost from start to node
    const gScore = {};
    // fScore: gScore + heuristic (estimated total cost)
    const fScore = {};
    const previous = {};
    const pq = new MinPriorityQueue();

    // Initialize
    for (let loc of AppState.locations) {
        gScore[loc.id] = Infinity;
        fScore[loc.id] = Infinity;
        previous[loc.id] = null;
    }

    gScore[startId] = 0;
    fScore[startId] = heuristic(startId);
    pq.enqueue(startId, fScore[startId]);

    let path = [];

    while (!pq.isEmpty()) {
        const currentId = pq.dequeue().val;

        if (currentId === endId) {
            // Reconstruct path
            let curr = endId;
            while (previous[curr]) {
                path.push(curr);
                curr = previous[curr];
            }
            break;
        }

        for (let neighborInfo of adjacencyList[currentId]) {
            const neighborId = neighborInfo.node;
            
            // A* specifically avoids "busy" hubs to simulate traffic optimization
            const neighborLoc = locMap[neighborId];
            const trafficPenalty = neighborLoc.priority === 'high' ? 1.5 : (neighborLoc.priority === 'normal' ? 1.1 : 1.0);
            
            const tentativeGScore = gScore[currentId] + (neighborInfo.weight * trafficPenalty);

            if (tentativeGScore < gScore[neighborId]) {
                previous[neighborId] = currentId;
                gScore[neighborId] = tentativeGScore;
                fScore[neighborId] = tentativeGScore + heuristic(neighborId);
                
                // Add to PQ (min priority queue handles updates/duplicates decently for our small scale)
                pq.enqueue(neighborId, fScore[neighborId]);
            }
        }
    }

    if(path.length > 0) {
        path = path.concat(startId).reverse();
    } else if (startId === endId) {
        path = [startId];
    }

    // Cost logic matches Dijkstra structure
    const totalDistance = gScore[endId] !== Infinity ? gScore[endId] : 0;
    const totalTime = Math.round(totalDistance * 1.5);

    return {
        path,
        totalDistance: Number(totalDistance.toFixed(2)),
        totalTime
    };
}
