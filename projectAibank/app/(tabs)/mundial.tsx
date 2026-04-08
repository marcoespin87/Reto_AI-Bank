import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import ChatbotModal from '../../components/ChatbotModal';
import { useTheme } from '../../context/ThemeContext';

const PARTIDO = {
  id: 'ecua-civ-2026',
  fase: 'Fase de Grupos',
  jornada: 'Jornada 1',
  cierrePrediccion: '2h 48m',
  estadio: 'Estadio AT&T, Dallas',
  fecha: '15 de Junio',
  hora: '18:00',
  local: {
    nombre: 'Ecuador', bandera: '🇪🇨', alias: 'ECU', ranking: 41,
    goles: { anotados: 4, recibidos: 3 },
    forma: ['G', 'G', 'E', 'G', 'P'] as Array<'G' | 'E' | 'P'>,
    jugadorClave: { nombre: 'Enner Valencia', stats: '5 goles mundialistas' },
    racha: 'En racha',
  },
  visitante: {
    nombre: 'Costa de Marfil', bandera: '🇨🇮', alias: 'CIV', ranking: 52,
    goles: { anotados: 3, recibidos: 2 },
    forma: ['G', 'E', 'G', 'G', 'P'] as Array<'G' | 'E' | 'P'>,
    jugadorClave: { nombre: 'Sébastien Haller', stats: '2 goles • 1 asistencia' },
    racha: 'Irregular',
  },
  h2h: { ganados: 3, empates: 2, perdidos: 4 },
  recompensas: { marcadorExacto: 1000, ganadorCorrecto: 300, rachaBono: 200 },
};

const FORMA_COLOR: Record<'G' | 'E' | 'P', string> = {
  G: '#b2c5ff', E: '#424655', P: '#ffb4ab',
};

export default function MundialScreen() {
  const { colors } = useTheme();
  const [userId, setUserId] = useState<number | null>(null);
  const [golesLocal, setGolesLocal] = useState(1);
  const [golesVisitante, setGolesVisitante] = useState(0);
  const [prediccionEnviada, setPrediccionEnviada] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rachaActiva, setRachaActiva] = useState(false);
  const [mostrarPrediccion, setMostrarPrediccion] = useState(false);
  const [chatbotVisible, setChatbotVisible] = useState(false);

  useEffect(() => { loadUser(); }, []);

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('users').select('id, mailes_acumulados, nombre')
      .eq('email', user.email).single();
    if (data) {
      setUserId(data.id);
      const { data: pred } = await supabase
        .from('predictions').select('*')
        .eq('user_id', data.id).eq('partido_id', PARTIDO.id).single();
      if (pred) {
        setPrediccionEnviada(true);
        setGolesLocal(pred.goles_local);
        setGolesVisitante(pred.goles_visitante);
      }
      const { data: preds } = await supabase
        .from('predictions').select('estado')
        .eq('user_id', data.id).eq('estado', 'correcto')
        .order('created_at', { ascending: false }).limit(3);
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
      Alert.alert('¡Predicción confirmada! ⚽',
        `${PARTIDO.local.nombre} ${golesLocal} - ${golesVisitante} ${PARTIDO.visitante.nombre}\n\nGanarás hasta ${(PARTIDO.recompensas.marcadorExacto + (rachaActiva ? PARTIDO.recompensas.rachaBono : 0)).toLocaleString()} mAiles si aciertas.`,
        [{ text: 'Perfecto', style: 'default' }]
      );
    } catch {
      setPrediccionEnviada(true);
      Alert.alert('¡Predicción registrada! ⚽', `${PARTIDO.local.nombre} ${golesLocal} - ${golesVisitante} ${PARTIDO.visitante.nombre}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.background }]}>
      {/* Top Nav */}
      <View style={[s.topNav, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={s.topNavLeft}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/index')} style={[s.backBtn, { backgroundColor: colors.surface }]}>
            <Text style={[s.backIcon, { color: colors.primary }]}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={[s.topNavTitle, { color: colors.primary }]}>Predicción</Text>
            <Text style={[s.topNavSub, { color: colors.textSecondary }]}>{PARTIDO.fase} · {PARTIDO.jornada}</Text>
          </View>
        </View>
        <View style={s.topNavRight}>
          <Text style={[s.ligaText, { color: colors.primary }]}>Liga Plata</Text>
          <Text style={[s.medalText, { color: colors.textSecondary }]}>Medalla 3</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* Hero */}
          <View style={[s.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={s.countdownBadge}>
              <Text style={s.countdownText}>⏱ Predicción cierra en {PARTIDO.cierrePrediccion}</Text>
            </View>
            <View style={s.teamsRow}>
              <View style={s.teamCol}>
                <View style={[s.flagCircle, { borderColor: colors.border }]}>
                  <Text style={s.flagEmoji}>{PARTIDO.local.bandera}</Text>
                </View>
                <Text style={[s.teamName, { color: colors.textPrimary }]}>{PARTIDO.local.nombre}</Text>
              </View>
              <View style={s.vsCol}>
                <Text style={[s.vsText, { color: colors.textMuted }]}>VS</Text>
                <View style={[s.vsDivider, { backgroundColor: colors.border }]} />
              </View>
              <View style={s.teamCol}>
                <View style={[s.flagCircle, { borderColor: colors.border }]}>
                  <Text style={s.flagEmoji}>{PARTIDO.visitante.bandera}</Text>
                </View>
                <Text style={[s.teamName, { color: colors.textPrimary }]}>{PARTIDO.visitante.nombre}</Text>
              </View>
            </View>
            <View style={s.matchInfoRow}>
              <Text style={[s.matchEstadio, { color: colors.textSecondary }]}>{PARTIDO.estadio}</Text>
              <Text style={[s.matchFecha, { color: colors.textMuted }]}>{PARTIDO.fecha} · {PARTIDO.hora}</Text>
              <TouchableOpacity style={[s.predecirBtn, { backgroundColor: colors.primary }]} onPress={() => setMostrarPrediccion(true)}>
                <Text style={[s.predecirBtnText, { color: colors.cardText }]}>⚽ Predecir resultado</Text>
              </TouchableOpacity>
              <Text style={s.matchQuote}>"Analiza los datos y decide tú"</Text>
            </View>
          </View>

          {/* Forma reciente */}
          <View style={[s.bentoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[s.bentoLabel, { color: colors.textSecondary }]}>FORMA RECIENTE</Text>
            <View style={s.formaRow}>
              <View style={s.formaDots}>
                {PARTIDO.local.forma.map((r, i) => <View key={i} style={[s.dot, { backgroundColor: FORMA_COLOR[r] }]} />)}
              </View>
              <View style={s.formaDots}>
                {PARTIDO.visitante.forma.map((r, i) => <View key={i} style={[s.dot, { backgroundColor: FORMA_COLOR[r] }]} />)}
              </View>
            </View>
            <View style={s.rachaRow}>
              <View style={[s.rachaBadge, { backgroundColor: `${colors.primary}20` }]}>
                <Text style={[s.rachaBadgeText, { color: colors.primary }]}>{PARTIDO.local.racha}</Text>
              </View>
              <View style={[s.rachaBadge, { backgroundColor: colors.surfaceHigh }]}>
                <Text style={[s.rachaBadgeTextMuted, { color: colors.textSecondary }]}>{PARTIDO.visitante.racha}</Text>
              </View>
            </View>
          </View>

          {/* FIFA + Goles */}
          <View style={s.bentoRow}>
            <View style={[s.bentoCard, s.bentoHalf, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.bentoLabel, { color: colors.textSecondary }]}>FIFA RANKING</Text>
              <View style={s.rankRow}>
                <Text style={[s.rankBig, { color: colors.textPrimary }]}>#{PARTIDO.local.ranking}</Text>
                <Text style={[s.rankVs, { color: colors.textMuted }]}> vs </Text>
                <Text style={[s.rankSmall, { color: colors.textSecondary }]}>#{PARTIDO.visitante.ranking}</Text>
              </View>
            </View>
            <View style={[s.bentoCard, s.bentoHalf, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.bentoLabel, { color: colors.textSecondary }]}>GOLES (A:R)</Text>
              <View style={s.rankRow}>
                <Text style={[s.rankBig, { color: colors.textPrimary }]}>{PARTIDO.local.goles.anotados}:{PARTIDO.local.goles.recibidos}</Text>
                <Text style={[s.rankVs, { color: colors.textMuted }]}> vs </Text>
                <Text style={[s.rankSmall, { color: colors.textSecondary }]}>{PARTIDO.visitante.goles.anotados}:{PARTIDO.visitante.goles.recibidos}</Text>
              </View>
            </View>
          </View>

          {/* Jugadores Clave */}
          <View style={[s.bentoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[s.bentoLabel, { color: colors.textSecondary }]}>JUGADORES CLAVE</Text>
            <View style={s.jugadoresRow}>
              <View style={s.jugadorLeft}>
                <View style={[s.jugadorAvatar, { borderColor: `${colors.primary}50`, backgroundColor: colors.surfaceHigh }]}>
                  <Text style={s.jugadorEmoji}>{PARTIDO.local.bandera}</Text>
                </View>
                <View>
                  <Text style={[s.jugadorNombre, { color: colors.textPrimary }]}>{PARTIDO.local.jugadorClave.nombre}</Text>
                  <Text style={[s.jugadorStats, { color: colors.primary }]}>{PARTIDO.local.jugadorClave.stats}</Text>
                </View>
              </View>
              <View style={s.jugadorRight}>
                <View>
                  <Text style={[s.jugadorNombre, { textAlign: 'right', opacity: 0.7, color: colors.textPrimary }]}>{PARTIDO.visitante.jugadorClave.nombre}</Text>
                  <Text style={[s.jugadorStats, { textAlign: 'right', color: colors.textSecondary }]}>{PARTIDO.visitante.jugadorClave.stats}</Text>
                </View>
                <View style={[s.jugadorAvatar, { borderColor: colors.border, backgroundColor: colors.surfaceHigh }]}>
                  <Text style={s.jugadorEmoji}>{PARTIDO.visitante.bandera}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* H2H */}
          <View style={[s.bentoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[s.bentoLabel, { color: colors.textSecondary }]}>CARA A CARA (H2H)</Text>
            <View style={s.h2hBar}>
              <View style={[s.h2hSegment, { flex: PARTIDO.h2h.ganados, backgroundColor: colors.primary }]} />
              <View style={[s.h2hSegment, { flex: PARTIDO.h2h.empates, backgroundColor: colors.border }]} />
              <View style={[s.h2hSegment, { flex: PARTIDO.h2h.perdidos, backgroundColor: colors.surfaceHigh }]} />
            </View>
            <View style={s.h2hLabels}>
              <Text style={[s.h2hLabel, { color: colors.primary }]}>{PARTIDO.h2h.ganados} Ganados</Text>
              <Text style={[s.h2hLabel, { color: colors.textSecondary }]}>{PARTIDO.h2h.empates} Empates</Text>
              <Text style={[s.h2hLabel, { color: colors.textMuted }]}>{PARTIDO.h2h.perdidos} Perdidos</Text>
            </View>
          </View>

          <View style={{ height: 260 }} />
        </ScrollView>

        {/* Sticky Bottom Predicción */}
        {mostrarPrediccion && (
          <View style={[s.stickyBottom, { backgroundColor: colors.navBg, borderTopColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => setMostrarPrediccion(false)}
              style={[s.closeBtn, { backgroundColor: colors.surfaceHigh }]}
            >
              <Text style={[s.closeBtnText, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
            <View style={s.steppersRow}>
              <View style={s.stepperCol}>
                <Text style={s.stepperFlag}>{PARTIDO.local.bandera}</Text>
                <View style={[s.stepperBox, { backgroundColor: colors.surfaceHigh }]}>
                  <TouchableOpacity style={s.stepperBtn} onPress={() => !prediccionEnviada && setGolesLocal(Math.max(0, golesLocal - 1))} disabled={prediccionEnviada}>
                    <Text style={[s.stepperBtnText, { color: colors.primary }]}>−</Text>
                  </TouchableOpacity>
                  <Text style={[s.stepperValue, { color: colors.textPrimary }]}>{golesLocal}</Text>
                  <TouchableOpacity style={s.stepperBtn} onPress={() => !prediccionEnviada && setGolesLocal(golesLocal + 1)} disabled={prediccionEnviada}>
                    <Text style={[s.stepperBtnText, { color: colors.primary }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={[s.stepperDash, { color: colors.textMuted }]}>—</Text>
              <View style={s.stepperCol}>
                <Text style={s.stepperFlag}>{PARTIDO.visitante.bandera}</Text>
                <View style={[s.stepperBox, { backgroundColor: colors.surfaceHigh }]}>
                  <TouchableOpacity style={s.stepperBtn} onPress={() => !prediccionEnviada && setGolesVisitante(Math.max(0, golesVisitante - 1))} disabled={prediccionEnviada}>
                    <Text style={[s.stepperBtnText, { color: colors.primary }]}>−</Text>
                  </TouchableOpacity>
                  <Text style={[s.stepperValue, { color: colors.textPrimary }]}>{golesVisitante}</Text>
                  <TouchableOpacity style={s.stepperBtn} onPress={() => !prediccionEnviada && setGolesVisitante(golesVisitante + 1)} disabled={prediccionEnviada}>
                    <Text style={[s.stepperBtnText, { color: colors.primary }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={[s.rewardsCard, { backgroundColor: `${colors.surfaceHigh}80` }]}>
              <View style={s.rewardRow}>
                <Text style={[s.rewardLabel, { color: colors.textSecondary }]}>Marcador exacto</Text>
                <Text style={s.rewardGold}>+{PARTIDO.recompensas.marcadorExacto.toLocaleString()} mAiles</Text>
              </View>
              <View style={s.rewardRow}>
                <Text style={[s.rewardLabel, { color: colors.textSecondary }]}>Ganador correcto</Text>
                <Text style={[s.rewardBlue, { color: colors.primary }]}>+{PARTIDO.recompensas.ganadorCorrecto} mAiles</Text>
              </View>
              {rachaActiva && (
                <View style={[s.rewardRow, s.rewardBorder, { borderTopColor: colors.border }]}>
                  <Text style={s.rewardRacha}>Racha activa 🔥</Text>
                  <Text style={s.rewardRacha}>+{PARTIDO.recompensas.rachaBono} mAiles extra</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[s.ctaBtn, { backgroundColor: colors.primary }, prediccionEnviada && { backgroundColor: colors.surfaceHigh, borderWidth: 1, borderColor: colors.primary }]}
              onPress={confirmarPrediccion}
              disabled={prediccionEnviada || submitting}
            >
              {submitting ? (
                <ActivityIndicator color={colors.cardText} />
              ) : (
                <Text style={[s.ctaBtnText, { color: prediccionEnviada ? colors.primary : colors.cardText }]}>
                  {prediccionEnviada ? `✓ Predicción enviada · ${golesLocal}-${golesVisitante}` : 'Confirmar predicción ⭐'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* FAB Chatbot */}
      {!mostrarPrediccion && (
        <TouchableOpacity style={[s.chatFab, { backgroundColor: colors.surface, borderColor: colors.primary }]} onPress={() => setChatbotVisible(true)}>
          <Text style={s.chatFabIcon}>🤖</Text>
        </TouchableOpacity>
      )}

      <ChatbotModal visible={chatbotVisible} onClose={() => setChatbotVisible(false)} />

      {/* Bottom Nav */}
      <View style={[s.bottomNav, { backgroundColor: colors.navBg, borderTopColor: colors.border }]}>
        <TouchableOpacity style={s.navItem} onPress={() => router.replace('/(tabs)/index')}>
          <Text style={s.navIcon}>🏠</Text>
          <Text style={[s.navLabel, { color: colors.textSecondary }]}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem} onPress={() => router.replace('/(tabs)/banco')}>
          <Text style={s.navIcon}>🏦</Text>
          <Text style={[s.navLabel, { color: colors.textSecondary }]}>Banco</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navCenter}>
          <View style={[s.navCenterBtn, s.navCenterBtnActive, { backgroundColor: colors.primary, borderColor: colors.background }]}>
            <Text style={s.navCenterIcon}>⚽</Text>
          </View>
          <Text style={[s.navCenterLabelActive, { color: colors.primary }]}>Mundial</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem} onPress={() => router.replace('/(tabs)/grupo')}>
          <Text style={s.navIcon}>👥</Text>
          <Text style={[s.navLabel, { color: colors.textSecondary }]}>Grupo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem} onPress={() => router.replace('/(tabs)/perfil')}>
          <Text style={s.navIcon}>👤</Text>
          <Text style={[s.navLabel, { color: colors.textSecondary }]}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 0.5 },
  topNavLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 18, fontWeight: '700' },
  topNavTitle: { fontSize: 18, fontWeight: '800' },
  topNavSub: { fontSize: 10, fontWeight: '500', marginTop: 1 },
  topNavRight: { alignItems: 'flex-end' },
  ligaText: { fontSize: 12, fontWeight: '700' },
  medalText: { fontSize: 10, fontWeight: '500' },
  heroCard: { borderRadius: 20, padding: 20, marginBottom: 12, borderWidth: 0.5 },
  countdownBadge: { alignSelf: 'flex-end', backgroundColor: 'rgba(255,214,91,0.1)', borderWidth: 1, borderColor: 'rgba(255,214,91,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 16 },
  countdownText: { color: '#ffd65b', fontSize: 10, fontWeight: '700' },
  teamsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  teamCol: { alignItems: 'center', gap: 8, flex: 1 },
  flagCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  flagEmoji: { fontSize: 44 },
  teamName: { fontSize: 16, fontWeight: '800', textAlign: 'center' },
  vsCol: { alignItems: 'center', gap: 4 },
  vsText: { fontSize: 11, fontWeight: '600' },
  vsDivider: { width: 24, height: 1 },
  matchInfoRow: { alignItems: 'center', gap: 2 },
  matchEstadio: { fontSize: 11, fontWeight: '500' },
  matchFecha: { fontSize: 10 },
  matchQuote: { color: '#ffb59d', fontSize: 11, fontStyle: 'italic', marginTop: 8 },
  predecirBtn: { borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, marginTop: 10 },
  predecirBtnText: { fontWeight: '800', fontSize: 13 },
  bentoCard: { borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 0.5 },
  bentoRow: { flexDirection: 'row', gap: 10 },
  bentoHalf: { flex: 1, marginBottom: 10 },
  bentoLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1.2, marginBottom: 10 },
  formaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  formaDots: { flexDirection: 'row', gap: 6 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  rachaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  rachaBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  rachaBadgeText: { fontSize: 9, fontWeight: '700' },
  rachaBadgeTextMuted: { fontSize: 9, fontWeight: '700' },
  rankRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  rankBig: { fontSize: 24, fontWeight: '800' },
  rankVs: { fontSize: 10 },
  rankSmall: { fontSize: 18, fontWeight: '700' },
  jugadoresRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  jugadorLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  jugadorRight: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'flex-end' },
  jugadorAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  jugadorEmoji: { fontSize: 22 },
  jugadorNombre: { fontSize: 13, fontWeight: '700' },
  jugadorStats: { fontSize: 10, marginTop: 1 },
  h2hBar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  h2hSegment: { height: '100%' },
  h2hLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  h2hLabel: { fontSize: 10, fontWeight: '600' },
  chatFab: { position: 'absolute', bottom: 80, right: 20, width: 52, height: 52, borderRadius: 26, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', elevation: 8 },
  chatFabIcon: { fontSize: 24 },
  stickyBottom: { position: 'absolute', bottom: 72, left: 0, right: 0, borderTopWidth: 0.5, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12 },
  closeBtn: { position: 'absolute', top: 12, right: 16, zIndex: 10, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 16, fontWeight: '700' },
  steppersRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  stepperCol: { alignItems: 'center', gap: 8 },
  stepperFlag: { fontSize: 28 },
  stepperBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 4 },
  stepperBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  stepperBtnText: { fontSize: 22, fontWeight: '700' },
  stepperValue: { fontSize: 24, fontWeight: '800', width: 40, textAlign: 'center' },
  stepperDash: { fontSize: 28, fontWeight: '200' },
  rewardsCard: { borderRadius: 14, padding: 12, marginBottom: 12 },
  rewardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  rewardBorder: { borderTopWidth: 0.5, paddingTop: 8, marginTop: 4 },
  rewardLabel: { fontSize: 11 },
  rewardGold: { color: '#ffd65b', fontSize: 11, fontWeight: '700' },
  rewardBlue: { fontSize: 11, fontWeight: '700' },
  rewardRacha: { color: '#ffb59d', fontSize: 11, fontWeight: '700' },
  ctaBtn: { height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  ctaBtnText: { fontSize: 15, fontWeight: '800' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 10, paddingBottom: 20, borderTopWidth: 0.5, borderTopLeftRadius: 24, borderTopRightRadius: 24, height: 72 },
  navItem: { alignItems: 'center', gap: 2 },
  navIcon: { fontSize: 22, opacity: 0.45 },
  navLabel: { fontSize: 9, fontWeight: '500', opacity: 0.45 },
  navCenter: { alignItems: 'center', marginTop: -18 },
  navCenterBtn: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginBottom: 2, borderWidth: 2.5 },
  navCenterBtnActive: {},
  navCenterIcon: { fontSize: 24 },
  navCenterLabelActive: { fontSize: 9, fontWeight: '700' },
});