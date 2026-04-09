import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useTutorial() {
  const [mostrar, setMostrar] = useState(false);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('tutorial_v1').then(val => {
      if (!val) setMostrar(true);
      setListo(true);
    });
  }, []);

  async function completar() {
    await AsyncStorage.setItem('tutorial_v1', 'done');
    setMostrar(false);
  }

  async function resetear() {
    await AsyncStorage.removeItem('tutorial_v1');
    setMostrar(true);
  }

  return { mostrar, listo, completar, resetear };
}