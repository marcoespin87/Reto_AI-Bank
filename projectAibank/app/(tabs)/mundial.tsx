import { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert,
  KeyboardAvoidingView, Platform, ActivityIndicator, Animated,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import ChatbotModal from '../../components/ChatbotModal';
import { useTheme } from '../../context/ThemeContext';
import BottomNav from '../../components/BottomNav';

// ─── DATOS DEL PARTIDO ───────────────────────────────────────────────────────
const PARTIDO = {
  id: 'ecua-civ-2026',
  fase: 'Fase de Grupos',
  jornada: 'Jornada 1',
  cierrePrediccion: '2h 48m',
  estadio: 'Estadio AT&T, Dallas',
  fecha: '15 de Junio',
  hora: '18:00',
  local: {
    nombre: 'Ecuador',
    bandera: '🇪🇨',
    alias: 'ECU',
    ranking: 41,
    goles: { anotados: 4, recibidos: 3 },
    forma: ['G', 'G', 'E', 'G', 'P'] as Array<'G' | 'E' | 'P'>,
    jugadorClave: { nombre: 'Enner Valencia', stats: '5 goles mundialistas' },
    racha: 'En racha',
  },
  visitante: {
    nombre: 'Costa de Marfil',
    bandera: '🇨🇮',
    alias: 'CIV',
    ranking: 52,
    goles: { anotados: 3, recibidos: 2 },
    forma: ['G', 'E', 'G', 'G', 'P'] as Array<'G' | 'E' | 'P'>,
    jugadorClave: { nombre: 'Sébastien Haller', stats: '2 goles • 1 asistencia' },
    racha: 'Irregular',
  },
  h2h: { ganados: 3, empates: 2, perdidos: 4 },
  recompensas: {
    marcadorExacto: 1000,
    ganadorCorrecto: 300,
    rachaBono: 200,
  },
};

export default function MundialScreen() {
  const { colors } = useTheme();
  const [userId, setUserId] = useState<number | null>(null);
  const [userMailes, setUserMailes] = useState(0);
  const [golesLocal, setGolesLocal] = useState(1);
  const [golesVisitante, setGolesVisitante] = useState(0);
  const [prediccionEnviada, setPrediccionEnviada] = useState(false);
  const [prediccionPrevia, setPrediccionPrevia] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [rachaActiva, setRachaActiva] = useState(false);
  const [mostrarPrediccion, setMostrarPrediccion] = useState(false);
  const [chatbotVisible, setChatbotVisible] = useState(false);

  // Animación parpadeo countdown
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.5, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => { loadUser(); }, []);

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('users')
      .select('id, mailes_acumulados, nombre')
      .eq('email', user.email)
      .single();

    if (data) {
      setUserId(data.id);
      setUserMailes(data.mailes_acumulados || 0);

      const { data: pred } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', data.id)
        .eq('partido_id', PARTIDO.id)
        .single();

      if (pred) {
        setPrediccionEnviada(true);
        setPrediccionPrevia(pred);
        setGolesLocal(pred.goles_local);
        setGolesVisitante(pred.goles_visitante);
      }

      const { data: preds } = await supabase
        .from('predictions')
        .select('estado')
        .eq('user_id', data.id)
        .eq('estado', 'correcto')
        .order('created_at', { ascending: false })
        .limit(3);

      if (preds && preds.length >= 2) setRachaActiva(true);
    }
  }

  async function confirmarPrediccion() {
    if (!userId) { Alert.alert('Error', 'No se pudo identificar tu usuario'); return; }
    if (prediccionEnviada) { Alert.alert('Ya predijiste', 'Solo puedes enviar una predicción por partido'); return; }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('predictions').insert({
        user_id: userId,
        partido_id: PARTIDO.id,
        equipo_local: PARTIDO.local.nombre,
        equipo_visitante: PARTIDO.visitante.nombre,
        goles_local: golesLocal,
        goles_visitante: golesVisitante,
        estado: 'pendiente',
        mailes_apostados: 0,
        fase: PARTIDO.fase,
      });
      if (error) throw error;
      setPrediccionEnviada(true);
      Alert.alert('¡Predicción confirmada! ⚽', `${PARTIDO.local.nombre} ${golesLocal} - ${golesVisitante} ${PARTIDO.visitante.nombre}\n\nGanarás hasta ${(PARTIDO.recompensas.marcadorExacto + (rachaActiva ? PARTIDO.recompensas.rachaBono : 0)).toLocaleString()} mAiles si aciertas.`, [{ text: 'Perfecto', style: 'default' }]);
    } catch {
      setPrediccionEnviada(true);
      Alert.alert('¡Predicción registrada! ⚽', `${PARTIDO.local.nombre} ${golesLocal} - ${golesVisitante} ${PARTIDO.visitante.nombre}`);
    } finally {
      setSubmitting(false);
    }
  }

  const FORMA_COLOR: Record<'G' | 'E' | 'P', string> = {
    G: colors.formaWin,
    E: colors.formaDraw,
    P: colors.formaLoss,
  };

  const s = getStyles(colors);

  return (
    <SafeAreaView style={s.root}>
      {/* Top Nav */}
      <View style={s.topNav}>
        <View style={s.topNavLeft}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={s.backBtn}>
            <Text style={s.backIcon}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={s.topNavTitle}>Predicción</Text>
            <Text style={s.topNavSub}>{PARTIDO.fase} · {PARTIDO.jornada}</Text>
          </View>
        </View>
        <View style={s.topNavRight}>
          <Text style={s.ligaText}>Liga Plata</Text>
          <Text style={s.medalText}>Medalla 3</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* Hero Card */}
          <View style={s.heroCard}>
            {/* Countdown badge — animado */}
            <Animated.View style={[s.countdownBadge, { opacity: pulseAnim }]}>
              <Text style={s.countdownText}>⏱ Predicción cierra en {PARTIDO.cierrePrediccion}</Text>
            </Animated.View>

            {/* Teams */}
            <View style={s.teamsRow}>
              <View style={s.teamCol}>
                <View style={s.flagCircle}>
                  <Text style={s.flagEmoji}>{PARTIDO.local.bandera}</Text>
                </View>
                <Text style={s.teamName}>{PARTIDO.local.nombre}</Text>
              </View>
              <View style={s.vsCol}>
                <Text style={s.vsText}>VS</Text>
                <View style={s.vsDivider} />
              </View>
              <View style={s.teamCol}>
                <View style={s.flagCircle}>
                  <Text style={s.flagEmoji}>{PARTIDO.visitante.bandera}</Text>
                </View>
                <Text style={s.teamName}>{PARTIDO.visitante.nombre}</Text>
              </View>
            </View>

            {/* Match info */}
            <View style={s.matchInfoRow}>
              <Text style={s.matchEstadio}>{PARTIDO.estadio}</Text>
              <Text style={s.matchFecha}>{PARTIDO.fecha} · {PARTIDO.hora}</Text>
              <TouchableOpacity style={s.predecirBtn} onPress={() => setMostrarPrediccion(true)}>
                <Text style={s.predecirBtnText}>⚽ Predecir resultado</Text>
              </TouchableOpacity>
              <Text style={s.matchQuote}>"Analiza los datos y decide tú"</Text>
            </View>
          </View>

          {/* Bento: Forma reciente */}
          <View style={s.bentoCard}>
            <Text style={s.bentoLabel}>FORMA RECIENTE</Text>
            <View style={s.formaRow}>
              <View style={s.formaDots}>
                {PARTIDO.local.forma.map((r, i) => (
                  <View key={i} style={[s.dot, { backgroundColor: FORMA_COLOR[r] }]} />
                ))}
              </View>
              <View style={s.formaDots}>
                {PARTIDO.visitante.forma.map((r, i) => (
                  <View key={i} style={[s.dot, { backgroundColor: FORMA_COLOR[r] }]} />
                ))}
              </View>
            </View>
            <View style={s.rachaRow}>
              <View style={s.rachaBadge}>
                <Text style={s.rachaBadgeText}>{PARTIDO.local.racha}</Text>
              </View>
              <View style={[s.rachaBadge, s.rachaBadgeMuted]}>
                <Text style={s.rachaBadgeTextMuted}>{PARTIDO.visitante.racha}</Text>
              </View>
            </View>
          </View>

          {/* Bento: FIFA Ranking + Goles */}
          <View style={s.bentoRow}>
            <View style={[s.bentoCard, s.bentoHalf]}>
              <Text style={s.bentoLabel}>FIFA RANKING</Text>
              <View style={s.rankRow}>
                <Text style={s.rankBig}>#{PARTIDO.local.ranking}</Text>
                <Text style={s.rankVs}> vs </Text>
                <Text style={s.rankSmall}>#{PARTIDO.visitante.ranking}</Text>
              </View>
            </View>
            <View style={[s.bentoCard, s.bentoHalf]}>
              <Text style={s.bentoLabel}>GOLES (A:R)</Text>
              <View style={s.rankRow}>
                <Text style={s.rankBig}>{PARTIDO.local.goles.anotados}:{PARTIDO.local.goles.recibidos}</Text>
                <Text style={s.rankVs}> vs </Text>
                <Text style={s.rankSmall}>{PARTIDO.visitante.goles.anotados}:{PARTIDO.visitante.goles.recibidos}</Text>
              </View>
            </View>
          </View>

          {/* Bento: Jugadores Clave */}
          <View style={s.bentoCard}>
            <Text style={s.bentoLabel}>JUGADORES CLAVE 🏆</Text>
            <View style={s.jugadoresRow}>
              <View style={s.jugadorLeft}>
                <View style={s.jugadorAvatar}>
                  <Text style={s.jugadorEmoji}>{PARTIDO.local.bandera}</Text>
                </View>
                <View>
                  <Text style={s.jugadorNombre}>{PARTIDO.local.jugadorClave.nombre}</Text>
                  <Text style={s.jugadorStats}>{PARTIDO.local.jugadorClave.stats}</Text>
                </View>
              </View>
              <View style={s.jugadorRight}>
                <View>
                  <Text style={[s.jugadorNombre, { textAlign: 'right', opacity: 0.7 }]}>{PARTIDO.visitante.jugadorClave.nombre}</Text>
                  <Text style={[s.jugadorStats, { textAlign: 'right' }]}>{PARTIDO.visitante.jugadorClave.stats}</Text>
                </View>
                <View style={[s.jugadorAvatar, { borderColor: colors.borderStrong }]}>
                  <Text style={s.jugadorEmoji}>{PARTIDO.visitante.bandera}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Bento: H2H */}
          <View style={s.bentoCard}>
            <Text style={s.bentoLabel}>CARA A CARA (H2H)</Text>
            <View style={s.h2hBar}>
              <View style={[s.h2hSegment, { flex: PARTIDO.h2h.ganados, backgroundColor: colors.primary }]} />
              <View style={[s.h2hSegment, { flex: PARTIDO.h2h.empates, backgroundColor: colors.textMuted }]} />
              <View style={[s.h2hSegment, { flex: PARTIDO.h2h.perdidos, backgroundColor: colors.borderMedium }]} />
            </View>
            <View style={s.h2hLabels}>
              <Text style={s.h2hLabel}>{PARTIDO.h2h.ganados} Ganados</Text>
              <Text style={[s.h2hLabel, { color: colors.textSecondary }]}>{PARTIDO.h2h.empates} Empates</Text>
              <Text style={[s.h2hLabel, { color: colors.textMuted }]}>{PARTIDO.h2h.perdidos} Perdidos</Text>
            </View>
          </View>

          <View style={{ height: 260 }} />
        </ScrollView>

        {/* Sticky Bottom: Predicción */}
        {mostrarPrediccion && (
          <View style={s.stickyBottom}>
            <TouchableOpacity
              onPress={() => setMostrarPrediccion(false)}
              style={s.closeBtn}
            >
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>

            <View style={s.steppersRow}>
              <View style={s.stepperCol}>
                <Text style={s.stepperFlag}>{PARTIDO.local.bandera}</Text>
                <View style={s.stepperBox}>
                  <TouchableOpacity style={s.stepperBtn} onPress={() => !prediccionEnviada && setGolesLocal(Math.max(0, golesLocal - 1))} disabled={prediccionEnviada}>
                    <Text style={s.stepperBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={s.stepperValue}>{golesLocal}</Text>
                  <TouchableOpacity style={s.stepperBtn} onPress={() => !prediccionEnviada && setGolesLocal(golesLocal + 1)} disabled={prediccionEnviada}>
                    <Text style={s.stepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={s.stepperDash}>—</Text>

              <View style={s.stepperCol}>
                <Text style={s.stepperFlag}>{PARTIDO.visitante.bandera}</Text>
                <View style={s.stepperBox}>
                  <TouchableOpacity style={s.stepperBtn} onPress={() => !prediccionEnviada && setGolesVisitante(Math.max(0, golesVisitante - 1))} disabled={prediccionEnviada}>
                    <Text style={s.stepperBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={s.stepperValue}>{golesVisitante}</Text>
                  <TouchableOpacity style={s.stepperBtn} onPress={() => !prediccionEnviada && setGolesVisitante(golesVisitante + 1)} disabled={prediccionEnviada}>
                    <Text style={s.stepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={s.rewardsCard}>
              <View style={s.rewardRow}>
                <Text style={s.rewardLabel}>Marcador exacto</Text>
                <Text style={s.rewardGold}>+{PARTIDO.recompensas.marcadorExacto.toLocaleString()} mAiles</Text>
              </View>
              <View style={s.rewardRow}>
                <Text style={s.rewardLabel}>Ganador correcto</Text>
                <Text style={s.rewardBlue}>+{PARTIDO.recompensas.ganadorCorrecto} mAiles</Text>
              </View>
              {rachaActiva && (
                <View style={[s.rewardRow, s.rewardBorder]}>
                  <Text style={s.rewardRacha}>Racha activa 🔥</Text>
                  <Text style={s.rewardRacha}>+{PARTIDO.recompensas.rachaBono} mAiles extra</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[s.ctaBtn, prediccionEnviada && s.ctaBtnDone]}
              onPress={confirmarPrediccion}
              disabled={prediccionEnviada || submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#002b73" />
              ) : (
                <Text style={[s.ctaBtnText, prediccionEnviada && { color: colors.primary }]}>
                  {prediccionEnviada ? `✓ Predicción enviada · ${golesLocal}-${golesVisitante}` : 'Confirmar predicción ⭐'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* FAB Chatbot */}
      {!mostrarPrediccion && (
        <TouchableOpacity style={s.chatFab} onPress={() => setChatbotVisible(true)}>
          <Text style={s.chatFabIcon}>🤖</Text>
        </TouchableOpacity>
      )}

      <ChatbotModal visible={chatbotVisible} onClose={() => setChatbotVisible(false)} />

      <BottomNav active="mundial" />
    </SafeAreaView>
  );
}

function getStyles(colors: ReturnType<typeof import('../../context/ThemeContext').useTheme>['colors']) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingHorizontal: 16, paddingTop: 8 },

    topNav: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 20, paddingVertical: 14,
      backgroundColor: colors.background,
      borderBottomWidth: 0.5, borderBottomColor: colors.borderMedium,
    },
    topNavLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    backBtn: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: colors.backgroundSecondary,
      alignItems: 'center', justifyContent: 'center',
    },
    backIcon: { color: colors.primary, fontSize: 18, fontWeight: '700' },
    topNavTitle: { color: colors.primary, fontSize: 18, fontWeight: '800' },
    topNavSub: { color: colors.textSecondary, fontSize: 10, fontWeight: '500', marginTop: 1 },
    topNavRight: { alignItems: 'flex-end' },
    ligaText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
    medalText: { color: colors.textPrimary, fontSize: 10, fontWeight: '500' },

    // Hero Card — premium
    heroCard: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 20, padding: 20, marginBottom: 12,
      borderWidth: 0.5, borderColor: colors.borderMedium,
      shadowColor: colors.shadowColorBlue,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 20,
      elevation: 6,
    },
    countdownBadge: {
      alignSelf: 'flex-end',
      backgroundColor: colors.errorDim,
      borderWidth: 1, borderColor: colors.error,
      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 16,
    },
    countdownText: { color: colors.error, fontSize: 10, fontWeight: '700' },
    teamsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    teamCol: { alignItems: 'center', gap: 8, flex: 1 },
    flagCircle: {
      width: 64, height: 64, borderRadius: 32,
      backgroundColor: colors.cardBackground,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1.5, borderColor: colors.borderMedium,
    },
    flagEmoji: { fontSize: 44 },
    teamName: { color: colors.textPrimary, fontSize: 16, fontWeight: '800', textAlign: 'center' },
    vsCol: { alignItems: 'center', gap: 4 },
    vsText: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
    vsDivider: { width: 24, height: 1, backgroundColor: colors.borderStrong },
    matchInfoRow: { alignItems: 'center', gap: 2 },
    matchEstadio: { color: colors.textSecondary, fontSize: 11, fontWeight: '500' },
    matchFecha: { color: colors.textSecondary, fontSize: 10 },
    matchQuote: { color: colors.warning, fontSize: 11, fontStyle: 'italic', marginTop: 8 },
    predecirBtn: {
      backgroundColor: colors.gold,
      borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, marginTop: 12,
      shadowColor: colors.goldShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 6,
    },
    predecirBtnText: { color: colors.textOnGold, fontWeight: '800', fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5 },

    // Bento
    bentoCard: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 16, padding: 16, marginBottom: 10,
      borderWidth: 0.5, borderColor: colors.borderMedium,
    },
    bentoRow: { flexDirection: 'row', gap: 10 },
    bentoHalf: { flex: 1, marginBottom: 10 },
    bentoLabel: { color: colors.textSecondary, fontSize: 9, fontWeight: '700', letterSpacing: 1.2, marginBottom: 10 },

    formaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    formaDots: { flexDirection: 'row', gap: 6 },
    dot: { width: 12, height: 12, borderRadius: 6 },
    rachaRow: { flexDirection: 'row', justifyContent: 'space-between' },
    rachaBadge: {
      backgroundColor: colors.primaryDim,
      paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
    },
    rachaBadgeMuted: { backgroundColor: colors.cardBackground },
    rachaBadgeText: { color: colors.primary, fontSize: 9, fontWeight: '700' },
    rachaBadgeTextMuted: { color: colors.textSecondary, fontSize: 9, fontWeight: '700' },

    rankRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
    rankBig: { color: colors.textPrimary, fontSize: 24, fontWeight: '800' },
    rankVs: { color: colors.textMuted, fontSize: 10 },
    rankSmall: { color: colors.textSecondary, fontSize: 18, fontWeight: '700' },

    jugadoresRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    jugadorLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    jugadorRight: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'flex-end' },
    jugadorAvatar: {
      width: 40, height: 40, borderRadius: 20,
      borderWidth: 2, borderColor: colors.primaryBorder,
      backgroundColor: colors.cardBackground,
      alignItems: 'center', justifyContent: 'center',
    },
    jugadorEmoji: { fontSize: 22 },
    jugadorNombre: { color: colors.textPrimary, fontSize: 13, fontWeight: '700' },
    jugadorStats: { color: colors.primary, fontSize: 10, marginTop: 1 },

    h2hBar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
    h2hSegment: { height: '100%' },
    h2hLabels: { flexDirection: 'row', justifyContent: 'space-between' },
    h2hLabel: { color: colors.primary, fontSize: 10, fontWeight: '600' },

    chatFab: {
      position: 'absolute', bottom: 80, right: 20,
      width: 52, height: 52, borderRadius: 26,
      backgroundColor: colors.cardBackground,
      borderWidth: 1.5, borderColor: colors.primary,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: colors.shadowColorBlue,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: 8,
    },
    chatFabIcon: { fontSize: 24 },

    stickyBottom: {
      position: 'absolute', bottom: 72, left: 0, right: 0,
      backgroundColor: colors.background,
      borderTopWidth: 0.5, borderTopColor: colors.borderMedium,
      borderTopLeftRadius: 24, borderTopRightRadius: 24,
      paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12,
    },
    closeBtn: {
      position: 'absolute', top: 12, right: 16, zIndex: 10,
      width: 28, height: 28, borderRadius: 14,
      backgroundColor: colors.cardBackground,
      alignItems: 'center', justifyContent: 'center',
    },
    closeBtnText: { color: colors.textSecondary, fontSize: 16, fontWeight: '700' },
    steppersRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    stepperCol: { alignItems: 'center', gap: 8 },
    stepperFlag: { fontSize: 28 },
    stepperBox: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.cardBackground, borderRadius: 12, padding: 4,
    },
    stepperBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    stepperBtnText: { color: colors.primary, fontSize: 22, fontWeight: '700' },
    stepperValue: { color: colors.textPrimary, fontSize: 24, fontWeight: '800', width: 40, textAlign: 'center' },
    stepperDash: { color: colors.textMuted, fontSize: 28, fontWeight: '200' },
    rewardsCard: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 14, padding: 12, marginBottom: 12,
    },
    rewardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    rewardBorder: { borderTopWidth: 0.5, borderTopColor: colors.borderMedium, paddingTop: 8, marginTop: 4 },
    rewardLabel: { color: colors.textSecondary, fontSize: 11 },
    rewardGold: { color: colors.gold, fontSize: 11, fontWeight: '700' },
    rewardBlue: { color: colors.primary, fontSize: 11, fontWeight: '700' },
    rewardRacha: { color: colors.warning, fontSize: 11, fontWeight: '700' },
    ctaBtn: {
      height: 52, borderRadius: 16,
      backgroundColor: colors.gold,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: colors.goldShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 6,
    },
    ctaBtnDone: {
      backgroundColor: colors.cardBackground,
      borderWidth: 1, borderColor: colors.primary,
    },
    ctaBtnText: { color: colors.textOnGold, fontSize: 15, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },

  });
}
