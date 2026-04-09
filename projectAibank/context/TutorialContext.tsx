import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TUTORIAL_KEY = 'tutorial_v1';

interface TutorialContextValue {
  mostrar: boolean;
  listo: boolean;
  completar: () => Promise<void>;
  resetear: () => Promise<void>;
}

const TutorialContext = createContext<TutorialContextValue>({
  mostrar: false,
  listo: false,
  completar: async () => {},
  resetear: async () => {},
});

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [mostrar, setMostrar] = useState(false);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(TUTORIAL_KEY).then(val => {
      if (!val) setMostrar(true);
      setListo(true);
    });
  }, []);

  async function completar() {
    await AsyncStorage.setItem(TUTORIAL_KEY, 'done');
    setMostrar(false);
  }

  async function resetear() {
    await AsyncStorage.removeItem(TUTORIAL_KEY);
    setMostrar(true);
  }

  return (
    <TutorialContext.Provider value={{ mostrar, listo, completar, resetear }}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  return useContext(TutorialContext);
}