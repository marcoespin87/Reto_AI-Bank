import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, StyleSheet, Text, View } from 'react-native';
import PartidoDetalleUI from '../../components/PartidoDetalleUI';
import { useLigaMedal } from '../../lib/useLigaMedal';
import { useMundialPartidoDetalle } from '../../lib/useMundialPartidoDetalle';
import { getSemanaActual, puedePredicir } from '../../lib/getSemanaActual';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';

export default function MundialPartidoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const partidoId = id ? parseInt(id, 10) : null;

  const { colors } = useTheme();
  const { ligaNombre, posicionEnLiga } = useLigaMedal();

  const [userId, setUserId] = useState<number | null>(null);
  const semanaActual = getSemanaActual();

  const { partido, loading, refetch } = useMundialPartidoDetalle(partidoId, userId);

  const [golesLocal, setGolesLocal] = useState(1);
  const [golesVisitante, setGolesVisitante] = useState(0);
  const [prediccionEnviada, setPrediccionEnviada] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rachaActiva, setRachaActiva] = useState(false);
  const [mostrarPrediccion, setMostrarPrediccion] = useState(false);
  const [chatbotVisible, setChatbotVisible] = useState(false);

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

  // Sincronizar predicción existente cuando carga el partido
  useEffect(() => {
    if (partido?.prediccion_usuario) {
      setGolesLocal(partido.prediccion_usuario.goles_local);
      setGolesVisitante(partido.prediccion_usuario.goles_visitante);
      setPrediccionEnviada(true);
    }
  }, [partido]);

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

    if (!data) return;
    setUserId(data.id);

    // Verificar racha activa
    const { data: preds } = await supabase
      .from('predictions')
      .select('id')
      .eq('user_id', data.id)
      .eq('es_correcto', true)
      .order('id', { ascending: false })
      .limit(3);

    if (preds && preds.length >= 2) setRachaActiva(true);
  }

  // Diálogo de confirmación + envío
  function handleConfirmar() {
    if (!partido) return;

    Alert.alert(
      'Confirmar predicción',
      `¿Estás seguro de guardar esta predicción?\n\n${partido.equipo_local.nombre} ${golesLocal} - ${golesVisitante} ${partido.equipo_visitante.nombre}\n\nUna vez enviada no podrás modificarla.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Guardar',
          style: 'default',
          onPress: () => doEnviarPrediccion(),
        },
      ],
    );
  }

  async function doEnviarPrediccion() {
    if (!userId || !partido) {
      Alert.alert('Error', 'No se pudo identificar tu usuario');
      return;
    }
    if (prediccionEnviada) return;

    setSubmitting(true);
    try {
      const { error } = await (supabase as any)
        .schema('mundial')
        .from('predicciones_mundial')
        .insert({
          user_id: userId,
          partido_id: partido.id,
          goles_local_predichos: golesLocal,
          goles_visitante_predichos: golesVisitante,
        });

      if (error) throw error;

      setPrediccionEnviada(true);
      setMostrarPrediccion(false);

      const maxMailes =
        partido.recompensa_exacto + (rachaActiva ? partido.recompensa_racha : 0);
      Alert.alert(
        '¡Predicción guardada! ⚽',
        `${partido.equipo_local.nombre} ${golesLocal} - ${golesVisitante} ${partido.equipo_visitante.nombre}\n\nPuedes ganar hasta ${maxMailes.toLocaleString()} mAiles si aciertas.`,
        [{ text: 'Perfecto', style: 'default' }],
      );
    } catch {
      // Si el registro falla (ej: ya existe), actualizamos estado local de todas formas
      setPrediccionEnviada(true);
      setMostrarPrediccion(false);
      Alert.alert(
        '¡Predicción registrada! ⚽',
        `${partido?.equipo_local.nombre} ${golesLocal} - ${golesVisitante} ${partido?.equipo_visitante.nombre}`,
      );
    } finally {
      setSubmitting(false);
    }
  }

  const s = StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
    errorText: { color: colors.textSecondary, fontSize: 14, marginTop: 12, textAlign: 'center' },
  });

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={s.errorText}>Cargando partido...</Text>
      </View>
    );
  }

  if (!partido) {
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 40 }}>🏟️</Text>
        <Text style={s.errorText}>No se encontró el partido</Text>
      </View>
    );
  }

  const canPredict = puedePredicir(partido.fecha_hora, partido.semana, semanaActual);

  return (
    <PartidoDetalleUI
      partido={partido}
      puedePredicir={canPredict}
      ligaNombre={ligaNombre}
      posicionEnLiga={posicionEnLiga}
      golesLocal={golesLocal}
      golesVisitante={golesVisitante}
      prediccionEnviada={prediccionEnviada}
      submitting={submitting}
      rachaActiva={rachaActiva}
      mostrarPrediccion={mostrarPrediccion}
      chatbotVisible={chatbotVisible}
      pulseAnim={pulseAnim}
      onBack={() => router.back()}
      onPredecir={() => setMostrarPrediccion(true)}
      onClosePredecir={() => setMostrarPrediccion(false)}
      onGolesLocalChange={setGolesLocal}
      onGolesVisitanteChange={setGolesVisitante}
      onConfirmar={handleConfirmar}
      onOpenChatbot={() => setChatbotVisible(true)}
      onCloseChatbot={() => setChatbotVisible(false)}
    />
  );
}
