
import React from 'react';
import { SiteSection } from '../types';
import RiskGauge from './RiskGauge';
import SirenIcon from './SirenIcon';

interface HeaderProps {
    onGoToArea: (area: SiteSection | null) => void;
    siteSections: SiteSection[];
    activeSectionName: string;
    sectionRiskData: { name: string; risk: number }[];
}

const Header: React.FC<HeaderProps> = ({ onGoToArea, siteSections, activeSectionName, sectionRiskData }) => {
    
    const getButtonClass = (name: string) => {
        const baseClass = "px-3 py-1.5 text-white text-sm font-semibold rounded-md transition-colors";
        if (name === activeSectionName) {
            return `${baseClass} bg-blue-600`;
        }
        return `${baseClass} bg-gray-700 hover:bg-gray-600`;
    }

    return (
        <header className="h-20 bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700 shadow-lg z-20">
            <div className="w-64">
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
                    스마트 건설 안전 관제
                </h1>
            </div>

            <div className="flex-grow flex justify-center items-center space-x-2">
                <button 
                    onClick={() => onGoToArea(null)}
                    className={getButtonClass('전체 공사장')}
                >
                    전체 공사장
                </button>
                {siteSections.map(section => {
                    const riskData = sectionRiskData.find(r => r.name === section.name);
                    const isCritical = riskData && riskData.risk >= 80;
                    return (
                        <button 
                            key={section.name}
                            onClick={() => onGoToArea(section)}
                            className={getButtonClass(section.name)}
                        >
                            <div className="flex items-center justify-center">
                                {section.name}
                                {isCritical && <SirenIcon />}
                            </div>
                        </button>
                    )
                })}
            </div>

            <div className="w-auto flex justify-end items-center space-x-2">
                {sectionRiskData.map(data => (
                    <RiskGauge key={data.name} title={data.name} value={data.risk} />
                ))}
            </div>
        </header>
    );
};

export default Header;