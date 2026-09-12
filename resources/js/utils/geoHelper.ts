/**
 * Calculates distance in meters between two GPS coordinates using the Haversine formula
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
}

/**
 * Checks if coordinate is within school geofence
 */
export function isWithinSchoolGeofence(
    lat: number,
    lon: number,
    maxRadiusMeters: number,
    targetLat: number,
    targetLon: number,
): boolean {
    const distance = calculateDistance(lat, lon, targetLat, targetLon);
    return distance <= maxRadiusMeters;
}

/**
 * Formats distance in meters or kilometers nicely
 */
export function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${meters} meter`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
}
