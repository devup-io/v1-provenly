/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserSettings, patchUserSettings } from '@/lib/api';
import type { UserSettings } from '@/types/api';

interface SettingsContextValue {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  reloadSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<UserSettings>({});

  const load = async () => {
    try {
      const data = await getUserSettings();
      setSettings(data);
    } catch (e) {
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    try {
      const newSettings = await patchUserSettings(updates);
      setSettings(newSettings);
    } catch (e) {
      throw e;
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, reloadSettings: load }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};
