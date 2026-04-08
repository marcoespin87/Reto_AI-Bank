import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Animated } from "react-native";
import MundialUI, { PARTIDO } from "../../components/MundialUI";
import { supabase } from "../../lib/supabase";

export default function MundialScreen() {
  const [userId, setUserId] = useState<number | null>(null);
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
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("users")
      .select("id, mailes_acumulados, nombre")
      .eq("email", user.email)
      .single();

    if (data) {
      setUserId(data.id);

      const { data: pred } = await supabase
        .from("predictions")
        .select("*")
        .eq("user_id", data.id)
        .eq("partido_id", PARTIDO.id)
        .single();

      if (pred) {
        setPrediccionEnviada(true);
        setGolesLocal(pred.goles_local);
        setGolesVisitante(pred.goles_visitante);
      }

      const { data: preds } = await supabase
        .from("predictions")
        .select("estado")
        .eq("user_id", data.id)
        .eq("estado", "correcto")
        .order("created_at", { ascending: false })
        .limit(3);

      if (preds && preds.length >= 2) setRachaActiva(true);
    }
  }

  async function confirmarPrediccion() {
    if (!userId) {
      Alert.alert("Error", "No se pudo identificar tu usuario");
      return;
    }
    if (prediccionEnviada) {
      Alert.alert("Ya predijiste", "Solo puedes enviar una predicción por partido");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("predictions").insert({
        user_id: userId,
        partido_id: PARTIDO.id,
        equipo_local: PARTIDO.local.nombre,
        equipo_visitante: PARTIDO.visitante.nombre,
        goles_local: golesLocal,
        goles_visitante: golesVisitante,
        estado: "pendiente",
        mailes_apostados: 0,
        fase: PARTIDO.fase,
      });
      if (error) throw error;
      setPrediccionEnviada(true);
      Alert.alert(
        "¡Predicción confirmada! ⚽",
        `${PARTIDO.local.nombre} ${golesLocal} - ${golesVisitante} ${PARTIDO.visitante.nombre}\n\nGanarás hasta ${(PARTIDO.recompensas.marcadorExacto + (rachaActiva ? PARTIDO.recompensas.rachaBono : 0)).toLocaleString()} mAiles si aciertas.`,
        [{ text: "Perfecto", style: "default" }],
      );
    } catch {
      setPrediccionEnviada(true);
      Alert.alert(
        "¡Predicción registrada! ⚽",
        `${PARTIDO.local.nombre} ${golesLocal} - ${golesVisitante} ${PARTIDO.visitante.nombre}`,
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <MundialUI
      golesLocal={golesLocal}
      golesVisitante={golesVisitante}
      prediccionEnviada={prediccionEnviada}
      submitting={submitting}
      rachaActiva={rachaActiva}
      mostrarPrediccion={mostrarPrediccion}
      chatbotVisible={chatbotVisible}
      pulseAnim={pulseAnim}
      onBack={() => router.replace("/(tabs)")}
      onPredecir={() => setMostrarPrediccion(true)}
      onClosePredecir={() => setMostrarPrediccion(false)}
      onGolesLocalChange={setGolesLocal}
      onGolesVisitanteChange={setGolesVisitante}
      onConfirmar={confirmarPrediccion}
      onOpenChatbot={() => setChatbotVisible(true)}
      onCloseChatbot={() => setChatbotVisible(false)}
    />
  );
}
