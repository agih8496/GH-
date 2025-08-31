
import React, { useState } from 'react';
import { SiteSection } from '../types';

interface SettingsSidebarProps {
  initialCounts: Record<string, number>;
  onApplyCounts: (sectionName: string, newCounts: Record<string, number>) => void;
  isEditingSections: boolean;
  onToggleSectionEditMode: () => void;
  onApplySectionChanges: () => void;
  onCancelSectionChanges: () => void;
  isEditingDangerZones: boolean;
  onToggleDangerZoneEditMode: () => void;
  onApplyDangerZoneChanges: () => void;
  onCancelDangerZoneChanges: () => void;
  siteSections: SiteSection[];
  onCaptureViewForSection: (name: string) => void;
  activeSectionName: string;
}

// SVG Icon Components
const PersonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>;
const ExcavatorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.926 9.34a.994.994 0 00-.395-.417l-3.953-2.26a1 1 0 00-1.156.32l-1.57 2.72a1 1 0 00-.01 1.042l3.43 5.942a1 1 0 001.37.38l3.953-2.26a1 1 0 00.33-.967z" /><path fillRule="evenodd" d="M12.964 3.65a1 1 0 00-1.37-.38L3.29 8.21a1 1 0 00-.33.967l.42 2.305a1 1 0 00.957.81h3.456a1 1 0 00.956-.81l.421-2.305a1 1 0 00-.33-.967L6.5 6.843l2.502-1.43 4.962 2.835-1.5-2.598zM2 16a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" clipRule="evenodd" /></svg>;
const TruckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a1 1 0 01-1 1h-1v1a1 1 0 11-2 0v-1H7v1a1 1 0 11-2 0v-1H4a1 1 0 110-2h1V8a1 1 0 011-1h9a1 1 0 011 1v2h1a1 1 0 011 1zM3 8a3 3 0 013-3h1.372a3.001 3.001 0 015.256 0H14a3 3 0 013 3v5a3 3 0 01-3 3H6a3 3 0 01-3-3V8zm3 1a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>;
const CraneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M13 3a1 1 0 00-1-1H4a1 1 0 00-1 1v12a1 1 0 102 0V4h5v12a1 1 0 102 0V4h1a1 1 0 001-1zM6 18a1 1 0 001.414 1.414L10 16.828l2.586 2.586a1 1 0 101.414-1.414L11.414 15.4l1.172-1.172a1 1 0 10-1.414-1.414L10 14.172l-1.172-1.172a1 1 0 10-1.414 1.414L8.586 15.4 6 18z" clipRule="evenodd" /></svg>;
const ConcreteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 16a3.5 3.5 0 01-3.5-3.5V5.5A3.5 3.5 0 015.5 2h9A3.5 3.5 0 0118 5.5v1.23c.31-.13.64-.23.99-.23v-1A4.5 4.5 0 0014.5 1h-9A4.5 4.5 0 001 5.5v7A4.5 4.5 0 005.5 17h1.23c-.13-.31-.23-.64-.23-.99H5.5z" /><path d="M15.5 5a1 1 0 00-1 1v1.33a3.52 3.52 0 00-1.5.75V6a2 2 0 10-4 0v5.5a3.5 3.5 0 107 0V6a1 1 0 00-1-1z" /></svg>;
const SpecialIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;

const assetCategories: { name: string; icon: JSX.Element; assets: { id: string, name: string }[] }[] = [
    { name: '투입 인력', icon: <PersonIcon />, assets: [{ id: 'workers', name: '작업자' }] },
    { name: '토공 장비', icon: <ExcavatorIcon />, assets: [{ id: 'excavators', name: '굴착기' }, { id: 'dozer', name: '불도저' }, { id: 'loaders', name: '로더' }] },
    { name: '운반 장비', icon: <TruckIcon />, assets: [{ id: 'dumpTrucks', name: '덤프트럭' }, { id: 'forklifts', name: '지게차' }, { id: 'mixerTrucks', name: '콘크리트 믹서 트럭' }] },
    { name: '양중 장비', icon: <CraneIcon />, assets: [{ id: 'towerCranes', name: '타워크레인' }, { id: 'mobileCranes', name: '모바일 크레인' }, { id: 'liftHoists', name: '리프트/호이스트' }] },
    { name: '콘크리트·포장 장비', icon: <ConcreteIcon />, assets: [{ id: 'pumpCars', name: '콘크리트 펌프카' }, { id: 'asphaltFinishers', name: '아스팔트 피니셔' }, { id: 'rollers', name: '롤러' }] },
    { name: '특수 장비', icon: <SpecialIcon />, assets: [{ id: 'pileDrivers', name: '파일드라이버' }, { id: 'drillRigs', name: '드릴 장비' }] }
];

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  initialCounts, onApplyCounts,
  isEditingSections, onToggleSectionEditMode,
  onApplySectionChanges, onCancelSectionChanges,
  isEditingDangerZones, onToggleDangerZoneEditMode,
  onApplyDangerZoneChanges, onCancelDangerZoneChanges,
  siteSections, onCaptureViewForSection, activeSectionName
}) => {
  const [localCounts, setLocalCounts] = useState(initialCounts);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const isConfigurable = activeSectionName !== '전체 공사장';
  const isEditing = isEditingSections || isEditingDangerZones;
  
  const handleInputChange = (type: string, value: string) => {
    const numValue = parseInt(value, 10);
    const newCount = !isNaN(numValue) && numValue >= 0 ? numValue : 0;
    setLocalCounts(prev => ({...prev, [type]: newCount}));
  };

  const handleApply = () => {
    if (isConfigurable) {
      onApplyCounts(activeSectionName, localCounts);
    }
  };
  
  const toggleCategory = (name: string) => {
      setOpenCategories(prev => ({...prev, [name]: !prev[name]}));
  }

  const renderAssetSettings = () => (
    <>
      <div className={`flex-grow space-y-3 ${!isConfigurable ? 'opacity-50' : ''}`}>
        {assetCategories.map((category) => {
          const categoryTotal = category.assets.reduce((sum, asset) => sum + (localCounts[asset.id] || 0), 0);
          const isOpen = openCategories[category.name];
          return (
            <div key={category.name}>
              <button onClick={() => toggleCategory(category.name)} className="w-full text-sm font-semibold text-gray-300 list-none flex items-center justify-between p-1 rounded-md hover:bg-gray-700">
                <div className="flex items-center">
                  <span className={`${isOpen ? 'rotate-90' : ''} inline-block transition-transform duration-200 mr-2 text-xs`}>▶</span>
                  <span className="mr-2 text-teal-400">{category.icon}</span>
                  {category.name}
                </div>
                {categoryTotal > 0 && !isOpen && (
                  <span className="ml-auto px-2 py-0.5 bg-gray-600 text-gray-200 text-xs font-bold rounded-full">
                    {categoryTotal}
                  </span>
                )}
              </button>
              {isOpen && (
                <div className="space-y-2 mt-2 pl-4 border-l-2 border-gray-700">
                  {category.assets.map(asset => (
                    <div key={asset.id}>
                      <label htmlFor={asset.id} className="block text-xs font-medium text-gray-400">{asset.name}</label>
                      <input
                        type="number"
                        id={asset.id}
                        value={localCounts[asset.id] || 0}
                        onChange={(e) => handleInputChange(asset.id, e.target.value)}
                        disabled={!isConfigurable}
                        className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-white text-sm focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button onClick={handleApply} disabled={!isConfigurable} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors mt-4 disabled:bg-gray-600 disabled:cursor-not-allowed">
        투입 적용
      </button>
    </>
  );

  const renderSectionEditor = () => (
    <>
      <div className="flex-grow space-y-2">
        <h3 className="text-sm font-semibold text-gray-300">영역 편집</h3>
        <p className="text-xs text-gray-400 pb-2">
          지도를 조작하여 원하는 뷰를 설정한 후, 아래 버튼을 눌러 해당 영역의 화면을 저장하세요.
        </p>
        <button onClick={() => onCaptureViewForSection('전체 공사장')} className="w-full text-left p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors text-xs font-medium">'전체 공사장' 화면 저장</button>
        {siteSections.map(section => (
          <button key={section.name} onClick={() => onCaptureViewForSection(section.name)} className="w-full text-left p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors text-xs font-medium">'{section.name}' 화면 저장</button>
        ))}
      </div>
    </>
  );

  const renderDangerZoneEditor = () => (
    <div className="flex-grow">
      <h3 className="text-sm font-semibold text-gray-300">위험 구역 편집</h3>
      <p className="text-xs text-gray-400 pb-2">
        지도 위의 위험 구역(붉은색 사각형)의 꼭짓점을 드래그하여 형태를 변경하세요.
      </p>
    </div>
  );

  return (
    <aside className="w-56 h-full bg-gray-800 p-3 flex flex-col shadow-lg z-10 overflow-y-auto border-r border-gray-700">
      <header className="mb-4">
        <h2 className="text-base font-bold text-gray-200">{isConfigurable ? `${activeSectionName} 설정` : '금일 작업 투입 현황'}</h2>
        <p className="text-xs text-gray-400">
          {isEditingSections ? '현장 및 공정 영역 설정' : isEditingDangerZones ? '위험 구역(울타리) 설정' : '장비 및 인력 설정'}
        </p>
      </header>
      
      {isEditingSections ? renderSectionEditor() : isEditingDangerZones ? renderDangerZoneEditor() : renderAssetSettings()}

      <div className="mt-auto pt-4 border-t border-gray-700 space-y-2">
        {isEditingSections ? (
          <div className="flex space-x-2">
             <button onClick={onCancelSectionChanges} className="w-1/2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">취소</button>
             <button onClick={onApplySectionChanges} className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">적용</button>
          </div>
        ) : isEditingDangerZones ? (
           <div className="flex space-x-2">
             <button onClick={onCancelDangerZoneChanges} className="w-1/2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">취소</button>
             <button onClick={onApplyDangerZoneChanges} className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">적용</button>
          </div>
        ) : (
          <>
            <button onClick={onToggleSectionEditMode} disabled={isEditing} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 text-sm">현장 및 공정 영역 편집</button>
            <button onClick={onToggleDangerZoneEditMode} disabled={isEditing} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 text-sm">위험 구역(울타리) 편집</button>
          </>
        )}
      </div>
    </aside>
  );
};

export default SettingsSidebar;