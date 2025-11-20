import React from 'react';
import { System, SystemStatus } from '../types';
import { useNotifications } from '../hooks/useNotifications';
import { useData } from '../hooks/useData';

interface SystemCardProps {
  system: System;
  onToggle: (id: string, currentStatus: SystemStatus) => void;
}

const StatusToggle: React.FC<{ active: boolean; onClick: () => void }> = ({ active, onClick }) => (
  <div
    onClick={onClick}
    className={`relative w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${active ? 'bg-indigo-600' : 'bg-gray-600'}`}
  >
    <div
      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${active ? 'translate-x-6' : ''}`}
    ></div>
  </div>
);

const SystemCard: React.FC<SystemCardProps> = ({ system, onToggle }) => {
  const { showNotification } = useNotifications();
  const { downloadWorkflow } = useData();
  const isMock = system.id.startsWith('mock-');

  const getStatusInfo = (status: SystemStatus) => {
    switch (status) {
      case SystemStatus.Active:
        return { text: 'Activo', color: 'text-green-400', dot: 'bg-green-400' };
      case SystemStatus.Paused:
        return { text: 'Pausado', color: 'text-yellow-400', dot: 'bg-yellow-400' };
      case SystemStatus.Error:
        return { text: 'Error', color: 'text-red-400', dot: 'bg-red-400' };
    }
  };

  const handleDownload = async () => {
    if (isMock) {
        showNotification('La descarga no está disponible para sistemas de demostración.', 'info');
        return;
    }
    try {
        const workflowJson = await downloadWorkflow(system.id);
        const blob = new Blob([JSON.stringify(workflowJson, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${system.name.replace(/\s+/g, '_')}_workflow.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification(`Workflow '${system.name}' descargado.`, 'success');
    } catch (error) {
        console.error("Failed to download workflow:", error);
        showNotification(`Error al descargar '${system.name}'.`, 'error');
    }
  };

  const statusInfo = getStatusInfo(system.status);

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-700 flex flex-col justify-between transition-all duration-300 hover:shadow-indigo-500/20 hover:border-indigo-500/50">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="inline-block bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-2 py-1 rounded-full mb-2">
              {system.category.charAt(0).toUpperCase() + system.category.slice(1)}
            </span>
            <h3 className="text-lg font-bold text-white">{system.name}</h3>
          </div>
          <StatusToggle active={system.status === 'active'} onClick={() => onToggle(system.id, system.status)} />
        </div>

        <p className="text-gray-400 text-sm mb-4 h-10 overflow-hidden">{system.description}</p>
        
        <div className={`flex items-center text-sm font-semibold mb-4 ${statusInfo.color}`}>
          <span className={`w-2.5 h-2.5 rounded-full mr-2 ${statusInfo.dot}`}></span>
          {statusInfo.text}
        </div>

        <div className="grid grid-cols-3 gap-4 text-center mb-4">
          <div>
            <p className="text-gray-400 text-xs">Revenue</p>
            <p className="font-semibold text-white">${system.revenue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Ventas</p>
            <p className="font-semibold text-white">{system.conversions}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">ROI</p>
            <p className="font-semibold text-white">{system.roi}%</p>
          </div>
        </div>
      </div>

      <div className="flex space-x-2 mt-auto pt-4 border-t border-gray-700">
        <button onClick={handleDownload} disabled={isMock} className="flex-1 bg-indigo-600/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-indigo-500/80 transition disabled:opacity-50 disabled:cursor-not-allowed">
          <i className="fas fa-download mr-2"></i>JSON
        </button>
        <button onClick={() => showNotification('La vista de Logs estará disponible pronto.', 'info')} className="flex-1 bg-gray-700/50 text-gray-300 px-3 py-2 text-sm rounded-lg hover:bg-gray-600/70 transition">
          <i className="fas fa-list mr-2"></i>Logs
        </button>
        <button onClick={() => showNotification('La configuración estará disponible pronto.', 'info')} className="flex-1 bg-gray-700/50 text-gray-300 px-3 py-2 text-sm rounded-lg hover:bg-gray-600/70 transition">
          <i className="fas fa-cog mr-2"></i>Config
        </button>
      </div>
    </div>
  );
};

export default SystemCard;