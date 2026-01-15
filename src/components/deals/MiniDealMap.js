'use client';

import React, { useMemo } from "react";
import { ComposableMap, Geographies, Geography, Marker, Line } from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const MiniDealMap = ({ from, to }) => {
    if (!from.lat || !to.lat) return null;

    // Auto-calculate center and scale based on coordinates
    const mapConfig = useMemo(() => {
        const minLon = Math.min(from.lon, to.lon);
        const maxLon = Math.max(from.lon, to.lon);
        const minLat = Math.min(from.lat, to.lat);
        const maxLat = Math.max(from.lat, to.lat);

        // Midpoint
        const centerLon = (minLon + maxLon) / 2;
        const centerLat = (minLat + maxLat) / 2;

        // Distance approximation (simplified Euclidean for zoom level estimation)
        const distLon = Math.abs(maxLon - minLon);
        const distLat = Math.abs(maxLat - minLat);
        const maxDiff = Math.max(distLon, distLat);

        // Scale logic: Inverse relationship to distance
        // Default base. Closer points = Higher scale.
        // Example: Diff 5 deg -> Scale ~1500
        // Example: Diff 100 deg -> Scale ~150

        // Adjusted formula manually tuned for "always better closer than farther"
        let scale = 15000 / (maxDiff + 10);

        // Clamp values
        if (scale < 100) scale = 140; // Don't zoom out too much
        if (scale > 3000) scale = 3000; // Cap max zoom

        return {
            scale,
            center: [centerLon, centerLat]
        };
    }, [from, to]);

    return (
        <div style={{ width: "100%", height: "200px", background: "#f8f9fa", borderRadius: "8px", overflow: "hidden", border: '1px solid #eee' }}>
            <ComposableMap
                projection="geoMercator"
                projectionConfig={mapConfig}
                style={{ width: "100%", height: "100%" }}
            >
                <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                        geographies.map((geo) => (
                            <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill="#E9DCC9"
                                stroke="rgba(255,255,255,0.5)"
                                strokeWidth={0.5}
                                style={{
                                    default: { fill: "#E0D4C3", outline: "none" },
                                    hover: { fill: "#E0D4C3", outline: "none" },
                                    pressed: { fill: "#E0D4C3", outline: "none" },
                                }}
                            />
                        ))
                    }
                </Geographies>

                {/* Origin Marker */}
                <Marker coordinates={[from.lon, from.lat]}>
                    <circle r={mapConfig.scale > 1000 ? 3 : 4} fill="#233B35" />
                </Marker>

                {/* Destination Marker */}
                <Marker coordinates={[to.lon, to.lat]}>
                    <circle r={mapConfig.scale > 1000 ? 3 : 4} fill="#233B35" />
                </Marker>

                {/* Curve Line */}
                <Line
                    from={[from.lon, from.lat]}
                    to={[to.lon, to.lat]}
                    stroke="#233B35"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeOpacity={0.8}
                />
            </ComposableMap>
        </div>
    );
};

export default MiniDealMap;
