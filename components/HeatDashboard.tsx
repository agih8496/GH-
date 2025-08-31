
import React, { useState, useEffect, useMemo } from 'react';

// --- Helper Functions ---
const generateHourlyData = () => {
  const data = [];
  for (let i = 0; i < 24; i++) {
    const temp = 28 + 6 * Math.sin((i - 8) * (Math.PI / 12));
    const humidity = 60 - 20 * Math.sin((i - 8) * (Math.PI / 12));
    data.push({ hour: i, temp: parseFloat(temp.toFixed(1)), humidity: parseFloat(humidity.toFixed(1)) });
  }
  return data;
};

const calculateFeelsLike = (temp: number, humidity: number) => {
  if (temp < 26.7) return temp;
  const c1=-8.78469475556,c2=1.61139411,c3=2.33854883889,c4=-0.14611605,c5=-0.012308094,c6=-0.0164248277778,c7=2.211732e-3,c8=7.2546e-4,c9=-3.582e-6;
  const hi = c1+c2*temp+c3*humidity+c4*temp*humidity+c5*temp*temp+c6*humidity*humidity+c7*temp*temp*humidity+c8*temp*humidity*humidity+c9*temp*temp*humidity*humidity;
  return parseFloat(hi.toFixed(1));
};

const getRiskLevel = (feelsLike: number) => {
  if (feelsLike >= 41) return { level: '위험', color: 'text-red-500', bg: 'bg-red-500/20' };
  if (feelsLike >= 35) return { level: '경계', color: 'text-orange-500', bg: 'bg-orange-500/20' };
  if (feelsLike >= 33) return { level: '주의', color: 'text-yellow-400', bg: 'bg-yellow-400/20' };
  return { level: '관심', color: 'text-green-400', bg: 'bg-green-400/20' };
};

// --- Icon Components ---
const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11h-1a1 1 0 100 2h1a1 1 0 100-2zM4.227 4.227a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM3 10a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1zM7.05 15.464a1 1 0 10-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zm5.657-5.657a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
);
const CloudIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
    </svg>
);


interface SvgChartProps {
    data: { hour: number; temp: number; humidity: number; feelsLike: number }[];
    visibleLines: { temp: boolean; humidity: boolean; feelsLike: boolean };
}

const SvgChart: React.FC<SvgChartProps> = ({ data, visibleLines }) => {
    const width = 320;
    const height = 80;
    const margin = { top: 5, right: 30, bottom: 20, left: 30 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const workdayData = data.filter(d => d.hour >= 6 && d.hour <= 18);

    const tempDomain = [20, 45];
    const humidDomain = [0, 100];
    const timeDomain = [6, 18];

    const xScale = (hour: number) => margin.left + ((hour - timeDomain[0]) / (timeDomain[1] - timeDomain[0])) * chartWidth;
    const yScaleTemp = (temp: number) => margin.top + chartHeight - ((temp - tempDomain[0]) / (tempDomain[1] - tempDomain[0])) * chartHeight;
    const yScaleHumid = (humid: number) => margin.top + chartHeight - ((humid - humidDomain[0]) / (humidDomain[1] - humidDomain[0])) * chartHeight;

    const createPath = (key: 'temp' | 'humidity' | 'feelsLike') => {
        const yScale = key === 'humidity' ? yScaleHumid : yScaleTemp;
        return workdayData.map(d => `${xScale(d.hour)},${yScale(d[key])}`).join(' L ');
    };

    return (
        <svg width={width} height={height} className="text-xs">
            {/* Y Axis Temp */}
            {Array.from({ length: 6 }).map((_, i) => {
                const temp = tempDomain[0] + i * 5;
                return (
                    <g key={`temp-tick-${i}`}>
                        <line x1={margin.left} y1={yScaleTemp(temp)} x2={width - margin.right} y2={yScaleTemp(temp)} stroke="#4b5563" strokeDasharray="2,2" />
                        <text x={margin.left - 5} y={yScaleTemp(temp) + 3} fill="#9ca3af" textAnchor="end">{temp}°C</text>
                    </g>
                );
            })}
            {/* Y Axis Humid */}
            {Array.from({ length: 5 }).map((_, i) => {
                const humid = humidDomain[0] + i * 25;
                return (
                    <text key={`humid-tick-${i}`} x={width - margin.right + 5} y={yScaleHumid(humid) + 3} fill="#9ca3af">{humid}%</text>
                );
            })}

            {/* X Axis */}
            {Array.from({ length: 5 }).map((_, i) => {
                const hour = timeDomain[0] + i * 3;
                return (
                     <text key={`time-tick-${i}`} x={xScale(hour)} y={height - 5} fill="#9ca3af" textAnchor="middle">{`${String(hour).padStart(2, '0')}:00`}</text>
                );
            })}

            {/* Data Lines */}
            {visibleLines.temp && <path d={`M ${createPath('temp')}`} fill="none" stroke="#f97316" strokeWidth="2" />}
            {visibleLines.humidity && <path d={`M ${createPath('humidity')}`} fill="none" stroke="#3b82f6" strokeWidth="2" />}
            {visibleLines.feelsLike && <path d={`M ${createPath('feelsLike')}`} fill="none" stroke="#facc15" strokeWidth="2" />}
        </svg>
    );
};

// --- Main Component ---
const HeatDashboard: React.FC = () => {
  const [data] = useState(generateHourlyData());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [visibleLines, setVisibleLines] = useState({ temp: true, humidity: true, feelsLike: true });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const fullData = useMemo(() => data.map(d => ({
    ...d,
    feelsLike: calculateFeelsLike(d.temp, d.humidity)
  })), [data]);
  
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentDataPoint = fullData[currentHour];
  const nextDataPoint = fullData[(currentHour + 1) % 24];
  const interpolate = (start: number, end: number) => start + (end - start) * (currentMinute / 60);
  const currentTemp = interpolate(currentDataPoint.temp, nextDataPoint.temp);
  const currentHumidity = interpolate(currentDataPoint.humidity, nextDataPoint.humidity);
  const currentFeelsLike = calculateFeelsLike(currentTemp, currentHumidity);
  const currentRisk = getRiskLevel(currentFeelsLike);
  
  // Forecast Data (Simulated)
  const todayForecast = { weather: '맑음', feelsLike: Math.max(...fullData.map(d => d.feelsLike)) };
  const tomorrowForecast = { weather: '흐림', feelsLike: Math.max(...fullData.map(d => d.feelsLike)) - 2.3 };
  
  const handleCheckboxChange = (line: keyof typeof visibleLines) => {
      setVisibleLines(prev => ({ ...prev, [line]: !prev[line] }));
  };

  return (
    <div className="h-full bg-gray-800 border-t border-gray-700 px-4 py-0 flex items-center justify-between">
      <div className="flex flex-col items-center justify-center text-center pr-4 border-r border-gray-700">
          <h2 className="text-base font-bold text-gray-200">폭염 대비</h2>
          <h3 className="text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
            사업장 관리
          </h3>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div>
          <h4 className="text-xs font-semibold text-gray-300 mb-0 text-center">금일 작업시간 기상 정보</h4>
          <SvgChart data={fullData} visibleLines={visibleLines} />
        </div>
        <div className="space-y-1 ml-4">
            {Object.keys(visibleLines).map(key => (
                <label key={key} className="flex items-center text-xs text-gray-300">
                    <input type="checkbox" checked={visibleLines[key as keyof typeof visibleLines]} onChange={() => handleCheckboxChange(key as keyof typeof visibleLines)} className={`form-checkbox h-4 w-4 rounded mr-2 ${key === 'temp' ? 'text-orange-500' : key === 'humidity' ? 'text-blue-500' : 'text-yellow-400'}`} />
                    {key === 'temp' ? '온도' : key === 'humidity' ? '습도' : '체감온도'}
                </label>
            ))}
        </div>
      </div>
      
      <div className="flex items-center justify-around flex-1 border-x border-gray-700 px-4">
        {/* Today's Forecast */}
        <div className="flex flex-col items-center">
            <h5 className="text-xs font-bold text-gray-200">오늘</h5>
            {todayForecast.weather === '맑음' ? <SunIcon /> : <CloudIcon />}
            <p className="text-xs text-gray-400">{todayForecast.weather}</p>
            <p className="text-base font-bold text-yellow-400">{todayForecast.feelsLike.toFixed(1)}°C</p>
        </div>
        {/* Tomorrow's Forecast */}
        <div className="flex flex-col items-center">
            <h5 className="text-xs font-bold text-gray-200">내일</h5>
            {tomorrowForecast.weather === '맑음' ? <SunIcon /> : <CloudIcon />}
            <p className="text-xs text-gray-400">{tomorrowForecast.weather}</p>
            <p className="text-sm font-bold text-gray-300">{tomorrowForecast.feelsLike.toFixed(1)}°C</p>
        </div>
      </div>
      
      <div className={`w-48 flex flex-col items-center justify-center rounded-lg px-2 py-0 ml-4 ${currentRisk.bg} border border-gray-600`}>
          <h4 className="text-xs font-semibold text-gray-300">실시간 체감온도</h4>
          <div className={`text-3xl font-bold ${currentRisk.color}`}>{currentFeelsLike.toFixed(1)}°C</div>
          <div className={`text-base font-semibold ${currentRisk.color}`}>{currentRisk.level}</div>
          <div className="text-xs text-gray-400 mt-0">
              온도: {currentTemp.toFixed(1)}°C / 습도: {currentHumidity.toFixed(1)}%
          </div>
      </div>
    </div>
  );
};

export default HeatDashboard;