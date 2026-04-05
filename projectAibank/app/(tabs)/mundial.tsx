import { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, TextInput,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';

// ─── DATOS DEL PARTIDO (dinámico — cambia aquí para otro partido) ───────────
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

const FORMA_COLOR: Record<'G' | 'E' | 'P', string> = {
  G: '#b2c5ff',
  E: '#424655',
  P: '#ffb4ab',
};

export default function MundialScreen() {
  const [userId, setUserId] = useState<number | null>(null);
  const [userMailes, setUserMailes] = useState(0);
  const [ligaBadge, setLigaBadge] = useState('Liga Plata · Medalla 3');
  const [golesLocal, setGolesLocal] = useState(1);
  const [golesVisitante, setGolesVisitante] = useState(0);
  const [prediccionEnviada, setPrediccionEnviada] = useState(false);
  const [prediccionPrevia, setPrediccionPrevia] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [rachaActiva, setRachaActiva] = useState(false);
  const [mostrarPrediccion, setMostrarPrediccion] = useState(false);

  // Chatbot
  const [chatMessages, setChatMessages] = useState<{ role: 'bot' | 'user'; text: string }[]>([
    { role: 'bot', text: '¡Hola! Soy tu AI Coach ⚽. Pronto podré analizar el partido y darte recomendaciones para tu predicción.' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadUser();
  }, []);

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
    }

    // Buscar predicción previa para este partido
    if (data) {
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

      // Verificar racha (últimas predicciones correctas)
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
    if (!userId) {
      Alert.alert('Error', 'No se pudo identificar tu usuario');
      return;
    }
    if (prediccionEnviada) {
      Alert.alert('Ya predijiste', 'Solo puedes enviar una predicción por partido');
      return;
    }

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
      Alert.alert(
        '¡Predicción confirmada! ⚽',
        `${PARTIDO.local.nombre} ${golesLocal} - ${golesVisitante} ${PARTIDO.visitante.nombre}\n\nGanarás hasta ${(PARTIDO.recompensas.marcadorExacto + (rachaActiva ? PARTIDO.recompensas.rachaBono : 0)).toLocaleString()} mAiles si aciertas.`,
        [{ text: 'Perfecto', style: 'default' }]
      );
    } catch (err: any) {
      // Si la tabla no existe aún, mostrar confirmación de todas formas (demo)
      setPrediccionEnviada(true);
      Alert.alert(
        '¡Predicción registrada! ⚽',
        `${PARTIDO.local.nombre} ${golesLocal} - ${golesVisitante} ${PARTIDO.visitante.nombre}`,
      );
    } finally {
      setSubmitting(false);
    }
  }

  function sendChatMessage() {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { role: 'bot', text: '🔧 El AI Coach estará disponible próximamente. ¡Estamos integrándolo!' },
      ]);
      chatRef.current?.scrollToEnd({ animated: true });
    }, 600);
  }

  const totalRecompensa = PARTIDO.recompensas.marcadorExacto + (rachaActiva ? PARTIDO.recompensas.rachaBono : 0);

  return (
    <SafeAreaView style={s.root}>
      {/* ── Top Nav ── */}
      <View style={s.topNav}>
        <View style={s.topNavLeft}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/index')} style={s.backBtn}>
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
        >
          {/* ── Hero: Partido ── */}
          <View style={s.heroCard}>
            {/* Countdown badge */}
            <View style={s.countdownBadge}>
              <Text style={s.countdownText}>⏱ Predicción cierra en {PARTIDO.cierrePrediccion}</Text>
            </View>

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
              <TouchableOpacity
                style={s.predecirBtn}
                onPress={() => setMostrarPrediccion(true)}
              >
                <Text style={s.predecirBtnText}>⚽ Predecir resultado</Text>
              </TouchableOpacity>
              <Text style={s.matchQuote}>"Analiza los datos y decide tú"</Text>
            </View>
          </View>

          {/* ── Stats Bento ── */}

          {/* Forma reciente */}
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

          {/* FIFA Ranking + Goles */}
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

          {/* Jugadores Clave */}
          <View style={s.bentoCard}>
            <Text style={s.bentoLabel}>JUGADORES CLAVE</Text>
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
                  <Text style={[s.jugadorStats, { textAlign: 'right', color: '#8c90a1' }]}>{PARTIDO.visitante.jugadorClave.stats}</Text>
                </View>
                <View style={[s.jugadorAvatar, { borderColor: '#424655' }]}>
                  <Text style={s.jugadorEmoji}>{PARTIDO.visitante.bandera}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* H2H */}
          <View style={s.bentoCard}>
            <Text style={s.bentoLabel}>CARA A CARA (H2H)</Text>
            <View style={s.h2hBar}>
              <View style={[s.h2hSegment, { flex: PARTIDO.h2h.ganados, backgroundColor: '#b2c5ff' }]} />
              <View style={[s.h2hSegment, { flex: PARTIDO.h2h.empates, backgroundColor: '#424655' }]} />
              <View style={[s.h2hSegment, { flex: PARTIDO.h2h.perdidos, backgroundColor: '#2a3548' }]} />
            </View>
            <View style={s.h2hLabels}>
              <Text style={s.h2hLabel}>{PARTIDO.h2h.ganados} Ganados</Text>
              <Text style={[s.h2hLabel, { color: '#8c90a1' }]}>{PARTIDO.h2h.empates} Empates</Text>
              <Text style={[s.h2hLabel, { color: '#424655' }]}>{PARTIDO.h2h.perdidos} Perdidos</Text>
            </View>
          </View>

          {/* ── Chatbot AI Coach ── */}
          <View style={s.chatSection}>
            <View style={s.chatHeader}>
              <Text style={s.chatHeaderIcon}>🤖</Text>
              <View>
                <Text style={s.chatTitle}>AI Coach</Text>
                <Text style={s.chatSub}>Próximamente disponible</Text>
              </View>
              <View style={s.chatComingSoon}>
                <Text style={s.chatComingSoonText}>Beta</Text>
              </View>
            </View>

            <ScrollView
              ref={chatRef}
              style={s.chatMessages}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => chatRef.current?.scrollToEnd({ animated: true })}
            >
              {chatMessages.map((msg, i) => (
                <View
                  key={i}
                  style={[
                    s.chatBubble,
                    msg.role === 'user' ? s.chatBubbleUser : s.chatBubbleBot,
                  ]}
                >
                  <Text style={msg.role === 'user' ? s.chatTextUser : s.chatTextBot}>
                    {msg.text}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={s.chatInputRow}>
              <TextInput
                style={s.chatInput}
                placeholder="Pregunta al AI Coach..."
                placeholderTextColor="#424655"
                value={chatInput}
                onChangeText={setChatInput}
                onSubmitEditing={sendChatMessage}
                returnKeyType="send"
              />
              <TouchableOpacity style={s.chatSendBtn} onPress={sendChatMessage}>
                <Text style={s.chatSendIcon}>↑</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Espacio para sticky bottom */}
          <View style={{ height: 260 }} />
        </ScrollView>

        {/* ── Sticky Bottom: Predicción ── */}
        {mostrarPrediccion && (
        <View style={s.stickyBottom}>
          <TouchableOpacity
            onPress={() => setMostrarPrediccion(false)}
            style={{ position: 'absolute', top: 12, right: 16, zIndex: 10, width: 28, height: 28, borderRadius: 14, backgroundColor: '#1f2a3d', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: '#8c90a1', fontSize: 16, fontWeight: '700' }}>✕</Text>
          </TouchableOpacity>
          {/* Steppers */}
          <View style={s.steppersRow}>
            {/* Local */}
            <View style={s.stepperCol}>
              <Text style={s.stepperFlag}>{PARTIDO.local.bandera}</Text>
              <View style={s.stepperBox}>
                <TouchableOpacity
                  style={s.stepperBtn}
                  onPress={() => !prediccionEnviada && setGolesLocal(Math.max(0, golesLocal - 1))}
                  disabled={prediccionEnviada}
                >
                  <Text style={s.stepperBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={s.stepperValue}>{golesLocal}</Text>
                <TouchableOpacity
                  style={s.stepperBtn}
                  onPress={() => !prediccionEnviada && setGolesLocal(golesLocal + 1)}
                  disabled={prediccionEnviada}
                >
                  <Text style={s.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={s.stepperDash}>—</Text>

            {/* Visitante */}
            <View style={s.stepperCol}>
              <Text style={s.stepperFlag}>{PARTIDO.visitante.bandera}</Text>
              <View style={s.stepperBox}>
                <TouchableOpacity
                  style={s.stepperBtn}
                  onPress={() => !prediccionEnviada && setGolesVisitante(Math.max(0, golesVisitante - 1))}
                  disabled={prediccionEnviada}
                >
                  <Text style={s.stepperBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={s.stepperValue}>{golesVisitante}</Text>
                <TouchableOpacity
                  style={s.stepperBtn}
                  onPress={() => !prediccionEnviada && setGolesVisitante(golesVisitante + 1)}
                  disabled={prediccionEnviada}
                >
                  <Text style={s.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Rewards preview */}
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

          {/* CTA */}
          <TouchableOpacity
            style={[s.ctaBtn, prediccionEnviada && s.ctaBtnDone]}
            onPress={confirmarPrediccion}
            disabled={prediccionEnviada || submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#002b73" />
            ) : (
              <Text style={s.ctaBtnText}>
                {prediccionEnviada
                  ? `✓ Predicción enviada · ${golesLocal}-${golesVisitante}`
                  : 'Confirmar predicción ⭐'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
        )}
      </KeyboardAvoidingView>

      {/* ── Bottom Nav ── */}
      <View style={s.bottomNav}>
        <TouchableOpacity style={s.navItem} onPress={() => router.replace('/(tabs)/index')}>
          <Text style={s.navIcon}>🏠</Text>
          <Text style={s.navLabel}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem} onPress={() => router.replace('/(tabs)/banco')}>
          <Text style={s.navIcon}>🏦</Text>
          <Text style={s.navLabel}>Banco</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navCenter}>
          <View style={[s.navCenterBtn, s.navCenterBtnActive]}>
            <Text style={s.navCenterIcon}>⚽</Text>
          </View>
          <Text style={s.navCenterLabelActive}>Mundial</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem} onPress={() => router.replace('/(tabs)/grupo')}>
          <Text style={s.navIcon}>👥</Text>
          <Text style={s.navLabel}>Grupo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem} onPress={() => router.replace('/(tabs)/perfil')}>
          <Text style={s.navIcon}>👤</Text>
          <Text style={s.navLabel}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#071325' },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },

  // Top Nav
  topNav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: '#071325', borderBottomWidth: 0.5, borderBottomColor: '#1f2a3d',
  },
  topNavLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#101c2e', alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: '#b2c5ff', fontSize: 18, fontWeight: '700' },
  topNavTitle: { color: '#b2c5ff', fontSize: 18, fontWeight: '800' },
  topNavSub: { color: 'rgba(215,227,252,0.5)', fontSize: 10, fontWeight: '500', marginTop: 1 },
  topNavRight: { alignItems: 'flex-end' },
  ligaText: { color: '#b2c5ff', fontSize: 12, fontWeight: '700' },
  medalText: { color: '#d7e3fc', fontSize: 10, fontWeight: '500' },

  // Hero Card
  heroCard: {
    backgroundColor: '#101c2e', borderRadius: 20, padding: 20,
    marginBottom: 12, borderWidth: 0.5, borderColor: '#1f2a3d',
    shadowColor: '#b2c5ff', shadowOpacity: 0.08, shadowRadius: 20,
  },
  countdownBadge: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255,214,91,0.1)', borderWidth: 1, borderColor: 'rgba(255,214,91,0.2)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 16,
  },
  countdownText: { color: '#ffd65b', fontSize: 10, fontWeight: '700' },
  teamsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  teamCol: { alignItems: 'center', gap: 8, flex: 1 },
  flagCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#2a3548',
  },
  flagEmoji: { fontSize: 44 },
  teamName: { color: '#d7e3fc', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  vsCol: { alignItems: 'center', gap: 4 },
  vsText: { color: '#424655', fontSize: 11, fontWeight: '600' },
  vsDivider: { width: 24, height: 1, backgroundColor: '#424655' },
  matchInfoRow: { alignItems: 'center', gap: 2 },
  matchEstadio: { color: '#8c90a1', fontSize: 11, fontWeight: '500' },
  matchFecha: { color: 'rgba(215,227,252,0.5)', fontSize: 10 },
  matchQuote: { color: '#ffb59d', fontSize: 11, fontStyle: 'italic', marginTop: 8 },

  // Bento
  bentoCard: {
    backgroundColor: '#101c2e', borderRadius: 16, padding: 16,
    marginBottom: 10, borderWidth: 0.5, borderColor: '#1f2a3d',
  },
  bentoRow: { flexDirection: 'row', gap: 10, marginBottom: 0 },
  bentoHalf: { flex: 1, marginBottom: 10 },
  bentoLabel: { color: '#8c90a1', fontSize: 9, fontWeight: '700', letterSpacing: 1.2, marginBottom: 10 },

  // Forma
  formaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  formaDots: { flexDirection: 'row', gap: 6 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  rachaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  rachaBadge: { backgroundColor: 'rgba(178,197,255,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  rachaBadgeMuted: { backgroundColor: '#1f2a3d' },
  rachaBadgeText: { color: '#b2c5ff', fontSize: 9, fontWeight: '700' },
  rachaBadgeTextMuted: { color: '#8c90a1', fontSize: 9, fontWeight: '700' },

  // Ranking
  rankRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  rankBig: { color: '#d7e3fc', fontSize: 24, fontWeight: '800' },
  rankVs: { color: '#424655', fontSize: 10 },
  rankSmall: { color: '#8c90a1', fontSize: 18, fontWeight: '700' },

  // Jugadores
  jugadoresRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  jugadorLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  jugadorRight: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'flex-end' },
  jugadorAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: 'rgba(178,197,255,0.3)', backgroundColor: '#1f2a3d', alignItems: 'center', justifyContent: 'center' },
  jugadorEmoji: { fontSize: 22 },
  jugadorNombre: { color: '#d7e3fc', fontSize: 13, fontWeight: '700' },
  jugadorStats: { color: '#b2c5ff', fontSize: 10, marginTop: 1 },

  // H2H
  h2hBar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  h2hSegment: { height: '100%' },
  h2hLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  h2hLabel: { color: '#b2c5ff', fontSize: 10, fontWeight: '600' },

  // Chatbot
  chatSection: {
    backgroundColor: '#101c2e', borderRadius: 20, padding: 16,
    marginBottom: 12, borderWidth: 0.5, borderColor: '#1f2a3d',
  },
  chatHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  chatHeaderIcon: { fontSize: 24 },
  chatTitle: { color: '#d7e3fc', fontSize: 15, fontWeight: '800' },
  chatSub: { color: '#8c90a1', fontSize: 10 },
  chatComingSoon: { marginLeft: 'auto', backgroundColor: 'rgba(178,197,255,0.1)', borderWidth: 1, borderColor: 'rgba(178,197,255,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  chatComingSoonText: { color: '#b2c5ff', fontSize: 9, fontWeight: '700' },
  chatMessages: { maxHeight: 160, marginBottom: 10 },
  chatBubble: { borderRadius: 12, padding: 10, marginBottom: 6, maxWidth: '85%' },
  chatBubbleBot: { backgroundColor: '#1f2a3d', alignSelf: 'flex-start' },
  chatBubbleUser: { backgroundColor: '#b2c5ff', alignSelf: 'flex-end' },
  chatTextBot: { color: '#d7e3fc', fontSize: 12, lineHeight: 18 },
  chatTextUser: { color: '#002b73', fontSize: 12, fontWeight: '600' },
  chatInputRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  chatInput: {
    flex: 1, backgroundColor: '#1f2a3d', borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 10, color: '#d7e3fc', fontSize: 13,
    borderWidth: 0.5, borderColor: '#424655',
  },
  chatSendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#b2c5ff', alignItems: 'center', justifyContent: 'center' },
  chatSendIcon: { color: '#002b73', fontSize: 18, fontWeight: '800' },

  // Sticky Bottom
  stickyBottom: {
    position: 'absolute', bottom: 72, left: 0, right: 0,
    backgroundColor: 'rgba(7,19,37,0.97)',
    borderTopWidth: 0.5, borderTopColor: '#1f2a3d',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12,
  },
  steppersRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  stepperCol: { alignItems: 'center', gap: 8 },
  stepperFlag: { fontSize: 28 },
  stepperBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1f2a3d', borderRadius: 12, padding: 4 },
  stepperBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  stepperBtnText: { color: '#b2c5ff', fontSize: 22, fontWeight: '700' },
  stepperValue: { color: '#d7e3fc', fontSize: 24, fontWeight: '800', width: 40, textAlign: 'center' },
  stepperDash: { color: '#424655', fontSize: 28, fontWeight: '200' },
  rewardsCard: { backgroundColor: 'rgba(3,14,32,0.5)', borderRadius: 14, padding: 12, marginBottom: 12 },
  rewardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  rewardBorder: { borderTopWidth: 0.5, borderTopColor: '#1f2a3d', paddingTop: 8, marginTop: 4 },
  rewardLabel: { color: '#8c90a1', fontSize: 11 },
  rewardGold: { color: '#ffd65b', fontSize: 11, fontWeight: '700' },
  rewardBlue: { color: '#b2c5ff', fontSize: 11, fontWeight: '700' },
  rewardRacha: { color: '#ffb59d', fontSize: 11, fontWeight: '700' },
  ctaBtn: {
    height: 52, borderRadius: 14,
    backgroundColor: '#b2c5ff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#5b8cff', shadowOpacity: 0.3, shadowRadius: 12,
  },
  ctaBtnDone: { backgroundColor: '#1f2a3d', borderWidth: 1, borderColor: '#b2c5ff' },
  ctaBtnText: { color: '#002b73', fontSize: 15, fontWeight: '800' },

  // Bottom Nav
  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(7,19,37,0.97)', flexDirection: 'row',
    justifyContent: 'space-around', alignItems: 'center',
    paddingVertical: 10, paddingBottom: 20,
    borderTopWidth: 0.5, borderTopColor: '#1f2a3d',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    height: 72,
  },
  navItem: { alignItems: 'center', gap: 2 },
  navIcon: { fontSize: 22, opacity: 0.45 },
  navLabel: { color: '#d7e3fc', fontSize: 9, fontWeight: '500', opacity: 0.45 },
  navCenter: { alignItems: 'center', marginTop: -18 },
  navCenterBtn: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#1f2a3d', alignItems: 'center', justifyContent: 'center', marginBottom: 2, borderWidth: 2.5, borderColor: '#071325' },
  navCenterBtnActive: { backgroundColor: '#b2c5ff' },
  navCenterIcon: { fontSize: 24 },
  navCenterLabelActive: { color: '#b2c5ff', fontSize: 9, fontWeight: '700' },
  predecirBtn: {
    backgroundColor: '#b2c5ff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 10,
  },
  predecirBtnText: {
    color: '#002b73',
    fontWeight: '800',
    fontSize: 13,
  },
});

