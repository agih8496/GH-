
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import MapViewer from './components/MapViewer';
import SettingsSidebar from './components/SettingsSidebar';
import MonitoringSidebar from './components/MonitoringSidebar';
import Header from './components/Header';
import HeatDashboard from './components/HeatDashboard';
import { Asset, Status, AssetType, ConstructionArea, SiteSection, DangerZone } from './types';
import L from 'leaflet';

// Default initial site center
const initialCenter: [number, number] = [37.545, 127.215];
const initialSiteSections: SiteSection[] = [
    { name: '제1공정', center: [37.5455, 127.214], zoom: 18 },
    { name: '제2공정', center: [37.5445, 127.216], zoom: 18 },
    { name: '제3공정', center: [37.544, 127.2145], zoom: 18 },
];

export const stationaryAssetTypes = [
    AssetType.EXCAVATOR, AssetType.DOZER, AssetType.LOADER, 
    AssetType.TOWER_CRANE, AssetType.LIFT_HOIST, AssetType.PUMP_CAR,
    AssetType.PILE_DRIVER, AssetType.DRILL_RIG
];

const assetConfig: { [key: string]: { type: AssetType, name: string } } = {
    workers: { type: AssetType.WORKER, name: '작업자' },
    excavators: { type: AssetType.EXCAVATOR, name: '굴착기' },
    dozer: { type: AssetType.DOZER, name: '불도저' },
    loaders: { type: AssetType.LOADER, name: '로더' },
    dumpTrucks: { type: AssetType.DUMP_TRUCK, name: '덤프트럭' },
    forklifts: { type: AssetType.FORKLIFT, name: '지게차' },
    mixerTrucks: { type: AssetType.MIXER_TRUCK, name: '콘크리트 믹서 트럭' },
    towerCranes: { type: AssetType.TOWER_CRANE, name: '타워크레인' },
    mobileCranes: { type: AssetType.MOBILE_CRANE, name: '모바일 크레인' },
    liftHoists: { type: AssetType.LIFT_HOIST, name: '리프트/호이스트' },
    pumpCars: { type: AssetType.PUMP_CAR, name: '콘크리트 펌프카' },
    asphaltFinishers: { type: AssetType.ASPHALT_FINISHER, name: '아스팔트 피니셔' },
    rollers: { type: AssetType.ROLLER, name: '롤러' },
    pileDrivers: { type: AssetType.PILE_DRIVER, name: '파일드라이버' },
    drillRigs: { type: AssetType.DRILL_RIG, name: '드릴 장비' },
};

// Helper function to generate a random point within a circle
const getRandomPointInCircle = (center: [number, number], radius: number): [number, number] => {
  const r = radius * Math.sqrt(Math.random());
  const theta = Math.random() * 2 * Math.PI;
  // Conversion from meters to degrees (approximate)
  const latRadius = r / 111111;
  const lonRadius = r / (111111 * Math.cos(center[0] * (Math.PI / 180)));
  
  const newLat = center[0] + latRadius * Math.cos(theta);
  const newLon = center[1] + lonRadius * Math.sin(theta);

  return [newLat, newLon];
};


const getInitialAssetCounts = (): Record<string, Record<string, number>> => {
    const counts: Record<string, Record<string, number>> = {};
    const equipmentKeys = Object.keys(assetConfig).filter(k => k !== 'workers');

    initialSiteSections.forEach(section => {
        counts[section.name] = {};
        equipmentKeys.forEach(key => {
            counts[section.name][key] = 1;
        });
    });

    counts['제1공정'].workers = 3;
    counts['제2공정'].workers = 5;
    counts['제3공정'].workers = 6;

    return counts;
};


const generateInitialAssets = (area: ConstructionArea, sections: SiteSection[], sectionCounts: Record<string, Record<string, number>>): Asset[] => {
    const assets: Asset[] = [];
    let idCounter = 1;

    for (const section of sections) {
        const counts = sectionCounts[section.name] || {};
        const sectionRadius = area.radius / 3; 

        for (const key in counts) {
            if (counts[key] > 0 && assetConfig[key]) {
                for (let i = 0; i < counts[key]; i++) {
                    const position = getRandomPointInCircle(section.center, sectionRadius);
                    const assetType = assetConfig[key].type;
                    const newAsset: Asset = {
                        id: idCounter++,
                        name: `${assetConfig[key].name} #${i + 1}`,
                        type: assetType,
                        position,
                        status: Status.SAFE,
                        section: section.name,
                    };

                    if (stationaryAssetTypes.includes(assetType)) {
                        newAsset.workArea = position;
                    } else {
                        newAsset.targetPosition = getRandomPointInCircle(section.center, sectionRadius);
                    }
                    assets.push(newAsset);
                }
            }
        }
    }
    return assets;
};

const generateDangerZones = (sections: SiteSection[]): DangerZone[] => {
    return sections.map((section, index) => {
        const offset = 0.0005;
        const center = section.center;
        return {
            id: index + 1,
            section: section.name,
            bounds: [
                [center[0] + offset, center[1] - offset],
                [center[0] + offset, center[1] + offset],
                [center[0] - offset, center[1] + offset],
                [center[0] - offset, center[1] - offset],
            ] as [number, number][],
        }
    });
};

const isInside = (point: [number, number], vs: [number, number][]) => {
    const x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i][0], yi = vs[i][1];
        const xj = vs[j][0], yj = vs[j][1];
        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

const App: React.FC = () => {
  const [constructionArea, setConstructionArea] = useState<ConstructionArea>({ center: initialCenter, radius: 250 });
  const [assetCounts, setAssetCounts] = useState<Record<string, Record<string, number>>>(getInitialAssetCounts);
  
  const [siteSections, setSiteSections] = useState<SiteSection[]>(initialSiteSections);
  
  const [assets, setAssets] = useState<Asset[]>(() => generateInitialAssets(constructionArea, siteSections, assetCounts));
  const [dangerZones, setDangerZones] = useState<DangerZone[]>(() => generateDangerZones(siteSections));
  
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [activeSectionName, setActiveSectionName] = useState('전체 공사장');
  
  const [isEditingSections, setIsEditingSections] = useState<boolean>(false);
  const [isEditingDangerZones, setIsEditingDangerZones] = useState<boolean>(false);

  const [currentMapView, setCurrentMapView] = useState<{ center: L.LatLng, zoom: number, bounds: L.LatLngBounds } | null>(null);
  const [tempConstructionArea, setTempConstructionArea] = useState<ConstructionArea | null>(null);
  const [tempSiteSections, setTempSiteSections] = useState<SiteSection[] | null>(null);
  const [tempDangerZones, setTempDangerZones] = useState<DangerZone[] | null>(null);
  const [previewCircle, setPreviewCircle] = useState<{ center: [number, number], radius: number } | null>(null);
  
  const [mapViewTarget, setMapViewTarget] = useState<{ center: [number, number], zoom: number} | null>(null);

  const isEditing = isEditingSections || isEditingDangerZones;

  useEffect(() => {
    setAssets(generateInitialAssets(constructionArea, siteSections, assetCounts));
    setDangerZones(generateDangerZones(siteSections));
  }, [constructionArea, assetCounts, siteSections]);


  useEffect(() => {
    const interval = setInterval(() => {
      if (isEditing) return;

      setAssets(prevAssets =>
        prevAssets.map(asset => {
          const section = siteSections.find(s => s.name === asset.section);
          if (!section) return asset;

          const sectionRadius = constructionArea.radius / 3;
          
          if (stationaryAssetTypes.includes(asset.type)) {
              if (!asset.workArea) return asset;
              const { position, workArea } = asset;
              const speed = 0.00003;
              const latDiff = workArea[0] - position[0];
              const lonDiff = workArea[1] - position[1];
              const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);

              let newPosition = position;
              if (distance > 0.00005) {
                  const moveLat = (latDiff / distance) * speed;
                  const moveLon = (lonDiff / distance) * speed;
                  newPosition = [position[0] + moveLat, position[1] + moveLon];
              } else {
                  const smallRadius = 1 / 111111;
                  newPosition = [workArea[0] + (Math.random() - 0.5) * smallRadius, workArea[1] + (Math.random() - 0.5) * smallRadius];
              }
              return { ...asset, position: newPosition };
          }
          
          const { position, targetPosition, type } = asset;
          if (!targetPosition) return asset;
          const speed = type === AssetType.WORKER ? 0.000015 : 0.00003; 
          const latDiff = targetPosition[0] - position[0];
          const lonDiff = targetPosition[1] - position[1];
          const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);

          let newPosition = position;
          let newTargetPosition = targetPosition;
          
          if (distance < 0.00005) { 
            newTargetPosition = getRandomPointInCircle(section.center, sectionRadius * 0.95);
          } else {
            const moveLat = (latDiff / distance) * speed;
            const moveLon = (lonDiff / distance) * speed;
            newPosition = [position[0] + moveLat, position[1] + moveLon];
          }

          let newStatus = Status.SAFE;
          if (type === AssetType.WORKER) {
            const sectionDangerZones = dangerZones.filter(dz => dz.section === asset.section);
            const inDangerZone = sectionDangerZones.some(zone => isInside(newPosition, zone.bounds));
            newStatus = inDangerZone ? Status.DANGER : Status.SAFE;
          }

          return { ...asset, position: newPosition, targetPosition: newTargetPosition, status: newStatus };
        })
      );
    }, 1000); 

    return () => clearInterval(interval);
  }, [constructionArea, dangerZones, isEditing, siteSections]);

  const handleSelectAsset = (id: number | null) => {
    setSelectedAssetId(id);
    if (id !== null) setMapViewTarget(null);
  };

  const handleSetWorkArea = (assetId: number, newWorkArea: [number, number]) => {
      setAssets(prevAssets => prevAssets.map(asset => 
          (asset.id === assetId && stationaryAssetTypes.includes(asset.type))
              ? { ...asset, workArea: newWorkArea }
              : asset
      ));
      setSelectedAssetId(null);
  };
  
  const handleCountsChange = useCallback((sectionName: string, newCounts: Record<string, number>) => {
    setAssetCounts(prev => ({
        ...prev,
        [sectionName]: newCounts
    }));
  }, []);

  const handleToggleSectionEditMode = () => {
    const isEntering = !isEditingSections;
    setIsEditingSections(isEntering);
    if (isEntering) {
        setTempConstructionArea(constructionArea);
        setTempSiteSections(siteSections);
    } else {
        setTempConstructionArea(null);
        setTempSiteSections(null);
        setPreviewCircle(null);
        setCurrentMapView(null);
    }
  };
  
  const handleToggleDangerZoneEditMode = () => {
      const isEntering = !isEditingDangerZones;
      setIsEditingDangerZones(isEntering);
      if(isEntering) {
          setTempDangerZones(dangerZones);
      } else {
          setTempDangerZones(null);
      }
  };
  
  const handleUpdateDangerZone = (id: number, newBounds: [number, number][]) => {
      setTempDangerZones(prev => prev!.map(dz => dz.id === id ? {...dz, bounds: newBounds} : dz));
  };
  
  const handleApplyDangerZoneChanges = () => {
      if(tempDangerZones) setDangerZones(tempDangerZones);
      handleToggleDangerZoneEditMode();
  };


  const handleMapViewChange = useCallback((view: { center: L.LatLng, zoom: number, bounds: L.LatLngBounds }) => {
    if (isEditingSections) setCurrentMapView(view);
  }, [isEditingSections]);

  const handleCaptureViewForSection = (name: string) => {
    if (!currentMapView) return;
    const { bounds, center: centerLatLng, zoom } = currentMapView;
    const center: [number, number] = [centerLatLng.lat, centerLatLng.lng];
    
    const radius = L.latLng(center).distanceTo(bounds.getNorthEast());

    setPreviewCircle({ center, radius });

    if (name === '전체 공사장') {
        if(tempConstructionArea) setTempConstructionArea({ ...tempConstructionArea, center, radius });
    } else {
        setTempSiteSections(prev => prev!.map(s => s.name === name ? { ...s, center, zoom } : s));
    }
  };

  const handleApplySectionChanges = () => {
    if (tempConstructionArea) setConstructionArea(tempConstructionArea);
    if (tempSiteSections) setSiteSections(tempSiteSections);
    handleToggleSectionEditMode();
  };
  
  const handleGoToArea = (area: SiteSection | null) => {
    setSelectedAssetId(null);
    const sectionName = area ? area.name : '전체 공사장';
    setActiveSectionName(sectionName);
    const zoomLevel = area ? area.zoom : Math.round(16 - Math.log2(constructionArea.radius / 250));
    setMapViewTarget(area || {center: constructionArea.center, zoom: zoomLevel });
  }
  
  const sectionRiskData = useMemo(() => {
    return siteSections.map(section => {
        const sectionAssets = assets.filter(a => a.section === section.name && a.type === AssetType.WORKER);
        if (sectionAssets.length === 0) return { name: section.name, risk: 0 };
        const dangerCount = sectionAssets.filter(a => a.status === Status.DANGER).length;
        const risk = (dangerCount / sectionAssets.length) * 100;
        return { name: section.name, risk };
    });
  }, [assets, siteSections]);

  const selectedAsset = assets.find(asset => asset.id === selectedAssetId) || null;
  const areaToDisplay = isEditingSections ? (tempConstructionArea || constructionArea) : constructionArea;
  const displayedAssets = activeSectionName === '전체 공사장' ? assets : assets.filter(a => a.section === activeSectionName);
  const displayedDangerZones = (isEditingDangerZones ? tempDangerZones : dangerZones) || dangerZones;

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-900 text-white font-sans overflow-hidden">
      <Header 
        onGoToArea={handleGoToArea} 
        siteSections={siteSections}
        activeSectionName={activeSectionName}
        sectionRiskData={sectionRiskData}
      />
      <div className="flex flex-grow min-h-0">
        <SettingsSidebar
          key={activeSectionName} // Resets state when section changes
          initialCounts={assetCounts[activeSectionName] || {}}
          onApplyCounts={handleCountsChange}
          isEditingSections={isEditingSections}
          onToggleSectionEditMode={handleToggleSectionEditMode}
          onApplySectionChanges={handleApplySectionChanges}
          onCancelSectionChanges={handleToggleSectionEditMode}
          isEditingDangerZones={isEditingDangerZones}
          onToggleDangerZoneEditMode={handleToggleDangerZoneEditMode}
          onApplyDangerZoneChanges={handleApplyDangerZoneChanges}
          onCancelDangerZoneChanges={handleToggleDangerZoneEditMode}
          siteSections={siteSections}
          onCaptureViewForSection={handleCaptureViewForSection}
          activeSectionName={activeSectionName}
        />
        <main className="flex-grow flex flex-col relative">
            <div className="flex-grow-[9] relative">
                <MapViewer 
                    assets={displayedAssets} 
                    dangerZones={displayedDangerZones}
                    selectedAsset={selectedAsset}
                    onSelectAsset={handleSelectAsset}
                    areaToDisplay={areaToDisplay}
                    onSetWorkArea={handleSetWorkArea}
                    mapViewTarget={mapViewTarget}
                    isEditingSections={isEditingSections}
                    isEditingDangerZones={isEditingDangerZones}
                    onUpdateDangerZone={handleUpdateDangerZone}
                    onMapViewChange={handleMapViewChange}
                    previewCircle={previewCircle}
                    activeSectionName={activeSectionName}
                />
            </div>
            <div className="flex-grow-[1] relative">
                <HeatDashboard />
            </div>
        </main>
        <MonitoringSidebar
          assets={assets}
          siteSections={siteSections}
          onSelectAsset={handleSelectAsset}
          selectedAssetId={selectedAssetId}
        />
      </div>
    </div>
  );
};

export default App;