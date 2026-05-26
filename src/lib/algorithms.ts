// Min Priority Queue Node
class PQNode<T> {
  constructor(public val: T, public priority: number) {}
}

// Min Priority Queue implemented as a Binary Heap
export class MinPriorityQueue<T> {
  public values: PQNode<T>[] = [];

  enqueue(val: T, priority: number) {
    const newNode = new PQNode(val, priority);
    this.values.push(newNode);
    this.bubbleUp();
  }

  private bubbleUp() {
    let idx = this.values.length - 1;
    const element = this.values[idx];
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      const parent = this.values[parentIdx];
      if (element.priority >= parent.priority) break;
      this.values[parentIdx] = element;
      this.values[idx] = parent;
      idx = parentIdx;
    }
  }

  dequeue(): PQNode<T> {
    const min = this.values[0];
    const end = this.values.pop();
    if (this.values.length > 0 && end) {
      this.values[0] = end;
      this.sinkDown();
    }
    return min;
  }

  private sinkDown() {
    let idx = 0;
    const length = this.values.length;
    const element = this.values[0];
    while (true) {
      const leftChildIdx = 2 * idx + 1;
      const rightChildIdx = 2 * idx + 2;
      let leftChild: PQNode<T> | undefined;
      let rightChild: PQNode<T> | undefined;
      let swap: number | null = null;

      if (leftChildIdx < length) {
        leftChild = this.values[leftChildIdx];
        if (leftChild.priority < element.priority) {
          swap = leftChildIdx;
        }
      }
      if (rightChildIdx < length) {
        rightChild = this.values[rightChildIdx];
        if (
          (swap === null && rightChild.priority < element.priority) ||
          (swap !== null && leftChild && rightChild.priority < leftChild.priority)
        ) {
          swap = rightChildIdx;
        }
      }
      if (swap === null) break;
      this.values[idx] = this.values[swap];
      this.values[swap] = element;
      idx = swap;
    }
  }

  isEmpty() {
    return this.values.length === 0;
  }
}

// Calculate distance between two coordinates in km (Haversine formula)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const deg2rad = (deg: number) => deg * (Math.PI / 180);
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return Number(d.toFixed(2));
}

export interface LocationNode {
  id: string;
  name: string;
  type: "warehouse" | "customer" | "hub";
  priority: "high" | "normal" | "low";
  capacity: number;
  timeWindow: string;
  lat: number;
  lng: number;
}

export interface Edge {
  id: string;
  from: string;
  to: string;
  weight: number;
}

export interface RouteResult {
  path: string[];
  totalDistance: number;
  totalTime: number;
}

// Dijkstra's Shortest Path
export function runDijkstra(
  locations: LocationNode[],
  edges: Edge[],
  startId: string,
  endId: string
): RouteResult | null {
  if (locations.length === 0) return null;

  // Build Adjacency List
  const adjacencyList: Record<string, { node: string; weight: number }[]> = {};
  locations.forEach((loc) => (adjacencyList[loc.id] = []));

  edges.forEach((edge) => {
    if (adjacencyList[edge.from] && adjacencyList[edge.to]) {
      adjacencyList[edge.from].push({ node: edge.to, weight: edge.weight });
      adjacencyList[edge.to].push({ node: edge.from, weight: edge.weight }); // Undirected
    }
  });

  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const pq = new MinPriorityQueue<string>();
  let path: string[] = [];

  // Initial state
  locations.forEach((loc) => {
    if (loc.id === startId) {
      distances[loc.id] = 0;
      pq.enqueue(loc.id, 0);
    } else {
      distances[loc.id] = Infinity;
      pq.enqueue(loc.id, Infinity);
    }
    previous[loc.id] = null;
  });

  let smallest: string | null = null;
  while (!pq.isEmpty()) {
    smallest = pq.dequeue().val;
    if (smallest === endId) {
      let curr = smallest;
      while (curr && previous[curr]) {
        path.push(curr);
        curr = previous[curr]!;
      }
      break;
    }

    if (smallest && distances[smallest] !== Infinity) {
      const neighbors = adjacencyList[smallest] || [];
      for (const neighborInfo of neighbors) {
        const candidate = distances[smallest] + neighborInfo.weight;
        const nextNeighbor = neighborInfo.node;

        if (candidate < distances[nextNeighbor]) {
          distances[nextNeighbor] = candidate;
          previous[nextNeighbor] = smallest;
          pq.enqueue(nextNeighbor, candidate);
        }
      }
    }
  }

  if (path.length > 0) {
    path = path.concat(startId).reverse();
  } else if (startId === endId) {
    path = [startId];
  }

  const totalDistance = distances[endId] !== Infinity ? distances[endId] : 0;
  const totalTime = Math.round(totalDistance * 1.5);

  return {
    path,
    totalDistance: Number(totalDistance.toFixed(2)),
    totalTime,
  };
}

// A* Search Algorithm
export function runAStar(
  locations: LocationNode[],
  edges: Edge[],
  startId: string,
  endId: string
): RouteResult | null {
  if (locations.length === 0) return null;

  const adjacencyList: Record<string, { node: string; weight: number }[]> = {};
  const locMap: Record<string, LocationNode> = {};

  locations.forEach((loc) => {
    adjacencyList[loc.id] = [];
    locMap[loc.id] = loc;
  });

  edges.forEach((edge) => {
    if (adjacencyList[edge.from] && adjacencyList[edge.to]) {
      adjacencyList[edge.from].push({ node: edge.to, weight: edge.weight });
      adjacencyList[edge.to].push({ node: edge.from, weight: edge.weight }); // Undirected
    }
  });

  const endLoc = locMap[endId];
  if (!endLoc) return null;

  // Heuristic function: straight-line distance to end node
  const heuristic = (nodeId: string) => {
    const loc = locMap[nodeId];
    return calculateDistance(loc.lat, loc.lng, endLoc.lat, endLoc.lng);
  };

  const gScore: Record<string, number> = {};
  const fScore: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const pq = new MinPriorityQueue<string>();

  locations.forEach((loc) => {
    gScore[loc.id] = Infinity;
    fScore[loc.id] = Infinity;
    previous[loc.id] = null;
  });

  gScore[startId] = 0;
  fScore[startId] = heuristic(startId);
  pq.enqueue(startId, fScore[startId]);

  let path: string[] = [];

  while (!pq.isEmpty()) {
    const currentId = pq.dequeue().val;

    if (currentId === endId) {
      let curr = endId;
      while (curr && previous[curr]) {
        path.push(curr);
        curr = previous[curr]!;
      }
      break;
    }

    const neighbors = adjacencyList[currentId] || [];
    for (const neighborInfo of neighbors) {
      const neighborId = neighborInfo.node;

      // A* specifically avoids "busy" hubs to simulate traffic optimization
      const neighborLoc = locMap[neighborId];
      const trafficPenalty =
        neighborLoc.priority === "high" ? 1.5 : neighborLoc.priority === "normal" ? 1.1 : 1.0;

      const tentativeGScore = gScore[currentId] + neighborInfo.weight * trafficPenalty;

      if (tentativeGScore < gScore[neighborId]) {
        previous[neighborId] = currentId;
        gScore[neighborId] = tentativeGScore;
        fScore[neighborId] = tentativeGScore + heuristic(neighborId);
        pq.enqueue(neighborId, fScore[neighborId]);
      }
    }
  }

  if (path.length > 0) {
    path = path.concat(startId).reverse();
  } else if (startId === endId) {
    path = [startId];
  }

  const totalDistance = gScore[endId] !== Infinity ? gScore[endId] : 0;
  const totalTime = Math.round(totalDistance * 1.5);

  return {
    path,
    totalDistance: Number(totalDistance.toFixed(2)),
    totalTime,
  };
}

// Greedy TSP Algorithm
export function runGreedyTSP(
  locations: LocationNode[],
  edges: Edge[],
  startId: string
): RouteResult | null {
  if (locations.length === 0) return null;

  const adjacencyList: Record<string, { node: string; weight: number }[]> = {};
  locations.forEach((loc) => (adjacencyList[loc.id] = []));

  edges.forEach((edge) => {
    if (adjacencyList[edge.from] && adjacencyList[edge.to]) {
      adjacencyList[edge.from].push({ node: edge.to, weight: edge.weight });
      adjacencyList[edge.to].push({ node: edge.from, weight: edge.weight }); // Undirected
    }
  });

  const unvisited = new Set(locations.map((l) => l.id));
  let currentNode = startId;
  const path = [currentNode];
  unvisited.delete(currentNode);

  let totalDistance = 0;

  while (unvisited.size > 0) {
    let nearestNeighbor: string | null = null;
    let shortestDistance = Infinity;

    const neighbors = adjacencyList[currentNode] || [];
    for (const neighbor of neighbors) {
      if (unvisited.has(neighbor.node) && neighbor.weight < shortestDistance) {
        shortestDistance = neighbor.weight;
        nearestNeighbor = neighbor.node;
      }
    }

    if (nearestNeighbor === null) {
      break;
    }

    path.push(nearestNeighbor);
    unvisited.delete(nearestNeighbor);
    totalDistance += shortestDistance;
    currentNode = nearestNeighbor;
  }

  // Optional: Return to start to complete the tour
  const returnEdge = (adjacencyList[currentNode] || []).find((n) => n.node === startId);
  if (returnEdge) {
    path.push(startId);
    totalDistance += returnEdge.weight;
  }

  const totalTime = Math.round(totalDistance * 1.5);

  return {
    path,
    totalDistance: Number(totalDistance.toFixed(2)),
    totalTime,
  };
}

// Prim's MST Algorithm
export function runPrimsMST(locations: LocationNode[], edges: Edge[]): string[] {
  if (locations.length === 0) return [];

  const adjacencyList: Record<string, { node: string; weight: number; edgeId: string }[]> = {};
  locations.forEach((loc) => (adjacencyList[loc.id] = []));

  edges.forEach((edge) => {
    if (adjacencyList[edge.from] && adjacencyList[edge.to]) {
      adjacencyList[edge.from].push({ node: edge.to, weight: edge.weight, edgeId: edge.id });
      adjacencyList[edge.to].push({ node: edge.from, weight: edge.weight, edgeId: edge.id });
    }
  });

  const mstEdges: string[] = [];
  const visited = new Set<string>();
  const pq = new MinPriorityQueue<{ from: string; to: string; edgeId: string }>();

  const startNode = locations[0].id;
  visited.add(startNode);

  const neighbors = adjacencyList[startNode] || [];
  neighbors.forEach((edge) => {
    pq.enqueue({ from: startNode, to: edge.node, edgeId: edge.edgeId }, edge.weight);
  });

  while (!pq.isEmpty() && visited.size < locations.length) {
    const minEdge = pq.dequeue().val;

    if (!visited.has(minEdge.to)) {
      visited.add(minEdge.to);
      mstEdges.push(minEdge.edgeId);

      const toNeighbors = adjacencyList[minEdge.to] || [];
      toNeighbors.forEach((edge) => {
        if (!visited.has(edge.node)) {
          pq.enqueue({ from: minEdge.to, to: edge.node, edgeId: edge.edgeId }, edge.weight);
        }
      });
    }
  }

  return mstEdges;
}
