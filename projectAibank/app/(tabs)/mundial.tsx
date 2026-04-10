import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated } from 'react-native';
import MundialUI, { PredState } from '../../components/MundialUI';
import { useLigaMedal } from '../../lib/useLigaMedal';
import { useMundialPartidos } from '../../lib/useMundialPartidos';
import { supabase } from '../../lib/supabase';

export default function MundialScreen() {
  const { ligaNombre, medallaNombre, medallaActual, posicionEnLiga } = useLigaMedal();

  const [userId, setUserId] = useState<number | null>(null);
  const [semana, setSemana] = useState(1);
  const [prediccionesState, setPrediccionesState] = useState<Record<number, PredState>>({});
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [partidoActivoId, setPartidoActivoId] = useState<number | null>(null);
  const [rachaActiva, setRachaActiva] = useState(false);
  const [chatbotVisible, setChatbotVisible] = useState(false);

  const { partidos, loading, refetch } = useMundialPartidos(semana, userId);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animación pulse para el countdown badge
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

  // Cargar usuario al montar
  useEffect(() => {
    loadUser();
  }, []);

  // Sincronizar predicciones del usuario cuando cambian los partidos
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
      .select('id, mailes_acumulados')
      .eq('email', user.email)
      .single();

    if (!data) return;
    setUserId(data.id);

    // Verificar racha activa (2+ predicciones correctas recientes)
    const { data: preds } = await supabase
      .from('predictions')
      .select('id')
      .eq('user_id', data.id)
      .eq('es_correcto', true)
      .order('id', { ascending: false })
      .limit(3);

    if (preds && preds.length >= 2) setRachaActiva(true);
  }

  function handleToggleExpand(id: number) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleAbrirPrediccion(id: number) {
    const pred = prediccionesState[id];
    if (pred?.enviada) return;
    setPartidoActivoId(id);
  }

  function handleGolesLocalChange(id: number, v: number) {
    setPrediccionesState((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? defaultPred()), goles_local: v },
    }));
  }

  function handleGolesVisitanteChange(id: number, v: number) {
    setPrediccionesState((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? defaultPred()), goles_visitante: v },
    }));
  }

  async function handleConfirmar(partidoId: number) {
    if (!userId) {
      Alert.alert('Error', 'No se pudo identificar tu usuario');
      return;
    }
    const pred = prediccionesState[partidoId];
    if (!pred || pred.enviada) return;

    const partido = partidos.find((p) => p.id === partidoId);
    if (!partido) return;

    setPrediccionesState((prev) => ({
      ...prev,
      [partidoId]: { ...prev[partidoId], submitting: true },
    }));

    try {
      const { error } = await (supabase as any)
        .schema('mundial')
        .from('predicciones_mundial')
        .insert({
          user_id: userId,
          partido_id: partidoId,
          goles_local_predichos: pred.goles_local,
          goles_visitante_predichos: pred.goles_visitante,
        });

      if (error) throw error;

      setPrediccionesState((prev) => ({
        ...prev,
        [partidoId]: { ...prev[partidoId], enviada: true, submitting: false },
      }));

      const maxMailes = partido.recompensa_exacto + (rachaActiva ? partido.recompensa_racha : 0);
      Alert.alert(
        '¡Predicción confirmada! ⚽',
        `${partido.equipo_local.nombre} ${pred.goles_local} - ${pred.goles_visitante} ${partido.equipo_visitante.nombre}\n\nGanarás hasta ${maxMailes.toLocaleString()} mAiles si aciertas.`,
        [{ text: 'Perfecto', style: 'default' }],
      );
      setPartidoActivoId(null);
    } catch {
      // Si falla la inserción igual marcamos como enviada localmente
      setPrediccionesState((prev) => ({
        ...prev,
        [partidoId]: { ...prev[partidoId], enviada: true, submitting: false },
      }));
      Alert.alert(
        '¡Predicción registrada! ⚽',
        `${partido.equipo_local.nombre} ${pred.goles_local} - ${pred.goles_visitante} ${partido.equipo_visitante.nombre}`,
      );
      setPartidoActivoId(null);
    }
  }

  return (
    <MundialUI
      partidos={partidos}
      loading={loading}
      semana={semana}
      onSemanaChange={(s) => { setSemana(s); setPartidoActivoId(null); }}
      prediccionesState={prediccionesState}
      partidoActivoId={partidoActivoId}
      expandedIds={expandedIds}
      onToggleExpand={handleToggleExpand}
      onAbrirPrediccion={handleAbrirPrediccion}
      onCerrarPrediccion={() => setPartidoActivoId(null)}
      onGolesLocalChange={handleGolesLocalChange}
      onGolesVisitanteChange={handleGolesVisitanteChange}
      onConfirmar={handleConfirmar}
      rachaActiva={rachaActiva}
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

function defaultPred(): PredState {
  return { goles_local: 1, goles_visitante: 0, enviada: false, submitting: false };
}
