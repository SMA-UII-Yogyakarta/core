import { useEffect, useRef } from "react";

interface Coords {
    lat: number;
    lng: number;
}

interface LiveAttendanceMapProps {
    schoolLat: number;
    schoolLng: number;
    schoolName?: string;
    radiusMeters?: number;
    userCoords: Coords | null;
    isInsideRadius: boolean;
    gpsStatus?: "idle" | "acquiring" | "locked" | "error";
    className?: string;
}

export function LiveAttendanceMap({
    schoolLat,
    schoolLng,
    schoolName = "SMA UII Yogyakarta",
    radiusMeters = 100,
    userCoords,
    isInsideRadius,
    className = "",
}: LiveAttendanceMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapInstance = useRef<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userMarkerRef = useRef<any>(null);

    useEffect(() => {
        let isMounted = true;
        let resizeObserver: ResizeObserver | null = null;
        const timeouts: number[] = [];

        // Ensure Leaflet CSS is injected
        if (!document.getElementById("leaflet-css")) {
            const link = document.createElement("link");
            link.id = "leaflet-css";
            link.rel = "stylesheet";
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            document.head.appendChild(link);
        }

        const triggerInvalidate = () => {
            if (mapInstance.current) {
                try {
                    mapInstance.current.invalidateSize();
                } catch {
                    // Ignore
                }
            }
        };

        const initOrUpdateMap = () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const L = (window as unknown as { L?: any }).L;
            if (!containerRef.current || !L || !isMounted) return;

            if (!mapInstance.current) {
                // Initialize map
                const map = L.map(containerRef.current, {
                    center: [schoolLat, schoolLng],
                    zoom: 16,
                    zoomControl: false,
                    attributionControl: false,
                });

                // Add clean OpenStreetMap tiles
                L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    maxZoom: 19,
                }).addTo(map);

                // Add School Geofence Circle
                L.circle([schoolLat, schoolLng], {
                    color: "#2E3391",
                    fillColor: "#3b82f6",
                    fillOpacity: 0.18,
                    weight: 2,
                    dashArray: "5, 5",
                    radius: radiusMeters,
                }).addTo(map);

                // Add School Center Marker
                const schoolIcon = L.divIcon({
                    className: "school-map-pin",
                    html: `
                        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
                            <div class="w-8 h-8 rounded-full bg-[#2E3391] text-white shadow-md border-2 border-white flex items-center justify-center text-xs font-bold">
                                🏫
                            </div>
                        </div>
                    `,
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                });

                const schoolMarker = L.marker([schoolLat, schoolLng], { icon: schoolIcon }).addTo(map);
                schoolMarker.bindPopup(`<b>${schoolName}</b><br>Radius Geofence: ${radiusMeters}m`);

                mapInstance.current = map;

                // Multiple invalidation triggers to ensure full container coverage
                [50, 150, 300, 600, 1000].forEach((delay) => {
                    const t = window.setTimeout(triggerInvalidate, delay);
                    timeouts.push(t);
                });

                if (containerRef.current && typeof ResizeObserver !== "undefined") {
                    resizeObserver = new ResizeObserver(() => {
                        triggerInvalidate();
                    });
                    resizeObserver.observe(containerRef.current);
                }
            }

            const map = mapInstance.current;
            if (!map) return;

            // Handle User Marker
            if (userCoords) {
                const markerBg = isInsideRadius ? "bg-emerald-500" : "bg-amber-500";
                const pulseBg = isInsideRadius ? "bg-emerald-400" : "bg-amber-400";
                const statusText = isInsideRadius ? "Di Dalam Radius" : "Di Luar Radius";

                const userIcon = L.divIcon({
                    className: "user-map-pin",
                    html: `
                        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
                            <span class="absolute w-8 h-8 rounded-full ${pulseBg} opacity-40 animate-ping"></span>
                            <span class="absolute w-6 h-6 rounded-full ${pulseBg} opacity-25"></span>
                            <div class="w-6 h-6 rounded-full ${markerBg} text-white shadow-lg border-2 border-white flex items-center justify-center text-[10px] font-bold">
                                📍
                            </div>
                        </div>
                    `,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                });

                if (userMarkerRef.current) {
                    try {
                        userMarkerRef.current.remove?.();
                    } catch {
                        // Ignore
                    }
                }

                const userMarker = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon }).addTo(map);
                userMarker.bindPopup(`<b>Posisi Anda</b><br>Status: ${statusText}`);
                userMarkerRef.current = userMarker;

                // Adjust view/bounds smoothly
                if (isInsideRadius) {
                    map.setView([schoolLat, schoolLng], 16);
                } else {
                    const minLat = Math.min(schoolLat, userCoords.lat);
                    const maxLat = Math.max(schoolLat, userCoords.lat);
                    const minLng = Math.min(schoolLng, userCoords.lng);
                    const maxLng = Math.max(schoolLng, userCoords.lng);
                    try {
                        map.fitBounds(
                            [
                                [minLat, minLng],
                                [maxLat, maxLng],
                            ],
                            { padding: [30, 30], maxZoom: 16 },
                        );
                    } catch {
                        map.setView([schoolLat, schoolLng], 15);
                    }
                }
            } else {
                if (userMarkerRef.current) {
                    try {
                        userMarkerRef.current.remove?.();
                    } catch {
                        // Ignore
                    }
                    userMarkerRef.current = null;
                }
                map.setView([schoolLat, schoolLng], 16);
            }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const globalL = (window as unknown as { L?: any }).L;
        if (!globalL) {
            if (!document.getElementById("leaflet-js")) {
                const script = document.createElement("script");
                script.id = "leaflet-js";
                script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
                script.onload = () => {
                    if (isMounted) initOrUpdateMap();
                };
                document.body.appendChild(script);
            } else {
                const checkInterval = setInterval(() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if ((window as unknown as { L?: any }).L) {
                        clearInterval(checkInterval);
                        if (isMounted) initOrUpdateMap();
                    }
                }, 100);
            }
        } else {
            initOrUpdateMap();
        }

        window.addEventListener("resize", triggerInvalidate);

        return () => {
            isMounted = false;
            window.removeEventListener("resize", triggerInvalidate);
            timeouts.forEach((t) => {
                clearTimeout(t);
            });
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
            if (mapInstance.current) {
                try {
                    mapInstance.current.remove();
                } catch {
                    // Ignore
                }
                mapInstance.current = null;
            }
        };
    }, [schoolLat, schoolLng, schoolName, radiusMeters, userCoords, isInsideRadius]);

    return (
        <div className={`relative w-full h-full min-h-0 overflow-hidden bg-slate-100 ${className}`}>
            <style>{`
                .leaflet-container {
                    width: 100% !important;
                    height: 100% !important;
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    background: #f1f5f9 !important;
                }
                .school-map-pin, .user-map-pin {
                    background: transparent !important;
                    border: none !important;
                }
            `}</style>

            {/* Stylized Cartographic Fallback / Underlay (active before or alongside Leaflet tiles) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-80">
                {/* Visual grid roads */}
                <svg className="w-full h-full text-slate-300" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="road-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
                            <rect width="80" height="80" fill="#f8fafc" />
                            <path d="M 0 40 L 80 40 M 40 0 L 40 80" stroke="#e2e8f0" strokeWidth="6" />
                            <path
                                d="M 0 40 L 80 40 M 40 0 L 40 80"
                                stroke="#cbd5e1"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                            />
                            <rect x="10" y="10" width="22" height="22" rx="4" fill="#e0f2fe" opacity="0.6" />
                            <rect x="48" y="10" width="22" height="22" rx="4" fill="#f0fdf4" opacity="0.6" />
                            <rect x="10" y="48" width="22" height="22" rx="4" fill="#fef3c7" opacity="0.4" />
                            <rect x="48" y="48" width="22" height="22" rx="4" fill="#f1f5f9" opacity="0.8" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#road-pattern)" />
                </svg>

                {/* Simulated Geofence Circle Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full border-2 border-dashed border-[#2E3391]/40 bg-[#2E3391]/10 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-[#2E3391] text-white flex items-center justify-center text-xs shadow-md border-2 border-white">
                            🏫
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Leaflet Map Container */}
            <div
                ref={containerRef}
                className="absolute inset-0 w-full h-full z-10"
                style={{ width: "100%", height: "100%" }}
            />
        </div>
    );
}
