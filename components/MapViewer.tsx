
import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, LayersControl, Polygon, useMap, Circle, useMapEvents, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Asset, Status, AssetType, ConstructionArea, DangerZone } from '../types';
import { stationaryAssetTypes } from '../App';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const WORK_AREA_RADIUS = 10; 

const getAssetTypeColor = (type: AssetType) => {
  if (type === AssetType.WORKER) return '#22c55e'; // green-500
  if (stationaryAssetTypes.includes(type)) return '#f97316'; // orange-600
  return '#f59e0b'; // amber-500
};

const getAssetIconChar = (type: AssetType) => {
    switch (type) {
        case AssetType.WORKER: return '인';
        case AssetType.EXCAVATOR: return '굴';
        case AssetType.DOZER: return '불';
        case AssetType.LOADER: return '로';
        case AssetType.DUMP_TRUCK: return '덤';
        case AssetType.FORKLIFT: return '지';
        case AssetType.MIXER_TRUCK: return '믹';
        case AssetType.TOWER_CRANE: return '타';
        case AssetType.MOBILE_CRANE: return '모';
        case AssetType.LIFT_HOIST: return '리';
        case AssetType.PUMP_CAR: return '펌';
        case AssetType.ASPHALT_FINISHER: return '아';
        case AssetType.ROLLER: return '롤';
        case AssetType.PILE_DRIVER: return '파';
        case AssetType.DRILL_RIG: return '드';
        default: return '?';
    }
}

const createAssetIcon = (asset: Asset) => {
  const color = getAssetTypeColor(asset.type);
  const isWorker = asset.type === AssetType.WORKER;
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: ${isWorker ? '50%' : '4px'}; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; color: white; font-weight: bold; font-size: 14px; font-family: 'Malgun Gothic', sans-serif;">${getAssetIconChar(asset.type)}</div>`,
    className: '', iconSize: [24, 24], iconAnchor: [12, 12],
  });
};

const EditablePolygon: React.FC<{
    zone: DangerZone;
    onUpdate: (id: number, newBounds: [number, number][]) => void;
}> = ({ zone, onUpdate }) => {
    const handleDrag = (vertexIndex: number, event: L.LeafletEvent) => {
        const newLatLng = (event.target as L.Marker).getLatLng();
        const newBounds = [...zone.bounds];
        newBounds[vertexIndex] = [newLatLng.lat, newLatLng.lng];
        onUpdate(zone.id, newBounds);
    };

    const vertexIcon = L.divIcon({
        html: `<div class="bg-white border-2 border-red-500 rounded-full w-3 h-3"></div>`,
        className: 'bg-transparent',
        iconSize: [12, 12],
    });

    return (
        <>
            <Polygon pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.3 }} positions={zone.bounds} />
            {zone.bounds.map((vertex, index) => (
                <Marker 
                    key={index} 
                    position={vertex} 
                    icon={vertexIcon} 
                    draggable={true} 
                    eventHandlers={{ drag: (e) => handleDrag(index, e) }}
                />
            ))}
        </>
    );
};

interface MapContentProps {
  assets: Asset[];
  dangerZones: DangerZone[];
  selectedAsset: Asset | null;
  onSelectAsset: (id: number | null) => void;
  areaToDisplay: ConstructionArea;
  onSetWorkArea: (assetId: number, position: [number, number]) => void;
  mapViewTarget: { center: [number, number]; zoom: number } | null;
  isEditingSections: boolean;
  isEditingDangerZones: boolean;
  onUpdateDangerZone: (id: number, newBounds: [number, number][]) => void;
  onMapViewChange: (view: { center: L.LatLng, zoom: number, bounds: L.LatLngBounds }) => void;
  previewCircle: { center: [number, number], radius: number } | null;
  activeSectionName: string;
}

const MapContent: React.FC<MapContentProps> = ({
    assets, dangerZones, selectedAsset, onSelectAsset, 
    areaToDisplay, onSetWorkArea, mapViewTarget,
    isEditingSections, isEditingDangerZones, onUpdateDangerZone,
    onMapViewChange, previewCircle, activeSectionName
}) => {
    const map = useMap();
    const showWorkAreaPrompt = selectedAsset && stationaryAssetTypes.includes(selectedAsset.type) && !(isEditingSections || isEditingDangerZones);

    useEffect(() => {
        if (selectedAsset) map.flyTo(selectedAsset.position, 18, { animate: true, duration: 1 });
        else if (mapViewTarget) map.flyTo(mapViewTarget.center, mapViewTarget.zoom, { animate: true, duration: 1.5 });
    }, [selectedAsset, mapViewTarget, map]);

    useEffect(() => {
        if (isEditingSections) {
          const handler = () => onMapViewChange({ center: map.getCenter(), zoom: map.getZoom(), bounds: map.getBounds() });
          map.on('moveend zoomend', handler);
          handler(); 
          return () => { map.off('moveend zoomend', handler); };
        }
    }, [map, isEditingSections, onMapViewChange]);

    useMapEvents({
        click(e) {
            if (showWorkAreaPrompt && selectedAsset) {
                onSetWorkArea(selectedAsset.id, [e.latlng.lat, e.latlng.lng]);
            }
        },
    });

    const displayedDangerZones = useMemo(() => {
        return activeSectionName === '전체 공사장'
            ? dangerZones
            : dangerZones.filter(dz => dz.section === activeSectionName)
    }, [dangerZones, activeSectionName]);

    return (
        <>
            <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="위성 지도">
                    <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="일반 지도">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                </LayersControl.BaseLayer>
            </LayersControl>
            
            {areaToDisplay && activeSectionName === '전체 공사장' && (
                <Circle center={areaToDisplay.center} radius={areaToDisplay.radius} pathOptions={{ color: '#06b6d4', dashArray: '5, 10', fill: false, weight: 2 }} />
            )}

            {previewCircle && <Circle center={previewCircle.center} radius={previewCircle.radius} pathOptions={{ color: '#f43f5e', dashArray: '10, 10', fill: false, weight: 3 }} />}
            
            {displayedDangerZones.map((zone) => 
                isEditingDangerZones ? (
                    <EditablePolygon key={zone.id} zone={zone} onUpdate={onUpdateDangerZone} />
                ) : (
                    <Polygon key={zone.id} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.3 }} positions={zone.bounds} />
                )
            )}

            {assets.map(asset => (
              <React.Fragment key={asset.id}>
                {asset.type !== AssetType.WORKER && (
                  <Circle center={asset.workArea || asset.position} radius={WORK_AREA_RADIUS} pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.2, weight: 1, dashArray: '5, 5' }} />
                )}
                 {asset.type === AssetType.DUMP_TRUCK && asset.targetPosition && (
                  <Polyline positions={[asset.position, asset.targetPosition]} pathOptions={{ color: '#f59e0b', weight: 2, dashArray: '5, 10' }} />
                )}
                <Marker 
                  position={asset.position} 
                  icon={createAssetIcon(asset)}
                  eventHandlers={{ click: () => onSelectAsset(asset.id) }}
                >
                  <Popup>
                    <span className="font-bold">{asset.name}</span><br />
                    타입: {asset.type}<br />
                    상태: <span style={{ color: asset.status === Status.DANGER ? '#ef4444' : '#22c55e', fontWeight: 'bold' }}>{asset.status}</span>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}
            <ZoomControl position="bottomright" />
        </>
    );
};


const MapViewer: React.FC<MapContentProps> = (props) => {
    const { areaToDisplay, selectedAsset, isEditingSections, isEditingDangerZones } = props;
    const showWorkAreaPrompt = selectedAsset && stationaryAssetTypes.includes(selectedAsset.type) && !(isEditingSections || isEditingDangerZones);
    
    return (
        <div className="relative h-full w-full">
            {showWorkAreaPrompt && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-black bg-opacity-70 text-white py-2 px-4 rounded-md text-sm font-semibold animate-pulse">
                    지도를 클릭하여 {selectedAsset.name.split('(')[0].trim()}의 작업 위치를 지정하세요.
                </div>
            )}
            <MapContainer 
                key={`${areaToDisplay.center[0]}-${areaToDisplay.center[1]}`}
                center={areaToDisplay.center} 
                zoom={16} 
                scrollWheelZoom={true} 
                zoomControl={false} 
                className="h-full w-full"
            >
                <MapContent {...props} />
            </MapContainer>
        </div>
    );
};

export default MapViewer;