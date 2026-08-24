'use client';
import React from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function WorldMap({ data }: { data: any[] }) {
  const countryCounts: Record<string, number> = {};
  data.forEach(d => {
    if (d.country) {
      let c = d.country.toLowerCase();
      if (c === 'maroc') c = 'morocco';
      if (c === 'etats-unis' || c === 'usa' || c === 'us') c = 'united states of america';
      if (c === 'royaume-uni' || c === 'uk') c = 'united kingdom';
      countryCounts[c] = (countryCounts[c] || 0) + d._count.id;
    }
  });

  return (
    <div className="w-full h-[400px] overflow-hidden flex items-center justify-center bg-white rounded-xl border border-[#e0ddd4]">
      <ComposableMap projectionConfig={{ scale: 140 }} width={800} height={400}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const geoName = geo.properties.name.toLowerCase();
              const count = countryCounts[geoName] || 0;
              const hasData = count > 0;
              
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={hasData ? "#0ea5e9" : "#EAEAEC"}
                  stroke="#D6D6DA"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: hasData ? "#0284c7" : "#F5F5F7", outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}
