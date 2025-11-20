
import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
  n8nApiUrl: string;
  n8nApiKey: string;
}

interface SettingsContextProps {
  settings: Settings | null;
  saveSettings: (settings: Settings) => void;
  isConfigured: boolean;
}

export const SettingsContext = createContext<SettingsContextProps>({} as SettingsContextProps);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('n8n-dashboard-settings');
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        if (parsedSettings.n8nApiUrl && parsedSettings.n8nApiKey) {
            setSettings(parsedSettings);
        } else {
             // Invalid stored settings, use defaults
             setDefaults();
        }
      } else {
          // No settings found, use defaults from configuration
          setDefaults();
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
      setDefaults();
    } finally {
        setIsLoaded(true);
    }
  }, []);

  const setDefaults = () => {
      // Defaults derived from user provided configuration
      // Explicitly setting the provided key
      const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjYyNzU3Yy1hMzFmLTQ2ZDYtYWFhMy1mNjNmYWM2ZDBhNzQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYzNjcxMTYyfQ.kx5oTvNmSavbQGAlpBDeSjTFp_omy1bDev2CXumY4XY';
      
      const defaultSettings = {
          n8nApiUrl: 'http://localhost:5678/api/v1',
          n8nApiKey: apiKey
      };
      setSettings(defaultSettings);
  };

  const saveSettings = (newSettings: Settings) => {
    try {
      localStorage.setItem('n8n-dashboard-settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  };

  if (!isLoaded) {
      return null; 
  }

  return (
    <SettingsContext.Provider value={{ settings, saveSettings, isConfigured: !!settings?.n8nApiUrl && !!settings?.n8nApiKey }}>
      {children}
    </SettingsContext.Provider>
  );
};
