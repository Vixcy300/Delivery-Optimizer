// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Live Interactive Graph with Vis.js
    const container = document.getElementById("hero-graph");
    
    // Generate some random nodes
    const nodes = new vis.DataSet([
        { id: 1, label: "Hub A", color: "#10b981", shape: "dot", size: 20 },
        { id: 2, label: "WH 1", color: "#3b82f6", shape: "dot", size: 15 },
        { id: 3, label: "WH 2", color: "#3b82f6", shape: "dot", size: 15 },
        { id: 4, label: "Node X", color: "#94a3b8", shape: "dot", size: 10 },
        { id: 5, label: "Node Y", color: "#94a3b8", shape: "dot", size: 10 },
        { id: 6, label: "Depot", color: "#8b5cf6", shape: "dot", size: 18 },
        { id: 7, label: "Node Z", color: "#94a3b8", shape: "dot", size: 10 },
        { id: 8, label: "Cust 1", color: "#ec4899", shape: "dot", size: 12 },
        { id: 9, label: "Cust 2", color: "#ec4899", shape: "dot", size: 12 },
        { id: 10, label: "Node W", color: "#94a3b8", shape: "dot", size: 10 },
    ]);

    // Create edges
    const edges = new vis.DataSet([
        { from: 1, to: 2, length: 150, color: { color: "rgba(16,185,129,0.5)" } },
        { from: 1, to: 3, length: 200, color: { color: "rgba(16,185,129,0.5)" } },
        { from: 2, to: 4, length: 100, color: { color: "rgba(59,130,246,0.3)" } },
        { from: 3, to: 5, length: 120, color: { color: "rgba(59,130,246,0.3)" } },
        { from: 1, to: 6, length: 250, color: { color: "rgba(139,92,246,0.5)" } },
        { from: 6, to: 7, length: 130, color: { color: "rgba(139,92,246,0.3)" } },
        { from: 4, to: 8, length: 90, color: { color: "rgba(236,72,153,0.5)" } },
        { from: 5, to: 9, length: 110, color: { color: "rgba(236,72,153,0.5)" } },
        { from: 6, to: 10, length: 140, color: { color: "rgba(148,163,184,0.3)" } },
        { from: 7, to: 8, length: 200, color: { color: "rgba(148,163,184,0.2)" } },
        { from: 10, to: 9, length: 180, color: { color: "rgba(148,163,184,0.2)" } },
        { from: 4, to: 5, length: 300, color: { color: "rgba(148,163,184,0.2)", dash: true } }
    ]);

    const data = { nodes: nodes, edges: edges };
    const options = {
        physics: {
            forceAtlas2Based: {
                gravitationalConstant: -50,
                centralGravity: 0.01,
                springLength: 100,
                springConstant: 0.08
            },
            maxVelocity: 50,
            solver: 'forceAtlas2Based',
            timestep: 0.35,
            stabilization: { iterations: 150 }
        },
        interaction: {
            hover: true,
            tooltipDelay: 200,
            zoomView: false,
            dragView: false
        },
        edges: {
            smooth: {
                type: 'continuous',
                forceDirection: 'none'
            }
        },
        nodes: {
            font: {
                color: '#334155',
                face: 'Inter',
                size: 14,
                strokeWidth: 3,
                strokeColor: '#ffffff'
            }
        }
    };

    if (container) {
        const network = new vis.Network(container, data, options);
        
        // Stop physics after initial load to eliminate lag
        network.once("stabilizationIterationsDone", function () {
            network.setOptions({ physics: false });
        });
        
        // Randomly simulate traffic (pulsing edges) without physics recalculation
        setInterval(() => {
            const edgeIds = edges.getIds();
            const randomEdge = edgeIds[Math.floor(Math.random() * edgeIds.length)];
            const edge = edges.get(randomEdge);
            
            const originalColor = edge.color.color;
            const originalWidth = edge.width || 1;
            
            edges.update({
                id: randomEdge, 
                color: { color: "#f59e0b" }, // Highlight amber
                width: 3
            });
            
            setTimeout(() => {
                edges.update({
                    id: randomEdge, 
                    color: { color: originalColor },
                    width: originalWidth
                });
            }, 1000);
            
        }, 2000);
    }

    // 2. Initialize GSAP Animations
    gsap.registerPlugin(ScrollTrigger);

    // Navbar load animation
    gsap.from(".gsap-nav", {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    });

    // Hero content animation
    gsap.from(".gsap-hero", {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: "power3.out"
    });

    // Fade up general elements
    gsap.utils.toArray('.gsap-fade-up').forEach(element => {
        gsap.from(element, {
            scrollTrigger: {
                trigger: element,
                start: "top 85%", 
                toggleActions: "play none none reverse"
            },
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out"
        });
    });

    // Stagger feature cards
    gsap.from(".features-grid .gsap-stagger", {
        scrollTrigger: {
            trigger: ".features-grid",
            start: "top 80%"
        },
        y: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "back.out(1.7)"
    });

    // Stagger algorithm cards
    gsap.from(".algo-grid .gsap-stagger", {
        scrollTrigger: {
            trigger: ".algo-grid",
            start: "top 80%"
        },
        y: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: "power3.out"
    });

    // Stagger table rows in compare section
    gsap.from(".compare-table tbody .gsap-tr", {
        scrollTrigger: {
            trigger: ".compare-table",
            start: "top 85%"
        },
        x: -30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out"
    });

    // 3. Initialize Chart.js for Algorithm Benchmark
    const ctx = document.getElementById('algoChart');
    if (ctx) {
        ScrollTrigger.create({
            trigger: ".algo-chart-container",
            start: "top 80%",
            once: true,
            onEnter: () => {
                // Create gradient for the main fill
                const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
                gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['1k Nodes', '2.5k Nodes', '5k Nodes', '7.5k Nodes', '10k Nodes'],
                        datasets: [
                            {
                                label: "Dijkstra Exec Time",
                                data: [120, 500, 1800, 4200, 8500],
                                borderColor: '#3b82f6', // Blue
                                backgroundColor: gradient,
                                borderWidth: 3,
                                tension: 0.4,
                                fill: true,
                                pointBackgroundColor: '#3b82f6',
                                pointRadius: 4,
                                pointHoverRadius: 6,
                                yAxisID: 'y'
                            },
                            {
                                label: 'A* Exec Time',
                                data: [28, 85, 210, 450, 820],
                                borderColor: '#f59e0b', // Amber/Yellow
                                backgroundColor: 'transparent',
                                borderWidth: 3,
                                tension: 0.4,
                                pointBackgroundColor: '#f59e0b',
                                pointRadius: 4,
                                pointHoverRadius: 6,
                                yAxisID: 'y'
                            },
                            {
                                label: 'TSP Exec Time',
                                data: [12, 35, 90, 180, 310],
                                borderColor: '#10b981', // Emerald/Green
                                backgroundColor: 'transparent',
                                borderWidth: 3,
                                tension: 0.4,
                                pointBackgroundColor: '#10b981',
                                pointRadius: 4,
                                pointHoverRadius: 6,
                                yAxisID: 'y'
                            },
                            {
                                type: 'bar',
                                label: 'Memory Cost (MB)',
                                data: [45, 110, 210, 380, 580],
                                backgroundColor: 'rgba(148, 163, 184, 0.2)',
                                borderColor: 'rgba(148, 163, 184, 0.5)',
                                borderWidth: 1,
                                borderRadius: 4,
                                yAxisID: 'y1'
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                            mode: 'index',
                            intersect: false,
                        },
                        plugins: {
                            legend: {
                                position: 'top',
                                labels: { 
                                    color: '#e2e8f0', 
                                    font: { family: 'Inter', size: 13, weight: '500' },
                                    usePointStyle: true,
                                    padding: 20
                                }
                            },
                            tooltip: {
                                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                titleColor: '#fff',
                                bodyColor: '#cbd5e1',
                                borderColor: '#334155',
                                borderWidth: 1,
                                padding: 12,
                                titleFont: { size: 14, family: 'Outfit' },
                                bodyFont: { size: 13, family: 'Inter' },
                                callbacks: {
                                    label: function(context) {
                                        let label = context.dataset.label || '';
                                        if (label) label += ': ';
                                        if (context.dataset.type === 'bar') {
                                            label += context.parsed.y + ' MB';
                                        } else {
                                            label += context.parsed.y + ' ms';
                                        }
                                        return label;
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                type: 'linear',
                                display: true,
                                position: 'left',
                                title: { display: true, text: 'Execution Time (ms)', color: '#3b82f6', font: {size: 13, weight: '600'} },
                                ticks: { color: '#64748b' },
                                grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false }
                            },
                            y1: {
                                type: 'linear',
                                display: true,
                                position: 'right',
                                title: { display: true, text: 'Memory Allocation (MB)', color: '#94a3b8', font: {size: 13, weight: '600'} },
                                ticks: { color: '#64748b' },
                                grid: { drawOnChartArea: false }, // only draw grid lines for one axis to keep it clean
                            },
                            x: {
                                ticks: { color: '#64748b' },
                                grid: { color: 'rgba(255,255,255,0.02)', drawBorder: false }
                            }
                        }
                    }
                });
            }
        });
    }
});
