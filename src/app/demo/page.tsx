"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  MapPin, 
  Route as RouteIcon, 
  Code, 
  Sparkles, 
  Terminal, 
  Map, 
  Tag, 
  Smile, 
  Info,
  CheckCircle
} from "lucide-react";
import { UpgradeBanner } from "@/components/ui/upgrade-banner";
import { ActionSearchBar } from "@/components/ui/action-search-bar";
import { LocationTag } from "@/components/ui/location-tag";
import { RatingInteraction } from "@/components/ui/emoji-rating";
import dynamic from "next/dynamic";

const AdvancedMap = dynamic(
  () => import("@/components/ui/interactive-map").then((mod) => mod.AdvancedMap),
  { ssr: false, loading: () => <div style={{ height: "450px" }} className="w-full bg-zinc-900 animate-pulse rounded-3xl" /> }
);

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<"all" | "banner" | "search" | "map" | "location" | "rating">("all");
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(true);
  const [rating, setRating] = useState(0);

  const tabs = [
    { id: "all", label: "Show All Components", icon: <Sparkles className="size-4" /> },
    { id: "banner", label: "Upgrade Banner", icon: <Info className="size-4" /> },
    { id: "search", label: "Action Search Bar", icon: <Terminal className="size-4" /> },
    { id: "map", label: "Interactive Map", icon: <Map className="size-4" /> },
    { id: "location", label: "Location Tag", icon: <Tag className="size-4" /> },
    { id: "rating", label: "Emoji Rating", icon: <Smile className="size-4" /> },
  ] as const;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 overflow-x-hidden">
      
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[400px] right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-semibold">
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono tracking-wider text-zinc-400">PATHSYNC COMPONENT HUB</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex-grow mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 z-10">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl leading-tight">
            PathSync Premium <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">Interactive Components</span>
          </h1>
          <p className="mt-4 text-base text-zinc-400">
            A comprehensive, premium showcase playground of custom React components integrated into PathSync. Optimized for mobile, desktop, and modern user experiences.
          </p>
        </div>

        {/* Instructions/Setup Details */}
        <div className="mb-12 rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 backdrop-blur-md">
          <div className="flex items-start gap-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 shrink-0">
              <Code className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white mb-2">Codebase Architecture & Paths</h2>
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                PathSync supports standard **TypeScript, Tailwind CSS**, and a **shadcn-compliant project structure** using absolute imports pointing to <code className="text-emerald-400 font-mono">@/components/ui/</code>. 
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-zinc-400">
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                  <span className="text-zinc-500 font-bold block mb-1">COMPONENTS LOCATION:</span>
                  <span>src/components/ui/[component-name].tsx</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                  <span className="text-zinc-500 font-bold block mb-1">IMPORT SYNTAX:</span>
                  <span>import &#123; Component &#125; from "@/components/ui/...";</span>
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-4 italic">
                ℹ️ Placing reusable custom files inside `/components/ui/` guarantees complete compatibility with future shadcn CLI commands and preserves clean paths.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-12 border-b border-zinc-900 pb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-emerald-500 text-zinc-950 border-emerald-500 shadow-lg shadow-emerald-500/10"
                  : "bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Showcase Grid */}
        <div className="space-y-16">

          {/* 1. UPGRADE BANNER */}
          {(activeTab === "all" || activeTab === "banner") && (
            <section className="rounded-3xl border border-zinc-800 bg-zinc-900/10 p-6 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-4 right-4 text-xs font-mono text-zinc-500 uppercase tracking-widest">
                Component 01
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">UpgradeBanner</h3>
                <p className="text-sm text-zinc-400">
                  A high-attention, animated notification banner featuring spring settings transitions and full state controllers.
                </p>
              </div>

              <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800/80 mb-6 flex flex-col justify-center min-h-[120px]">
                {showUpgradeBanner ? (
                  <UpgradeBanner
                    buttonText="Upgrade to PathSync Pro"
                    description="for unlimited route optimization queries and real-time SLA maps"
                    onClose={() => setShowUpgradeBanner(false)}
                    onClick={() => alert("Upgrade request triggered!")}
                    className="w-full"
                  />
                ) : (
                  <div className="text-center py-4">
                    <button 
                      onClick={() => setShowUpgradeBanner(true)}
                      className="px-4 py-2 bg-emerald-500 text-zinc-950 text-xs font-bold rounded-lg hover:bg-emerald-400 transition-colors cursor-pointer"
                    >
                      Reset Banner State
                    </button>
                  </div>
                )}
              </div>
              
              <div className="text-xs font-mono bg-zinc-900/50 p-4 rounded-xl text-zinc-400 border border-zinc-800">
                <span className="text-emerald-400 block font-bold mb-2">API Specifications:</span>
                <span>• Props: <code className="text-zinc-200">buttonText?: string</code>, <code className="text-zinc-200">description?: string</code>, <code className="text-zinc-200">onClose?: () =&gt; void</code>, <code className="text-zinc-200">onClick?: () =&gt; void</code></span>
              </div>
            </section>
          )}

          {/* 2. ACTION SEARCH BAR */}
          {(activeTab === "all" || activeTab === "search") && (
            <section className="rounded-3xl border border-zinc-800 bg-zinc-900/10 p-6 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-4 right-4 text-xs font-mono text-zinc-500 uppercase tracking-widest">
                Component 02
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">ActionSearchBar</h3>
                <p className="text-sm text-zinc-400">
                  A debounced, keyboard-interactive dispatcher console. Simulates AI autopilot manifests and switchers.
                </p>
              </div>

              <div className="bg-zinc-950 p-8 rounded-2xl border border-zinc-800/80 mb-6">
                <ActionSearchBar actions={[
                  {
                    id: "1",
                    label: "Solve Dijkstra Route",
                    icon: <RouteIcon className="h-4 w-4 text-emerald-400" />,
                    description: "Precision route engine",
                    short: "⌘D",
                    end: "Active Solver",
                  },
                  {
                    id: "2",
                    label: "Reorder Greedy TSP",
                    icon: <Terminal className="h-4 w-4 text-blue-400" />,
                    description: "Nearest neighbor solver",
                    short: "⌘T",
                    end: "TSP Engine",
                  },
                  {
                    id: "3",
                    label: "Search Location",
                    icon: <MapPin className="h-4 w-4 text-pink-400" />,
                    description: "Nominatim coordinate search",
                    short: "⌘S",
                    end: "Geo Search",
                  }
                ]} />
              </div>

              <div className="text-xs font-mono bg-zinc-900/50 p-4 rounded-xl text-zinc-400 border border-zinc-800">
                <span className="text-emerald-400 block font-bold mb-2">API Specifications:</span>
                <span>• Props: <code className="text-zinc-200">actions?: Action[]</code> (custom action list with title, icons, shortcuts, and description). Supports debounce out-of-the-box.</span>
              </div>
            </section>
          )}

          {/* 3. INTERACTIVE MAP */}
          {(activeTab === "all" || activeTab === "map") && (
            <section className="rounded-3xl border border-zinc-800 bg-zinc-900/10 p-6 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-4 right-4 text-xs font-mono text-zinc-500 uppercase tracking-widest">
                Component 03
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">AdvancedMap</h3>
                <p className="text-sm text-zinc-400">
                  A high-end, responsive Leaflet map wrapper with client-side safe mounting, live search geocoding, controls, and marker clustering.
                </p>
              </div>

              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 mb-6 overflow-hidden">
                <AdvancedMap
                  center={[13.0827, 80.2707]}
                  zoom={12}
                  style={{ height: "450px", width: "100%" }}
                  markers={[
                    {
                      id: 1,
                      position: [13.0827, 80.2707],
                      color: "blue",
                      size: "medium",
                      popup: { title: "Depot Chennai", content: "Primary depot dispatch zone." }
                    },
                    {
                      id: 2,
                      position: [13.0300, 80.2500],
                      color: "red",
                      size: "large",
                      popup: { title: "Velachery Hub", content: "Active fulfillment center." }
                    }
                  ]}
                  polygons={[
                    {
                      id: 1,
                      positions: [
                        [13.0900, 80.2300],
                        [13.0600, 80.2100],
                        [13.0400, 80.2500]
                      ],
                      style: { color: "#10b981", weight: 2, fillOpacity: 0.15 }
                    }
                  ]}
                  enableClustering={true}
                  enableSearch={true}
                  enableControls={true}
                />
              </div>

              <div className="text-xs font-mono bg-zinc-900/50 p-4 rounded-xl text-zinc-400 border border-zinc-800">
                <span className="text-emerald-400 block font-bold mb-2">API Specifications:</span>
                <span>• Props: <code className="text-zinc-200">center?: [number, number]</code>, <code className="text-zinc-200">zoom?: number</code>, <code className="text-zinc-200">markers?: Marker[]</code>, <code className="text-zinc-200">polygons?: Polygon[]</code>, <code className="text-zinc-200">circles?: Circle[]</code>, <code className="text-zinc-200">enableClustering?: boolean</code>.</span>
              </div>
            </section>
          )}

          {/* 4. LOCATION TAG */}
          {(activeTab === "all" || activeTab === "location") && (
            <section className="rounded-3xl border border-zinc-800 bg-zinc-900/10 p-6 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-4 right-4 text-xs font-mono text-zinc-500 uppercase tracking-widest">
                Component 04
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">LocationTag</h3>
                <p className="text-sm text-zinc-400">
                  A minimal location pill with automated digital clock calculations and a hover-activated slide overlay.
                </p>
              </div>

              <div className="bg-zinc-950 p-8 rounded-2xl border border-zinc-800/80 mb-6 flex flex-wrap gap-4 items-center justify-center min-h-[100px]">
                <LocationTag city="Chennai" country="India" timezone="IST" />
                <LocationTag city="San Francisco" country="USA" timezone="PST" />
                <LocationTag city="London" country="UK" timezone="GMT" />
              </div>

              <div className="text-xs font-mono bg-zinc-900/50 p-4 rounded-xl text-zinc-400 border border-zinc-800">
                <span className="text-emerald-400 block font-bold mb-2">API Specifications:</span>
                <span>• Props: <code className="text-zinc-200">city?: string</code>, <code className="text-zinc-200">country?: string</code>, <code className="text-zinc-200">timezone?: string</code> (e.g. "IST", "PST"). Calculated dynamically at runtime.</span>
              </div>
            </section>
          )}

          {/* 5. EMOJI RATING */}
          {(activeTab === "all" || activeTab === "rating") && (
            <section className="rounded-3xl border border-zinc-800 bg-zinc-900/10 p-6 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-4 right-4 text-xs font-mono text-zinc-500 uppercase tracking-widest">
                Component 05
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">RatingInteraction</h3>
                <p className="text-sm text-zinc-400">
                  An outstanding emoji satisfaction interaction with micro-animations, grayscale toggles, blur scaling, and custom label callouts.
                </p>
              </div>

              <div className="bg-zinc-950 p-8 rounded-2xl border border-zinc-800/80 mb-6 flex flex-col items-center justify-center min-h-[140px]">
                <RatingInteraction onChange={(val) => setRating(val)} />
                {rating > 0 && (
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400 font-mono animate-bounce">
                    <CheckCircle className="size-3" />
                    Registered satisfaction index: {rating}/5
                  </div>
                )}
              </div>

              <div className="text-xs font-mono bg-zinc-900/50 p-4 rounded-xl text-zinc-400 border border-zinc-800">
                <span className="text-emerald-400 block font-bold mb-2">API Specifications:</span>
                <span>• Props: <code className="text-zinc-200">onChange?: (rating: number) =&gt; void</code>. Uses fully keyframed custom spring easing animations.</span>
              </div>
            </section>
          )}

        </div>

      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-6 text-center text-xs text-zinc-500 mt-20">
        <p>&copy; {new Date().getFullYear()} PathSync Logistics Component Hub. Optimized for next-gen dispatching.</p>
      </footer>

    </div>
  );
}
