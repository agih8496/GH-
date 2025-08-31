
import React from 'react';

interface RiskGaugeProps {
  value: number; // 0 to 100
  title: string;
}

const RiskGauge: React.FC<RiskGaugeProps> = ({ value, title }) => {
  const clampedValue = Math.max(0, Math.min(100, value));
  const angle = -90 + (clampedValue / 100) * 180;

  const levels = [
    { label: '안전', color: '#22c55e', threshold: 0 }, // green-500
    { label: '관심', color: '#84cc16', threshold: 20 }, // lime-500
    { label: '주의', color: '#facc15', threshold: 40 }, // yellow-400
    { label: '경계', color: '#f97316', threshold: 60 }, // orange-500
    { label: '심각', color: '#ef4444', threshold: 80 }, // red-500
  ];

  const activeLevel = levels.slice().reverse().find(level => clampedValue >= level.threshold) || levels[0];

  const Arc: React.FC<{ color: string, startAngle: number, endAngle: number }> = ({ color, startAngle, endAngle }) => {
    const start = polarToCartesian(50, 50, 40, endAngle);
    const end = polarToCartesian(50, 50, 40, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    const d = `M ${start.x} ${start.y} A 40 40 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
    return <path d={d} fill="none" stroke={color} strokeWidth="12" />;
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  return (
    <div className="flex flex-col items-center w-24">
        <div className="text-xs font-semibold text-gray-300 mb-1">{title}</div>
        <div className="w-20 h-10 relative">
            <svg viewBox="0 0 100 55" className="w-full h-full">
                <Arc color="#4b5563" startAngle={-90} endAngle={90} /> 
                <Arc color={levels[0].color} startAngle={-90} endAngle={-54} />
                <Arc color={levels[1].color} startAngle={-54} endAngle={-18} />
                <Arc color={levels[2].color} startAngle={-18} endAngle={18} />
                <Arc color={levels[3].color} startAngle={18} endAngle={54} />
                <Arc color={levels[4].color} startAngle={54} endAngle={90} />

                {/* Needle */}
                <g transform={`rotate(${angle} 50 50)`}>
                    <path d="M 50 50 L 50 15" stroke="white" strokeWidth="2" />
                    <circle cx="50" cy="50" r="4" fill="white" />
                </g>
            </svg>
        </div>
        <div className="text-xs font-bold mt-0.5" style={{ color: activeLevel.color }}>
            {activeLevel.label}
        </div>
    </div>
  );
};

export default RiskGauge;