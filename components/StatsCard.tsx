
import React from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
  trend: string;
  trendDirection: 'up' | 'down';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend, trendDirection }) => {
  const trendColor = trendDirection === 'up' ? 'text-green-400' : 'text-red-400';
  const iconColor = trendDirection === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400';

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-700 transform hover:-translate-y-1 transition-transform duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</h3>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconColor}`}>
          <i className={`fas ${icon} text-xl`}></i>
        </div>
      </div>
      <p className="text-4xl font-bold text-white">{value}</p>
      <div className={`flex items-center text-sm mt-2 ${trendColor}`}>
        <i className={`fas fa-arrow-${trendDirection} mr-2`}></i>
        <span>{trend}</span>
      </div>
    </div>
  );
};

export default StatsCard;
