
import React, { useState, useMemo } from 'react';
import { Asset, Status, SiteSection } from '../types';

interface MonitoringSidebarProps {
  assets: Asset[];
  siteSections: SiteSection[];
  onSelectAsset: (id: number) => void;
  selectedAssetId: number | null;
}

const getStatusInfo = (status: Status): { color: string, text: string } => {
  switch (status) {
    case Status.SAFE:
      return { color: 'bg-green-500', text: '안전' };
    case Status.WARNING:
      return { color: 'bg-yellow-500', text: '주의' };
    case Status.DANGER:
      return { color: 'bg-red-500', text: '위험' };
    default:
      return { color: 'bg-gray-500', text: '알 수 없음' };
  }
};

const MonitoringSidebar: React.FC<MonitoringSidebarProps> = ({
  assets,
  siteSections,
  onSelectAsset,
  selectedAssetId,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    siteSections.forEach(s => initialState[s.name] = true); // Default to all expanded
    return initialState;
  });

  const toggleSection = (name: string) => {
    setExpandedSections(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const groupedAssets = useMemo(() => {
    const groups: Record<string, Asset[]> = {};
    siteSections.forEach(s => groups[s.name] = []);
    assets.forEach(asset => {
        if (groups[asset.section]) {
            groups[asset.section].push(asset);
        }
    });
    return groups;
  }, [assets, siteSections]);


  return (
    <aside className="w-64 h-full bg-gray-800 p-3 flex flex-col shadow-lg z-10 overflow-y-auto border-l border-gray-700">
      <header className="mb-4">
        <h2 className="text-lg font-bold text-gray-200">실시간 모니터링</h2>
        <p className="text-xs text-gray-400">총 {assets.length}개 자산 추적 중</p>
      </header>
      <div className="flex-grow">
        {siteSections.map(section => {
          const sectionAssets = groupedAssets[section.name] || [];
          const dangerCount = sectionAssets.filter(a => a.status === Status.DANGER).length;
          const isExpanded = !!expandedSections[section.name];

          return (
            <div key={section.name} className="mb-2 bg-gray-900/50 rounded-md">
              <header 
                onClick={() => toggleSection(section.name)} 
                className="cursor-pointer p-2 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <span className={`inline-block transition-transform duration-200 mr-2 text-sm ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                  <h3 className="font-bold text-md text-gray-200">{section.name}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  {dangerCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                      {dangerCount}
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-gray-600 text-gray-200 text-xs font-bold rounded-full">
                    {sectionAssets.length}
                  </span>
                </div>
              </header>
              {isExpanded && (
                <ul className="space-y-1 p-2 border-t border-gray-700">
                  {sectionAssets.map(asset => {
                    const statusInfo = getStatusInfo(asset.status);
                    const isSelected = asset.id === selectedAssetId;
                    return (
                      <li
                        key={asset.id}
                        onClick={() => onSelectAsset(asset.id)}
                        className={`p-2 rounded-md cursor-pointer transition-all duration-200 ${isSelected ? 'bg-blue-600/50' : 'bg-gray-700 hover:bg-gray-600'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-sm text-white">{asset.name}</p>
                            <p className="text-xs text-gray-400">{asset.type}</p>
                          </div>
                          <div className={`px-2 py-0.5 text-xs font-bold rounded-full text-white ${statusInfo.color}`}>
                            {statusInfo.text}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                   {sectionAssets.length === 0 && (
                    <li className="text-center text-xs text-gray-500 py-2">
                        투입된 자산 없음
                    </li>
                   )}
                </ul>
              )}
            </div>
          )
        })}
      </div>
       <footer className="text-center text-xs text-gray-500 mt-4 pt-4 border-t border-gray-700">
        <p>RTK-GNSS 기반 정밀 측위 시스템</p>
      </footer>
    </aside>
  );
};

export default MonitoringSidebar;