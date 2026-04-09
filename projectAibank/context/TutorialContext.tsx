import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TutorialContextValue {
  mostrar: boolean;
  listo: boolean;
  pasoInicial: number;
  mostrarMenu: boolean;
  completar: () => Promise<void>;
  resetear: () => Promise<void>;
  iniciarDesde: (paso: number) => void;
  setMostrarMenu: (v: boolean) => void;
  verificarParaUsuario: (userId: number) => Promise<void>;
}

const TutorialContext = createContext<TutorialContextValue>({
  mostrar: false, listo: false, pasoInicial: 0, mostrarMenu: false,
  completar: async () => {}, resetear: async () => {},
  iniciarDesde: () => {}, setMostrarMenu: () => {},
  verificarParaUsuario: async () => {},
});

let tutorialKey = 'tutorial_v1';

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [mostrar, setMostrar]         = useState(false);
  const [listo, setListo]             = useState(false);
  const [pasoInicial, setPasoInicial] = useState(0);
  const [mostrarMenu, setMostrarMenu] = useState(false);

  // Se llama desde index.tsx cuando ya tenemos el userId
  async function verificarParaUsuario(userId: number) {
    tutorialKey = `tutorial_v1_${userId}`;
    const val = await AsyncStorage.getItem(tutorialKey);
    if (!val) setMostrar(true);
    setListo(true);
  }

  async function completar() {
    await AsyncStorage.setItem(tutorialKey, 'done');
    setMostrar(false);
    setPasoInicial(0);
  }

  async function resetear() {
    await AsyncStorage.removeItem(tutorialKey);
  }

  function iniciarDesde(paso: number) {
    setMostrar(false);  // primero apaga
    setPasoInicial(paso);
    setMostrarMenu(false);
    setTimeout(() => setMostrar(true), 50);
  }

  return (
    <TutorialContext.Provider value={{
      mostrar, listo, pasoInicial, mostrarMenu,
      completar, resetear, iniciarDesde, setMostrarMenu,
      verificarParaUsuario,
    }}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  return useContext(TutorialContext);
}