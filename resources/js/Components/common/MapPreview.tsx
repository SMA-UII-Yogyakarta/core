import { useEffect, useRef } from "react";

interface LeafletMap {
    remove: () => void;
    invalidateSize: () => void;
}

declare global {
    interface Window {
        L?: {
            map: (element: HTMLElement, options: Record<string, unknown>) => LeafletMap;
            tileLayer: (url: string, options: Record<string, unknown>) => { addTo: (map: LeafletMap) => void };
            marker: (coords: [number, number]) => { addTo: (map: LeafletMap) => { bindPopup: (content: string) => { openPopup: () => void } } };
            circle: (coords: [number, number], options: Record<string, unknown>) => { addTo: (map: LeafletMap) => void };
        };
    }
}

interface MapPreviewProps {
    latitude: number;
    longitude: number;
    radiusMeters?: number;
    zoom?: number;
    className?: string;
}

export function MapPreview({
    latitude,
    longitude,
    radiusMeters = 100,
    zoom = 16,
    className = "",
}: MapPreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<LeafletMap | null>(null);

    useEffect(() => {
        let isMounted = true;
        let resizeObserver: ResizeObserver | null = null;
        const timeouts: number[] = [];

        // Ensure Leaflet CSS is loaded
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
                    // ignore
                }
            }
        };

        const initMap = () => {
            if (!containerRef.current || !window.L || !isMounted) return;

            const L = window.L;

            if (mapInstance.current) {
                try {
                    mapInstance.current.remove();
                } catch {
                    // ignore
                }
                mapInstance.current = null;
            }

            const map = L.map(containerRef.current, {
                center: [latitude, longitude],
                zoom: zoom,
                zoomControl: true,
                attributionControl: true,
            });

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            }).addTo(map);

            const marker = L.marker([latitude, longitude]).addTo(map);
            marker.bindPopup(`<b>Titik Pusat Sekolah</b><br>GPS: ${latitude}, ${longitude}`).openPopup();

            if (radiusMeters > 0) {
                L.circle([latitude, longitude], {
                    color: "#2563eb",
                    fillColor: "#3b82f6",
                    fillOpacity: 0.15,
                    radius: radiusMeters,
                }).addTo(map);
            }

            mapInstance.current = map;

            // Invalidate size immediately and repeatedly to guarantee 100% full container fill
            [50, 150, 300, 600, 1000].forEach((delay) => {
                const t = window.setTimeout(triggerInvalidate, delay);
                timeouts.push(t);
            });

            // Use ResizeObserver for instant container expansion response
            if (containerRef.current && typeof ResizeObserver !== "undefined") {
                resizeObserver = new ResizeObserver(() => {
                    triggerInvalidate();
                });
                resizeObserver.observe(containerRef.current);
            }
        };

        if (!window.L) {
            if (!document.getElementById("leaflet-js")) {
                const script = document.createElement("script");
                script.id = "leaflet-js";
                script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
                script.onload = () => {
                    if (isMounted) initMap();
                };
                document.body.appendChild(script);
            } else {
                const checkInterval = setInterval(() => {
                    if (window.L) {
                        clearInterval(checkInterval);
                        if (isMounted) initMap();
                    }
                }, 100);
            }
        } else {
            initMap();
        }

        window.addEventListener("resize", triggerInvalidate);

        return () => {
            isMounted = false;
            window.removeEventListener("resize", triggerInvalidate);
            timeouts.forEach((t) => clearTimeout(t));
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
            if (mapInstance.current) {
                try {
                    mapInstance.current.remove();
                } catch {
                    // ignore
                }
                mapInstance.current = null;
            }
        };
    }, [latitude, longitude, radiusMeters, zoom]);

    return (
        <div className={`relative w-full h-[340px] sm:h-[380px] rounded-xl overflow-hidden bg-slate-100 border border-border shadow-inner ${className}`}>
            <style>{`
                .leaflet-container {
                    width: 100% !important;
                    height: 100% !important;
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                }
            `}</style>
            <div
                ref={containerRef}
                className="absolute inset-0 w-full h-full rounded-xl z-0 block"
                style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            />
        </div>
    );
}
