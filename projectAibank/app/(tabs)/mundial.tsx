import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import MundialUI, { PredState } from '../../components/MundialUI';
import { useLigaMedal } from '../../lib/useLigaMedal';
import { useMundialPartidos } from '../../lib/useMundialPartidos';
import { useMundialSemanas } from '../../lib/useMundialSemanas';
import { getSemanaActual } from '../../lib/getSemanaActual';
import { supabase } from '../../lib/supabase';

export default function MundialScreen() {
  const { ligaNombre, posicionEnLiga } = useLigaMedal();
  const { semanas } = useMundialSemanas();

  const [userId, setUserId] = useState<number | null>(null);
  const semanaActual = getSemanaActual();
  const [semana, setSemana] = useState(semanaActual);
  const [prediccionesState, setPrediccionesState] = useState<Record<number, PredState>>({});
  const [chatbotVisible, setChatbotVisible] = useState(false);

  const { partidos, loading, error } = useMundialPartidos(semana, userId);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.5, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (!partidos.length) return;
    setPrediccionesState((prev) => {
      const next = { ...prev };
      for (const p of partidos) {
        if (p.prediccion_usuario && !next[p.id]) {
          next[p.id] = {
            goles_local: p.prediccion_usuario.goles_local,
            goles_visitante: p.prediccion_usuario.goles_visitante,
            enviada: true,
            submitting: false,
          };
        } else if (!next[p.id]) {
          next[p.id] = { goles_local: 1, goles_visitante: 0, enviada: false, submitting: false };
        }
      }
      return next;
    });
  }, [partidos]);

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (data) setUserId(data.id);
  }

  function handleVerDetalle(partidoId: number) {
    router.push(`/mundial-partido?id=${partidoId}` as any);
  }

  // Banner de error visible en pantalla para diagnóstico
  if (error && !loading && partidos.length === 0) {
    console.error('[MundialScreen] error:', error);
  }

  return (
    <MundialUI
      partidos={partidos}
      loading={loading}
      error={error}
      semanas={semanas}
      semana={semana}
      semanaActual={semanaActual}
      onSemanaChange={(s) => setSemana(s)}
      prediccionesState={prediccionesState}
      onVerDetalle={handleVerDetalle}
      chatbotVisible={chatbotVisible}
      onOpenChatbot={() => setChatbotVisible(true)}
      onCloseChatbot={() => setChatbotVisible(false)}
      pulseAnim={pulseAnim}
      ligaNombre={ligaNombre}
      posicionEnLiga={posicionEnLiga}
      onBack={() => router.replace('/(tabs)')}
    />
  );
}
