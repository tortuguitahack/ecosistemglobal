import React, { useState, useCallback } from 'react';
import { View } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import SystemsGridView from './components/SystemsGridView';
import AiAssistant from './components/AiAssistant';
import { DataProvider } from './contexts/DataContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Notifications from './components/Notifications';
import { SettingsProvider } from './contexts/SettingsContext';

const AppContent: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>(View.Dashboard);
    const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSetView = useCallback((view: View) => {
        setCurrentView(view);
    }, []);

    const toggleAiPanel = useCallback(() => {
        setIsAiPanelOpen(prev => !prev);
    }, []);

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
        if(term) {
          setCurrentView(View.AllSystems);
        }
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-900 text-gray-200 font-sans">
            <Sidebar currentView={currentView} setView={handleSetView} />
            <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 transition-all duration-300">
                <Header onSearch={handleSearch} onToggleAi={toggleAiPanel} />
                <div className="mt-8">
                {currentView === View.Dashboard && <DashboardView />}
                {currentView !== View.Dashboard && <SystemsGridView currentView={currentView} searchTerm={searchTerm} />}
                </div>
            </main>
            <AiAssistant isOpen={isAiPanelOpen} onClose={toggleAiPanel} />
            <Notifications />
        </div>
    );
};

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <SettingsProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </SettingsProvider>
    </NotificationProvider>
  );
};

export default App;