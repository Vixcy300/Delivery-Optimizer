import { AppState, generateId, calculateDistance } from './utils/helpers.js';
import { runDijkstra } from './algorithms/dijkstra.js';
import { runPrimsMST } from './algorithms/prims-mst.js';
import { runGreedyTSP } from './algorithms/greedy-tsp.js';
import { runAStar } from './algorithms/a-star.js';
import { demoScenarios } from './utils/scenarios.js';
// ═══════════════════════════════════════════════════
//  BOOTSTRAP
// ═══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initWelcomeModal();
    initTheme();
    initLiveTracking();
    initMaps();
    initNetworkGraph();
    initCharts();
    initDemandModule();
    setupAlgorithmControls();
    setupAdvancedUI();
    initParticles();
    initSimulateBtn();
    updateLocationTable();
    initFleetModule();

    showToast('PathSync initialized. Load a demo scenario or click the map to add nodes.', 'info');
});

// ─── Welcome Modal ─────────────────────────────────
function initWelcomeModal() {
    const overlay = document.getElementById('welcome-modal-overlay');
    if (!overlay) return;

    const closeBtns = overlay.querySelectorAll('.close-welcome-modal');
    const helpBtn = document.getElementById('btn-help');
    const loadDemoBtn = document.getElementById('btn-load-demo-welcome');

    // Show modal on first load if no locations exist (using setTimeout for animation)
    setTimeout(() => {
        if (AppState.locations.length === 0) {
            overlay.classList.add('active');
        }
    }, 500);

    closeBtns.forEach(btn => btn.addEventListener('click', () => {
        overlay.classList.remove('active');
    }));

    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            overlay.classList.add('active');
        });
    }

    if (loadDemoBtn) {
        loadDemoBtn.addEventListener('click', () => {
            loadNetworkState(demoScenarios['chennai']);
            document.getElementById('scenario-select').value = 'chennai';
            overlay.classList.remove('active');
            showToast('Loaded Chennai Demo Scenario', 'success');
        });
    }
}

// ─── Navigation ───────────────────────────────────
function initNav() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.module-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            item.classList.add('active');
            const target = document.getElementById(item.dataset.target);
            if (target) target.classList.add('active');

            setTimeout(() => {
                if (window.map1) window.map1.invalidateSize();
                if (window.map2) window.map2.invalidateSize();
                if (window.map3) window.map3.invalidateSize();
                if (window.network) window.network.fit();
            }, 120);
        });
    });
}

// ─── Theme ────────────────────────────────────────
function initTheme() {
    document.getElementById('theme-toggle').addEventListener('click', () => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        if (isLight) {
            document.documentElement.removeAttribute('data-theme');
            AppState.currentTheme = 'dark';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            AppState.currentTheme = 'light';
        }
        updateChartsTheme();
    });
}

// ─── Maps ─────────────────────────────────────────
function initMaps() {
    if (typeof L === 'undefined') {
        showToast('Leaflet map library failed to load.', 'error');
        return;
    }

    const center = [13.0827, 80.2707]; // Chennai, India
    const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const tileOpts = { attribution: '© OpenStreetMap contributors', maxZoom: 19 };

    window.map1 = L.map('leaflet-map', { zoomControl: true }).setView(center, 13);
    L.tileLayer(tileUrl, tileOpts).addTo(window.map1);
    window.map1.on('click', e => openLocationModal(e.latlng.lat, e.latlng.lng));

    window.map2 = L.map('route-map', { zoomControl: true }).setView(center, 13);
    L.tileLayer(tileUrl, tileOpts).addTo(window.map2);
}

// ─── Vis.js Network Graph ──────────────────────────
function initNetworkGraph() {
    window.nodesDataset = new vis.DataSet([]);
    window.edgesDataset = new vis.DataSet([]);

    const options = {
        nodes: {
            shape: 'dot',
            font: { color: '#f1f5f9', size: 12, face: 'Inter' },
            borderWidth: 2,
            scaling: { min: 14, max: 24 }
        },
        edges: {
            width: 1.5,
            smooth: { type: 'curvedCW', roundness: 0.1 },
            font: { align: 'middle', color: '#8b949e', size: 10, strokeWidth: 0, face: 'JetBrains Mono' },
            color: { color: 'rgba(139,148,158,0.35)', highlight: '#3b82f6' }
        },
        physics: {
            barnesHut: { gravitationalConstant: -2000, centralGravity: 0.1, springLength: 150, springConstant: 0.04 },
            stabilization: { iterations: 150 }
        },
        interaction: { hover: true, tooltipDelay: 100 },
        manipulation: {
            enabled: true,
            initiallyActive: true,
            addEdge: function (data, callback) {
                if (data.from === data.to) {
                    showToast('Cannot connect a node to itself', 'warning');
                    return callback(null);
                }
                const dist = calculateDistance(
                    AppState.locations.find(l => l.id === data.from).lat,
                    AppState.locations.find(l => l.id === data.from).lng,
                    AppState.locations.find(l => l.id === data.to).lat,
                    AppState.locations.find(l => l.id === data.to).lng
                );
                data.label = `${dist}km`;
                data.id = `${data.from}--${data.to}`;
                AppState.edges.push({ id: data.id, from: data.from, to: data.to, weight: dist });
                callback(data);
                showToast(`Edge added: ${dist}km`, 'success');
            }
        }
    };

    window.network = new vis.Network(
        document.getElementById('network-graph'),
        { nodes: window.nodesDataset, edges: window.edgesDataset },
        options
    );

    // Stop physics after stabilization to prevent CPU lag
    window.network.on("stabilizationIterationsDone", function () {
        window.network.setOptions( { physics: false } );
    });
}

// ─── Charts ───────────────────────────────────────
function initCharts() {
    if (typeof Chart === 'undefined') return;

    Chart.defaults.color = '#8b949e';
    Chart.defaults.font.family = "'Inter', sans-serif";

    const gridColor = 'rgba(255,255,255,0.04)';

    window.volumeChart = new Chart(
        document.getElementById('volumeChart').getContext('2d'),
        {
            type: 'line',
            data: {
                labels: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
                datasets: [
                    {
                        label: 'Deliveries Completed',
                        data: [4, 11, 22, 31, 45, 52, 60, 72, 78, 84, 91],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59,130,246,0.08)',
                        tension: 0.4, fill: true, pointRadius: 3,
                        pointBackgroundColor: '#3b82f6'
                    },
                    {
                        label: 'Planned Deliveries',
                        data: [5, 15, 25, 35, 50, 55, 65, 75, 82, 88, 95],
                        borderColor: 'rgba(139,148,158,0.4)',
                        borderDash: [4, 4],
                        tension: 0.4, fill: false, pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'top', labels: { boxWidth: 12, padding: 16 } } },
                scales: {
                    y: { beginAtZero: true, grid: { color: gridColor }, border: { display: false } },
                    x: { grid: { display: false }, border: { display: false } }
                }
            }
        }
    );

    window.statusChart = new Chart(
        document.getElementById('statusChart').getContext('2d'),
        {
            type: 'doughnut',
            data: {
                labels: ['Delivered', 'In Transit', 'Pending', 'Delayed'],
                datasets: [{
                    data: [65, 18, 12, 5],
                    backgroundColor: ['#10b981', '#3b82f6', '#8b949e', '#f59e0b'],
                    borderWidth: 0, hoverOffset: 6
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                cutout: '72%',
                plugins: {
                    legend: { position: 'right', labels: { boxWidth: 10, padding: 14, font: { size: 11 } } }
                }
            }
        }
    );
}

// ─── Demand Intelligence (Module 5) ───────────────
function initDemandModule() {
    // 1. Demand Chart
    const ctx = document.getElementById('demandChart');
    if (!ctx) return;
    
    window.demandChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
            datasets: [{
                label: 'Predicted Orders',
                data: [120, 180, 150, 210, 300, 450, 200],
                borderColor: '#ec4899',
                backgroundColor: 'rgba(236,72,153,0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });

    // 2. Heatmap Map
    const center = [13.0827, 80.2707];
    window.map3 = L.map('heatmap-map', { zoomControl: true }).setView(center, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors', maxZoom: 19
    }).addTo(window.map3);

    // Mock Heat Zones
    const heatZones = [
        L.circleMarker([13.08, 80.27], { radius: 40, color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.4, weight: 0 }),
        L.circleMarker([13.05, 80.25], { radius: 30, color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.4, weight: 0 }),
        L.circleMarker([13.10, 80.22], { radius: 25, color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.4, weight: 0 }),
        L.circleMarker([13.02, 80.21], { radius: 45, color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.4, weight: 0 })
    ];
    
    heatZones.forEach((zone, index) => {
        const names = ["Central Zone Spike", "T. Nagar Spillover", "Kolathur Peak Area", "Adyar Demand Surge"];
        const name = names[index];
        zone.bindTooltip(`<b>${name}</b><br>🔥 High Demand Peak<br><i>Click to spawn Delivery Node!</i>`, { direction: 'top' });
        
        zone.on('mouseover', () => zone.setStyle({ fillOpacity: 0.6 }));
        zone.on('mouseout', () => zone.setStyle({ fillOpacity: 0.4 }));
        
        zone.on('click', () => {
            const latlng = zone.getLatLng();
            openLocationModal(latlng.lat, latlng.lng);
            
            // Pre-populate modal fields
            document.getElementById('loc-name').value = name;
            document.getElementById('loc-type').value = 'customer';
            document.getElementById('loc-priority').value = 'high';
            document.getElementById('loc-capacity').value = '180';
            
            showToast(`📍 Spawning node from "${name}". Review and Save in Module 1!`, 'info');
            
            // Programmatically click Module 1 Nav Item
            const mod1Nav = document.querySelector('.nav-item[data-target="module-1"]');
            if (mod1Nav) mod1Nav.click();
        });
    });
    
    const heatLayer = L.layerGroup(heatZones).addTo(window.map3);

    document.getElementById('toggle-heatmap').addEventListener('change', (e) => {
        if (e.target.checked) window.map3.addLayer(heatLayer);
        else window.map3.removeLayer(heatLayer);
    });
}

function updateChartsTheme() {
    if (!window.volumeChart) return;
    const isLight = AppState.currentTheme === 'light';
    const gc = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.04)';
    const tc = isLight ? '#64748b' : '#8b949e';
    Chart.defaults.color = tc;
    window.volumeChart.options.scales.y.grid.color = gc;
    window.volumeChart.update('none');
    if (window.network) {
        window.network.setOptions({
            nodes: { font: { color: isLight ? '#0f172a' : '#f1f5f9' } },
            edges: { font: { color: tc } }
        });
    }
}

// ── Live Tracking Simulation ──
function initLiveTracking() {
    const simBtn = document.getElementById('btn-start-simulation');
    if (!simBtn) return;
    
    simBtn.addEventListener('click', () => {
        if (!AppState.lastRouteGeometry || AppState.lastRouteGeometry.length === 0) return;
        simBtn.innerHTML = '🚚 Tracking in progress...';
        simBtn.disabled = true;

        const path = AppState.lastRouteGeometry;
        if (window._simMarker) {
            window.map2.removeLayer(window._simMarker);
        }
        
        const truckIcon = L.divIcon({
            html: '<div style="font-size:24px; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.5)); transform:translate(-12px, -12px);">🚚</div>',
            className: 'custom-div-icon'
        });
        
        window._simMarker = L.marker(path[0], { icon: truckIcon }).addTo(window.map2);
        let i = 0;
        const animate = () => {
            if (i >= path.length) {
                simBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l3 3"></path></svg> Start Live Tracking';
                simBtn.disabled = false;
                showToast('Live tracking simulation completed.', 'success');
                return;
            }
            window._simMarker.setLatLng(path[i]);
            i += Math.max(1, Math.floor(path.length / 100)); // skip some frames for speed
            setTimeout(animate, 50);
        };
        animate();
    });
}

// ═══════════════════════════════════════════════════
//  LOCATION MODAL
// ═══════════════════════════════════════════════════
function openLocationModal(lat, lng) {
    const type = AppState.locations.length === 0 ? 'warehouse' : 'customer';
    const num  = AppState.locations.length;
    document.getElementById('loc-lat').value       = lat;
    document.getElementById('loc-lng').value       = lng;
    document.getElementById('loc-type').value      = type;
    document.getElementById('loc-name').value      = type === 'warehouse' ? 'Main Depot' : `Drop Point ${num}`;
    document.getElementById('loc-priority').value  = type === 'warehouse' ? 'high' : 'normal';
    document.getElementById('loc-capacity').value  = type === 'warehouse' ? '1000' : '50';
    document.getElementById('loc-timewindow').value = '09:00 - 17:00';
    document.getElementById('coord-text').textContent =
        `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    document.getElementById('location-modal-overlay').classList.add('active');
}

function closeLocationModal() {
    document.getElementById('location-modal-overlay').classList.remove('active');
}

// ═══════════════════════════════════════════════════
//  LOCATION DATA MANAGEMENT
// ═══════════════════════════════════════════════════
function addLocationNode(data, skipEdgeRebuild = false) {
    const id  = data.id || generateId();
    const loc = { id, ...data };
    AppState.locations.push(loc);

    const COLOR = { warehouse: '#3b82f6', hub: '#f59e0b', customer: '#10b981' };
    const color = COLOR[loc.type] || '#10b981';
    const SIZE  = { warehouse: 22, hub: 18, customer: 14 };

    // ── Leaflet markers ──
    const markerHtml = `
        <div style="
            width:${SIZE[loc.type] || 14}px;
            height:${SIZE[loc.type] || 14}px;
            background:${color};
            border-radius:50%;
            border:2.5px solid white;
            box-shadow:0 0 10px ${color}99, 0 2px 4px rgba(0,0,0,0.4);
        "></div>`;
    const icon = L.divIcon({ html: markerHtml, className: '', iconSize: [20,20], iconAnchor: [10,10] });
    const tip  = `<b>${loc.name}</b><br>📦 ${loc.type} · ${loc.capacity} units<br>🕐 ${loc.timeWindow}`;

    const m1 = L.marker([loc.lat, loc.lng], { icon }).bindTooltip(tip, { direction: 'top', offset: [0, -10] }).addTo(window.map1);
    const m2 = L.marker([loc.lat, loc.lng], { icon }).bindTooltip(`<b>${loc.name}</b>`, { direction: 'top' }).addTo(window.map2);
    loc.markers = [m1, m2];

    // ── Vis.js node ──
    window.nodesDataset.add({
        id,
        label: loc.name,
        title: `${loc.type} | ${loc.capacity} units | ${loc.timeWindow}`,
        color: { background: color, border: '#ffffff80', highlight: { background: color, border: '#fff' } },
        size:  SIZE[loc.type] || 14
    });

    if (!skipEdgeRebuild) rebuildEdges();
    updateLocationTable();
    updateDropdowns();
}

function rebuildEdges() {
    window.edgesDataset.clear();
    AppState.edges = [];
    const locs = AppState.locations;

    for (let i = 0; i < locs.length; i++) {
        for (let j = i + 1; j < locs.length; j++) {
            const a = locs[i], b = locs[j];
            const dist = calculateDistance(a.lat, a.lng, b.lat, b.lng);
            const edge = { id: `${a.id}--${b.id}`, from: a.id, to: b.id, weight: dist };
            AppState.edges.push(edge);
            window.edgesDataset.add({ id: edge.id, from: a.id, to: b.id, label: `${dist}km` });
        }
    }
}

function updateLocationTable() {
    const tbody = document.getElementById('locations-tbody');
    const countEl = document.getElementById('loc-count');
    if (countEl) countEl.textContent = AppState.locations.length;

    if (!tbody) return;
    if (AppState.locations.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-state">
                <td colspan="6" style="padding: 2.5rem 1rem; text-align: center; color: var(--color-text-muted);">
                    <div style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.7;">📍</div>
                    <strong style="display: block; color: var(--color-text); font-size: 1.1rem; margin-bottom: 0.5rem;">No Nodes Found</strong>
                    <span style="font-size: 0.9rem;">Start mapping your logistics network by searching for addresses or clicking anywhere on the map above.</span>
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = '';
    AppState.locations.forEach(loc => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${loc.name}</strong></td>
            <td><span class="type-pill ${loc.type}">${
                loc.type === 'warehouse' ? '🏭' : loc.type === 'hub' ? '🔄' : '👤'
            } ${loc.type}</span></td>
            <td><span class="badge ${loc.priority}">${loc.priority}</span></td>
            <td><span style="font-family:var(--font-mono);font-size:0.8rem">${loc.capacity} u</span></td>
            <td style="color:var(--color-text-muted);font-size:0.82rem">${loc.timeWindow || '--'}</td>
            <td>
                <button class="btn-icon" onclick="window.removeLocation('${loc.id}')" title="Remove location" style="font-size:0.9rem">🗑️</button>
            </td>`;
        tbody.appendChild(tr);
    });
}

function updateDropdowns() {
    const opts = AppState.locations.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
    ['start-node', 'end-node', 'edge-from', 'edge-to'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = opts || '<option value="">-- Add locations first --</option>';
    });
}

window.removeLocation = id => {
    const idx = AppState.locations.findIndex(l => l.id === id);
    if (idx < 0) return;
    const loc = AppState.locations[idx];
    if (loc.markers) loc.markers.forEach(m => m.remove());
    window.nodesDataset.remove(id);
    AppState.locations.splice(idx, 1);
    rebuildEdges();
    updateLocationTable();
    updateDropdowns();
    showToast(`Removed "${loc.name}"`, 'warning');
};

// ═══════════════════════════════════════════════════
//  ADVANCED UI (Modal, Edge Editor, Import/Export, Scenarios)
// ═══════════════════════════════════════════════════
function setupAdvancedUI() {
    // ── Modal close ──
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeLocationModal);
    });
    document.getElementById('location-modal-overlay').addEventListener('click', e => {
        if (e.target === e.currentTarget) closeLocationModal();
    });

    // ── Save location ──
    document.getElementById('btn-save-location').addEventListener('click', () => {
        const lat      = parseFloat(document.getElementById('loc-lat').value);
        const lng      = parseFloat(document.getElementById('loc-lng').value);
        const name     = document.getElementById('loc-name').value.trim() || 'Location';
        const type     = document.getElementById('loc-type').value;
        const priority = document.getElementById('loc-priority').value;
        const capacity = parseInt(document.getElementById('loc-capacity').value) || 0;
        const timeWindow = document.getElementById('loc-timewindow').value || '09:00-17:00';

        addLocationNode({ name, type, priority, capacity, timeWindow, lat, lng });
        closeLocationModal();
        addEventLog(`Added "${name}" (${type})`, 'success');
        showToast(`📍 "${name}" added as ${type}`, 'success');
    });

    // ── Add Node button ──
    document.getElementById('btn-add-location').addEventListener('click', () => {
        const c = window.map1.getCenter();
        openLocationModal(c.lat, c.lng);
    });

    // ── Nominatim Address Search ──
    const searchBtn = document.getElementById('btn-map-search');
    const searchInput = document.getElementById('map-search-input');
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', async () => {
            const query = searchInput.value.trim();
            if (!query) return showToast('Please enter an address to search', 'warning');
            
            searchBtn.textContent = '⏳';
            searchBtn.disabled = true;
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=in&format=json&limit=1`);
                const data = await res.json();
                
                if (data && data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);
                    
                    window.map1.setView([lat, lon], 15);
                    openLocationModal(lat, lon);
                    document.getElementById('loc-name').value = data[0].display_name.split(',')[0] || query;
                    showToast(`Found: ${data[0].display_name.split(',')[0]}`, 'success');
                } else {
                    showToast('Address not found in India. Try adding city name.', 'error');
                }
            } catch (err) {
                showToast('Search failed. Check network.', 'error');
            } finally {
                searchBtn.textContent = '🔍';
                searchBtn.disabled = false;
            }
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchBtn.click();
        });
    }

    // ── Manual Edge Editor ──
    document.getElementById('btn-add-edge').addEventListener('click', () => {
        const from   = document.getElementById('edge-from').value;
        const to     = document.getElementById('edge-to').value;
        const weight = parseFloat(document.getElementById('edge-weight').value);

        if (!from || !to)        return showToast('Select both From and To nodes.', 'warning');
        if (from === to)          return showToast('Cannot connect a node to itself.', 'warning');
        if (isNaN(weight) || weight <= 0) return showToast('Enter a valid positive weight (km).', 'warning');

        const edgeId   = `${from}--${to}`;
        const edgeIdRev = `${to}--${from}`;
        const exists = AppState.edges.find(e => e.id === edgeId || e.id === edgeIdRev);
        if (exists) return showToast('Edge already exists between these nodes.', 'warning');

        const edge = { id: edgeId, from, to, weight };
        AppState.edges.push(edge);
        window.edgesDataset.add({ id: edgeId, from, to, label: `${weight}km` });
        document.getElementById('edge-weight').value = '';
        showToast(`Edge added: ${weight} km`, 'success');
    });

    // ── Scenario Loader ──
    document.getElementById('scenario-select').addEventListener('change', e => {
        const key = e.target.value;
        if (key && demoScenarios[key]) {
            loadNetworkState(demoScenarios[key]);
            e.target.value = '';
            const n = demoScenarios[key].locations.length;
            addEventLog(`Loaded scenario: ${key} (${n} locations)`, 'info');
            showToast(`🗺️ Scenario "${key}" loaded — ${n} locations`, 'info');
        }
    });

    // ── JSON Export ──
    document.getElementById('btn-export').addEventListener('click', () => {
        if (AppState.locations.length === 0) return showToast('No data to export.', 'warning');
        const data = {
            locations: AppState.locations.map(({ markers, ...rest }) => rest),
            edges:     AppState.edges
        };
        const blob   = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url    = URL.createObjectURL(blob);
        const a      = document.createElement('a');
        a.href       = url;
        a.download   = `pathsync-network-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Network exported as JSON ✅', 'success');
    });

    // ── JSON Import ──
    document.getElementById('btn-import-trigger').addEventListener('click', () => {
        document.getElementById('file-import').click();
    });

    document.getElementById('file-import').addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                loadNetworkState(JSON.parse(ev.target.result));
                showToast(`Imported network with ${AppState.locations.length} locations`, 'success');
            } catch {
                showToast('Invalid JSON file.', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    });
}

function clearNetworkState() {
    AppState.locations.forEach(l => { if (l.markers) l.markers.forEach(m => m.remove()); });
    AppState.locations = [];
    AppState.edges     = [];
    window.nodesDataset.clear();
    window.edgesDataset.clear();
    if (window._routeLayer) { window.map2.removeLayer(window._routeLayer); window._routeLayer = null; }
    updateLocationTable();
    updateDropdowns();
}

function loadNetworkState(state) {
    clearNetworkState();
    state.locations.forEach(loc => addLocationNode(loc, true));
    
    if (state.edges && state.edges.length > 0) {
        state.edges.forEach(edge => {
            AppState.edges.push(edge);
            window.edgesDataset.add({ id: edge.id, from: edge.from, to: edge.to, label: `${edge.weight}km` });
        });
    } else {
        rebuildEdges(); // Auto-compute if missing
    }

    if (AppState.locations.length > 0) {
        const group = L.featureGroup(AppState.locations.map(l => l.markers[0]));
        const bounds = group.getBounds();
        window.map1.fitBounds(bounds, { padding: [40, 40] });
        window.map2.fitBounds(bounds, { padding: [40, 40] });
    }
    updateDropdowns();
}

// ═══════════════════════════════════════════════════
//  ALGORITHM CONTROLS (MODULE 2)
// ═══════════════════════════════════════════════════
function setupAlgorithmControls() {
    // ── Algo card radio selection ──
    document.querySelectorAll('.algo-card').forEach(card => {
        card.addEventListener('change', () => {
            document.querySelectorAll('.algo-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            const algo = card.querySelector('input').value;
            document.getElementById('end-node-group').style.display = algo === 'tsp' ? 'none' : '';
        });
    });

    // ── Run MST ──
    document.getElementById('btn-run-mst').addEventListener('click', () => {
        if (AppState.locations.length < 2) return showToast('Add at least 2 locations first.', 'warning');
        const mstEdgeIds = runPrimsMST();
        const updates = [];
        window.edgesDataset.forEach(e => {
            updates.push(mstEdgeIds.includes(e.id)
                ? { id: e.id, color: { color: '#10b981' }, width: 3 }
                : { id: e.id, color: { color: 'rgba(139,148,158,0.15)' }, width: 1 });
        });
        window.edgesDataset.update(updates);
        addEventLog(`Prim's MST computed — ${mstEdgeIds.length} edges`, 'success');
        showToast(`🌲 MST: ${mstEdgeIds.length} edges spanning ${AppState.locations.length} nodes`, 'success');
    });

    // ── Run Optimization ──
    document.getElementById('btn-run-algo').addEventListener('click', async () => {
        if (AppState.locations.length < 2) return showToast('Add at least 2 locations first.', 'warning');
        if (AppState.edges.length === 0)    return showToast('No edges in network. Add locations first.', 'warning');

        const algoEl = document.querySelector('input[name="algo"]:checked');
        const algo   = algoEl ? algoEl.value : 'dijkstra';
        const startId = document.getElementById('start-node').value;
        const endId   = document.getElementById('end-node').value;

        if (startId === endId && algo !== 'tsp') {
            return showToast('Start and End nodes must be different for this algorithm.', 'warning');
        }

        const vehicleType = document.getElementById('vehicle-type').value;
        const trafficCond = document.getElementById('traffic-condition').value;

        let result = null;
        let algoName = '';
        if (algo === 'dijkstra') {
            result = runDijkstra(startId, endId);
            algoName = "Dijkstra's";
        } else if (algo === 'astar') {
            result = runAStar(startId, endId);
            algoName = "A* Search";
        } else {
            result = runGreedyTSP(startId);
            algoName = "Greedy TSP";
        }

        if (!result || result.path.length === 0) {
            return showToast('No valid route found. Check graph connectivity.', 'error');
        }

        const runBtn = document.getElementById('btn-run-algo');
        runBtn.innerHTML = '⏳ Computing Route...';
        runBtn.disabled = true;

        try {
            // Build OSRM coordinate string (lng,lat;lng,lat...)
            const coords = result.path.map(id => {
                const l = AppState.locations.find(loc => loc.id === id);
                return `${l.lng},${l.lat}`;
            }).join(';');

            const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`);
            const osrmData = await osrmRes.json();

            if (osrmData.code !== 'Ok') throw new Error('OSRM Failed');

            const route = osrmData.routes[0];
            const realDistanceKm = route.distance / 1000;
            const baseDurationMin = route.duration / 60;

            // Apply Traffic Multiplier
            const trafficMultiplier = trafficCond === 'peak' ? 2.2 : (trafficCond === 'normal' ? 1.4 : 1.0);
            const actualTimeMin = Math.round(baseDurationMin * trafficMultiplier);

            // Apply Tolls (Approx Indian NH Rates)
            const rates = { twowheeler: 1.5, car: 2.5, lcv: 4, truck: 7 };
            let tollCost = Math.round(realDistanceKm * (rates[vehicleType] || 2.5));

            // Real-World Toll Fix (OMR)
            const involvesOMR = result.path.some(id => {
                const loc = AppState.locations.find(l => l.id === id);
                if (!loc) return false;
                const name = loc.name.toLowerCase();
                return name.includes('omr') || name.includes('navalur') || name.includes('siruseri') || name.includes('t. nagar') || name.includes('t-nagar') || name.includes('t nagar');
            });
            if (involvesOMR) {
                tollCost = 0;
            }

            // Update result panel
            document.getElementById('res-algo').textContent     = algoName;
            document.getElementById('res-distance').textContent = `${realDistanceKm.toFixed(2)} km`;
            document.getElementById('res-time').textContent     = `${actualTimeMin} min`;
            const tollEl = document.getElementById('res-toll');
            if (tollEl) {
                tollEl.textContent = tollCost === 0 ? '₹ 0 (Toll-Free stretch)' : `₹ ${tollCost}`;
                tollEl.style.color = tollCost === 0 ? 'var(--color-success)' : '#f59e0b';
            }
            document.getElementById('res-nodes').textContent    = `${result.path.length} nodes`;

            // Path chips
            const pathDisplay = document.getElementById('route-path-display');
            const pathNodes   = document.getElementById('route-path-nodes');
            pathDisplay.style.display = '';
            pathNodes.innerHTML = result.path.map((id, i) => {
                const loc = AppState.locations.find(l => l.id === id);
                const name = loc ? loc.name : id;
                return `${i > 0 ? '<span style="color:var(--color-text-muted);font-size:0.7rem">→</span>' : ''}
                        <span class="path-node-chip">${name}</span>`;
            }).join('');

            // Convert GeoJSON to Leaflet LatLng format [lat, lng]
            const pathLatLngs = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            drawRouteOnMap(pathLatLngs, trafficCond);
            
            // Store for simulation & dispatch
            AppState.lastRouteGeometry = pathLatLngs;
            AppState.lastComputedRouteResult = result;
            AppState.lastComputedRouteDetails = {
                startName: AppState.locations.find(l => l.id === startId)?.name || 'Start',
                endName: algo === 'tsp' ? 'Multi-Stop Route' : (AppState.locations.find(l => l.id === endId)?.name || 'End'),
                distance: `${realDistanceKm.toFixed(1)} km`,
                time: actualTimeMin,
                toll: tollCost
            };

            const simBtn = document.getElementById('btn-start-simulation');
            if (simBtn) simBtn.style.display = 'flex';
            
            const dispBtn = document.getElementById('btn-dispatch-fleet');
            if (dispBtn) dispBtn.style.display = 'flex';
            
            // Pass the new metrics to dashboard
            updateDashboard({ totalDistance: realDistanceKm.toFixed(1), totalTime: actualTimeMin });
            
            addEventLog(`${algoName}: ${realDistanceKm.toFixed(1)} km, ${actualTimeMin} min, ₹${tollCost}`, 'success');
            showToast(`✅ Route: ${realDistanceKm.toFixed(1)} km · ${actualTimeMin} min`, 'success');

        } catch (e) {
            console.error(e);
            showToast('Failed to fetch real road data. Ensure nodes are on land.', 'error');
        } finally {
            runBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Run Optimization';
            runBtn.disabled = false;
        }
    });

    // ── Clear Route ──
    document.getElementById('btn-clear-route')?.addEventListener('click', () => {
        if (window._routeLayer) {
            window.map2.removeLayer(window._routeLayer);
            window._routeLayer = null;
        }
        document.getElementById('route-path-display').style.display = 'none';
        
        const simBtn = document.getElementById('btn-start-simulation');
        if (simBtn) simBtn.style.display = 'none';
        
        const dispBtn = document.getElementById('btn-dispatch-fleet');
        if (dispBtn) dispBtn.style.display = 'none';
        
        AppState.lastComputedRouteResult = null;
        AppState.lastComputedRouteDetails = null;
    });
}

function drawRouteOnMap(latlngs, trafficCond = 'normal') {
    if (window._routeLayer) window.map2.removeLayer(window._routeLayer);

    const group = L.featureGroup();
    const N = latlngs.length;

    if (N < 2) return;

    // Define colors for traffic states
    const colors = {
        green: '#10b981', // Free flow
        yellow: '#f59e0b', // Moderate
        red: '#ef4444'     // Heavy
    };

    // Determine traffic segments based on Selected Condition
    let states = [];
    const segmentsCount = 10;
    
    for (let k = 0; k < segmentsCount; k++) {
        if (trafficCond === 'offpeak') {
            states.push('green');
        } else if (trafficCond === 'peak') {
            // High congestion in the middle segments
            if (k >= 2 && k <= 4) states.push('red');
            else if (k >= 5 && k <= 7) states.push('red');
            else if (k === 1 || k === 8) states.push('yellow');
            else states.push('green');
        } else { // normal
            // Mild congestion in the middle
            if (k === 3 || k === 6) states.push('yellow');
            else if (k === 4 || k === 5) states.push('yellow');
            else states.push('green');
        }
    }

    // Slice and draw polylines for each segment
    for (let k = 0; k < segmentsCount; k++) {
        const startIdx = Math.floor((k / segmentsCount) * (N - 1));
        const endIdx = Math.min(Math.floor(((k + 1) / segmentsCount) * (N - 1)) + 1, N - 1);
        
        if (startIdx >= endIdx) continue;

        const slice = latlngs.slice(startIdx, endIdx + 1);
        if (slice.length < 2) continue;

        const color = colors[states[k]];
        
        L.polyline(slice, {
            color: color,
            weight: 7,
            opacity: 0.95,
            dashArray: states[k] === 'red' ? '6, 6' : '12, 6',
            className: `route-segment-${states[k]}`
        }).addTo(group);
    }

    window._routeLayer = group.addTo(window.map2);
    window.map2.fitBounds(window._routeLayer.getBounds(), { padding: [60, 60] });
}

// ═══════════════════════════════════════════════════
//  DASHBOARD (MODULE 3)
// ═══════════════════════════════════════════════════
function updateDashboard(result) {
    animateValue('kpi-vehicles', AppState.locations.filter(l => l.type !== 'warehouse').length);
    animateValue('kpi-ontime', '98%');
    animateValue('kpi-time',  `${result.totalTime} m`);
    animateValue('kpi-distance', `${result.totalDistance} km`);

    document.querySelectorAll('.kpi-card').forEach(card => {
        card.classList.remove('value-changed');
        void card.offsetWidth;
        card.classList.add('value-changed');
    });
}

function animateValue(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = val;
    el.classList.remove('updated');
    void el.offsetWidth;
    el.classList.add('updated');
}

function addEventLog(message, type = 'info') {
    const log = document.getElementById('event-log');
    if (!log) return;
    const now  = new Date();
    const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `
        <span class="log-time">${time}</span>
        <span class="log-badge ${type}">${type.toUpperCase()}</span>
        <span>${message}</span>`;
    log.insertBefore(entry, log.firstChild);
    if (log.children.length > 30) log.removeChild(log.lastChild);
}

function initSimulateBtn() {
    document.getElementById('btn-simulate')?.addEventListener('click', () => {
        const deliveries = Math.floor(Math.random() * 20) + 5;
        const ontime     = Math.floor(Math.random() * 15) + 85;
        const avgTime    = Math.floor(Math.random() * 10) + 22;
        const totalKm    = (Math.random() * 80 + 20).toFixed(1);

        animateValue('kpi-vehicles', Math.floor(Math.random() * 5) + 1);
        animateValue('kpi-ontime',   `${ontime}%`);
        animateValue('kpi-time',     `${avgTime} m`);
        animateValue('kpi-distance', `${totalKm} km`);

        // Update volume chart
        if (window.volumeChart) {
            window.volumeChart.data.datasets[0].data =
                Array.from({ length: 11 }, (_, i) => Math.round(i * (deliveries / 10) + Math.random() * 5));
            window.volumeChart.update();
        }

        // Update status chart
        if (window.statusChart) {
            const d = Math.floor(Math.random() * 30) + 50;
            const t = Math.floor(Math.random() * 15) + 10;
            const p = Math.floor(Math.random() * 10) + 5;
            window.statusChart.data.datasets[0].data = [d, t, p, 100 - d - t - p];
            window.statusChart.update();
        }

        addEventLog(`Simulation run — ${deliveries} deliveries, ${ontime}% on-time`, 'success');
        showToast(`▶ Simulation complete: ${deliveries} deliveries simulated`, 'success');
    });
}

// ═══════════════════════════════════════════════════
//  TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        Object.assign(container.style, {
            position: 'fixed', bottom: '24px', right: '24px',
            zIndex: '9999', display: 'flex', flexDirection: 'column',
            gap: '8px', maxWidth: '360px'
        });
        document.body.appendChild(container);
    }

    const COLORS = { success: '#10b981', error: '#f43f5e', info: '#3b82f6', warning: '#f59e0b' };
    const ICONS  = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const c = COLORS[type] || COLORS.info;

    const toast = document.createElement('div');
    Object.assign(toast.style, {
        background:    'rgba(22,26,34,0.97)',
        border:        `1px solid ${c}40`,
        borderLeft:    `4px solid ${c}`,
        color:         '#f1f5f9',
        padding:       '11px 16px',
        borderRadius:  '10px',
        backdropFilter:'blur(16px)',
        fontSize:      '0.82rem',
        display:       'flex',
        alignItems:    'center',
        gap:           '10px',
        boxShadow:     '0 4px 24px rgba(0,0,0,0.45)',
        animation:     'slideInRight 0.3s ease forwards',
        cursor:        'pointer'
    });
    toast.innerHTML = `<span>${ICONS[type]}</span><span style="flex:1">${message}</span>`;
    toast.addEventListener('click', () => toast.remove());
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.35s ease forwards';
        setTimeout(() => toast.remove(), 350);
    }, 4500);
}

// ═══════════════════════════════════════════════════
//  PARTICLE BACKGROUND
// ═══════════════════════════════════════════════════
function initParticles() {
    const bg = document.getElementById('particle-bg');
    if (!bg) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
    bg.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const pts = Array.from({ length: 45 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.2 + 0.4,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        a: Math.random() * 0.35 + 0.08
    }));

    function frame() {
        ctx.clearRect(0, 0, W, H);
        pts.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(59,130,246,${p.a})`;
            ctx.fill();
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;
        });
        // Draw connection lines between nearby particles
        for (let i = 0; i < pts.length; i++) {
            for (let j = i + 1; j < pts.length; j++) {
                const dx = pts[i].x - pts[j].x;
                const dy = pts[i].y - pts[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(pts[i].x, pts[i].y);
                    ctx.lineTo(pts[j].x, pts[j].y);
                    ctx.strokeStyle = `rgba(59,130,246,${0.06 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(frame);
    }
    frame();
    window.addEventListener('resize', () => {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    });
}

// ═══════════════════════════════════════════════════
//  FLEET MANAGEMENT (MODULE 4)
// ═══════════════════════════════════════════════════
function initFleetModule() {
    // Initialize mock drivers if AppState.drivers is empty
    if (AppState.drivers.length === 0) {
        AppState.drivers = [
            { name: 'Rajesh Kumar', vehicleType: 'lcv', status: 'En Route', route: 'Chennai Central Depot → OMR Tech Park', capacity: 85 },
            { name: 'Anil Menon', vehicleType: 'truck', status: 'Loading', route: 'T. Nagar Hub → Chennai Central Depot', capacity: 40 },
            { name: 'Karthik S.', vehicleType: 'twowheeler', status: 'Idle', route: 'Unassigned', capacity: 0 },
            { name: 'Suresh Raina', vehicleType: 'car', status: 'Idle', route: 'Unassigned', capacity: 0 },
            { name: 'Vijay Amrit', vehicleType: 'lcv', status: 'Idle', route: 'Unassigned', capacity: 0 }
        ];
    }
    updateFleetTable();

    // Hook reset button
    document.getElementById('btn-fleet-reset')?.addEventListener('click', () => {
        AppState.drivers = [
            { name: 'Rajesh Kumar', vehicleType: 'lcv', status: 'Idle', route: 'Unassigned', capacity: 0 },
            { name: 'Anil Menon', vehicleType: 'truck', status: 'Idle', route: 'Unassigned', capacity: 0 },
            { name: 'Karthik S.', vehicleType: 'twowheeler', status: 'Idle', route: 'Unassigned', capacity: 0 },
            { name: 'Suresh Raina', vehicleType: 'car', status: 'Idle', route: 'Unassigned', capacity: 0 },
            { name: 'Vijay Amrit', vehicleType: 'lcv', status: 'Idle', route: 'Unassigned', capacity: 0 }
        ];
        updateFleetTable();
        showToast('Fleet status has been reset and all drivers are now Idle.', 'success');
        addEventLog('Fleet Roster reset to idle state', 'info');
    });

    // Hook Dispatch button
    document.getElementById('btn-dispatch-fleet')?.addEventListener('click', () => {
        if (!AppState.lastComputedRouteResult || !AppState.lastComputedRouteDetails) {
            showToast('Please run route optimization first before dispatching.', 'warning');
            return;
        }

        const vehicleType = document.getElementById('vehicle-type').value;
        
        // Find an idle driver that matches the vehicle type, or any idle driver
        let driver = AppState.drivers.find(d => d.status === 'Idle' && d.vehicleType === vehicleType);
        if (!driver) {
            driver = AppState.drivers.find(d => d.status === 'Idle');
        }

        if (!driver) {
            showToast('No idle drivers available at the moment!', 'error');
            return;
        }

        const details = AppState.lastComputedRouteDetails; // { startName, endName, distance, time, toll }
        driver.status = 'En Route';
        driver.route = `${details.startName} → ${details.endName}`;
        driver.capacity = Math.min(100, Math.floor(Math.random() * 40) + 50); // Random capacity between 50-90%

        updateFleetTable();
        showToast(`🚚 Dispatched ${driver.name} (${driver.vehicleType.toUpperCase()}) on route: ${driver.route}!`, 'success');
        addEventLog(`Dispatched ${driver.name} to ${driver.route} (${details.distance}, ${details.time} min)`, 'success');

        // Automatically animate live tracking when dispatched
        const trackBtn = document.getElementById('btn-start-simulation');
        if (trackBtn && trackBtn.style.display !== 'none') {
            trackBtn.click();
        }
    });
}

function updateFleetTable() {
    const tbody = document.getElementById('fleet-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    // Populate table rows
    AppState.drivers.forEach(d => {
        const tr = document.createElement('tr');
        
        const vehiclePills = {
            twowheeler: '<span class="type-pill" style="background:rgba(16,185,129,0.15); color:var(--color-success);">🛵 Two-Wheeler</span>',
            car: '<span class="type-pill" style="background:rgba(245,158,11,0.15); color:var(--color-warning);">🚗 Car</span>',
            lcv: '<span class="type-pill" style="background:rgba(59,130,246,0.15); color:var(--color-primary);">🚐 LCV</span>',
            truck: '<span class="type-pill" style="background:rgba(139,92,246,0.15); color:#8b5cf6;">🚛 Heavy Truck</span>'
        };

        const statusBadges = {
            'Idle': '<span class="badge" style="background:rgba(139,148,158,0.15); color:var(--color-text-muted);">Idle</span>',
            'En Route': '<span class="badge" style="background:rgba(16,185,129,0.15); color:var(--color-success);">En Route</span>',
            'Loading': '<span class="badge" style="background:rgba(245,158,11,0.15); color:var(--color-warning);">Loading</span>'
        };

        const capacityColor = d.capacity > 80 ? 'var(--color-danger)' : (d.capacity > 50 ? 'var(--color-warning)' : 'var(--color-success)');

        tr.innerHTML = `
            <td><strong>${d.name}</strong></td>
            <td>${vehiclePills[d.vehicleType] || d.vehicleType}</td>
            <td>${statusBadges[d.status] || d.status}</td>
            <td><span style="font-family:var(--font-mono); font-size:0.8rem;">${d.route}</span></td>
            <td>
                <div style="display:flex; align-items:center; gap:8px;">
                    <div style="width:70px; background:rgba(255,255,255,0.1); border-radius:4px; height:6px; overflow:hidden;">
                        <div style="width:${d.capacity}%; background:${capacityColor}; height:100%; border-radius:4px;"></div>
                    </div>
                    <span style="font-family:var(--font-mono); font-size:0.75rem;">${d.capacity}%</span>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}
