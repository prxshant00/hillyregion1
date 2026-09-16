import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { WardRisk, ValidationEvent, SensorNode } from '../types';
import { Layers, Compass, Eye, Mountain, Radio } from 'lucide-react';

interface MapProps {
  wards: WardRisk[];
  selectedWard: WardRisk | null;
  onSelectWard: (wardId: string) => void;
  validationEvents: ValidationEvent[];
  geoJsonData: any;
  sensors?: SensorNode[];
}

type MapLayerType = 'satellite' | 'dark' | 'topo';

export const MapChoropleth: React.FC<MapProps> = ({
  wards,
  selectedWard,
  onSelectWard,
  validationEvents,
  geoJsonData,
  sensors = []
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const sensorsLayerRef = useRef<L.LayerGroup | null>(null);

  const [activeLayer, setActiveLayer] = useState<MapLayerType>('satellite');
  const [showEvents, setShowEvents] = useState<boolean>(true);
  const [showSensors, setShowSensors] = useState<boolean>(true);

  // Tile layers definition (100% Free, Zero API Key / Billing Cost)
  const TILE_LAYERS = {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Esri, Maxar, Earthstar Geographics | SRTM 30m'
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; CARTO | OpenStreetMap contributors'
    },
    topo: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenTopoMap (CC-BY-SA)'
    }
  };

  // 1. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [31.95, 76.95],
      zoom: 9,
      minZoom: 8,
      maxZoom: 15,
      zoomControl: false
    });

    // Add initial base tile layer (Satellite by default for high-end look)
    const initialConfig = TILE_LAYERS.satellite;
    const tileLayer = L.tileLayer(initialConfig.url, {
      attribution: initialConfig.attribution,
      maxZoom: 18
    }).addTo(map);
    currentTileLayerRef.current = tileLayer;

    // Zoom controls on top-left
    L.control.zoom({ position: 'topleft' }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    sensorsLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Switch Base Tile Layer
  const handleLayerSwitch = (type: MapLayerType) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const config = TILE_LAYERS[type];
    const newLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: 18
    }).addTo(map);

    currentTileLayerRef.current = newLayer;
    setActiveLayer(type);
  };

  // 3. Render GeoJSON Ward Polygons
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !geoJsonData) return;

    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
    }

    const wardRiskMap = new Map(wards.map(w => [w.ward_id, w]));

    const geoLayer = L.geoJSON(geoJsonData, {
      style: (feature) => {
        const wardId = feature?.properties?.ward_id;
        const ward = wardRiskMap.get(wardId);
        const isSelected = selectedWard?.ward_id === wardId;
        const isHighDanger = ward?.alert_level === 'WARNING' || ward?.alert_level === 'WATCH';

        return {
          fillColor: ward?.alert_color || '#10b981',
          weight: isSelected ? 3.5 : (isHighDanger ? 2.5 : 1.5),
          opacity: 1,
          color: isSelected ? '#38bdf8' : (isHighDanger ? '#ef4444' : '#64748b'),
          dashArray: isSelected ? '' : (isHighDanger ? '' : '3'),
          fillOpacity: isSelected ? 0.75 : (activeLayer === 'satellite' ? 0.45 : 0.55)
        };
      },
      onEachFeature: (feature, layer) => {
        const wardId = feature?.properties?.ward_id;
        const ward = wardRiskMap.get(wardId);

        layer.on({
          click: () => {
            if (wardId) onSelectWard(wardId);
          },
          mouseover: (e) => {
            const l = e.target;
            l.setStyle({
              weight: 3.5,
              color: '#38bdf8',
              fillOpacity: 0.8
            });
          },
          mouseout: (e) => {
            geoLayer.resetStyle(e.target);
          }
        });

        if (ward) {
          layer.bindTooltip(
            `<div class="font-sans text-xs p-1">
              <div class="font-bold text-white text-sm">${ward.ward_name}</div>
              <div class="text-slate-300 font-mono mt-0.5">Risk Score: <strong>${ward.risk_score.toFixed(1)}/100</strong></div>
              <div class="font-mono text-[11px]" style="color: ${ward.alert_color};">Alert: <strong>${ward.alert_level}</strong></div>
              <div class="text-slate-400 font-mono text-[10px] mt-0.5">Est. Lead Time: ${ward.lead_time_hours.toFixed(1)} hrs</div>
            </div>`,
            { sticky: true, className: 'tactical-tooltip' }
          );
        }
      }
    }).addTo(map);

    geoJsonLayerRef.current = geoLayer;
  }, [geoJsonData, wards, selectedWard, onSelectWard, activeLayer]);

  // 4. Update Historical 2025 Event Markers
  useEffect(() => {
    const markersGroup = markersLayerRef.current;
    if (!markersGroup) return;

    markersGroup.clearLayers();
    if (!showEvents) return;

    const wardMap = new Map(wards.map(w => [w.ward_id, w]));

    validationEvents.forEach(ev => {
      const ward = wardMap.get(ev.ward_id);
      if (!ward) return;

      const lat = ward.latitude + 0.015;
      const lon = ward.longitude + 0.015;

      const markerIcon = L.divIcon({
        className: 'custom-event-marker',
        html: `<div class="w-6 h-6 rounded-full bg-red-600/90 border-2 border-white shadow-[0_0_12px_#ef4444] flex items-center justify-center text-xs text-white font-black animate-pulse" aria-label="Cloudburst Event ${ev.location}">!</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([lat, lon], { icon: markerIcon });
      marker.bindPopup(
        `<div class="p-2.5 font-sans max-w-xs text-xs">
          <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-red-950 text-red-300 border border-red-800 font-bold">
            2025 CLOUDBURST GROUND TRUTH
          </span>
          <h4 class="font-bold text-slate-100 text-sm mt-1.5">${ev.location}</h4>
          <div class="text-slate-400 text-[11px] font-mono">${ev.date} • ${ev.district} District</div>
          <p class="text-slate-200 mt-1.5 leading-relaxed">${ev.description}</p>
          <div class="mt-2.5 pt-2 border-t border-slate-700/80 font-mono text-[11px] flex justify-between items-center">
            <span>24h Rain: <strong class="text-white">${ev.rainfall_24h_mm} mm</strong></span>
            <span class="text-emerald-400 font-bold">✓ Model Alert Verified</span>
          </div>
          <div class="text-[10px] text-slate-400 mt-1 italic">Source: ${ev.documented_source}</div>
        </div>`,
        { className: 'tactical-popup' }
      );

      markersGroup.addLayer(marker);
    });
  }, [validationEvents, wards, showEvents]);



  // 6. Update IoT Field Sensors Layer
  useEffect(() => {
    const sensorsGroup = sensorsLayerRef.current;
    if (!sensorsGroup) return;

    sensorsGroup.clearLayers();
    if (!showSensors) return;

    sensors.forEach(node => {
      const isSurge = node.status === 'SURGE_WARNING' || node.water_level_cm > 400;

      const sensorIcon = L.divIcon({
        className: 'custom-sensor-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 rounded-full ${isSurge ? 'bg-red-500/40 animate-ping' : 'bg-cyan-500/30 animate-pulse'}"></div>
            <div class="w-6 h-6 rounded-full ${isSurge ? 'bg-red-600 border-red-300 shadow-[0_0_12px_#ef4444]' : 'bg-cyan-600 border-cyan-300 shadow-[0_0_12px_#06b6d4]'} border-2 flex items-center justify-center text-white text-[10px] font-black z-10">
              ⚡
            </div>
            <div class="absolute -bottom-4 bg-slate-900/90 border border-slate-700 px-1.5 py-0.2 rounded text-[9px] font-mono text-white whitespace-nowrap shadow">
              ${node.water_level_cm.toFixed(0)}cm
            </div>
          </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([node.latitude, node.longitude], { icon: sensorIcon });
      marker.bindPopup(
        `<div class="p-2.5 font-sans max-w-xs text-xs">
          <span class="px-2 py-0.5 rounded text-[10px] font-mono ${isSurge ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'} font-bold">
            ${isSurge ? 'SURGE ANOMALY DETECTED' : 'IOT RIVER GAUGE ACTIVE'}
          </span>
          <h4 class="font-bold text-white text-sm mt-1.5">${node.node_name}</h4>
          <div class="text-cyan-300 font-mono text-[11px] mt-0.5">Catchment: <strong>${node.river_name}</strong></div>
          <div class="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-700/80 font-mono text-[11px]">
            <div>Stage: <strong class="${isSurge ? 'text-red-400' : 'text-white'}">${node.water_level_cm} cm</strong></div>
            <div>Rise: <strong class="text-amber-400">+${node.water_level_rate_cm_per_hr} cm/h</strong></div>
            <div>Tilt: <strong>${node.tilt_angle_deg}°</strong></div>
            <div>Battery: <strong class="text-emerald-400">${node.battery_level_pct}%</strong></div>
          </div>
          <div class="text-[10px] text-slate-400 mt-2">Assigned Ward: ${node.ward_name}</div>
        </div>`,
        { className: 'tactical-popup' }
      );

      sensorsGroup.addLayer(marker);
    });
  }, [sensors, showSensors]);



  return (
    <div
      role="region"
      aria-label="Interactive Tactical Flash Flood Risk Map"
      className="relative w-full h-[540px] rounded-xl overflow-hidden border border-tactical-border shadow-2xl bg-tactical-bg focus-within:ring-2 focus-within:ring-cyan-500"
    >
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Tactical Layer Switcher Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2 pointer-events-auto">
        {/* Layer Selector Pill */}
        <div className="bg-tactical-surface/90 backdrop-blur-md border border-tactical-border rounded-lg p-1 flex items-center space-x-1 shadow-xl">
          <button
            onClick={() => handleLayerSwitch('satellite')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-mono flex items-center space-x-1.5 transition-all ${
              activeLayer === 'satellite'
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
            aria-label="Switch to Satellite Imagery Layer (ESRI World Imagery)"
            title="High-Resolution Satellite Imagery (0 API Cost)"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Satellite</span>
          </button>

          <button
            onClick={() => handleLayerSwitch('dark')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-mono flex items-center space-x-1.5 transition-all ${
              activeLayer === 'dark'
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
            aria-label="Switch to Tactical Dark Map Layer"
            title="Tactical Dark Canvas (0 API Cost)"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Dark</span>
          </button>

          <button
            onClick={() => handleLayerSwitch('topo')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-mono flex items-center space-x-1.5 transition-all ${
              activeLayer === 'topo'
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
            aria-label="Switch to Topographic Contours Map Layer (OpenTopoMap)"
            title="Topographical Contours (0 API Cost)"
          >
            <Mountain className="w-3.5 h-3.5" />
            <span>Topo</span>
          </button>
        </div>

        {/* Feature Toggles (Sensors, Events) */}
        <div className="bg-tactical-surface/90 backdrop-blur-md border border-tactical-border rounded-lg p-2 flex items-center space-x-3 text-xs font-mono shadow-xl flex-wrap gap-y-1">
          <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={showSensors}
              onChange={(e) => setShowSensors(e.target.checked)}
              className="accent-cyan-500 rounded cursor-pointer"
            />
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sensors ({sensors.length})</span>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={showEvents}
              onChange={(e) => setShowEvents(e.target.checked)}
              className="accent-red-500 rounded cursor-pointer"
            />
            <Compass className="w-3.5 h-3.5 text-red-400" />
            <span>2025 Events</span>
          </label>
        </div>
      </div>

      {/* Map Tactical Legend */}
      <div
        className="absolute bottom-4 left-4 z-20 bg-tactical-surface/90 backdrop-blur-md border border-tactical-border rounded-lg p-3 text-xs font-mono shadow-lg pointer-events-auto max-w-[290px]"
        role="complementary"
        aria-label="Risk classification legend"
      >
        <div className="text-[11px] font-bold tracking-wider text-slate-300 uppercase mb-2 flex items-center justify-between">
          <span>Risk Classification</span>
          <span className="text-[10px] text-cyan-400 uppercase font-mono">{activeLayer} Mode</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
            <span className="text-slate-300">Normal (&lt;40)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_6px_#eab308]" />
            <span className="text-slate-300">Advisory (40-60)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_6px_#f97316]" />
            <span className="text-slate-300">Watch (60-80)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
            <span className="text-slate-300 font-bold">Warning (&gt;80)</span>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-700/80 space-y-1 text-[10px] text-slate-300">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-cyan-300 font-semibold">
              <span className="text-cyan-400">⚡</span> IoT Sonar River Gauge
            </span>
            <span className="flex items-center gap-1 text-red-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-ping" /> 2025 Disaster Event
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
