
import React, { useState, useMemo } from 'react';
import { View } from '../types';
import SystemCard from './SystemCard';
import { useData } from '../hooks/useData';

interface SystemsGridViewProps {
  currentView: View;
  searchTerm: string;
}

const SystemsGridView: React.FC<SystemsGridViewProps> = ({ currentView, searchTerm }) => {
  const [statusFilter, setStatusFilter] = useState('');
  const { systems, isLoading, toggleSystemStatus } = useData();

  const viewCategory = useMemo(() => {
    if (currentView === View.AllSystems || currentView === View.Dashboard) return '';
    return currentView;
  }, [currentView]);

  const filteredSystems = useMemo(() => {
    return systems.filter(system => {
      const matchesCategory = viewCategory ? system.category === viewCategory : true;
      const matchesStatus = statusFilter ? system.status === statusFilter : true;
      const matchesSearch = searchTerm
        ? system.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          system.description.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [systems, viewCategory, statusFilter, searchTerm]);

  const getCategoryTitle = () => {
    if (currentView === View.AllSystems && searchTerm) return `Resultados para "${searchTerm}"`;
    if (currentView === View.AllSystems) return "Todos los Sistemas";
    const title = viewCategory.charAt(0).toUpperCase() + viewCategory.slice(1);
    // Special case for RRHH
    if (viewCategory === 'hr') return 'RRHH';
    return title;
  }
  
  if (isLoading) {
    return <div className="text-center py-20"><i className="fas fa-spinner fa-spin text-4xl text-indigo-400"></i></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">{getCategoryTitle()} ({filteredSystems.length})</h2>
        <div className="flex space-x-4">
          <select 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-700/50 border border-gray-600 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="paused">Pausados</option>
            <option value="error">Con errores</option>
          </select>
        </div>
      </div>
      {filteredSystems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredSystems.map(system => (
            <SystemCard key={system.id} system={system} onToggle={toggleSystemStatus} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-800/50 rounded-2xl">
          <p className="text-gray-400 text-lg">No se encontraron sistemas que coincidan con los filtros.</p>
        </div>
      )}
    </div>
  );
};

export default SystemsGridView;
