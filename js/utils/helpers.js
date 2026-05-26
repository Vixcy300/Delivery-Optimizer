// Utility functions and state management

// Central State
export const AppState = {
    locations: [], // Array of { id, name, type, lat, lng }
    edges: [],     // Array of { from, to, weight }
    currentTheme: 'dark',
    drivers: []    // Array of { name, vehicleType, status, route, capacity }
};

// Generate a random ID
export function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

// Calculate distance between two coordinates in km (Haversine formula)
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1); 
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return Number(d.toFixed(2));
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

// Get icon class for location type
export function getLocationIcon(type) {
    switch(type) {
        case 'warehouse': return 'fa-warehouse text-blue';
        case 'customer': return 'fa-user text-green';
        case 'hub': return 'fa-building text-amber';
        default: return 'fa-map-marker-alt';
    }
}
