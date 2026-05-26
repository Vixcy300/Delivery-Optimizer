"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MapPin,
  Route as RouteIcon,
  Activity,
  Zap,
  TrendingUp,
  Settings,
  Plus,
  Play,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Search,
  CheckCircle,
  HelpCircle,
  Truck,
  Users,
  Compass,
  AlertTriangle,
  FileText,
  Map,
  Network,
  X as CloseIcon
} from "lucide-react";
import { 
  LocationNode, 
  Edge, 
  runDijkstra, 
  runAStar, 
  runGreedyTSP, 
  runPrimsMST, 
  calculateDistance 
} from "@/lib/algorithms";
import { demoScenarios } from "@/lib/scenarios";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";


// Initial state for drivers
const initialDrivers = [
  { name: "Rajesh Kumar", vehicleType: "🛵 Two-Wheeler", status: "On Duty", route: "c-depot → Anna Nagar", capacity: "85%" },
  { name: "Priya Sharma", vehicleType: "🚐 LCV / Mini-Truck", status: "In Transit", route: "c-depot → OMR", capacity: "92%" },
  { name: "Amit Patel", vehicleType: "🚗 Car / Jeep", status: "On Duty", route: "c-depot → T. Nagar", capacity: "78%" },
  { name: "Suresh Raina", vehicleType: "🚛 Heavy Truck", status: "Idle", route: "None", capacity: "0%" },
  { name: "Vikram Singh", vehicleType: "🚐 LCV / Mini-Truck", status: "In Transit", route: "c-depot → Velachery", capacity: "88%" },
];

export default function Workspace() {
  // Sidebar / Module Navigation State
  const [activeModule, setActiveModule] = useState<string>("module-1");
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(true);
  const [showAddNodeModal, setShowAddNodeModal] = useState<boolean>(false);

  // Core Network State
  const [locations, setLocations] = useState<LocationNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Selected Nodes for Pathfinding
  const [startNode, setStartNode] = useState<string>("");
  const [endNode, setEndNode] = useState<string>("");
  const [edgeFrom, setEdgeFrom] = useState<string>("");
  const [edgeTo, setEdgeTo] = useState<string>("");
  const [edgeWeight, setEdgeWeight] = useState<string>("");

  // Search Address Input
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

  // New Node Form State
  const [newNodeLat, setNewNodeLat] = useState<number>(13.0827);
  const [newNodeLng, setNewNodeLng] = useState<number>(80.2707);
  const [newNodeName, setNewNodeName] = useState<string>("");
  const [newNodeType, setNewNodeType] = useState<"warehouse" | "customer" | "hub">("customer");
  const [newNodePriority, setNewNodePriority] = useState<"high" | "normal" | "low">("normal");
  const [newNodeCapacity, setNewNodeCapacity] = useState<string>("50");
  const [newNodeTimeWindow, setNewNodeTimeWindow] = useState<string>("09:00 - 17:00");

  // Algorithm Control State
  const [selectedAlgo, setSelectedAlgo] = useState<"dijkstra" | "astar" | "tsp">("dijkstra");
  const [vehicleType, setVehicleType] = useState<string>("lcv");
  const [trafficCondition, setTrafficCondition] = useState<string>("normal");

  // Computation Results State
  const [resultPanel, setResultPanel] = useState<{
    algo: string;
    distance: string;
    time: string;
    toll: string;
    nodesVisited: number;
    computedPath: string[];
  } | null>(null);

  // Simulation & Live Tracking States
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simBtnText, setSimBtnText] = useState<string>("Start Live Tracking");
  const [trackingProgress, setTrackingProgress] = useState<number>(0);

  // Logs Console State
  const [logs, setLogs] = useState<Array<{ time: string; type: "system" | "success" | "warning" | "error"; text: string }>>([
    { time: "08:00", type: "system", text: "PathSync core optimizer initialized." },
  ]);

  // Analytics KPIs State
  const [activeVehiclesCount, setActiveVehiclesCount] = useState<number>(3);
  const [onTimeRate, setOnTimeRate] = useState<number>(96.4);
  const [avgTimeMin, setAvgTimeMin] = useState<number>(45);
  const [totalDistanceKm, setTotalDistanceKm] = useState<number>(0);

  // Heatmap Overlay State
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);

  // Leaflet Map References
  const map1Ref = useRef<HTMLDivElement | null>(null);
  const map2Ref = useRef<HTMLDivElement | null>(null);
  const map3Ref = useRef<HTMLDivElement | null>(null);

  // Leaflet Instances
  const leafletMap1 = useRef<any>(null);
  const leafletMap2 = useRef<any>(null);
  const leafletMap3 = useRef<any>(null);
  const tileLayer1Ref = useRef<any>(null);
  const tileLayer2Ref = useRef<any>(null);
  const tileLayer3Ref = useRef<any>(null);
  const mapMarkers = useRef<Record<string, any[]>>({});
  const routePolyline = useRef<any>(null);
  const simMarker = useRef<any>(null);
  const LRef = useRef<any>(null);

  // Map engine & theme UX states
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Setup toast messages
  const [toast, setToast] = useState<{ message: string; type: "success" | "warning" | "error" | "info" } | null>(null);
  const showToast = (message: string, type: "success" | "warning" | "error" | "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Helper: Format Current Time for logs
  const getFormattedTime = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  const addEventLog = (text: string, type: "system" | "success" | "warning" | "error" = "system") => {
    setLogs((prev) => [{ time: getFormattedTime(), type, text }, ...prev]);
  };

  // Effect: Dynamically load Leaflet on Client Side
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("leaflet").then((leafletModule) => {
        LRef.current = leafletModule.default;
        
        // Define Custom marker styles
        const L = LRef.current;
        
        const darkUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
        const lightUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
        const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

        const isDark = document.documentElement.classList.contains("dark");
        const currentUrl = isDark ? darkUrl : lightUrl;

        // Initialize Map 1 (Network modeling)
        if (map1Ref.current && !leafletMap1.current) {
          leafletMap1.current = L.map(map1Ref.current, { zoomControl: true }).setView([13.0827, 80.2707], 13);
          tileLayer1Ref.current = L.tileLayer(currentUrl, {
            attribution,
            maxZoom: 19,
          }).addTo(leafletMap1.current);

          leafletMap1.current.on("click", (e: any) => {
            setNewNodeLat(e.latlng.lat);
            setNewNodeLng(e.latlng.lng);
            setNewNodeName(`Delivery Point ${locations.length + 1}`);
            setNewNodeType("customer");
            setNewNodePriority("normal");
            setNewNodeCapacity("50");
            setNewNodeTimeWindow("09:00 - 17:00");
            setShowAddNodeModal(true);
          });
        }

        // Initialize Map 2 (Route visualizer)
        if (map2Ref.current && !leafletMap2.current) {
          leafletMap2.current = L.map(map2Ref.current, { zoomControl: true }).setView([13.0827, 80.2707], 13);
          tileLayer2Ref.current = L.tileLayer(currentUrl, {
            attribution,
            maxZoom: 19,
          }).addTo(leafletMap2.current);
        }

        // Initialize Map 3 (Heatmap)
        if (map3Ref.current && !leafletMap3.current) {
          leafletMap3.current = L.map(map3Ref.current, { zoomControl: true }).setView([13.0827, 80.2707], 12);
          tileLayer3Ref.current = L.tileLayer(currentUrl, {
            attribution,
            maxZoom: 19,
          }).addTo(leafletMap3.current);
        }

        // Mark map engine as loaded
        setIsMapLoaded(true);
      });
    }
  }, []);

  // Effect: Sync local dark mode status with html node's dark class list changes
  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Effect: Hot-reload tile layers when dark mode toggles
  useEffect(() => {
    const L = LRef.current;
    if (!L) return;

    const darkUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    const lightUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
    const nextUrl = isDarkMode ? darkUrl : lightUrl;

    [
      { map: leafletMap1.current, tileRef: tileLayer1Ref },
      { map: leafletMap2.current, tileRef: tileLayer2Ref },
      { map: leafletMap3.current, tileRef: tileLayer3Ref },
    ].forEach(({ map, tileRef }) => {
      if (map && tileRef.current) {
        map.removeLayer(tileRef.current);
        tileRef.current = L.tileLayer(nextUrl, {
          attribution,
          maxZoom: 19,
        }).addTo(map);
      }
    });
  }, [isDarkMode]);

  // Effect: Recalculate sizes when swapping display tabs from hidden to visible
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeModule === "module-1" && leafletMap1.current) {
        leafletMap1.current.invalidateSize();
      } else if (activeModule === "module-2" && leafletMap2.current) {
        leafletMap2.current.invalidateSize();
      } else if (activeModule === "module-5" && leafletMap3.current) {
        leafletMap3.current.invalidateSize();
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [activeModule]);

  // Effect: Render and sync map markers whenever locations state changes
  useEffect(() => {
    const L = LRef.current;
    if (!L) return;

    // Clear old markers from both Map 1 and Map 2
    Object.keys(mapMarkers.current).forEach((nodeId) => {
      mapMarkers.current[nodeId].forEach((marker) => marker.remove());
    });
    mapMarkers.current = {};

    // Render new markers
    locations.forEach((loc) => {
      const COLOR = { warehouse: "#3b82f6", hub: "#f59e0b", customer: "#10b981" };
      const color = COLOR[loc.type] || "#10b981";
      const SIZE = { warehouse: 22, hub: 18, customer: 14 };
      const sizeVal = SIZE[loc.type] || 14;

      const markerHtml = `
        <div style="
          width:${sizeVal}px;
          height:${sizeVal}px;
          background:${color};
          border-radius:50%;
          border:2.5px solid white;
          box-shadow:0 0 10px ${color}99, 0 2px 4px rgba(0,0,0,0.4);
        "></div>`;

      const icon = L.divIcon({
        html: markerHtml,
        className: "",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const tip = `<b>${loc.name}</b><br>📦 ${loc.type} · ${loc.capacity} units<br>🕐 ${loc.timeWindow}`;

      let m1, m2;
      if (leafletMap1.current) {
        m1 = L.marker([loc.lat, loc.lng], { icon })
          .bindTooltip(tip, { direction: "top", offset: [0, -10] })
          .addTo(leafletMap1.current);
      }
      if (leafletMap2.current) {
        m2 = L.marker([loc.lat, loc.lng], { icon })
          .bindTooltip(`<b>${loc.name}</b>`, { direction: "top", offset: [0, -10] })
          .addTo(leafletMap2.current);
      }

      mapMarkers.current[loc.id] = [m1, m2].filter(Boolean);
    });

    // Auto fit bounds if locations exist
    if (locations.length > 0) {
      const coords = locations.map((loc) => [loc.lat, loc.lng] as [number, number]);
      const bounds = L.latLngBounds(coords);
      if (leafletMap1.current) leafletMap1.current.fitBounds(bounds, { padding: [40, 40] });
      if (leafletMap2.current) leafletMap2.current.fitBounds(bounds, { padding: [40, 40] });
    }

    // Auto set start/end dropdown node options if empty
    if (locations.length > 0) {
      if (!startNode) setStartNode(locations[0].id);
      if (!endNode && locations[1]) setEndNode(locations[1].id);
      if (!edgeFrom) setEdgeFrom(locations[0].id);
      if (!edgeTo && locations[1]) setEdgeTo(locations[1].id);
    }
  }, [locations]);

  // Effect: Render predictive heatmap overlays on Map 3
  useEffect(() => {
    const L = LRef.current;
    if (!L || !leafletMap3.current) return;

    // Define mock heat zones
    const zones = [
      { coords: [13.08, 80.27], name: "Central Zone Spike", color: "#ef4444" },
      { coords: [13.05, 80.25], name: "T. Nagar Spillover", color: "#f59e0b" },
      { coords: [13.1, 80.22], name: "Kolathur Peak Area", color: "#f59e0b" },
      { coords: [13.02, 80.21], name: "Adyar Demand Surge", color: "#ef4444" },
    ];

    const circleMarkers: any[] = [];

    if (showHeatmap) {
      zones.forEach((z) => {
        const marker = L.circleMarker(z.coords, {
          radius: 35,
          color: z.color,
          fillColor: z.color,
          fillOpacity: 0.4,
          weight: 0,
        })
          .bindTooltip(`<b>${z.name}</b><br>🔥 Peak Demand Surge<br><i>Click to spawn node in Module 1</i>`, {
            direction: "top",
          })
          .addTo(leafletMap3.current);

        marker.on("mouseover", () => marker.setStyle({ fillOpacity: 0.6 }));
        marker.on("mouseout", () => marker.setStyle({ fillOpacity: 0.4 }));
        
        // Spawn Location on click
        marker.on("click", () => {
          setLocations((prev) => {
            const id = `spawn-${Date.now().toString(36)}`;
            const duplicate = prev.some((l) => l.name === z.name);
            if (duplicate) {
              showToast(`"${z.name}" is already spawned.`, "warning");
              return prev;
            }
            const updated: LocationNode[] = [
              ...prev,
              {
                id,
                name: z.name,
                type: "customer" as const,
                priority: "high" as const,
                capacity: 180,
                timeWindow: "09:00 - 17:00",
                lat: z.coords[0],
                lng: z.coords[1],
              },
            ];
            showToast(`📍 Spawned node "${z.name}" from Heat Zone!`, "success");
            addEventLog(`Spawned heatmap node: ${z.name}`, "success");
            return updated;
          });
          setActiveModule("module-1");
        });

        circleMarkers.push(marker);
      });
    }

    return () => {
      circleMarkers.forEach((m) => m.remove());
    };
  }, [showHeatmap, leafletMap3.current]);

  // Handle Resize Events to keep maps sized correctly when modules switch
  useEffect(() => {
    setTimeout(() => {
      if (leafletMap1.current) leafletMap1.current.invalidateSize();
      if (leafletMap2.current) leafletMap2.current.invalidateSize();
      if (leafletMap3.current) leafletMap3.current.invalidateSize();
    }, 150);
  }, [activeModule]);

  // ─── ACTION HANDLERS ─────────────────────────────────

  // Load Demo Scenarios
  const handleLoadScenario = (key: string) => {
    if (!key || !demoScenarios[key]) return;
    const scenario = demoScenarios[key];
    
    // Clear old state
    setLocations([]);
    setEdges([]);
    setResultPanel(null);
    if (routePolyline.current) {
      routePolyline.current.remove();
      routePolyline.current = null;
    }

    // Populate locations
    const locs = scenario.locations;
    setLocations(locs);

    // Populate edges using Haversine auto-generation
    const computedEdges: Edge[] = [];
    for (let i = 0; i < locs.length; i++) {
      for (let j = i + 1; j < locs.length; j++) {
        const a = locs[i];
        const b = locs[j];
        const dist = calculateDistance(a.lat, a.lng, b.lat, b.lng);
        computedEdges.push({
          id: `${a.id}--${b.id}`,
          from: a.id,
          to: b.id,
          weight: dist,
        });
      }
    }
    setEdges(computedEdges);

    // KPI total distance
    const totalDist = computedEdges.reduce((sum, e) => sum + e.weight, 0);
    setTotalDistanceKm(Number((totalDist / 2).toFixed(1))); // approximate path network scale

    addEventLog(`Loaded scenario: ${key} (${locs.length} nodes)`, "success");
    showToast(`🗺️ Loaded ${key.toUpperCase()} Demo Scenario`, "success");
  };

  // Add Location Node
  const handleAddNode = () => {
    if (!newNodeName.trim()) {
      showToast("Node name is required", "warning");
      return;
    }

    const capacity = parseInt(newNodeCapacity) || 50;
    const id = `node-${Date.now().toString(36)}`;
    const newNode: LocationNode = {
      id,
      name: newNodeName,
      type: newNodeType,
      priority: newNodePriority,
      capacity,
      timeWindow: newNodeTimeWindow || "09:00 - 17:00",
      lat: newNodeLat,
      lng: newNodeLng,
    };

    // Update locations
    setLocations((prev) => {
      const updated = [...prev, newNode];
      
      // Auto build edges with all other nodes
      setEdges((prevEdges) => {
        const newEdges = [...prevEdges];
        prev.forEach((oldNode) => {
          const dist = calculateDistance(newNode.lat, newNode.lng, oldNode.lat, oldNode.lng);
          newEdges.push({
            id: `${newNode.id}--${oldNode.id}`,
            from: newNode.id,
            to: oldNode.id,
            weight: dist,
          });
        });
        return newEdges;
      });

      return updated;
    });

    setShowAddNodeModal(false);
    addEventLog(`Added node: ${newNodeName} (${newNodeType})`, "success");
    showToast(`📍 Node "${newNodeName}" added successfully`, "success");
  };

  // Delete Location Node
  const handleDeleteNode = (id: string, name: string) => {
    // Remove marker
    if (mapMarkers.current[id]) {
      mapMarkers.current[id].forEach((m) => m.remove());
      delete mapMarkers.current[id];
    }

    setLocations((prev) => prev.filter((l) => l.id !== id));
    setEdges((prev) => prev.filter((e) => e.from !== id && e.to !== id));
    
    // Clear route if active
    if (resultPanel?.computedPath.includes(id)) {
      setResultPanel(null);
      if (routePolyline.current) {
        routePolyline.current.remove();
        routePolyline.current = null;
      }
    }

    addEventLog(`Removed node: ${name}`, "warning");
    showToast(`🗑️ Removed "${name}"`, "warning");
  };

  // Run Prim's MST (Draw Minimum Spanning Tree)
  const handleRunMST = () => {
    if (locations.length < 2) {
      showToast("Add at least 2 locations first", "warning");
      return;
    }

    const mstEdgeIds = runPrimsMST(locations, edges);
    
    addEventLog(`Prim's MST computed (${mstEdgeIds.length} tree edges)`, "success");
    showToast(`🌲 MST computed spanning ${locations.length} nodes!`, "success");

    // We can also log MST detail
    const mstWeights = edges.filter(e => mstEdgeIds.includes(e.id)).reduce((sum, e) => sum + e.weight, 0);
    addEventLog(`Total MST weight: ${mstWeights.toFixed(2)} km`, "system");
  };

  // Manual Edge Adder
  const handleManualAddEdge = () => {
    if (!edgeFrom || !edgeTo) {
      showToast("Select both From and To nodes", "warning");
      return;
    }
    if (edgeFrom === edgeTo) {
      showToast("Cannot connect a node to itself", "warning");
      return;
    }
    const weightVal = parseFloat(edgeWeight);
    if (isNaN(weightVal) || weightVal <= 0) {
      showToast("Enter a positive number for weight (km)", "warning");
      return;
    }

    const edgeId = `${edgeFrom}--${edgeTo}`;
    const edgeIdRev = `${edgeTo}--${edgeFrom}`;
    const exists = edges.some((e) => e.id === edgeId || e.id === edgeIdRev);
    if (exists) {
      showToast("An edge already connects these two nodes", "warning");
      return;
    }

    setEdges((prev) => [
      ...prev,
      {
        id: edgeId,
        from: edgeFrom,
        to: edgeTo,
        weight: weightVal,
      },
    ]);

    setEdgeWeight("");
    showToast(`⚡ Added edge: ${weightVal} km`, "success");
    addEventLog(`Manual edge created: ${weightVal} km`, "success");
  };

  // nominatim map search
  const handleSearchAddress = async () => {
    if (!searchQuery.trim()) {
      showToast("Please enter an address to search", "warning");
      return;
    }

    setSearchLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery
        )}&countrycodes=in&format=json&limit=1`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        if (leafletMap1.current) {
          leafletMap1.current.setView([lat, lon], 15);
        }

        setNewNodeLat(lat);
        setNewNodeLng(lon);
        setNewNodeName(data[0].display_name.split(",")[0] || searchQuery);
        setNewNodeType("customer");
        setNewNodePriority("normal");
        setNewNodeCapacity("50");
        setNewNodeTimeWindow("09:00 - 17:00");
        setShowAddNodeModal(true);

        showToast(`📍 Found: ${data[0].display_name.split(",")[0]}`, "success");
      } else {
        showToast("Address not found in India. Try adding city name.", "error");
      }
    } catch (err) {
      showToast("Search API failed. Check connection.", "error");
    } finally {
      setSearchLoading(false);
    }
  };

  // Run Route Optimization (Dijkstra, A*, Greedy TSP)
  const handleRunOptimization = async () => {
    if (locations.length < 2) {
      showToast("Add at least 2 locations first", "warning");
      return;
    }
    if (edges.length === 0) {
      showToast("No route paths exist in network", "warning");
      return;
    }
    if (!startNode) {
      showToast("Please select a starting node", "warning");
      return;
    }
    if (selectedAlgo !== "tsp" && !endNode) {
      showToast("Please select an ending node", "warning");
      return;
    }
    if (selectedAlgo !== "tsp" && startNode === endNode) {
      showToast("Start and End nodes must be different", "warning");
      return;
    }

    let result = null;
    let algoName = "";

    if (selectedAlgo === "dijkstra") {
      result = runDijkstra(locations, edges, startNode, endNode);
      algoName = "Dijkstra's Shortest Path";
    } else if (selectedAlgo === "astar") {
      result = runAStar(locations, edges, startNode, endNode);
      algoName = "A* Search";
    } else {
      result = runGreedyTSP(locations, edges, startNode);
      algoName = "Greedy TSP";
    }

    if (!result || result.path.length === 0) {
      showToast("No valid route found. Check graph connectivity.", "error");
      addEventLog(`Route failed: Nodes disconnected`, "error");
      return;
    }

    // Process route parameters and OSRM roads
    addEventLog(`Running ${algoName} optimization...`, "system");

    try {
      const coords = result.path
        .map((id) => {
          const l = locations.find((loc) => loc.id === id);
          return l ? `${l.lng},${l.lat}` : "";
        })
        .filter(Boolean)
        .join(";");

      const osrmRes = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`
      );
      const osrmData = await osrmRes.json();

      let realDistanceKm = result.totalDistance;
      let actualTimeMin = result.totalTime;
      let geometry: any = null;

      if (osrmData.code === "Ok") {
        const route = osrmData.routes[0];
        realDistanceKm = route.distance / 1000;
        const baseDurationMin = route.duration / 60;
        
        // Traffic Condition multiplier
        const trafficMultiplier = trafficCondition === "peak" ? 2.2 : trafficCondition === "normal" ? 1.4 : 1.0;
        actualTimeMin = Math.round(baseDurationMin * trafficMultiplier);
        geometry = route.geometry;
      }

      // Calculate Toll Cost
      const rates: Record<string, number> = { twowheeler: 1.5, car: 2.5, lcv: 4, truck: 7 };
      let tollCost = Math.round(realDistanceKm * (rates[vehicleType] || 2.5));

      // Local Rule: OMR Chennai zero toll gate bypass check
      const involvesOMR = result.path.some((id) => {
        const loc = locations.find((l) => l.id === id);
        if (!loc) return false;
        const name = loc.name.toLowerCase();
        return name.includes("omr") || name.includes("navalur") || name.includes("siruseri");
      });
      if (involvesOMR) {
        tollCost = 0; // OMR bypass zero toll NH logic
        addEventLog("Local OMR Toll Waiver applied! Fee set to ₹0", "success");
      }

      // Render line on Map 2
      const L = LRef.current;
      if (L && leafletMap2.current) {
        if (routePolyline.current) {
          routePolyline.current.remove();
        }

        let routeCoords: any[] = [];
        if (geometry) {
          routeCoords = geometry.coordinates.map((c: any) => [c[1], c[0]]);
        } else {
          // fallback to straight lines if OSRM fails
          routeCoords = result.path
            .map((id) => {
              const l = locations.find((loc) => loc.id === id);
              return l ? [l.lat, l.lng] : null;
            })
            .filter(Boolean);
        }

        // Draw neon optimization line
        routePolyline.current = L.polyline(routeCoords, {
          color: selectedAlgo === "tsp" ? "#10b981" : "#3b82f6",
          weight: 5,
          opacity: 0.85,
          lineJoin: "round",
          dashArray: selectedAlgo === "astar" ? "10, 10" : "",
        }).addTo(leafletMap2.current);

        // Fit map bounds to show route
        leafletMap2.current.fitBounds(routePolyline.current.getBounds(), { padding: [50, 50] });

        // Store path coordinates in active tracking cache
        (leafletMap2.current as any)._cachedRouteGeometry = routeCoords;
      }

      // Update State
      setResultPanel({
        algo: algoName,
        distance: `${realDistanceKm.toFixed(2)} km`,
        time: `${actualTimeMin} mins`,
        toll: tollCost === 0 ? "₹0 (Toll Waiver)" : `₹${tollCost}`,
        nodesVisited: result.path.length,
        computedPath: result.path,
      });

      // Update Analytics metrics
      setTotalDistanceKm((prev) => Number((prev + realDistanceKm).toFixed(1)));
      setAvgTimeMin(Math.round((avgTimeMin + actualTimeMin) / 2));
      setActiveVehiclesCount((prev) => Math.min(initialDrivers.length, prev + 1));

      addEventLog(`Route generated: ${realDistanceKm.toFixed(2)}km, time: ${actualTimeMin}m`, "success");
      showToast(`⚡ Optimal route generated using ${selectedAlgo.toUpperCase()}`, "success");

    } catch (err) {
      showToast("Route computation failed. Check network.", "error");
    }
  };

  // Clear computed route
  const handleClearRoute = () => {
    setResultPanel(null);
    if (routePolyline.current) {
      routePolyline.current.remove();
      routePolyline.current = null;
    }
    if (simMarker.current) {
      simMarker.current.remove();
      simMarker.current = null;
    }
    showToast("Route visualizer cleared", "info");
  };

  // Start Live Vehicle simulation
  const handleLiveTracking = () => {
    const map = leafletMap2.current;
    if (!map || !(map as any)._cachedRouteGeometry) {
      showToast("Please calculate a route first", "warning");
      return;
    }

    const path = (map as any)._cachedRouteGeometry;
    const L = LRef.current;
    if (!L) return;

    if (simMarker.current) {
      simMarker.current.remove();
    }

    setIsSimulating(true);
    setSimBtnText("Tracking truck 🚚...");

    const truckIcon = L.divIcon({
      html: '<div style="font-size:26px; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.5)); transform:translate(-13px, -13px);">🚚</div>',
      className: "custom-div-icon",
    });

    simMarker.current = L.marker(path[0], { icon: truckIcon }).addTo(map);

    let i = 0;
    const interval = setInterval(() => {
      if (i >= path.length) {
        clearInterval(interval);
        setIsSimulating(false);
        setSimBtnText("Start Live Tracking");
        showToast("Live vehicle tracking completed", "success");
        addEventLog("Vehicle simulation completed. Driver has reached destination.", "success");
        return;
      }
      simMarker.current.setLatLng(path[i]);
      setTrackingProgress(Math.round((i / (path.length - 1)) * 100));
      i += 1;
    }, 80);
  };

  // Dispatch manifesto
  const handleDispatchFleet = () => {
    if (!resultPanel) return;
    showToast("Manifest dispatched to driver roster", "success");
    addEventLog(`Manifest dispatched to active drivers: ${resultPanel.computedPath.join(" → ")}`, "success");
  };

  // Load chennai welcome scenario
  const handleWelcomeDemoLoad = () => {
    handleLoadScenario("chennai");
    setShowWelcomeModal(false);
  };

  // Export JSON
  const handleExportJSON = () => {
    if (locations.length === 0) {
      showToast("No data to export", "warning");
      return;
    }
    const data = {
      locations,
      edges,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pathsync-logistics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Network exported successfully", "success");
  };

  // Trigger Simulation Run in KPI
  const handleKPIFullSimulation = () => {
    showToast("Triggering full fleet simulation...", "info");
    addEventLog("Simulation triggered: computing dynamic order congestion variables...", "system");
    
    // Animate KPI increments
    setTimeout(() => {
      setOnTimeRate(Number((95 + Math.random() * 4.8).toFixed(1)));
      setAvgTimeMin(Math.round(35 + Math.random() * 15));
      showToast("Dynamic fleet simulation complete!", "success");
      addEventLog("Simulation completed successfully. KPIs updated.", "success");
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 overflow-x-hidden md:flex-row font-sans">
      
      {/* ── TOAST ALERT SYSTEM ────────────────────────── */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-xl animate-in slide-in-from-top-6 duration-200 ${
          toast.type === "success" 
            ? "border-emerald-500/20 bg-emerald-950/90 text-emerald-400"
            : toast.type === "warning"
            ? "border-amber-500/20 bg-amber-950/90 text-amber-400"
            : toast.type === "error"
            ? "border-red-500/20 bg-red-950/90 text-red-400"
            : "border-blue-500/20 bg-blue-950/90 text-blue-400"
        }`}>
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* ── SIDEBAR NAVIGATION (Desktop) / TOP MENU (Mobile) ──── */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-900/40 backdrop-blur-md flex flex-col justify-between shrink-0">
        
        {/* Upper Sidebar */}
        <div className="flex flex-col">
          {/* Logo Brand */}
          <div className="h-16 px-6 border-b border-zinc-800 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-500 to-blue-600">
                <RouteIcon className="size-4.5 text-white" />
              </div>
              <div>
                <span>PathSync</span>
                <span className="block text-[10px] font-semibold text-zinc-500 tracking-wider uppercase -mt-1">WORKSPACE</span>
              </div>
            </Link>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-1.5 py-0.5 rounded-md font-mono">V7.0</span>
          </div>

          {/* Module Nav Links */}
          <nav className="p-4 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setActiveModule("module-1")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeModule === "module-1"
                  ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
              }`}
            >
              <Map className="size-4 shrink-0" />
              <span>Network Modeling</span>
            </button>
            <button
              onClick={() => setActiveModule("module-2")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeModule === "module-2"
                  ? "bg-blue-500/10 text-blue-400 border-l-2 border-blue-500"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
              }`}
            >
              <Network className="size-4 shrink-0" />
              <span>Network Routing</span>
            </button>
            <button
              onClick={() => setActiveModule("module-3")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeModule === "module-3"
                  ? "bg-purple-500/10 text-purple-400 border-l-2 border-purple-500"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
              }`}
            >
              <Activity className="size-4 shrink-0" />
              <span>KPI Performance</span>
            </button>
            <button
              onClick={() => setActiveModule("module-4")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeModule === "module-4"
                  ? "bg-amber-500/10 text-amber-400 border-l-2 border-amber-500"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
              }`}
            >
              <Truck className="size-4 shrink-0" />
              <span>Fleet Dispatch</span>
            </button>
            <button
              onClick={() => setActiveModule("module-5")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeModule === "module-5"
                  ? "bg-pink-500/10 text-pink-400 border-l-2 border-pink-500"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
              }`}
            >
              <TrendingUp className="size-4 shrink-0" />
              <span>Demand AI</span>
            </button>
          </nav>
        </div>

        {/* Lower Sidebar */}
        <div className="hidden md:flex flex-col p-4 border-t border-zinc-900">
          <div className="flex items-center gap-2 mb-3">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-zinc-500 font-semibold tracking-wide uppercase">Core status: Active</span>
          </div>
          <button 
            onClick={() => setShowWelcomeModal(true)}
            className="flex items-center gap-2 text-zinc-400 hover:text-white text-xs font-semibold py-2 px-3 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/80 transition-colors"
          >
            <HelpCircle className="size-3.5" />
            <span>Open Quick Start</span>
          </button>
        </div>

      </aside>

      {/* ── MAIN WORKSPACE CONTENT PANEL ────────────────────── */}
      <main className="flex-1 min-w-0 flex flex-col bg-zinc-950">
        
        {/* Module Header Toolbar */}
        <header className="h-16 border-b border-zinc-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 bg-zinc-950">
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              {activeModule === "module-1" && "Delivery Network Modeling"}
              {activeModule === "module-2" && "Route Optimization Engine"}
              {activeModule === "module-3" && "KPI Performance Analytics"}
              {activeModule === "module-4" && "Fleet Management"}
              {activeModule === "module-5" && "Demand AI Intelligence"}
            </h2>
            <span className="text-xs text-zinc-500 hidden sm:inline">
              {activeModule === "module-1" && "Input logistics nodes directly on map. Model warehouses, hubs and customer drops."}
              {activeModule === "module-2" && "Run spatial shortest paths, A* heuristic searches, or multi-stop TSP tours."}
              {activeModule === "module-3" && "Review fleet analytics, algorithmic runtimes, and system logs."}
              {activeModule === "module-4" && "Review driver manifests and vehicle rosters."}
              {activeModule === "module-5" && "Determine high-congestion zones with predictive AI overlays."}
            </span>
          </div>

          {/* Quick Actions (Export / Demo scenario loading) */}
          <div className="flex items-center gap-2">
            <AnimatedThemeToggler />
            <select 
              onChange={(e) => handleLoadScenario(e.target.value)}
              className="bg-zinc-900 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 max-w-[150px] sm:max-w-none"
            >
              <option value="">🗺️ Load Scenario</option>
              <option value="chennai">🏙️ Chennai City</option>
              <option value="delhi">🏭 Delhi NCR</option>
              <option value="mumbai">🛵 Mumbai Last Mile</option>
            </select>
            <button 
              onClick={handleExportJSON}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-all active:scale-95 animate-in fade-in duration-300"
            >
              <Download className="size-3.5" />
              <span>Export</span>
            </button>
          </div>
        </header>

        {/* Dynamic Module Body */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-0">

          {/* ════════════ MODULE 1: NETWORK MODELING ════════════ */}
          <div className={activeModule === "module-1" ? "grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start" : "hidden"}>
              
              {/* Map Canvas (Module 1) */}
              <div className="lg:col-span-8 flex flex-col rounded-3xl border border-zinc-800 bg-zinc-900/20 overflow-hidden backdrop-blur-sm">
                
                {/* Panel Title Bar */}
                <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
                  <div className="flex items-center gap-2">
                    <Map className="size-4.5 text-emerald-400" />
                    <span className="text-sm font-extrabold tracking-tight text-white">Interactive Map Editor</span>
                  </div>
                  
                  {/* Map Search input */}
                  <div className="flex items-center gap-1 max-w-[200px] sm:max-w-none">
                    <input 
                      type="text" 
                      placeholder="Search address (e.g. Anna Nagar)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearchAddress()}
                      className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full"
                    />
                    <button 
                      onClick={handleSearchAddress}
                      disabled={searchLoading}
                      className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition-colors"
                    >
                      {searchLoading ? <RefreshCw className="size-3 animate-spin" /> : <Search className="size-3" />}
                    </button>
                  </div>
                </div>

                {/* Instruction Banner */}
                <div className="bg-emerald-500/5 px-4 py-2 border-b border-zinc-900 text-xs text-emerald-400 font-semibold flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Click anywhere on the map to drop a delivery pin, or search above.</span>
                </div>

                {/* Map Div container */}
                <div className="relative h-[450px] w-full z-10 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 shadow-inner">
                  <div ref={map1Ref} className="w-full h-full" />
                  {!isMapLoaded && (
                    <div className="absolute inset-0 bg-zinc-50/80 dark:bg-zinc-950/85 backdrop-blur-sm z-[20] flex flex-col items-center justify-center gap-3 animate-in fade-in duration-300">
                      <div className="size-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 font-mono tracking-wider animate-pulse">Initializing Geospatial Engine...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Action Roster (Module 1) */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Manual Edge Editor Box */}
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/10 p-5 backdrop-blur-sm">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-zinc-800/80 pb-2">
                    <Zap className="size-4 text-emerald-400" />
                    <span>Manual Edge Editor</span>
                  </h3>
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-zinc-500 uppercase font-semibold">From Node</label>
                        <select 
                          value={edgeFrom}
                          onChange={(e) => setEdgeFrom(e.target.value)}
                          className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 p-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="">Select From</option>
                          {locations.map((loc) => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-zinc-500 uppercase font-semibold">To Node</label>
                        <select 
                          value={edgeTo}
                          onChange={(e) => setEdgeTo(e.target.value)}
                          className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 p-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="">Select To</option>
                          {locations.map((loc) => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-zinc-500 uppercase font-semibold">Route Weight (Distance in km)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 12.5"
                        value={edgeWeight}
                        onChange={(e) => setEdgeWeight(e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 p-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <button 
                      onClick={handleManualAddEdge}
                      className="mt-2 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md transition-all active:scale-95"
                    >
                      + Add Custom Route Edge
                    </button>
                  </div>
                </div>

                {/* Algorithmic Tree Roster */}
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/10 p-5 backdrop-blur-sm">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between border-b border-zinc-800/80 pb-2">
                    <span className="flex items-center gap-2">
                      <Network className="size-4 text-emerald-400" />
                      <span>Network Algorithms</span>
                    </span>
                  </h3>
                  <button 
                    onClick={handleRunMST}
                    className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Play className="size-3 text-emerald-400" />
                    <span>Run Prim's MST spanning tree</span>
                  </button>
                  <p className="mt-3 text-[10px] text-zinc-500 leading-relaxed">
                    🌲 Prim's Minimum Spanning Tree algorithm computes the most cost-efficient fiber backbone or roadway grid to link all distribution centers with minimum distance overlap.
                  </p>
                </div>

              </div>

              {/* Location Nodes Table (Module 1 Row 2) */}
              <div className="lg:col-span-12 rounded-3xl border border-zinc-800 bg-zinc-900/20 overflow-hidden backdrop-blur-sm">
                <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4.5 text-emerald-400" />
                    <span className="text-sm font-extrabold tracking-tight text-white">Active Location Nodes</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 font-mono">
                    {locations.length} Nodes mapped
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800/80 bg-zinc-900/50 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold font-mono">
                        <th className="px-6 py-4.5">Node Name</th>
                        <th className="px-6 py-4.5">Type</th>
                        <th className="px-6 py-4.5">Priority SLA</th>
                        <th className="px-6 py-4.5 text-right">Capacity (units)</th>
                        <th className="px-6 py-4.5">Delivery Time Window</th>
                        <th className="px-6 py-4.5 text-right">Latitude/Longitude</th>
                        <th className="px-6 py-4.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {locations.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                            <MapPin className="size-8 mx-auto mb-3 text-zinc-700" />
                            <strong className="block text-zinc-400 text-sm">No locations mapped yet</strong>
                            <span>Search for an address or click the interactive map above to create delivery points.</span>
                          </td>
                        </tr>
                      ) : (
                        locations.map((loc) => (
                          <tr key={loc.id} className="hover:bg-zinc-900/30 transition-colors">
                            <td className="px-6 py-4 font-bold text-white">{loc.name}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-medium tracking-wide uppercase ${
                                loc.type === "warehouse"
                                  ? "border-blue-500/20 bg-blue-950/40 text-blue-400"
                                  : loc.type === "hub"
                                  ? "border-amber-500/20 bg-amber-950/40 text-amber-400"
                                  : "border-emerald-500/20 bg-emerald-950/40 text-emerald-400"
                              }`}>
                                {loc.type === "warehouse" ? "🏭 WH" : loc.type === "hub" ? "🔄 Hub" : "👤 Customer"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                                loc.priority === "high"
                                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                  : loc.priority === "normal"
                                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                  : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                              }`}>
                                {loc.priority.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-zinc-300 font-semibold">{loc.capacity} u</td>
                            <td className="px-6 py-4 text-zinc-400 font-medium">{loc.timeWindow}</td>
                            <td className="px-6 py-4 text-right font-mono text-zinc-500">{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</td>
                            <td className="px-6 py-4 text-center">
                              <button 
                                onClick={() => handleDeleteNode(loc.id, loc.name)}
                                className="p-2 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-red-500/5 transition-all"
                                title="Delete node"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>

          {/* ════════════ MODULE 2: ROUTE OPTIMIZATION ════════════ */}
          <div className={activeModule === "module-2" ? "grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start" : "hidden"}>
              
              {/* Left Settings Panel (Module 2) */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Algorithm Selection Box */}
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/10 p-5 backdrop-blur-sm">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-zinc-800/80 pb-2">
                    <Settings className="size-4 text-blue-400" />
                    <span>Algorithm Settings</span>
                  </h3>
                  
                  {/* Select buttons */}
                  <div className="flex flex-col gap-2 mb-4">
                    <button
                      onClick={() => {
                        setSelectedAlgo("dijkstra");
                        setResultPanel(null);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        selectedAlgo === "dijkstra"
                          ? "border-blue-500 bg-blue-500/5"
                          : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/40"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-extrabold text-white">Dijkstra's Solver</span>
                        <span className="text-[10px] text-zinc-500 mt-0.5">Absolute shortest path guarantee</span>
                      </div>
                      <span className="size-2 rounded-full bg-blue-500" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAlgo("astar");
                        setResultPanel(null);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        selectedAlgo === "astar"
                          ? "border-purple-500 bg-purple-500/5"
                          : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/40"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-extrabold text-white">A* Spatial Search</span>
                        <span className="text-[10px] text-zinc-500 mt-0.5">Heuristic fast urban routing</span>
                      </div>
                      <span className="size-2 rounded-full bg-purple-500" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAlgo("tsp");
                        setResultPanel(null);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        selectedAlgo === "tsp"
                          ? "border-emerald-500 bg-emerald-500/5"
                          : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/40"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-extrabold text-white">Greedy TSP Solvers</span>
                        <span className="text-[10px] text-zinc-500 mt-0.5">Multi-stop nearest-neighbor loop</span>
                      </div>
                      <span className="size-2 rounded-full bg-emerald-500" />
                    </button>
                  </div>

                  {/* Settings Parameters */}
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-zinc-500 uppercase font-semibold">Vehicle Type</label>
                        <select 
                          value={vehicleType}
                          onChange={(e) => setVehicleType(e.target.value)}
                          className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 p-2 rounded-xl focus:outline-none"
                        >
                          <option value="twowheeler">🛵 Two-Wheeler</option>
                          <option value="car">🚗 Car / Jeep</option>
                          <option value="lcv">🚐 LCV / Mini-Truck</option>
                          <option value="truck">🚛 Heavy Truck</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-zinc-500 uppercase font-semibold">Traffic Condition</label>
                        <select 
                          value={trafficCondition}
                          onChange={(e) => setTrafficCondition(e.target.value)}
                          className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 p-2 rounded-xl focus:outline-none"
                        >
                          <option value="offpeak">🟢 Off-Peak (1.0x)</option>
                          <option value="normal">🟡 Normal (1.4x)</option>
                          <option value="peak">🔴 Peak Hour (2.2x)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-zinc-500 uppercase font-semibold">Start Node Depot</label>
                      <select 
                        value={startNode}
                        onChange={(e) => setStartNode(e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 p-2 rounded-xl focus:outline-none"
                      >
                        <option value="">Select Start</option>
                        {locations.map((loc) => (
                          <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                      </select>
                    </div>

                    {selectedAlgo !== "tsp" && (
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-zinc-500 uppercase font-semibold">End Destination Node</label>
                        <select 
                          value={endNode}
                          onChange={(e) => setEndNode(e.target.value)}
                          className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 p-2 rounded-xl focus:outline-none"
                        >
                          <option value="">Select End</option>
                          {locations.map((loc) => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <button 
                      onClick={handleRunOptimization}
                      className="mt-2 w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-zinc-950 font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Play className="size-3.5 fill-current" />
                      <span>Run Route Optimization</span>
                    </button>
                  </div>

                </div>

                {/* Computation Results Panel */}
                {resultPanel && (
                  <div className="rounded-3xl border border-zinc-800 bg-zinc-900/10 p-5 backdrop-blur-sm animate-in fade-in duration-200">
                    <h3 className="text-sm font-bold text-white mb-4 border-b border-zinc-800/80 pb-2 flex items-center gap-2">
                      <CheckCircle className="size-4 text-emerald-400" />
                      <span>Route Manifest Summary</span>
                    </h3>
                    
                    <div className="flex flex-col gap-2.5 text-xs text-zinc-400">
                      <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                        <span>Algorithm</span>
                        <strong className="text-white">{resultPanel.algo}</strong>
                      </div>
                      <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                        <span>Calculated Distance</span>
                        <strong className="text-emerald-400 font-mono">{resultPanel.distance}</strong>
                      </div>
                      <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                        <span>Estimated Time</span>
                        <strong className="text-blue-400">{resultPanel.time}</strong>
                      </div>
                      <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                        <span>Toll Fee Estimations</span>
                        <strong className="text-amber-400">{resultPanel.toll}</strong>
                      </div>
                      <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                        <span>Manifest Nodes Count</span>
                        <strong className="text-white">{resultPanel.nodesVisited} stops</strong>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
                      <button 
                        onClick={handleLiveTracking}
                        disabled={isSimulating}
                        className="w-full py-2 rounded-xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <Truck className="size-3.5 text-blue-400" />
                        <span>{simBtnText}</span>
                      </button>
                      <button 
                        onClick={handleDispatchFleet}
                        className="w-full py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <Users className="size-3.5" />
                        <span>Dispatch manifest to Fleet</span>
                      </button>
                    </div>

                    {isSimulating && (
                      <div className="mt-4">
                        <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                          <span>Vehicle location tracker progress</span>
                          <span>{trackingProgress}%</span>
                        </div>
                        <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 transition-all duration-100" style={{ width: `${trackingProgress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Right Route Map Panel (Module 2) */}
              <div className="lg:col-span-8 flex flex-col rounded-3xl border border-zinc-800 bg-zinc-900/20 overflow-hidden backdrop-blur-sm">
                <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
                  <div className="flex items-center gap-2">
                    <Map className="size-4.5 text-blue-400" />
                    <span className="text-sm font-extrabold tracking-tight text-white">Route Visualizer</span>
                  </div>
                  <button 
                    onClick={handleClearRoute}
                    className="text-xs font-bold text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800/80 transition-colors"
                  >
                    Clear Route
                  </button>
                </div>
                <div className="relative h-[450px] w-full z-10 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 shadow-inner">
                  <div ref={map2Ref} className="w-full h-full" />
                  {!isMapLoaded && (
                    <div className="absolute inset-0 bg-zinc-50/80 dark:bg-zinc-950/85 backdrop-blur-sm z-[20] flex flex-col items-center justify-center gap-3 animate-in fade-in duration-300">
                      <div className="size-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 font-mono tracking-wider animate-pulse">Initializing Route Visualizer...</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

          {/* ════════════ MODULE 3: PERFORMANCE METRICS ════════════ */}
          <div className={activeModule === "module-3" ? "flex flex-col gap-6 items-start h-full" : "hidden"}>
              
              {/* KPI Summary Cards Grid */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* KPI 1 */}
                <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/20 p-5 backdrop-blur-sm">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center gap-3.5">
                    <div className="size-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <Truck className="size-5.5 text-blue-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Active Vehicles</span>
                      <strong className="text-2xl font-black text-white mt-0.5">{activeVehiclesCount}</strong>
                    </div>
                  </div>
                </div>

                {/* KPI 2 */}
                <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/20 p-5 backdrop-blur-sm">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center gap-3.5">
                    <div className="size-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <CheckCircle className="size-5.5 text-emerald-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">On-Time SLA Rate</span>
                      <strong className="text-2xl font-black text-white mt-0.5">{onTimeRate}%</strong>
                    </div>
                  </div>
                </div>

                {/* KPI 3 */}
                <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/20 p-5 backdrop-blur-sm">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center gap-3.5">
                    <div className="size-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <Compass className="size-5.5 text-amber-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Avg Transit Time</span>
                      <strong className="text-2xl font-black text-white mt-0.5">{avgTimeMin} mins</strong>
                    </div>
                  </div>
                </div>

                {/* KPI 4 */}
                <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/20 p-5 backdrop-blur-sm">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center gap-3.5">
                    <div className="size-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                      <MapPin className="size-5.5 text-purple-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Total Dispatch Dist.</span>
                      <strong className="text-2xl font-black text-white mt-0.5">{totalDistanceKm} km</strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Charts & Roster Row (Module 3 Row 2) */}
              <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Visual Chart 1: Delivery Trend */}
                <div className="lg:col-span-8 rounded-3xl border border-zinc-800 bg-zinc-900/20 p-5 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-6 pb-2 border-b border-zinc-800/80">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp className="size-4.5 text-blue-400" />
                      <span>Delivery Volume Trend (Simulated)</span>
                    </h3>
                    <button 
                      onClick={handleKPIFullSimulation}
                      className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold px-3 py-1.5 rounded-lg border border-zinc-700 transition-colors"
                    >
                      ▶ Re-run Simulation
                    </button>
                  </div>
                  
                  {/* Styled Pure CSS Bar Chart representing transit parameters */}
                  <div className="h-[220px] w-full flex items-end justify-between gap-2 px-4 pt-6">
                    {[
                      { label: "08:00", val: 30 },
                      { label: "10:00", val: 55 },
                      { label: "12:00", val: 42 },
                      { label: "14:00", val: 78 },
                      { label: "16:00", val: 62 },
                      { label: "18:00", val: 95 },
                      { label: "20:00", val: 50 },
                    ].map((bar, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                        <span className="text-[10px] font-mono text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold">{bar.val} orders</span>
                        <div 
                          className="w-full bg-gradient-to-t from-blue-600/20 to-blue-400 rounded-t-lg transition-all duration-500 hover:brightness-110" 
                          style={{ height: `${bar.val * 1.5}px` }} 
                        />
                        <span className="text-[10px] font-semibold text-zinc-500 font-mono mt-1">{bar.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Donut Roster */}
                <div className="lg:col-span-4 rounded-3xl border border-zinc-800 bg-zinc-900/20 p-5 backdrop-blur-sm">
                  <h3 className="text-sm font-bold text-white mb-6 border-b border-zinc-800/80 pb-2">
                    <span>Delivery Status Breakdown</span>
                  </h3>
                  <div className="flex flex-col gap-3">
                    {[
                      { status: "Delivered Successfully", count: 65, color: "bg-emerald-500" },
                      { status: "Currently In Transit", count: 18, color: "bg-blue-500" },
                      { status: "Pending Dispatch", count: 12, color: "bg-zinc-600" },
                      { status: "Traffic Delayed", count: 5, color: "bg-amber-500" },
                    ].map((stat, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-zinc-400">
                          <span className={`size-2.5 rounded-full ${stat.color}`} />
                          <span>{stat.status}</span>
                        </div>
                        <span className="font-mono font-bold text-white">{stat.count}%</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-4 border-t border-zinc-900 text-center">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Autopilot Status: WAITING</span>
                  </div>
                </div>

                {/* Event Logs Console */}
                <div className="lg:col-span-12 rounded-3xl border border-zinc-800 bg-zinc-900/20 overflow-hidden backdrop-blur-sm">
                  <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4.5 text-purple-400" />
                      <span className="text-sm font-extrabold tracking-tight text-white">System Activity Event Logs</span>
                    </div>
                  </div>
                  
                  {/* Console body */}
                  <div className="h-[200px] overflow-y-auto p-4 bg-zinc-950/80 font-mono text-[11px] leading-relaxed flex flex-col gap-2">
                    {logs.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-3 select-none">
                        <span className="text-zinc-600 font-bold shrink-0">{log.time}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider shrink-0 uppercase ${
                          log.type === "success"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-500/20"
                            : log.type === "warning"
                            ? "bg-amber-950 text-amber-400 border border-amber-500/20"
                            : log.type === "error"
                            ? "bg-red-950 text-red-400 border border-red-500/20"
                            : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                        }`}>
                          {log.type}
                        </span>
                        <span className="text-zinc-300 font-medium">{log.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          {/* ════════════ MODULE 4: FLEET MANAGEMENT ════════════ */}
          <div className={activeModule === "module-4" ? "flex flex-col gap-6 items-start h-full" : "hidden"}>
              
              {/* Fleet Metric Row */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/20 p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🚐</span>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold font-mono">Total Fleet Size</span>
                      <strong className="text-xl font-black text-white mt-0.5">42 Vehicles</strong>
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/20 p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">👨‍✈️</span>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold font-mono">Active Drivers</span>
                      <strong className="text-xl font-black text-emerald-400 mt-0.5">28 On-Duty</strong>
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/20 p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">📦</span>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold font-mono">Capacity Utilization</span>
                      <strong className="text-xl font-black text-amber-400 mt-0.5">78%</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Roster Table */}
              <div className="w-full rounded-3xl border border-zinc-800 bg-zinc-900/20 overflow-hidden backdrop-blur-sm">
                <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
                  <div className="flex items-center gap-2">
                    <Users className="size-4.5 text-amber-400" />
                    <span className="text-sm font-extrabold tracking-tight text-white">Active Driver Manifest Roster</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800/80 bg-zinc-900/50 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold font-mono">
                        <th className="px-6 py-4.5">Driver Name</th>
                        <th className="px-6 py-4.5">Assigned Vehicle</th>
                        <th className="px-6 py-4.5">Status</th>
                        <th className="px-6 py-4.5">Assigned Route Manifest</th>
                        <th className="px-6 py-4.5 text-right">Capacity Util.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {initialDrivers.map((driver, idx) => (
                        <tr key={idx} className="hover:bg-zinc-900/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-white">{driver.name}</td>
                          <td className="px-6 py-4 text-zinc-300 font-medium">{driver.vehicleType}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              driver.status === "In Transit"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                : driver.status === "On Duty"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                            }`}>
                              {driver.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-zinc-400 font-mono">{driver.route}</td>
                          <td className="px-6 py-4 text-right font-mono text-zinc-300 font-semibold">{driver.capacity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>

          {/* ════════════ MODULE 5: DEMAND AI INTELLIGENCE ════════════ */}
          <div className={activeModule === "module-5" ? "grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start" : "hidden"}>
              
              {/* Heatmap visual overlay */}
              <div className="lg:col-span-8 flex flex-col rounded-3xl border border-zinc-800 bg-zinc-900/20 overflow-hidden backdrop-blur-sm">
                <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
                  <div className="flex items-center gap-2">
                    <Map className="size-4.5 text-pink-400" />
                    <span className="text-sm font-extrabold tracking-tight text-white">Demand Heatmap Overlay</span>
                  </div>
                  
                  {/* Toggle controls */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={showHeatmap}
                      onChange={(e) => setShowHeatmap(e.target.checked)}
                      className="accent-pink-500 size-3.5"
                    />
                    <span className="text-xs font-semibold text-zinc-400">Show Heat Zones</span>
                  </label>
                </div>

                <div className="bg-pink-500/5 px-4 py-2 border-b border-zinc-900 text-xs text-pink-400 font-semibold flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-pink-400 animate-ping" />
                  <span>Interactive overlay shows zone spikes. Click any circle to import delivery nodes.</span>
                </div>

                <div className="relative h-[400px] w-full z-10 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 shadow-inner">
                  <div ref={map3Ref} className="w-full h-full" />
                  {!isMapLoaded && (
                    <div className="absolute inset-0 bg-zinc-50/80 dark:bg-zinc-950/85 backdrop-blur-sm z-[20] flex flex-col items-center justify-center gap-3 animate-in fade-in duration-300">
                      <div className="size-10 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 font-mono tracking-wider animate-pulse">Initializing Predictive Heatmap Engine...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Dispatch Advice column */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* AI Volume forecast chart */}
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/10 p-5 backdrop-blur-sm">
                  <h3 className="text-sm font-bold text-white mb-4 border-b border-zinc-800/80 pb-2">
                    <span>Order Volume Forecast</span>
                  </h3>
                  
                  {/* Pure CSS mini bar chart for predicted volume */}
                  <div className="h-[120px] w-full flex items-end justify-between gap-1.5 px-2 pt-2">
                    {[
                      { label: "8a", val: 20 },
                      { label: "10a", val: 45 },
                      { label: "12p", val: 35 },
                      { label: "2p", val: 55 },
                      { label: "4p", val: 80 },
                      { label: "6p", val: 98 },
                      { label: "8p", val: 40 },
                    ].map((bar, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                        <div 
                          className="w-full bg-pink-500/20 border-t border-pink-500 rounded-t" 
                          style={{ height: `${bar.val}%` }} 
                        />
                        <span className="text-[9px] font-mono text-zinc-500 font-bold">{bar.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Suggestions Box */}
                <div className="rounded-3xl border border-pink-500/20 bg-pink-950/20 p-5 backdrop-blur-sm">
                  <h3 className="text-sm font-bold text-pink-400 mb-3 flex items-center gap-2">
                    <Compass className="size-4 text-pink-400 animate-spin" style={{ animationDuration: "10s" }} />
                    <span>AI Dispatch Advice</span>
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                    🤖 AI predicts a <strong>42% surge</strong> in last-mile delivery volume between 17:00 and 19:00. <br /><br />
                    Recommend pre-shifting 5 idle LCV delivery trucks to the <strong>Central Zone</strong> depot to bypass high-priority congestion delays and maintain strict SLA windows.
                  </p>
                </div>

              </div>

            </div>

        </div>

      </main>

      {/* ── Welcome onboarding modal overlay ────────────────── */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-[550px] rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8 shadow-2xl relative">
            <button 
              onClick={() => setShowWelcomeModal(false)}
              className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <CloseIcon className="size-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="size-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center text-lg">
                🚀
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-bold text-white">Welcome to PathSync</h3>
                <span className="text-xs text-zinc-400">Enterprise Logistics Delivery Optimizer Suite</span>
              </div>
            </div>

            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              PathSync helps you plan, model, and optimize large-scale logistics operations using real-time Indian road spatial metrics and advanced graph traversal routing algorithms.
            </p>

            <div className="flex flex-col gap-4 mb-8">
              <div className="flex gap-4 items-start">
                <div className="size-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0">1</div>
                <div className="flex flex-col">
                  <strong className="text-xs text-white">Map Your Logistics Network</strong>
                  <span className="text-xs text-zinc-400 mt-0.5">Search address endpoints or click the Leaflet map inside Module 1 to drop Warehouses, Hubs, and Customer bins.</span>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">2</div>
                <div className="flex flex-col">
                  <strong className="text-xs text-white">Optimize Route Traversals</strong>
                  <span className="text-xs text-zinc-400 mt-0.5">Navigate to Module 2 to run Dijkstra, A*, or Greedy TSP runs. Adjust vehicle parameters and traffic conditions for real ETAs.</span>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="size-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-400 shrink-0">3</div>
                <div className="flex flex-col">
                  <strong className="text-xs text-white">Track Active Roster Metrics</strong>
                  <span className="text-xs text-zinc-400 mt-0.5">Evaluate live transit logs, driver capacities, and forecast surge spikes inside Modules 3, 4 and 5.</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-4 border-t border-zinc-800">
              <button 
                onClick={handleWelcomeDemoLoad}
                className="px-4 py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-850 text-zinc-300 text-xs font-bold transition-all active:scale-95"
              >
                Load Chennai Demo Scenario
              </button>
              <button 
                onClick={() => setShowWelcomeModal(false)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-extrabold shadow-md shadow-emerald-500/15 transition-all active:scale-95"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add node modal overlay (Module 1) ───────────────── */}
      {showAddNodeModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[500px] rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-7 shadow-2xl relative">
            <button 
              onClick={() => setShowAddNodeModal(false)}
              className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <CloseIcon className="size-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-sm text-emerald-400">
                📍
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-white">Create Delivery Node</h3>
                <span className="text-[10px] text-zinc-400 font-mono">LAT: {newNodeLat.toFixed(5)} · LNG: {newNodeLng.toFixed(5)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-zinc-500 uppercase font-semibold">Location Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Adyar Distribution Center"
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-zinc-500 uppercase font-semibold">Node Type</label>
                  <select 
                    value={newNodeType}
                    onChange={(e) => setNewNodeType(e.target.value as any)}
                    className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 p-2.5 rounded-xl focus:outline-none"
                  >
                    <option value="warehouse">🏭 Warehouse</option>
                    <option value="customer">👤 Customer Drop</option>
                    <option value="hub">🔄 Hub Point</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-zinc-500 uppercase font-semibold">SLA Priority</label>
                  <select 
                    value={newNodePriority}
                    onChange={(e) => setNewNodePriority(e.target.value as any)}
                    className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 p-2.5 rounded-xl focus:outline-none"
                  >
                    <option value="high">🔴 High</option>
                    <option value="normal">🔵 Normal</option>
                    <option value="low">⚫ Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-zinc-500 uppercase font-semibold">Capacity (units)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 150"
                    value={newNodeCapacity}
                    onChange={(e) => setNewNodeCapacity(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 p-2.5 rounded-xl focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-zinc-500 uppercase font-semibold">Delivery Time Window</label>
                  <input 
                    type="text" 
                    placeholder="09:00 - 17:00"
                    value={newNodeTimeWindow}
                    onChange={(e) => setNewNodeTimeWindow(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 p-2.5 rounded-xl focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800">
              <button 
                onClick={() => setShowAddNodeModal(false)}
                className="px-4 py-2 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-400 text-xs font-bold transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddNode}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-extrabold shadow-md transition-all active:scale-95"
              >
                Save Location Node
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
