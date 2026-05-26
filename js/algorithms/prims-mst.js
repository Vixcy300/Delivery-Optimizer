import { MinPriorityQueue } from './priority-queue.js';
import { AppState } from '../utils/helpers.js';

export function runPrimsMST() {
    if (AppState.locations.length === 0) return [];

    // 1. Build Adjacency List
    const adjacencyList = {};
    AppState.locations.forEach(loc => adjacencyList[loc.id] = []);
    
    AppState.edges.forEach(edge => {
        adjacencyList[edge.from].push({ node: edge.to, weight: edge.weight, edgeId: edge.id });
        adjacencyList[edge.to].push({ node: edge.from, weight: edge.weight, edgeId: edge.id });
    });

    const mstEdges = [];
    const visited = new Set();
    const pq = new MinPriorityQueue();

    // Start with the first node arbitrarily
    const startNode = AppState.locations[0].id;
    visited.add(startNode);

    // Add all edges from startNode to PQ
    adjacencyList[startNode].forEach(edge => {
        pq.enqueue({ from: startNode, to: edge.node, edgeId: edge.edgeId }, edge.weight);
    });

    while (!pq.isEmpty() && visited.size < AppState.locations.length) {
        const minEdge = pq.dequeue().val;
        
        if (!visited.has(minEdge.to)) {
            // This edge is part of MST
            visited.add(minEdge.to);
            mstEdges.push(minEdge.edgeId);
            
            // Add all edges from the new node to unvisited nodes
            adjacencyList[minEdge.to].forEach(edge => {
                if (!visited.has(edge.node)) {
                    pq.enqueue({ from: minEdge.to, to: edge.node, edgeId: edge.edgeId }, edge.weight);
                }
            });
        }
    }

    return mstEdges;
}
