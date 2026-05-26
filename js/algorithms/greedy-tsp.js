import { AppState } from '../utils/helpers.js';

export function runGreedyTSP(startId) {
    if (AppState.locations.length === 0) return null;

    // 1. Build Adjacency List
    const adjacencyList = {};
    AppState.locations.forEach(loc => adjacencyList[loc.id] = []);
    
    AppState.edges.forEach(edge => {
        adjacencyList[edge.from].push({ node: edge.to, weight: edge.weight });
        adjacencyList[edge.to].push({ node: edge.from, weight: edge.weight }); // Undirected
    });

    const unvisited = new Set(AppState.locations.map(l => l.id));
    let currentNode = startId;
    const path = [currentNode];
    unvisited.delete(currentNode);
    
    let totalDistance = 0;

    while (unvisited.size > 0) {
        let nearestNeighbor = null;
        let shortestDistance = Infinity;

        // Find nearest unvisited neighbor
        const neighbors = adjacencyList[currentNode];
        for (let neighbor of neighbors) {
            if (unvisited.has(neighbor.node) && neighbor.weight < shortestDistance) {
                shortestDistance = neighbor.weight;
                nearestNeighbor = neighbor.node;
            }
        }

        if (nearestNeighbor === null) {
            // Graph is disconnected, cannot complete TSP
            break;
        }

        path.push(nearestNeighbor);
        unvisited.delete(nearestNeighbor);
        totalDistance += shortestDistance;
        currentNode = nearestNeighbor;
    }

    // Optional: Return to start to complete the tour
    // Find distance back to start
    const returnEdge = adjacencyList[currentNode].find(n => n.node === startId);
    if (returnEdge) {
        path.push(startId);
        totalDistance += returnEdge.weight;
    }

    const totalTime = Math.round(totalDistance * 1.5);

    return {
        path,
        totalDistance: Number(totalDistance.toFixed(2)),
        totalTime
    };
}
