'use client';

import React, { useMemo } from "react";
import { ComposableMap, Geographies, Geography, Marker, Line } from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const DealsMap = ({ deals, highlightedId, filter }) => {

    // Config based on filter
    const mapConfig = useMemo(() => {
        if (filter === 'National') {
            return {
                center: [-4, 40], // Focus on Iberia/Spain
                scale: 2400
            };
        }
        return {
            center: [10, 20], // Focus on Europe/Africa/Global
            scale: 140
        };
    }, [filter]);

    return (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <ComposableMap
                projection="geoMercator"
                projectionConfig={mapConfig}
                style={{ width: "100%", height: "100%" }}
            >
                <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                        geographies.map((geo) => {
                            // Slightly higher contrast for international map
                            const isSpain = geo.properties.name === "Spain";
                            const defaultFill = "rgba(233, 220, 201, 0.35)"; // Increased form 0.25
                            const stroke = "rgba(255, 255, 255, 0.15)";

                            return (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill={defaultFill}
                                    stroke={stroke}
                                    strokeWidth={0.5}
                                    style={{
                                        default: { outline: "none" },
                                        hover: { fill: "rgba(233, 220, 201, 0.5)", outline: "none" },
                                        pressed: { outline: "none" },
                                    }}
                                />
                            );
                        })
                    }
                </Geographies>

                {deals.map((deal) => {
                    const isHighlighted = deal.id === highlightedId;
                    const opacity = highlightedId ? (isHighlighted ? 1 : 0.1) : 0.7; // Base opacity up
                    const strokeWidth = isHighlighted ? 2.5 : 0.8; // Thinner base lines for elegance
                    const strokeColor = isHighlighted ? "#E9DCC9" : "#ffffff"; // White base lines

                    if (!deal.fromClub.lat || !deal.toClub.lat) return null;

                    return (
                        <React.Fragment key={deal.id}>
                            {/* Line */}
                            <Line
                                from={[deal.fromClub.lon, deal.fromClub.lat]}
                                to={[deal.toClub.lon, deal.toClub.lat]}
                                stroke={strokeColor}
                                strokeWidth={strokeWidth}
                                strokeLinecap="round"
                                strokeOpacity={opacity}
                            />

                            {/* Markers */}
                            {(isHighlighted || !highlightedId) && (
                                <>
                                    <Marker coordinates={[deal.fromClub.lon, deal.fromClub.lat]}>
                                        <circle r={isHighlighted ? 3 : 1.5} fill="#E9DCC9" fillOpacity={opacity} />
                                    </Marker>
                                    <Marker coordinates={[deal.toClub.lon, deal.toClub.lat]}>
                                        <circle r={isHighlighted ? 3 : 1.5} fill="#E9DCC9" fillOpacity={opacity} />
                                    </Marker>
                                </>
                            )}
                        </React.Fragment>
                    );
                })}
            </ComposableMap>

            {/* VIGNETTE OVERLAY */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at center, transparent 40%, #1a2e29 100%)',
                pointerEvents: 'none',
                zIndex: 1
            }} />
        </div>
    );
};

export default DealsMap;
