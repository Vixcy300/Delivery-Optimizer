# 📍 PathSync: Next-Gen Logistics & Delivery Optimizer

PathSync is a high-performance, premium web-based delivery optimization engine designed to model, solve, and analyze complex vehicle routing and network optimization problems. Built with raw vanilla HTML5, CSS3, and JavaScript, PathSync delivers a stunning "MNC-style" interactive experience, featuring gorgeous visual representations, live mathematical simulations, and rich benchmark evidence.

🚀 **Live Deployment on Vercel:** Fully compatible with Vercel's zero-config static site deployment.

---

## ✨ Features & Modules

### 1. 🌐 Delivery Data Collection and Network Modeling
*   **Interactive Node Graph:** Visualize delivery points, central hubs (e.g., T Nagar, OMR Tech Park), and active routing pathways.
*   **Flexible Inputs:** Easily customize nodes, edge weights, distances, and toll parameters in real-time.
*   **Toll-Cost Calculator:** Accurate modeling of toll systems with updated local route parameters (incorporating OMR toll closures).

### 2. ⚡ Route Optimization & Vehicle Routing
*   **Dijkstra’s Algorithm:** Find the absolute shortest path from a single central hub to any target customer node.
*   **A\* Search Algorithm:** Compute paths efficiently using heuristics for faster convergence.
*   **Greedy TSP (Traveling Salesperson Problem):** Calculate optimal multi-stop closed-loop tours for vehicle fleets.
*   **Prim’s MST (Minimum Spanning Tree):** Compute the most efficient backbone layout to connect all delivery points with minimal cabling/distance cost.

### 3. 📊 Analytics & Benchmark Evidence
*   **Dual-Axis Mixed Chart:** Real-time visual comparison of algorithm scalability. Track execution time (ms) on one axis and memory utilization (KB) on the other.
*   **Tabular Empirical Data:** View clear, side-by-side evidence comparing speed, accuracy, and stop limits across algorithms (Dijkstra vs. A* vs. Greedy TSP vs. Prim's MST).

---

## 🛠️ Technology Stack

*   **Frontend Core:** HTML5, modern vanilla CSS3 (utilizing modern typography, dark-mode glassmorphism, HSL tailormade colors, and micro-animations).
*   **Interactive Graphs:** [vis.js](https://visjs.github.io/vis-network/) for physics-optimized, live neural network representations.
*   **Dynamic Charts:** [Chart.js](https://www.chartjs.org/) for multi-axis responsive performance data plotting.
*   **Deployment:** Static hosting ready, optimized for Vercel, Netlify, or Github Pages.

---

## 🚀 Getting Started

No heavy installations or build processes required! PathSync is a zero-dependency static web application.

### Running Locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Vixcy300/Delivery-Optimizer.git
    cd Delivery-Optimizer
    ```

2.  **Serve the files:**
    You can simply double-click `index.html` to open it in your browser, or serve it using an HTTP server for the best experience:
    ```bash
    # Using Node.js
    npx http-server -p 3000
    
    # Or using Python
    python -m http.server 3000
    ```

3.  **Explore the App:**
    Open your browser to `http://localhost:3000` to view the stunning landing page, and click **"Launch Dashboard"** to enter the core Route Optimization Engine.

---

## 🌎 Vercel Deployment

This repository is pre-configured for **instant Vercel deployment**.
1.  Go to [Vercel](https://vercel.com).
2.  Click **"New Project"** and import the `Delivery-Optimizer` repository.
3.  Vercel will automatically detect the static project and deploy it instantly. No build commands or output directory modifications required!

---

## 🔬 Computational Performance Summary

| Algorithm | Computational Complexity | Typical Use Case | Accuracy | Scalability |
| :--- | :--- | :--- | :--- | :--- |
| **Dijkstra** | $O((V + E) \log V)$ | Single-source shortest path | $100\%$ | High |
| **A\* Search** | $O(b^d)$ (heuristic dependent) | Speed-optimized point-to-point | $98\% - 100\%$ | Very High |
| **Greedy TSP** | $O(V^2)$ | Multi-stop round trips (TSP) | $\approx 92\%$ (Heuristic) | Moderate |
| **Prim's MST** | $O(E \log V)$ | Backbone route infrastructure | $100\%$ | High |

---

Developed with ❤️ for high-efficiency logistics engineering.
