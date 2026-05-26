"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  MapPin, 
  Route as RouteIcon, 
  TrendingUp, 
  Check, 
  X, 
  Menu, 
  X as CloseIcon, 
  Cpu, 
  Gauge, 
  Activity, 
  Zap, 
  ShieldAlert, 
  ChevronRight,
  Calendar,
  FileText,
  Clock,
  Truck
} from "lucide-react";
import ServiceLedger from "@/components/ui/service-ledger";
import FolderInteraction from "@/components/ui/folder";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";
import { LocationTag } from "@/components/ui/location-tag";
import { UpgradeBanner } from "@/components/ui/upgrade-banner";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { ActionSearchBar } from "@/components/ui/action-search-bar";
import { RatingInteraction } from "@/components/ui/emoji-rating";
import dynamic from "next/dynamic";

const AdvancedMap = dynamic(
  () => import("@/components/ui/interactive-map").then((mod) => mod.AdvancedMap),
  { ssr: false, loading: () => <div style={{ height: '550px' }} className="w-full bg-zinc-900 animate-pulse rounded-3xl" /> }
);

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(true);

  // Timeline dispatch stages
  const timelineData = [
    {
      id: 1,
      title: "Manifest Ingress",
      date: "Stage 01",
      content: "Automated routing manifest generated from centralized logistics dispatch parameters.",
      category: "Ingress",
      icon: Calendar,
      relatedIds: [2],
      status: "completed" as const,
      energy: 100,
    },
    {
      id: 2,
      title: "Engine Optimise",
      date: "Stage 02",
      content: "Statically-typed A* and Dijkstra solvers process graph permutations under 1ms.",
      category: "Solve",
      icon: FileText,
      relatedIds: [1, 3],
      status: "completed" as const,
      energy: 95,
    },
    {
      id: 3,
      title: "Fleet Allocation",
      date: "Stage 03",
      content: "Optimal LCV/Jeep capacities and driver shifts automatically assigned.",
      category: "Dispatch",
      icon: Truck,
      relatedIds: [2, 4],
      status: "in-progress" as const,
      energy: 65,
    },
    {
      id: 4,
      title: "Active Tracking",
      date: "Stage 04",
      content: "Real-time OSRM tracking active along dynamic vector road layers.",
      category: "Transit",
      icon: MapPin,
      relatedIds: [3, 5],
      status: "pending" as const,
      energy: 30,
    },
    {
      id: 5,
      title: "SLA Handshake",
      date: "Stage 05",
      content: "OMR Zero-toll bypass rules and customer priority SLA parameters verified.",
      category: "Handoff",
      icon: Clock,
      relatedIds: [4],
      status: "pending" as const,
      energy: 10,
    },
  ];

  // Features mapping
  const features = [
    {
      icon: <MapPin className="size-6 text-emerald-400" />,
      title: "Interactive Network Modeling",
      description: "Construct complex supply chain graphs with intuitive interactive mechanics. Instantly bridge theoretical models with real-world map data."
    },
    {
      icon: <RouteIcon className="size-6 text-blue-400" />,
      title: "Route Optimization",
      description: "Process thousands of routing permutations in milliseconds using state-of-the-art A* and Dijkstra graph traversal algorithms."
    },
    {
      icon: <Activity className="size-6 text-purple-400" />,
      title: "Real-time Tracking",
      description: "Monitor your entire fleet with sub-second latency. React to traffic anomalies and weather events before they impact your delivery SLAs."
    },
    {
      icon: <Zap className="size-6 text-amber-400" />,
      title: "Fleet Dispatching",
      description: "Dynamically assign delivery manifests based on vehicle capacity, driver status, and real-time proximity to demand zones."
    },
    {
      icon: <TrendingUp className="size-6 text-pink-400" />,
      title: "Demand Intelligence",
      description: "Visualize predictive heatmaps to identify high-density order zones and pre-position your fleet for maximum efficiency."
    },
    {
      icon: <ShieldAlert className="size-6 text-emerald-400" />,
      title: "Local Cost Control",
      description: "Automatically factor in localized variables like the OMR zero-toll policy, slashing operational overhead at the routing level."
    }
  ];

  // Algorithms data
  const algos = [
    {
      tag: "Precision Engine",
      title: "Dijkstra's Algorithm",
      desc: "Guarantees the absolute shortest path by calculating the aggregate weight of all possible node combinations. Ideal for critical medical or high-value transit.",
      accuracy: "100%",
      speed: "Moderate",
      data: [
        { nodes: "1,000 Nodes", time: "120 ms", mem: "45 MB" },
        { nodes: "5,000 Nodes", time: "1,800 ms", mem: "210 MB" },
        { nodes: "10,000 Nodes", time: "8,500 ms", mem: "580 MB" }
      ]
    },
    {
      tag: "Heuristic Engine",
      title: "A* Search",
      desc: "Injects real-world traffic heuristics and spatial coordinates to drastically reduce computation time. The enterprise standard for rapid urban dispatch.",
      accuracy: "98%",
      speed: "Lightning Fast",
      data: [
        { nodes: "1,000 Nodes", time: "28 ms", mem: "12 MB" },
        { nodes: "5,000 Nodes", time: "210 ms", mem: "45 MB" },
        { nodes: "10,000 Nodes", time: "820 ms", mem: "95 MB" }
      ]
    },
    {
      tag: "Multi-Stop Engine",
      title: "Greedy TSP",
      desc: "Solves the Traveling Salesperson Problem for complex delivery manifests by constantly seeking the nearest unvisited node. Perfect for last-mile logistics.",
      accuracy: "Unlimited Stops",
      speed: "Immediate",
      data: [
        { nodes: "50 Stops", time: "4 ms", mem: "18% Savings" },
        { nodes: "150 Stops", time: "12 ms", mem: "22% Savings" },
        { nodes: "500 Stops", time: "35 ms", mem: "28% Savings" }
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 overflow-x-hidden">
      
      {showUpgradeBanner && (
        <UpgradeBanner
          buttonText="Upgrade to PathSync Pro"
          description="for unlimited route optimization queries and real-time SLA maps"
          onClose={() => setShowUpgradeBanner(false)}
          onClick={() => {
            window.location.href = "/workspace";
          }}
          className="w-full z-50 bg-[#06193A] border-b border-[#003674]/50 py-1"
        />
      )}
      
      {/* ── HEADER & NAVIGATION ────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-white transition-opacity hover:opacity-90">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-600 shadow-md">
              <RouteIcon className="size-5 text-white" />
            </div>
            <span>
              Path<span className="text-emerald-400 font-semibold">Sync</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="transition-colors hover:text-white">Platform</a>
            <a href="#algorithms" className="transition-colors hover:text-white">Intelligence</a>
            <a href="#how-we-work" className="transition-colors hover:text-white">Execution</a>
            <a href="#compare" className="transition-colors hover:text-white">Compare</a>
          </nav>

          {/* Desktop Call to Actions */}
          <div className="hidden md:flex items-center gap-4">
            <AnimatedThemeToggler />
            <Link 
              href="/workspace" 
              className="inline-flex h-9 items-center justify-center rounded-lg bg-zinc-800 px-4 text-sm font-medium text-zinc-200 transition-all hover:bg-zinc-700 hover:text-white"
            >
              Sign In
            </Link>
            <Link 
              href="/workspace" 
              className="inline-flex h-9 items-center justify-center rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-zinc-950 shadow-md transition-all hover:bg-emerald-400 hover:shadow-emerald-500/10 active:scale-95"
            >
              Launch Workspace
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-4 md:hidden">
            <AnimatedThemeToggler />
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex size-10 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <CloseIcon className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-zinc-950/95 backdrop-blur-lg md:hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-6 p-6 border-t border-zinc-900">
            <nav className="flex flex-col gap-4 text-lg font-medium text-zinc-300">
              <a 
                href="#features" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 border-b border-zinc-900"
              >
                <span>Platform</span>
                <ChevronRight className="size-4 text-zinc-500" />
              </a>
              <a 
                href="#algorithms" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 border-b border-zinc-900"
              >
                <span>Intelligence</span>
                <ChevronRight className="size-4 text-zinc-500" />
              </a>
              <a 
                href="#how-we-work" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 border-b border-zinc-900"
              >
                <span>Execution</span>
                <ChevronRight className="size-4 text-zinc-500" />
              </a>
              <a 
                href="#compare" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 border-b border-zinc-900"
              >
                <span>Compare</span>
                <ChevronRight className="size-4 text-zinc-500" />
              </a>
            </nav>
            <div className="flex flex-col gap-3 mt-4">
              <Link 
                href="/workspace" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-12 items-center justify-center rounded-xl bg-zinc-900 text-base font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
              >
                Sign In
              </Link>
              <Link 
                href="/workspace" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-12 items-center justify-center rounded-xl bg-emerald-500 text-base font-bold text-zinc-950 shadow-md shadow-emerald-500/10 active:scale-98"
              >
                Launch Workspace
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── HERO SECTION ───────────────────────────────── */}
      <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 overflow-hidden border-b border-zinc-900">
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none z-0" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">
            
            {/* Left Copy */}
            <div className="flex flex-col text-center lg:text-left lg:col-span-7">
              <div className="inline-flex self-center lg:self-start items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-3.5 py-1 text-xs font-medium text-emerald-400 mb-6">
                <span className="relative flex size-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500"></span>
                </span>
                PathSync v7 is now live
              </div>
              
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
                INTELLIGENT <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 bg-clip-text text-transparent">
                  LOGISTICS DISPATCH
                </span>
              </h1>
              
              <p className="mt-6 text-base text-zinc-400 sm:text-lg md:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Command your fleet with real-time routing optimization, dynamic demand intelligence, and zero-latency graph neural network algorithms. Build for fast urban supply chains.
              </p>
              
              {/* Live Location Hub Tags */}
              <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <LocationTag city="Chennai" country="IND" timezone="IST" />
                <LocationTag city="San Francisco" country="USA" timezone="PST" />
              </div>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  href="/workspace" 
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 text-base font-bold text-zinc-950 shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/30 active:scale-95"
                >
                  Start Optimization Free
                  <ArrowRight className="size-5" />
                </Link>
                <a 
                  href="#features" 
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 px-6 text-base font-semibold text-zinc-200 transition-all hover:bg-zinc-800 hover:text-white hover:border-zinc-700"
                >
                  Explore Platform
                </a>
              </div>

              {/* Trust Badge Grid */}
              <div className="mt-12 pt-8 border-t border-zinc-900/80 flex flex-wrap gap-x-8 gap-y-4 justify-center lg:justify-start text-xs text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <Cpu className="size-4 text-zinc-600" />
                  <span>Dijkstra's Precision Tour</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Gauge className="size-4 text-zinc-600" />
                  <span>Sub-Millisecond Solving</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-4 text-zinc-600" />
                  <span>Leaflet Spatial Modeling</span>
                </div>
              </div>
            </div>

            {/* Right Widget Panel */}
            <div className="lg:col-span-5 flex justify-center z-10 w-full">
              <div className="relative w-full max-w-[380px] sm:max-w-[420px] rounded-3xl border border-zinc-800/80 bg-zinc-900/20 p-4 sm:p-6 backdrop-blur-xl shadow-2xl shadow-emerald-500/[0.02]">
                
                {/* Visual Accent Sheen */}
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-blue-500/5 rounded-3xl opacity-50 pointer-events-none" />
                
                {/* Title */}
                <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Autopilot Hub Simulator</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">V7.0-STAGE</span>
                </div>

                {/* Folder interaction component */}
                <div className="py-2 flex items-center justify-center">
                  <FolderInteraction />
                </div>
                
                {/* Helper instruction */}
                <p className="mt-3 text-center text-xs text-zinc-500 italic">
                  🖱️ Click the folder above to toggle autopilot manifest delete
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── PLATFORM FEATURES ──────────────────────────── */}
      <section className="py-20 md:py-28 bg-zinc-950 relative border-b border-zinc-900" id="features">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Complete Logistics Engine</h2>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
              Platform Features Built to Deliver
            </p>
            <p className="mt-4 text-base sm:text-lg text-zinc-400">
              Everything you need to map network topographies, dispatch vehicles, and track supply chain KPIs on a single platform.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="group relative flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/10 p-6 transition-all hover:bg-zinc-900/40 hover:border-zinc-700/80 hover:shadow-xl hover:shadow-emerald-500/[0.01]"
              >
                {/* Icon wrapper */}
                <div className="flex size-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700 group-hover:bg-zinc-950 transition-all mb-5">
                  {feature.icon}
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── NEURAL PIPELINE ORBIT TRACKER ───────────────── */}
      <section className="py-20 md:py-28 bg-black relative border-b border-zinc-900 overflow-hidden" id="pipeline">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-purple-400">Real-Time Dispatch Pipeline</h2>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
              Chronological Neural Orbit Status
            </p>
            <p className="mt-4 text-base sm:text-lg text-zinc-400">
              Interactive orbital projection of order stages. Click on any stop node below to examine load factors and connected neural pathways.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/10 backdrop-blur-sm overflow-hidden shadow-2xl shadow-purple-500/[0.01]">
            <RadialOrbitalTimeline timelineData={timelineData} />
          </div>

        </div>
      </section>

      {/* ── LIVE GLOBAL OPERATIONS MAP Showcase ───────────────── */}
      <section className="py-20 md:py-28 bg-zinc-950 relative border-b border-zinc-900 overflow-hidden" id="live-map">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Live Spatial Operations</h2>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
              Interactive Dispatch Map
            </p>
            <p className="mt-4 text-base sm:text-lg text-zinc-400">
              Click the map to drop custom delivery waypoints, search worldwide locations, and overlay clustering zones directly from your browser.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-4 shadow-2xl backdrop-blur-md">
            <AdvancedMap 
              center={[13.0827, 80.2707]} 
              zoom={12}
              markers={[
                {
                  id: 1,
                  position: [13.0827, 80.2707],
                  color: 'blue',
                  size: 'medium',
                  popup: {
                    title: 'Chennai Central Depot',
                    content: 'Primary hub coordinate for South India dispatch.',
                    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'
                  }
                },
                {
                  id: 2,
                  position: [13.0475, 80.2090],
                  color: 'green',
                  size: 'large',
                  popup: {
                    title: 'Anna Nagar Fulfillment Hub',
                    content: 'High-density zone with dynamic route caching active.'
                  }
                },
                {
                  id: 3,
                  position: [12.9716, 80.2454],
                  color: 'orange',
                  size: 'medium',
                  popup: {
                    title: 'OMR Roadway Zone',
                    content: 'Zero-toll bypass route currently operational.'
                  }
                }
              ]}
              polygons={[
                {
                  id: 1,
                  positions: [
                    [13.0900, 80.2100],
                    [13.0500, 80.1900],
                    [13.0300, 80.2300]
                  ],
                  style: { color: '#10b981', weight: 2, fillOpacity: 0.2 },
                  popup: 'High-Priority Dispatch Zone Alpha'
                }
              ]}
              circles={[
                {
                  id: 1,
                  center: [13.0827, 80.2707],
                  radius: 3000,
                  style: { color: '#3b82f6', fillOpacity: 0.1, weight: 1 },
                  popup: 'Base Coverage (3km Radius)'
                }
              ]}
              enableClustering={true}
              enableSearch={true}
              enableControls={true}
              style={{ height: '550px', width: '100%' }}
            />
          </div>

        </div>
      </section>

      {/* ── ALGORITHM DEEP DIVE ────────────────────────── */}
      <section className="py-20 md:py-28 bg-zinc-950 relative border-b border-zinc-900" id="algorithms">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/5 via-transparent to-transparent pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-blue-400">Advanced Algorithmic Switching</h2>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
              Mathematics of Last-Mile Efficiency
            </p>
            <p className="mt-4 text-base sm:text-lg text-zinc-400">
              Select the optimal algorithm based on your speed, accuracy, and vehicle constraints. Pure mathematics at runtime.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {algos.map((algo, idx) => (
              <div 
                key={idx}
                className="flex flex-col rounded-3xl border border-zinc-800 bg-zinc-900/20 p-6 backdrop-blur-sm"
              >
                <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 self-start px-2 py-0.5 rounded-full mb-4">
                  {algo.tag}
                </span>
                
                <h3 className="text-xl font-bold text-white mb-2">{algo.title}</h3>
                
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  {algo.desc}
                </p>

                <div className="flex items-center justify-between border-t border-zinc-800 pt-4 mb-6 text-xs font-semibold text-zinc-400">
                  <span>Accuracy: <span className="text-white">{algo.accuracy}</span></span>
                  <span>Execution: <span className="text-emerald-400">{algo.speed}</span></span>
                </div>

                <div className="mt-auto bg-zinc-950/60 rounded-xl border border-zinc-800/80 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200 mb-3 font-mono">
                    <Activity className="size-3 text-blue-400" />
                    <span>REAL BENCHMARKS</span>
                  </div>
                  <table className="w-full text-[11px] font-mono text-zinc-400">
                    <thead>
                      <tr className="border-b border-zinc-800/80 text-zinc-500">
                        <th className="text-left pb-1.5 font-medium">Nodes</th>
                        <th className="text-center pb-1.5 font-medium">Time</th>
                        <th className="text-right pb-1.5 font-medium">Metric</th>
                      </tr>
                    </thead>
                    <tbody>
                      {algo.data.map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-zinc-900/50 last:border-0 hover:bg-zinc-900/30">
                          <td className="py-1.5 text-left text-zinc-300 font-medium">{row.nodes}</td>
                          <td className="py-1.5 text-center text-emerald-400 font-bold">{row.time}</td>
                          <td className="py-1.5 text-right text-zinc-400">{row.mem}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>



      {/* ── COMPARISON TABLE ───────────────────────────── */}
      <section className="py-20 md:py-28 bg-zinc-950 relative border-b border-zinc-900" id="compare">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Competitive Analysis</h2>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
              Why Enterprise Chooses PathSync
            </p>
            <p className="mt-4 text-base sm:text-lg text-zinc-400">
              Compare features and sub-millisecond execution parameters against legacy solutions.
            </p>
          </div>

          <div className="mt-16 overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-900/10">
            <table className="w-full min-w-[700px] border-collapse text-left text-sm text-zinc-300">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <th className="px-6 py-5">Platform Features</th>
                  <th className="px-6 py-5 text-emerald-400 bg-emerald-500/5 font-bold">PathSync Optimizer</th>
                  <th className="px-6 py-5">Standard APIs</th>
                  <th className="px-6 py-5">Legacy ERPs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                <tr className="hover:bg-zinc-900/30">
                  <td className="px-6 py-4.5 font-medium text-white">Real-Time Algorithmic Switching</td>
                  <td className="px-6 py-4.5 bg-emerald-500/5"><Check className="size-5 text-emerald-400" /></td>
                  <td className="px-6 py-4.5"><X className="size-5 text-zinc-600" /></td>
                  <td className="px-6 py-4.5"><X className="size-5 text-zinc-600" /></td>
                </tr>
                <tr className="hover:bg-zinc-900/30">
                  <td className="px-6 py-4.5 font-medium text-white">Interactive Graph Network Modeling</td>
                  <td className="px-6 py-4.5 bg-emerald-500/5"><Check className="size-5 text-emerald-400" /></td>
                  <td className="px-6 py-4.5"><X className="size-5 text-zinc-600" /></td>
                  <td className="px-6 py-4.5"><X className="size-5 text-zinc-600" /></td>
                </tr>
                <tr className="hover:bg-zinc-900/30">
                  <td className="px-6 py-4.5 font-medium text-white">Dynamic Manifest Fleet Dispatching</td>
                  <td className="px-6 py-4.5 bg-emerald-500/5"><Check className="size-5 text-emerald-400" /></td>
                  <td className="px-6 py-4.5"><Check className="size-5 text-emerald-400" /></td>
                  <td className="px-6 py-4.5"><X className="size-5 text-zinc-600" /></td>
                </tr>
                <tr className="hover:bg-zinc-900/30">
                  <td className="px-6 py-4.5 font-medium text-white">Predictive AI Demand Heatmaps</td>
                  <td className="px-6 py-4.5 bg-emerald-500/5"><Check className="size-5 text-emerald-400" /></td>
                  <td className="px-6 py-4.5"><X className="size-5 text-zinc-600" /></td>
                  <td className="px-6 py-4.5"><Check className="size-5 text-emerald-400" /></td>
                </tr>
                <tr className="hover:bg-zinc-900/30">
                  <td className="px-6 py-4.5 font-medium text-white">Local Toll & Penalty Adjustments</td>
                  <td className="px-6 py-4.5 bg-emerald-500/5"><Check className="size-5 text-emerald-400" /></td>
                  <td className="px-6 py-4.5"><X className="size-5 text-zinc-600" /></td>
                  <td className="px-6 py-4.5"><X className="size-5 text-zinc-600" /></td>
                </tr>
                <tr className="hover:bg-zinc-900/30">
                  <td className="px-6 py-4.5 font-medium text-white">Sub-Millisecond Local Solving</td>
                  <td className="px-6 py-4.5 bg-emerald-500/5"><Check className="size-5 text-emerald-400" /></td>
                  <td className="px-6 py-4.5"><Check className="size-5 text-emerald-400" /></td>
                  <td className="px-6 py-4.5"><X className="size-5 text-zinc-600" /></td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* ── CALL TO ACTION ─────────────────────────────── */}
      <section className="py-20 md:py-28 bg-zinc-950 relative overflow-hidden">
        
        {/* Glow Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center z-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Ready to Optimize Your Fleet Operations?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Join logistics professionals and dispatchers using PathSync to cut fuel overhead, enforce strict SLAs, and run efficient delivery runs.
          </p>
          <div className="mt-8 flex justify-center">
            <Link 
              href="/workspace" 
              className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 text-base font-bold text-zinc-950 shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-98"
            >
              Launch Next-Gen Workspace
              <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEEDBACK & SATISFACTION ───────────────────────── */}
      <section className="py-16 bg-black relative border-t border-zinc-900">
        <div className="mx-auto max-w-lg px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 mb-6">
            Rate Your Dispatch Experience
          </p>
          <RatingInteraction 
            onChange={(val) => {
              console.log("Feedback rating selected: ", val);
            }} 
          />
          <div className="mt-8 h-px w-24 bg-gradient-to-r from-transparent via-zinc-800 to-transparent mx-auto" />
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────── */}
      <footer className="bg-zinc-950 border-t border-zinc-900 pt-16 pb-8 text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          
          <div className="md:col-span-4 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white">
              <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500">
                <RouteIcon className="size-4 text-zinc-950" />
              </div>
              <span>PathSync</span>
            </Link>
            <p className="text-zinc-400 leading-relaxed max-w-xs">
              Next-generation routing algorithms, interactive spatial modeling, and predictive intelligence for logistics enterprises.
            </p>
          </div>

          <div className="md:col-span-2.5 flex flex-col gap-3">
            <h4 className="text-zinc-200 font-bold text-xs uppercase tracking-wider">Engine</h4>
            <a href="#algorithms" className="hover:text-zinc-300">Dijkstra's Solver</a>
            <a href="#algorithms" className="hover:text-zinc-300">A* Search Engine</a>
            <a href="#algorithms" className="hover:text-zinc-300">Greedy TSP Solver</a>
            <a href="#features" className="hover:text-zinc-300">Network Prim's MST</a>
          </div>

          <div className="md:col-span-2.5 flex flex-col gap-3">
            <h4 className="text-zinc-200 font-bold text-xs uppercase tracking-wider">Features</h4>
            <a href="#features" className="hover:text-zinc-300">Network Graphing</a>
            <a href="#features" className="hover:text-zinc-300">Leaflet Maps</a>
            <a href="#features" className="hover:text-zinc-300">Fleet Manifests</a>
            <a href="#features" className="hover:text-zinc-300">Demand Heatmaps</a>
          </div>

          <div className="md:col-span-3 flex flex-col gap-3">
            <h4 className="text-zinc-200 font-bold text-xs uppercase tracking-wider">Contact & Legal</h4>
            <p>Chennai, Tamil Nadu, India</p>
            <a href="#" className="hover:text-zinc-300">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-300">Terms of Service</a>
            <a href="#" className="hover:text-zinc-300">Support Desk</a>
          </div>

        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-zinc-900/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} PathSync Logistics Intelligence. All rights reserved.</p>
          <p className="text-zinc-600 font-mono">Stage: Production-Ready Rewrite</p>
        </div>
      </footer>

    </div>
  );
}
