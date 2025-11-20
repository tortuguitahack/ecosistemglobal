
import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { System, SystemStatus, ConnectionStatus } from '../types';
import { fetchWorkflows, fetchWorkflow, toggleWorkflowStatus as apiToggleStatus } from '../services/n8nService';
import { mockFinancialData } from '../data/workflows';
import { useNotifications } from '../hooks/useNotifications';
import { useSettings } from '../hooks/useSettings';

const REFRESH_INTERVAL_MS = 30000;

interface DataContextProps {
  systems: System[];
  isLoading: boolean;
  error: string | null;
  connectionStatus: ConnectionStatus;
  nextRefreshTimestamp: number | null;
  fetchSystemData: (isManualTrigger?: boolean) => Promise<void>;
  toggleSystemStatus: (id: string, currentStatus: SystemStatus) => Promise<void>;
  downloadWorkflow: (id: string) => Promise<any>;
}

export const DataContext = createContext<DataContextProps>({} as DataContextProps);

const categories = ['marketing', 'ecommerce', 'social', 'productivity', 'education', 'finance', 'hr', 'support', 'analytics', 'integrations'];

const loadFallbackSystems = (): System[] => {
    return mockFinancialData.map((mock, index) => ({
        id: `mock-${index + 1}`,
        name: mock.name,
        description: mock.description,
        revenue: mock.revenue,
        conversions: mock.conversions,
        roi: mock.roi,
        status: [SystemStatus.Active, SystemStatus.Active, SystemStatus.Paused, SystemStatus.Error][index % 4],
        category: categories[Math.floor(index / 10) % categories.length],
    }));
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [systems, setSystems] = useState<System[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('not_configured');
  const [nextRefreshTimestamp, setNextRefreshTimestamp] = useState<number | null>(null);
  const { showNotification } = useNotifications();
  const { settings, isConfigured } = useSettings();
  const timeoutRef = useRef<number | undefined>(undefined);
  const firstLoadRef = useRef(true);

  const fetchSystemData = useCallback(async (isManualTrigger = false) => {
    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
    }
    
    if (isManualTrigger) {
        setIsLoading(true);
    }

    if (!isConfigured) {
        setConnectionStatus('not_configured');
        if (systems.length === 0) {
            setSystems(loadFallbackSystems());
        }
        setIsLoading(false);
        return;
    }

    setConnectionStatus('connecting');

    try {
      const liveWorkflows = await fetchWorkflows(settings!.n8nApiUrl, settings!.n8nApiKey);
      const mergedSystems: System[] = liveWorkflows.map((flow) => {
        const mockData = mockFinancialData.find(m => m.name === flow.name);
        const categoryIndex = mockFinancialData.findIndex(m => m.name === flow.name);
        return {
          id: flow.id,
          name: flow.name,
          status: flow.active ? SystemStatus.Active : SystemStatus.Paused,
          description: mockData?.description || `Workflow de n8n con id: ${flow.id}`,
          revenue: mockData?.revenue || 0,
          conversions: mockData?.conversions || 0,
          roi: mockData?.roi || 0,
          category: categoryIndex !== -1 ? categories[Math.floor(categoryIndex / 10) % categories.length] : 'integrations',
        };
      });
      
      setSystems(mergedSystems);
      setConnectionStatus('connected');
      setError(null);
    } catch (e: any) {
      // Check for the specific error thrown by our service for connection issues
      if (e.message === 'CONNECTION_FAILED' || e.message.includes('Failed to fetch')) {
          // Graceful fallback to demo mode
          setConnectionStatus('error'); // This displays "Mode Demo" in the UI
          setError(null); // Clear error state so we don't block the UI with a red alert
          
          if (systems.length === 0) {
            console.log("n8n connection failed (offline/CORS). Loading fallback data.");
            setSystems(loadFallbackSystems());
          }
          
          if (isManualTrigger) {
              showNotification("No se pudo conectar a n8n. Verifica CORS o si el servidor está activo. Mostrando demo.", 'info');
          }
      } else {
          // Actual API errors (401, 500, etc)
          const errorMessage = e.message || "Error de conexión desconocido.";
          setError(errorMessage);
          setConnectionStatus('error');
          
          if (systems.length === 0) {
            setSystems(loadFallbackSystems());
          }
          
          if (isManualTrigger) {
              showNotification(`Error de API: ${errorMessage}`, 'error');
          }
      }
    } finally {
      setIsLoading(false);
      setNextRefreshTimestamp(Date.now() + REFRESH_INTERVAL_MS);
      timeoutRef.current = window.setTimeout(() => fetchSystemData(false), REFRESH_INTERVAL_MS);
      firstLoadRef.current = false;
    }
  }, [isConfigured, settings, showNotification, systems.length]);

  const toggleSystemStatus = async (id: string, currentStatus: SystemStatus) => {
    if (id.startsWith('mock-')) {
        const newStatus = currentStatus === SystemStatus.Active ? SystemStatus.Paused : SystemStatus.Active;
        setSystems(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
        showNotification('El estado ha cambiado (modo de demostración).', 'info');
        return;
    }

    if (!isConfigured) {
        showNotification('Por favor, configura la conexión n8n para cambiar el estado.', 'error');
        return;
    }

    try {
        await apiToggleStatus(id, currentStatus, settings!.n8nApiUrl, settings!.n8nApiKey);
        const newStatus = currentStatus === SystemStatus.Active ? SystemStatus.Paused : SystemStatus.Active;
        setSystems(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
        const systemName = systems.find(s => s.id === id)?.name || '';
        showNotification(`Sistema '${systemName}' ${newStatus === 'active' ? 'activado' : 'pausado'}.`, 'success');
    } catch (error: any) {
        showNotification(`Error al cambiar estado: ${error.message}`, 'error');
    }
  };

  const downloadWorkflow = (id: string): Promise<any> => {
      if (!isConfigured) {
          return Promise.reject(new Error("La conexión a n8n no está configurada."));
      }
      return fetchWorkflow(id, settings!.n8nApiUrl, settings!.n8nApiKey);
  }

  useEffect(() => {
    if (isConfigured) {
        firstLoadRef.current = true; 
        fetchSystemData(false);
    } else {
        setSystems(loadFallbackSystems());
        setIsLoading(false);
    }

    return () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfigured]);

  return (
    <DataContext.Provider value={{ systems, isLoading, error, fetchSystemData, toggleSystemStatus, connectionStatus, nextRefreshTimestamp, downloadWorkflow }}>
      {children}
    </DataContext.Provider>
  );
};
