import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, Animated, Dimensions, Image
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const MONTO_DEMO   = 120;
const MAILES_DEMO  = Math.floor(MONTO_DEMO / 100) * 10;
const CROMOS_DEMO  = Math.floor(MONTO_DEMO / 20);

interface Props {
  visible: boolean;
  onCompletar: () => void;
  userName?: string;
}

export default function TutorialInteractivo({ visible, onCompletar, userName = 'Usuario' }: Props) {
  const { colors } = useTheme();
  const [paso, setPaso] = useState(0);

  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(30)).current;
  const mailesAnim = useRef(new Animated.Value(0)).current;
  const cromoScale = useRef(new Animated.Value(0.3)).current;
  const cromoOpac  = useRef(new Animated.Value(0)).current;

  useEffect(() => { if (visible) { setPaso(0); animar(); } }, [visible]);
  useEffect(() => {
    animar();
    if (paso === 1) animarMailes();
    if (paso === 2) animarCromo();
  }, [paso]);

  function animar() {
    fadeAnim.setValue(0); slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }

  function animarMailes() {
    mailesAnim.setValue(0);
    Animated.spring(mailesAnim, { toValue: 1, tension: 55, friction: 7, useNativeDriver: true }).start();
  }

  function animarCromo() {
    cromoScale.setValue(0.3); cromoOpac.setValue(0);
    Animated.parallel([
      Animated.spring(cromoScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.timing(cromoOpac,  { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }

  const PASOS = [
    { titulo: 'Así realizas un pago',        sub: `Paga con tu tarjeta y gana mAiles y cromos`,              boton: 'Ver qué gané →'      },
    { titulo: '¡Ganaste mAiles!',             sub: `$${MONTO_DEMO} pagados → ${MAILES_DEMO} mAiles`,          boton: 'Ver mis cromos →'    },
    { titulo: '¡Ganaste cromos!',             sub: `Cada $20 = 1 cromo. Con $${MONTO_DEMO} → ${CROMOS_DEMO}`, boton: 'Ver mi álbum →'      },
    { titulo: 'Tu álbum Mundial 2026',        sub: 'Completa 28 cromos y entra al sorteo VIP ✈️',             boton: 'Ver predicciones →'  },
    { titulo: 'Predice los partidos',         sub: 'Acierta el marcador exacto y gana hasta 1,000 mAiles',    boton: 'Ver grupos →'        },
    { titulo: 'Únete a un equipo',            sub: 'Compite en grupo y cumplan objetivos para ganar más',     boton: '¡Empezar ahora! 🚀'  },
  ];

  const p = PASOS[paso];
  const esUltimo = paso === PASOS.length - 1;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={s.overlay}>

        {/* Pills de progreso */}
        <View style={[s.pills, { backgroundColor: colors.cardBackground }]}>
          {PASOS.map((_, i) => (
            <View key={i} style={[
              s.pill,
              { backgroundColor: i <= paso ? colors.primary : colors.borderMedium },
              i === paso && { width: 22 },
            ]} />
          ))}
        </View>

        <Animated.View style={[
          s.card,
          { backgroundColor: colors.cardBackgroundAlt, borderColor: colors.borderStrong },
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}>
          {/* Botón X saltar */}
          <TouchableOpacity style={[s.saltarX, { backgroundColor: colors.cardBackground }]} onPress={onCompletar}>
            <Text style={[s.saltarXText, { color: colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={s.pasoHeader}>
            <Text style={[s.pasoTitulo, { color: colors.textPrimary }]}>{p.titulo}</Text>
            <Text style={[s.pasoSub, { color: colors.textSecondary }]}>{p.sub}</Text>
          </View>

          {/* ── PASO 0: Simulación de pago ── */}
          {paso === 0 && (
            <View style={s.contenido}>
              <View style={[s.miniCard, { backgroundColor: colors.primary }]}>
                <View style={s.miniCardPatternCircle} />
                <View style={s.miniCardTop}>
                  <Text style={s.miniCardLabel}>AI-Bank Débito</Text>
                  <Text style={s.miniCardBrand}>mAiles</Text>
                </View>
                <Text style={s.miniSaldo}>Saldo disponible</Text>
                <Text style={s.miniBalance}>$1,500.00</Text>
                <Text style={s.miniCuenta}>1234 5678 9012 3456</Text>
              </View>

              <View style={[s.modalSimulado, { backgroundColor: colors.cardBackground, borderColor: colors.borderStrong }]}>
                <Text style={[s.modalSimuladoTitle, { color: colors.textPrimary }]}>💡 Pagar servicio</Text>
                <Text style={[s.inputLabel, { color: colors.primary }]}>DESCRIPCIÓN</Text>
                <View style={[s.inputFake, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderStrong }]}>
                  <Text style={[s.inputFakeVal, { color: colors.textPrimary }]}>Supermercado Premium</Text>
                </View>
                <Text style={[s.inputLabel, { color: colors.primary }]}>MONTO ($)</Text>
                <View style={[s.inputFake, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderStrong }]}>
                  <Text style={[s.inputFakeVal, { color: colors.primary, fontSize: 22, fontWeight: '800' }]}>${MONTO_DEMO}.00</Text>
                </View>
                <View style={[s.previewMailes, { backgroundColor: colors.goldDim }]}>
                  <Text style={[s.previewMailesText, { color: colors.gold }]}>⭐ Ganarás {MAILES_DEMO} mAiles</Text>
                </View>
                <View style={[s.btnSimulado, { backgroundColor: colors.gold, opacity: 0.8 }]}>
                  <Text style={[s.btnSimuladoText, { color: colors.textOnGold }]}>Confirmar ✦</Text>
                </View>
              </View>
            </View>
          )}

          {/* ── PASO 1: mAiles ganados ── */}
          {paso === 1 && (
            <View style={s.contenido}>
              <Animated.View style={[
                s.mailesContainer,
                { borderColor: colors.goldBorder, backgroundColor: colors.goldDim },
                { transform: [{ scale: mailesAnim }], opacity: mailesAnim },
              ]}>
                <Text style={s.mailesGanIcon}>⭐</Text>
                <Text style={[s.mailesGanNum, { color: colors.gold }]}>+{MAILES_DEMO}</Text>
                <Text style={[s.mailesGanLabel, { color: colors.gold }]}>mAiles ganados</Text>
              </Animated.View>

              <View style={[s.detalleBox, { backgroundColor: colors.cardBackground, borderColor: colors.borderMedium }]}>
                {[
                  { key: 'Monto pagado',    val: `$${MONTO_DEMO}.00`,       valColor: colors.textPrimary },
                  { key: 'Tasa mAiles',     val: '×2 por cada $100',        valColor: colors.primary     },
                  { key: 'Cromos ganados',  val: `${CROMOS_DEMO} cromos 🃏`, valColor: colors.primary     },
                ].map((row, i) => (
                  <View key={i} style={[s.detalleRow, i > 0 && { borderTopWidth: 0.5, borderTopColor: colors.borderMedium }]}>
                    <Text style={[s.detalleKey, { color: colors.textSecondary }]}>{row.key}</Text>
                    <Text style={[s.detalleVal, { color: row.valColor }]}>{row.val}</Text>
                  </View>
                ))}
                <View style={[s.detalleRow, { borderTopWidth: 1, borderTopColor: colors.borderStrong }]}>
                  <Text style={[s.detalleKey, { color: colors.textPrimary, fontWeight: '800' }]}>Total mAiles</Text>
                  <Text style={[s.detalleVal, { color: colors.gold, fontSize: 16 }]}>+{MAILES_DEMO} ⭐</Text>
                </View>
              </View>

              <View style={[s.infoBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderMedium }]}>
                <Text style={[s.infoText, { color: colors.primary }]}>
                  💡 Los mAiles acumulados te suben de medalla y desbloquean beneficios
                </Text>
              </View>
            </View>
          )}

          {/* ── PASO 2: Cromo revelado ── */}
          {paso === 2 && (
            <View style={s.contenido}>
              <Text style={[s.cromosGanados, { color: colors.textSecondary }]}>
                ${MONTO_DEMO} ÷ $20 = {CROMOS_DEMO} cromos ganados
              </Text>

              <Animated.View style={[
                s.cromoCard,
                { borderColor: colors.rarityEpicBorder, backgroundColor: colors.rarityEpicBg },
                { transform: [{ scale: cromoScale }], opacity: cromoOpac },
              ]}>
                <Image
                  source={{ uri: 'https://picsum.photos/seed/valencia/400/530' }}
                  style={s.cromoImg}
                  resizeMode="cover"
                />
                <View style={[s.cromoRarezaBadge, { backgroundColor: colors.rarityEpicBg }]}>
                  <Text style={[s.cromoRarezaText, { color: colors.rarityEpicText }]}>ÉPICO</Text>
                </View>
                <Text style={[s.cromoNombre, { color: colors.rarityEpicText }]}>Enner Valencia</Text>
              </Animated.View>

              <View style={s.rarezaRow}>
                {[
                  { label: 'Común', color: colors.rarityCommonText, pct: '60%' },
                  { label: 'Raro',  color: colors.rarityRareText,   pct: '30%' },
                  { label: 'Épico', color: colors.rarityEpicText,   pct: '10%' },
                ].map(r => (
                  <View key={r.label} style={[s.rarezaItem, { backgroundColor: colors.cardBackground, borderColor: colors.borderMedium }]}>
                    <Text style={[s.rarezaLabel, { color: r.color }]}>{r.label}</Text>
                    <Text style={[s.rarezaPct, { color: colors.textMuted }]}>{r.pct}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── PASO 3: Álbum ── */}
          {paso === 3 && (
            <View style={s.contenido}>
              <View style={[s.albumProgress, { backgroundColor: colors.cardBackground, borderColor: colors.borderMedium }]}>
                <View style={s.albumProgressHeader}>
                  <Text style={[s.albumNum, { color: colors.gold }]}>1</Text>
                  <Text style={[s.albumTotal, { color: colors.textSecondary }]}>/ 28 cromos</Text>
                </View>
                <View style={[s.progressBar, { backgroundColor: colors.borderMedium }]}>
                  <View style={[s.progressFill, { width: `${(1/28)*100}%`, backgroundColor: colors.primary }]} />
                </View>
                <Text style={[s.albumSub, { color: colors.textSecondary }]}>
                  ¡Estás a 27 cromos de completar tu colección!
                </Text>
              </View>

              <View style={s.albumGrid}>
                <View style={[s.albumCromoCard, { borderColor: colors.rarityEpicBorder, backgroundColor: colors.rarityEpicBg }]}>
                  <Image source={{ uri: 'https://picsum.photos/seed/valencia/400/530' }} style={s.albumCromoImg} resizeMode="cover" />
                  <View style={[s.albumCromoBadge, { backgroundColor: colors.rarityEpicBg }]}>
                    <Text style={[s.albumCromoBadgeText, { color: colors.rarityEpicText }]}>ÉPICO</Text>
                  </View>
                </View>
                {[...Array(5)].map((_, i) => (
                  <View key={i} style={[s.albumCromoCard, s.albumCromoLocked, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderMedium }]}>
                    <Text style={[s.albumLockText, { color: colors.textMuted }]}>?</Text>
                  </View>
                ))}
              </View>

              <View style={[s.premioBox, { borderColor: colors.goldBorder, backgroundColor: colors.goldDim }]}>
                <Text style={s.premioIcon}>🎫</Text>
                <View style={s.premioInfo}>
                  <Text style={[s.premioTitulo, { color: colors.gold }]}>Premio álbum completo</Text>
                  <Text style={[s.premioDesc, { color: colors.textSecondary }]}>
                    Vuelo + Hotel + Experiencias VIP Mundial 2026 ✈️🏨
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* ── PASO 4: Mundial / Predicciones ── */}
          {paso === 4 && (
            <View style={s.contenido}>
              {/* Mini partido card */}
              <View style={[s.partidoCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderMedium }]}>
                <View style={[s.countdownChip, { backgroundColor: colors.errorDim, borderColor: colors.error }]}>
                  <Text style={[s.countdownText, { color: colors.error }]}>⏱ Cierra en 2h 48m</Text>
                </View>
                <View style={s.teamsRow}>
                  <View style={s.teamCol}>
                    <View style={[s.flagCircle, { backgroundColor: colors.cardBackground, borderColor: colors.borderMedium }]}>
                      <Text style={s.flagEmoji}>🇪🇨</Text>
                    </View>
                    <Text style={[s.teamName, { color: colors.textPrimary }]}>Ecuador</Text>
                  </View>
                  <Text style={[s.vsText, { color: colors.textMuted }]}>VS</Text>
                  <View style={s.teamCol}>
                    <View style={[s.flagCircle, { backgroundColor: colors.cardBackground, borderColor: colors.borderMedium }]}>
                      <Text style={s.flagEmoji}>🇨🇮</Text>
                    </View>
                    <Text style={[s.teamName, { color: colors.textPrimary }]}>C. de Marfil</Text>
                  </View>
                </View>
              </View>

              {/* Stepper simulado */}
              <View style={[s.stepperCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderMedium }]}>
                <Text style={[s.stepperTitle, { color: colors.textSecondary }]}>TU PREDICCIÓN</Text>
                <View style={s.steppersRow}>
                  <View style={s.stepperCol}>
                    <Text style={s.stepperFlag}>🇪🇨</Text>
                    <View style={[s.stepperBox, { backgroundColor: colors.backgroundSecondary }]}>
                      <Text style={[s.stepperBtn, { color: colors.primary }]}>−</Text>
                      <Text style={[s.stepperValue, { color: colors.textPrimary }]}>1</Text>
                      <Text style={[s.stepperBtn, { color: colors.primary }]}>+</Text>
                    </View>
                  </View>
                  <Text style={[s.stepperDash, { color: colors.textMuted }]}>—</Text>
                  <View style={s.stepperCol}>
                    <Text style={s.stepperFlag}>🇨🇮</Text>
                    <View style={[s.stepperBox, { backgroundColor: colors.backgroundSecondary }]}>
                      <Text style={[s.stepperBtn, { color: colors.primary }]}>−</Text>
                      <Text style={[s.stepperValue, { color: colors.textPrimary }]}>0</Text>
                      <Text style={[s.stepperBtn, { color: colors.primary }]}>+</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Recompensas */}
              <View style={[s.rewardsCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderMedium }]}>
                {[
                  { label: 'Marcador exacto',  val: '+1,000 mAiles', color: colors.gold    },
                  { label: 'Ganador correcto', val: '+300 mAiles',   color: colors.primary },
                  { label: 'Racha activa 🔥',  val: '+200 extra',    color: colors.warning },
                ].map((r, i) => (
                  <View key={i} style={[s.rewardRow, i > 0 && { borderTopWidth: 0.5, borderTopColor: colors.borderMedium }]}>
                    <Text style={[s.rewardLabel, { color: colors.textSecondary }]}>{r.label}</Text>
                    <Text style={[s.rewardVal, { color: r.color }]}>{r.val}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── PASO 5: Grupos ── */}
          {paso === 5 && (
            <View style={s.contenido}>
              {/* Opciones de grupo */}
              <View style={s.grupoOpciones}>
                {[
                  { icon: '➕', label: 'Crear grupo',            sub: 'Nombra tu equipo y comparte el código',    bg: colors.primaryDim,  border: colors.primary },
                  { icon: '🔑', label: 'Unirse con código',      sub: 'Ingresa el código de invitación de 6 letras', bg: colors.cardBackground, border: colors.borderStrong },
                  { icon: '🎯', label: 'Matchmaking automático', sub: 'Te unimos con usuarios de puntaje similar', bg: colors.goldDim,     border: colors.goldBorder },
                ].map((opt, i) => (
                  <View key={i} style={[s.grupoOpcion, { backgroundColor: opt.bg, borderColor: opt.border }]}>
                    <Text style={s.grupoOpcionIcon}>{opt.icon}</Text>
                    <View style={s.grupoOpcionInfo}>
                      <Text style={[s.grupoOpcionLabel, { color: colors.textPrimary }]}>{opt.label}</Text>
                      <Text style={[s.grupoOpcionSub, { color: colors.textSecondary }]}>{opt.sub}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Votación */}
              <View style={[s.votacionCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderMedium }]}>
                <Text style={[s.votacionTitle, { color: colors.textPrimary }]}>⚖️ Sistema de votación</Text>
                <Text style={[s.votacionDesc, { color: colors.textSecondary }]}>
                  Cuando alguien solicita unirse, todos los miembros activos deben aprobar. Un rechazo es suficiente para denegar el ingreso.
                </Text>
                <View style={s.votacionBtns}>
                  <View style={[s.votaBtnAprobar, { backgroundColor: colors.primaryDim, borderColor: colors.primary }]}>
                    <Text style={[s.votaBtnText, { color: colors.primary }]}>✓ Aprobar</Text>
                  </View>
                  <View style={[s.votaBtnRechazar, { backgroundColor: colors.errorDim, borderColor: colors.error }]}>
                    <Text style={[s.votaBtnText, { color: colors.error }]}>✗ Rechazar</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Botón siguiente */}
          <TouchableOpacity
            style={[s.btnSiguiente, { backgroundColor: colors.gold }]}
            onPress={() => esUltimo ? onCompletar() : setPaso(p => p + 1)}
          >
            <Text style={[s.btnSiguienteText, { color: colors.textOnGold }]}>{p.boton}</Text>
          </TouchableOpacity>

          <Text style={[s.contador, { color: colors.textMuted }]}>
            Paso {paso + 1} de {PASOS.length}
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center', justifyContent: 'center', padding: 16,
  },
  pills: { flexDirection: 'row', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginBottom: 10 },
  pill: { height: 6, width: 6, borderRadius: 3 },
  card: { borderRadius: 28, padding: 20, width: '100%', borderWidth: 0.5 },

  // Botón X
  saltarX: {
    position: 'absolute', top: 14, right: 14, zIndex: 10,
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  saltarXText: { fontSize: 14, fontWeight: '700' },

  pasoHeader: { marginBottom: 14, paddingRight: 32 },
  pasoTitulo: { fontSize: 19, fontWeight: '800', marginBottom: 3 },
  pasoSub: { fontSize: 12, lineHeight: 17 },
  contenido: { gap: 10, marginBottom: 14 },

  // Paso 0
  miniCard: { borderRadius: 18, padding: 16, overflow: 'hidden', position: 'relative' },
  miniCardPatternCircle: { position: 'absolute', top: -25, right: -25, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.12)' },
  miniCardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  miniCardLabel: { color: '#002b73', fontSize: 10, fontWeight: '700' },
  miniCardBrand: { color: '#002b73', fontSize: 14, fontWeight: '900', fontStyle: 'italic' },
  miniSaldo: { color: 'rgba(0,43,115,0.6)', fontSize: 9, marginBottom: 1 },
  miniBalance: { color: '#002b73', fontSize: 22, fontWeight: '800', letterSpacing: -0.5, marginBottom: 6 },
  miniCuenta: { color: 'rgba(0,43,115,0.65)', fontFamily: 'monospace', fontSize: 10, letterSpacing: 2 },
  modalSimulado: { borderRadius: 18, padding: 14, gap: 6, borderWidth: 0.5 },
  modalSimuladoTitle: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
  inputLabel: { fontSize: 8, fontWeight: '700', letterSpacing: 1.5 },
  inputFake: { borderRadius: 10, padding: 10, borderWidth: 0.5 },
  inputFakeVal: { fontSize: 13 },
  previewMailes: { borderRadius: 8, padding: 6, alignItems: 'center' },
  previewMailesText: { fontSize: 11, fontWeight: '700' },
  btnSimulado: { borderRadius: 12, paddingVertical: 10, alignItems: 'center', marginTop: 2 },
  btnSimuladoText: { fontWeight: '800', fontSize: 13 },

  // Paso 1
  mailesContainer: { borderRadius: 18, borderWidth: 1, padding: 18, alignItems: 'center', gap: 3 },
  mailesGanIcon: { fontSize: 40 },
  mailesGanNum: { fontSize: 40, fontWeight: '900', letterSpacing: -1 },
  mailesGanLabel: { fontSize: 12, fontWeight: '700' },
  detalleBox: { borderRadius: 14, borderWidth: 0.5, overflow: 'hidden' },
  detalleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 },
  detalleKey: { fontSize: 11 },
  detalleVal: { fontSize: 12, fontWeight: '700' },
  infoBox: { borderRadius: 10, padding: 10, borderWidth: 0.5 },
  infoText: { fontSize: 11, lineHeight: 17, fontWeight: '600' },

  // Paso 2
  cromosGanados: { fontSize: 11, textAlign: 'center' },
  cromoCard: { width: width * 0.38, aspectRatio: 3/4, borderRadius: 14, borderWidth: 2, overflow: 'hidden', alignSelf: 'center', position: 'relative' },
  cromoImg: { width: '100%', height: '100%' },
  cromoRarezaBadge: { position: 'absolute', bottom: 22, left: 4, right: 4, paddingVertical: 2, borderRadius: 5, alignItems: 'center' },
  cromoRarezaText: { fontSize: 7, fontWeight: '800', letterSpacing: 0.8 },
  cromoNombre: { position: 'absolute', bottom: 4, left: 4, right: 4, fontSize: 9, fontWeight: '800', textAlign: 'center' },
  rarezaRow: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  rarezaItem: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, alignItems: 'center', borderWidth: 0.5 },
  rarezaLabel: { fontSize: 10, fontWeight: '700' },
  rarezaPct: { fontSize: 9, marginTop: 1 },

  // Paso 3
  albumProgress: { borderRadius: 14, padding: 12, gap: 6, borderWidth: 0.5 },
  albumProgressHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  albumNum: { fontSize: 28, fontWeight: '800', letterSpacing: -1 },
  albumTotal: { fontSize: 13 },
  progressBar: { height: 7, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  albumSub: { fontSize: 10 },
  albumGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, justifyContent: 'center' },
  albumCromoCard: { width: (width - 32 - 40 - 5*5)/6, aspectRatio: 3/4, borderRadius: 7, borderWidth: 1.5, overflow: 'hidden', position: 'relative', alignItems: 'center', justifyContent: 'center' },
  albumCromoImg: { width: '100%', height: '100%' },
  albumCromoBadge: { position: 'absolute', bottom: 1, left: 1, right: 1, paddingVertical: 1, borderRadius: 3, alignItems: 'center' },
  albumCromoBadgeText: { fontSize: 5, fontWeight: '800' },
  albumCromoLocked: { opacity: 0.3 },
  albumLockText: { fontSize: 12, fontWeight: '800' },
  premioBox: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, padding: 12 },
  premioIcon: { fontSize: 26 },
  premioInfo: { flex: 1 },
  premioTitulo: { fontSize: 13, fontWeight: '800' },
  premioDesc: { fontSize: 10, marginTop: 2, lineHeight: 14 },

  // Paso 4 - Mundial
  partidoCard: { borderRadius: 16, padding: 14, borderWidth: 0.5, gap: 10 },
  countdownChip: { alignSelf: 'flex-end', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, borderWidth: 0.5 },
  countdownText: { fontSize: 9, fontWeight: '700' },
  teamsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  teamCol: { alignItems: 'center', gap: 6 },
  flagCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  flagEmoji: { fontSize: 34 },
  teamName: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  vsText: { fontSize: 12, fontWeight: '700' },
  stepperCard: { borderRadius: 14, padding: 12, borderWidth: 0.5, gap: 8 },
  stepperTitle: { fontSize: 9, fontWeight: '700', letterSpacing: 1.2 },
  steppersRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  stepperCol: { alignItems: 'center', gap: 6 },
  stepperFlag: { fontSize: 24 },
  stepperBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 4, paddingVertical: 2 },
  stepperBtn: { fontSize: 20, fontWeight: '700', paddingHorizontal: 8 },
  stepperValue: { fontSize: 22, fontWeight: '800', width: 32, textAlign: 'center' },
  stepperDash: { fontSize: 22, fontWeight: '200' },
  rewardsCard: { borderRadius: 12, borderWidth: 0.5, overflow: 'hidden' },
  rewardRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 10 },
  rewardLabel: { fontSize: 11 },
  rewardVal: { fontSize: 11, fontWeight: '700' },

  // Paso 5 - Grupos
  grupoOpciones: { gap: 8 },
  grupoOpcion: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 12, borderWidth: 0.5 },
  grupoOpcionIcon: { fontSize: 22 },
  grupoOpcionInfo: { flex: 1 },
  grupoOpcionLabel: { fontSize: 13, fontWeight: '700' },
  grupoOpcionSub: { fontSize: 10, marginTop: 1 },
  votacionCard: { borderRadius: 12, padding: 12, borderWidth: 0.5, gap: 8 },
  votacionTitle: { fontSize: 13, fontWeight: '700' },
  votacionDesc: { fontSize: 11, lineHeight: 16 },
  votacionBtns: { flexDirection: 'row', gap: 8 },
  votaBtnAprobar: { flex: 1, borderWidth: 1, borderRadius: 8, paddingVertical: 7, alignItems: 'center' },
  votaBtnRechazar: { flex: 1, borderWidth: 1, borderRadius: 8, paddingVertical: 7, alignItems: 'center' },
  votaBtnText: { fontSize: 12, fontWeight: '700' },

  // Navegación
  btnSiguiente: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 6 },
  btnSiguienteText: { fontWeight: '800', fontSize: 15 },
  contador: { fontSize: 10, textAlign: 'center' },
});