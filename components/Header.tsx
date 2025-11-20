import React, { useState, useEffect } from 'react';
import { useData } from '../hooks/useData';
import { useSettings } from '../hooks/useSettings';
import { useNotifications } from '../hooks/useNotifications';

const SettingsModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const { settings, saveSettings } = useSettings();
    const { error, fetchSystemData } = useData();
    const [apiUrl, setApiUrl] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { showNotification } = useNotifications();

    useEffect(() => {
        if (isOpen) {
            setApiUrl(settings?.n8nApiUrl || 'http://localhost:5678/api/v1');
            setApiKey(settings?.n8nApiKey || '');
        }
    }, [isOpen, settings]);

    const handleSaveAndConnect = async () => {
        if (!apiUrl || !apiKey) {
            showNotification('Por favor, introduce tanto la URL como la clave de la API.', 'error');
            return;
        }
        setIsSaving(true);
        saveSettings({ n8nApiUrl: apiUrl, n8nApiKey: apiKey });
        showNotification('Ajustes guardados. Intentando conectar...', 'info');
        
        setTimeout(async () => {
            await fetchSystemData(true);
            setIsSaving(false);
            if (!error) {
                onClose();
            }
        }, 500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 border border-indigo-700/50 rounded-2xl shadow-xl max-w-lg w-full p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-indigo-300 flex items-center">
                        <i className="fas fa-cog mr-3"></i>
                        Configuración de Conexión n8n
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                </div>
                
                {error && (
                     <div className="bg-yellow-900/50 border border-yellow-700/60 text-yellow-300 text-sm rounded-lg p-3 mb-4">
                        <p className="font-bold mb-1">Error de Conexión / Modo Demo</p>
                        <p>{error}</p>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label htmlFor="api-url" className="block text-sm font-medium text-gray-300 mb-1">URL de la API de n8n</label>
                        <input 
                            id="api-url"
                            type="text"
                            value={apiUrl}
                            onChange={(e) => setApiUrl(e.target.value)}
                            placeholder="http://localhost:5678/api/v1"
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="api-key" className="block text-sm font-medium text-gray-300 mb-1">Clave de la API de n8n</label>
                        <input 
                            id="api-key"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Pega tu clave de API aquí"
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        onClick={handleSaveAndConnect}
                        disabled={isSaving}
                        className="bg-indigo-600 text-white px-5 py-2.5 text-sm font-bold rounded-lg hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {isSaving ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-save mr-2"></i>}
                        Guardar y Conectar
                    </button>
                </div>
            </div>
        </div>
    );
};

const Countdown: React.FC<{ timestamp: number | null }> = ({ timestamp }) => {
    const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

    useEffect(() => {
        if (timestamp === null) {
            setSecondsLeft(null);
            return;
        }

        const updateCountdown = () => {
            const now = Date.now();
            const timeLeft = Math.round((timestamp - now) / 1000);
            setSecondsLeft(timeLeft > 0 ? timeLeft : 0);
        };

        updateCountdown();
        const intervalId = setInterval(updateCountdown, 1000);

        return () => clearInterval(intervalId);
    }, [timestamp]);

    if (secondsLeft === null || secondsLeft <= 0) {
        return null;
    }

    return <span className="ml-1 font-mono">({secondsLeft}s)</span>;
};

const ConnectionStatusIndicator: React.FC = () => {
    const { connectionStatus, nextRefreshTimestamp } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const statusConfig = {
        not_configured: {
            text: 'Conectar a n8n',
            icon: 'fas fa-plug',
            color: 'text-gray-400',
            action: () => setIsModalOpen(true),
        },
        connecting: {
            text: 'Conectando...',
            icon: 'fas fa-spinner fa-spin',
            color: 'text-yellow-400',
            action: undefined,
        },
        connected: {
            text: 'n8n Conectado',
            icon: 'fas fa-check-circle',
            color: 'text-green-400',
            action: undefined,
        },
        error: {
            text: 'Modo Demo',
            icon: 'fas fa-vial',
            color: 'text-yellow-400',
            action: () => setIsModalOpen(true),
        }
    };

    const currentStatus = statusConfig[connectionStatus];
    const showCountdown = (connectionStatus === 'connected' || connectionStatus === 'error') && nextRefreshTimestamp;

    return (
        <>
            <button
                onClick={currentStatus.action}
                className={`flex items-center space-x-2 text-sm transition-opacity ${currentStatus.color} ${currentStatus.action ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                disabled={!currentStatus.action}
            >
                <i className={currentStatus.icon}></i>
                <span>{currentStatus.text}</span>
                {showCountdown && <Countdown timestamp={nextRefreshTimestamp} />}
            </button>
            <SettingsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};


interface HeaderProps {
  onSearch: (term: string) => void;
  onToggleAi: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onToggleAi }) => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 flex items-center justify-between shadow-lg border border-gray-700">
      <div className="relative flex-1 max-w-lg">
        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input
          type="text"
          placeholder="Buscar sistemas, categorías, etc..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-gray-700/50 border border-gray-600 rounded-full py-2.5 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>
      <div className="flex items-center space-x-4 ml-6">
        <div className="hidden sm:flex">
          <ConnectionStatusIndicator />
        </div>
        <button className="h-11 w-11 flex items-center justify-center bg-gray-700/50 rounded-full hover:bg-gray-600/70 transition" title="Cambiar Tema (Próximamente)">
          <i className="fas fa-moon text-lg"></i>
        </button>
        <button onClick={onToggleAi} className="h-11 w-11 flex items-center justify-center bg-indigo-600/80 rounded-full hover:bg-indigo-500/80 transition" title="Asistente IA">
          <i className="fas fa-brain text-lg"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;