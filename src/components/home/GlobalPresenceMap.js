'use client';

import React from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Tooltip } from "react-tooltip";
import { getFlagUrl } from "../../utils/countryHelpers";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Active Players: Country -> List of names
const ACTIVE_PLAYERS = {
    "Spain": ["Christian Rivera", "Dani Fernandez"],
    "Australia": ["Victor Campuzano"],
    "India": ["Matias Hernandez"],
    "Andorra": ["Christian Jimenez"]
};

// Countries with "Llegada/Contacto" (Reach)
const REACH_COUNTRIES = [
    "United States of America", "Canada", "Mexico", "China",
    // Europe
    "France", "Germany", "Italy", "United Kingdom", "Portugal",
    "Netherlands", "Belgium", "Switzerland", "Austria", "Sweden",
    "Norway", "Denmark", "Finland", "Poland", "Croatia",
    "Serbia", "Greece", "Turkey", "Russia", "Ukraine",
    "Romania", "Ireland", "Scotland", "Wales", "Czech Republic", "Hungary"
];

const GlobalPresenceMap = () => {
    return (
        <div style={{ position: 'relative', width: "100%", height: "600px", display: 'flex', flexDirection: 'column' }}>
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 140,
                    center: [0, 30]
                }}
                style={{ width: "100%", height: "100%" }}
            >
                <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                        geographies.map((geo) => {
                            const countryName = geo.properties.name;
                            const activePlayers = ACTIVE_PLAYERS[countryName];
                            const isReach = REACH_COUNTRIES.includes(countryName);

                            let fillColor = "#D6C7B2"; // Default Beige
                            let hoverColor = "#D6C7B2";
                            let tooltipContent = "";

                            // Flag HTML for tooltip
                            const flagUrl = getFlagUrl(countryName);
                            const flagHtml = flagUrl ? `<img src="${flagUrl}" style="width: 20px; height: 15px; margin-right: 8px; vertical-align: middle; border-radius: 2px;" />` : '';

                            if (activePlayers) {
                                fillColor = "#233B35"; // Aquila Dark Green
                                hoverColor = "#1a2c28";
                                // Format: Flag Country <br/> Player 1 <br/> Player 2
                                const playersHtml = activePlayers.map(p => `<div>• ${p}</div>`).join('');
                                tooltipContent = `
                                    <div style="font-weight: bold; margin-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 4px;">
                                        ${flagHtml} ${countryName}
                                    </div>
                                    <div style="font-size: 0.9em;">${playersHtml}</div>
                                `;
                            } else if (isReach) {
                                fillColor = "#8FA8A1"; // Light Green/Grey (Global Network)
                                hoverColor = "#7E968E";
                                tooltipContent = `
                                    <div style="display: flex; align-items: center;">
                                        ${flagHtml} 
                                        <span>${countryName}</span>
                                    </div>
                                    <div style="font-size: 0.8em; margin-top: 4px; font-style: italic;">Global Network</div>
                                `;
                            } else {
                                // For other countries, just show flag + name on hover
                                tooltipContent = `
                                    <div style="display: flex; align-items: center;">
                                        ${flagHtml} 
                                        <span>${countryName}</span>
                                    </div>
                                `;
                            }

                            return (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    data-tooltip-id="map-tooltip"
                                    data-tooltip-html={tooltipContent}
                                    fill={fillColor}
                                    stroke="#E9DCC9"
                                    strokeWidth={0.5}
                                    style={{
                                        default: {
                                            fill: fillColor,
                                            outline: "none",
                                            transition: "all 0.3s"
                                        },
                                        hover: {
                                            fill: hoverColor,
                                            outline: "none",
                                            cursor: "pointer"
                                        },
                                        pressed: {
                                            fill: hoverColor,
                                            outline: "none"
                                        },
                                    }}
                                />
                            );
                        })
                    }
                </Geographies>
            </ComposableMap>
            <Tooltip
                id="map-tooltip"
                style={{ backgroundColor: "#233B35", color: "#fff", borderRadius: "4px", padding: "8px 12px", zIndex: 100 }}
                opacity={1}
            />

            {/* Legend - Absolute positioned at bottom left */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                fontSize: '0.85rem',
                color: 'var(--color-text-dark)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ width: '12px', height: '12px', background: '#233B35', borderRadius: '50%', marginRight: '8px' }}></span>
                    <span>Active Players</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ width: '12px', height: '12px', background: '#8FA8A1', borderRadius: '50%', marginRight: '8px' }}></span>
                    <span>Global Network</span>
                </div>
                {/* 
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ width: '12px', height: '12px', background: '#D6C7B2', borderRadius: '50%', marginRight: '8px' }}></span>
                    <span>No Presence</span>
                </div> 
                */}
            </div>
        </div>
    );
};

export default GlobalPresenceMap;
