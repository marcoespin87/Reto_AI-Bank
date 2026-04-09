import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, Animated, Dimensions, Image, ScrollView
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const MONTO_DEMO = 120;
const MAILES_DEMO = Math.floor(MONTO_DEMO / 100) * 10;
const CROMOS_DEMO = Math.floor(MONTO_DEMO / 20);

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

  useEffect(() => {
    if (visible) { setPaso(0); animar(); }
  }, [visible]);

  useEffect(() => {
    animar();
    if (paso === 1) animarMailes();
    if (paso === 2) animarCromo();
  }, [paso]);

  function animar() {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
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
    cromoScale.setValue(0.3);
    cromoOpac.setValue(0);
    Animated.parallel([
      Animated.spring(cromoScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.timing(cromoOpac,  { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }

  const PASOS = [
    { boton: 'Ver qué gané →',    titulo: 'Gana puntos y cromos',      sub: 'Paga con Ai-Gana mAiles y cromos' },
    { boton: 'Ver mis cromos →',  titulo: '¡Ganaste mAiles!',           sub: `$${MONTO_DEMO} pagados → ${MAILES_DEMO} mAiles acumulados` },
    { boton: 'Ver mi álbum →',    titulo: '¡Ganaste cromos!',           sub: `Cada $20 = 1 cromo. Con $${MONTO_DEMO} ganaste ${CROMOS_DEMO} cromos` },
    { boton: '¡Empezar ahora! 🚀', titulo: 'Tu álbum Mundial 2026',    sub: 'Completa 28 cromos y entra al sorteo VIP ✈️' },
  ];

  const p = PASOS[paso];

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={[s.overlay]}>

        {/* Pills de progreso */}
        <View style={[s.pills, { backgroundColor: colors.cardBackground }]}>
          {PASOS.map((_, i) => (
            <View key={i} style={[
              s.pill,
              { backgroundColor: i <= paso ? colors.primary : colors.borderMedium },
              i === paso && { width: 24 },
            ]} />
          ))}
        </View>

        <Animated.View style={[
          s.card,
          { backgroundColor: colors.cardBackgroundAlt, borderColor: colors.borderStrong },
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}>
          {/* Header */}
          <View style={s.pasoHeader}>
            <Text style={[s.pasoTitulo, { color: colors.textPrimary }]}>{p.titulo}</Text>
            <Text style={[s.pasoSub, { color: colors.textSecondary }]}>{p.sub}</Text>
          </View>

          {/* ── PASO 0: Simulación de pago ── */}
          {paso === 0 && (
            <View style={s.contenido}>
              {/* Mini tarjeta bancaria — mismos estilos que BancoUI */}
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

              {/* Modal de pago simulado — mismos estilos que BancoUI */}
              <View style={[s.modalSimulado, { backgroundColor: colors.cardBackground, borderColor: colors.borderStrong }]}>
                <Text style={[s.modalSimuladoTitle, { color: colors.textPrimary }]}>💡 Pagar servicio</Text>

                <Text style={[s.inputLabel, { color: colors.primary }]}>DESCRIPCIÓN</Text>
                <View style={[s.inputFake, { backgroundColor: colors.inputBackground ?? colors.backgroundSecondary, borderColor: colors.borderStrong }]}>
                  <Text style={[s.inputFakeVal, { color: colors.textPrimary }]}>Supermercado Premium</Text>
                </View>

                <Text style={[s.inputLabel, { color: colors.primary }]}>MONTO ($)</Text>
                <View style={[s.inputFake, { backgroundColor: colors.inputBackground ?? colors.backgroundSecondary, borderColor: colors.borderStrong }]}>
                  <Text style={[s.inputFakeVal, { color: colors.primary, fontSize: 22, fontWeight: '800' }]}>${MONTO_DEMO}.00</Text>
                </View>

                <View style={[s.previewMailes, { backgroundColor: colors.goldDim ?? 'rgba(255,214,91,0.1)' }]}>
                  <Text style={[s.previewMailesText, { color: colors.gold }]}>⭐ Ganarás {MAILES_DEMO} mAiles</Text>
                </View>

                <View style={[s.btnSimulado, { backgroundColor: colors.gold }]}>
                  <Text style={[s.btnSimuladoText, { color: colors.textOnGold ?? '#002b73' }]}>Confirmar ✦</Text>
                </View>
              </View>
            </View>
          )}

          {/* ── PASO 1: mAiles ganados ── */}
          {paso === 1 && (
            <View style={s.contenido}>
              <Animated.View style={[
                s.mailesContainer,
                { borderColor: colors.goldBorder ?? 'rgba(255,214,91,0.3)', backgroundColor: colors.goldDim ?? 'rgba(255,214,91,0.08)' },
                { transform: [{ scale: mailesAnim }], opacity: mailesAnim },
              ]}>
                <Text style={s.mailesGanIcon}>⭐</Text>
                <Text style={[s.mailesGanNum, { color: colors.gold }]}>+{MAILES_DEMO}</Text>
                <Text style={[s.mailesGanLabel, { color: colors.gold }]}>mAiles ganados</Text>
              </Animated.View>

              <View style={[s.detalleBox, { backgroundColor: colors.cardBackground, borderColor: colors.borderMedium }]}>
                {[
                  { key: 'Monto pagado',       val: `$${MONTO_DEMO}.00`,         color: colors.textPrimary },
                  { key: 'Tasa de mAiles',      val: '×2 por cada $100',          color: colors.primary },
                  { key: 'Cromos obtenidos',    val: `${CROMOS_DEMO} cromos 🃏`,   color: colors.primary },
                ].map((row, i) => (
                  <View key={i} style={[s.detalleRow, i > 0 && { borderTopWidth: 0.5, borderTopColor: colors.borderMedium }]}>
                    <Text style={[s.detalleKey, { color: colors.textSecondary }]}>{row.key}</Text>
                    <Text style={[s.detalleVal, { color: row.color }]}>{row.val}</Text>
                  </View>
                ))}
                <View style={[s.detalleRow, { borderTopWidth: 1, borderTopColor: colors.borderStrong }]}>
                  <Text style={[s.detalleKey, { color: colors.textPrimary, fontWeight: '800' }]}>Total mAiles</Text>
                  <Text style={[s.detalleVal, { color: colors.gold, fontSize: 16 }]}>+{MAILES_DEMO} ⭐</Text>
                </View>
              </View>

              <View style={[s.infoBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderMedium }]}>
                <Text style={[s.infoText, { color: colors.primary }]}>
                  💡 Los mAiles acumulados te suben de medalla y desbloquean beneficios exclusivos
                </Text>
              </View>
            </View>
          )}

          {/* ── PASO 2: Cromo revelado — mismos estilos que SobreModal ── */}
          {paso === 2 && (
            <View style={s.contenido}>
              <Text style={[s.cromosGanados, { color: colors.textSecondary }]}>
                ${MONTO_DEMO} ÷ $20 = {CROMOS_DEMO} cromos ganados
              </Text>

              <Animated.View style={[
                s.cromoCard,
                { borderColor: colors.rarityEpicBorder ?? '#f0c110', backgroundColor: colors.rarityEpicBg ?? 'rgba(240,193,16,0.15)' },
                { transform: [{ scale: cromoScale }], opacity: cromoOpac },
              ]}>
                <Image
                  source={{ uri: 'https://picsum.photos/seed/valencia/400/530' }}
                  style={s.cromoImg}
                  resizeMode="cover"
                />
                <View style={[s.cromoRarezaBadge, { backgroundColor: colors.rarityEpicBg ?? 'rgba(240,193,16,0.15)' }]}>
                  <Text style={[s.cromoRarezaText, { color: colors.rarityEpicText ?? '#ffd65b' }]}>ÉPICO</Text>
                </View>
                <Text style={[s.cromoNombre, { color: colors.rarityEpicText ?? '#ffd65b' }]}>Enner Valencia</Text>
              </Animated.View>

              {/* Tabla de rareza */}
              <View style={s.rarezaRow}>
                {[
                  { label: 'Común', color: colors.rarityCommonText ?? '#c2c6d8', pct: '60%' },
                  { label: 'Raro',  color: colors.rarityRareText  ?? '#b2c5ff', pct: '30%' },
                  { label: 'Épico', color: colors.rarityEpicText  ?? '#ffd65b', pct: '10%' },
                ].map(r => (
                  <View key={r.label} style={[s.rarezaItem, { backgroundColor: colors.cardBackground, borderColor: colors.borderMedium }]}>
                    <Text style={[s.rarezaLabel, { color: r.color }]}>{r.label}</Text>
                    <Text style={[s.rarezaPct, { color: colors.textMuted }]}>{r.pct}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── PASO 3: Álbum — mismos estilos que AlbumUI ── */}
          {paso === 3 && (
            <View style={s.contenido}>
              {/* Progreso */}
              <View style={[s.albumProgress, { backgroundColor: colors.cardBackground, borderColor: colors.borderMedium }]}>
                <View style={s.albumProgressHeader}>
                  <Text style={[s.albumNum, { color: colors.gold }]}>1</Text>
                  <Text style={[s.albumTotal, { color: colors.textSecondary }]}>/ 28 cromos</Text>
                </View>
                <View style={[s.progressBar, { backgroundColor: colors.borderMedium }]}>
                  <View style={[s.progressFill, { width: `${(1 / 28) * 100}%`, backgroundColor: colors.primary }]} />
                </View>
                <Text style={[s.albumSub, { color: colors.textSecondary }]}>
                  ¡Estás a 27 cromos de completar tu colección!
                </Text>
              </View>

              {/* Grid de cromos — mismos estilos que AlbumUI */}
              <View style={s.albumGrid}>
                {/* Cromo desbloqueado */}
                <View style={[s.albumCromoCard, { borderColor: colors.rarityEpicBorder ?? '#f0c110', backgroundColor: colors.rarityEpicBg ?? 'rgba(240,193,16,0.15)' }]}>
                  <Image
                    source={{ uri: 'https://picsum.photos/seed/valencia/400/530' }}
                    style={s.albumCromoImg}
                    resizeMode="cover"
                  />
                  <View style={[s.albumCromoBadge, { backgroundColor: colors.rarityEpicBg ?? 'rgba(240,193,16,0.15)' }]}>
                    <Text style={[s.albumCromoBadgeText, { color: colors.rarityEpicText ?? '#ffd65b' }]}>ÉPICO</Text>
                  </View>
                </View>

                {/* Espacios bloqueados */}
                {[...Array(5)].map((_, i) => (
                  <View key={i} style={[s.albumCromoCard, s.albumCromoLocked, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderMedium }]}>
                    <Text style={[s.albumLockText, { color: colors.textMuted }]}>?</Text>
                  </View>
                ))}
              </View>

              {/* Premio álbum completo */}
              <View style={[s.premioBox, { borderColor: colors.goldBorder ?? 'rgba(255,214,91,0.3)', backgroundColor: colors.goldDim ?? 'rgba(255,214,91,0.06)' }]}>
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

          {/* Botón siguiente */}
          <TouchableOpacity
            style={[s.btnSiguiente, { backgroundColor: colors.gold }]}
            onPress={() => paso < PASOS.length - 1 ? setPaso(p => p + 1) : onCompletar()}
          >
            <Text style={[s.btnSiguienteText, { color: colors.textOnGold ?? '#002b73' }]}>{p.boton}</Text>
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
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  pills: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 12,
  },
  pill: { height: 6, width: 6, borderRadius: 3 },
  card: {
    borderRadius: 28,
    padding: 20,
    width: '100%',
    borderWidth: 0.5,
  },
  pasoHeader: { marginBottom: 16 },
  pasoTitulo: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  pasoSub: { fontSize: 13, lineHeight: 18 },
  contenido: { gap: 12, marginBottom: 16 },

  // Paso 0 - mini tarjeta
  miniCard: {
    borderRadius: 20,
    padding: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  miniCardPatternCircle: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  miniCardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  miniCardLabel: { color: '#002b73', fontSize: 11, fontWeight: '700' },
  miniCardBrand: { color: '#002b73', fontSize: 16, fontWeight: '900', fontStyle: 'italic' },
  miniSaldo: { color: 'rgba(0,43,115,0.6)', fontSize: 10, marginBottom: 2 },
  miniBalance: { color: '#002b73', fontSize: 24, fontWeight: '800', letterSpacing: -0.5, marginBottom: 8 },
  miniCuenta: { color: 'rgba(0,43,115,0.7)', fontFamily: 'monospace', fontSize: 11, letterSpacing: 2 },

  // Modal simulado
  modalSimulado: {
    borderRadius: 20,
    padding: 16,
    gap: 8,
    borderWidth: 0.5,
  },
  modalSimuladoTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  inputLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  inputFake: { borderRadius: 12, padding: 12, marginBottom: 4, borderWidth: 0.5 },
  inputFakeVal: { fontSize: 14 },
  previewMailes: { borderRadius: 10, padding: 8, alignItems: 'center' },
  previewMailesText: { fontSize: 12, fontWeight: '700' },
  btnSimulado: { borderRadius: 14, paddingVertical: 12, alignItems: 'center', opacity: 0.8, marginTop: 4 },
  btnSimuladoText: { fontWeight: '800', fontSize: 14 },

  // Paso 1 - mAiles
  mailesContainer: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    gap: 4,
  },
  mailesGanIcon: { fontSize: 44 },
  mailesGanNum: { fontSize: 44, fontWeight: '900', letterSpacing: -1 },
  mailesGanLabel: { fontSize: 13, fontWeight: '700' },
  detalleBox: { borderRadius: 16, borderWidth: 0.5, overflow: 'hidden' },
  detalleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  detalleKey: { fontSize: 12 },
  detalleVal: { fontSize: 13, fontWeight: '700' },
  infoBox: { borderRadius: 12, padding: 12, borderWidth: 0.5 },
  infoText: { fontSize: 12, lineHeight: 18, fontWeight: '600' },

  // Paso 2 - cromo
  cromosGanados: { fontSize: 12, textAlign: 'center' },
  cromoCard: {
    width: width * 0.42,
    aspectRatio: 3 / 4,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    alignSelf: 'center',
    position: 'relative',
  },
  cromoImg: { width: '100%', height: '100%' },
  cromoRarezaBadge: {
    position: 'absolute',
    bottom: 26,
    left: 6,
    right: 6,
    paddingVertical: 3,
    borderRadius: 6,
    alignItems: 'center',
  },
  cromoRarezaText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  cromoNombre: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  rarezaRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  rarezaItem: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center', borderWidth: 0.5 },
  rarezaLabel: { fontSize: 11, fontWeight: '700' },
  rarezaPct: { fontSize: 10, marginTop: 2 },

  // Paso 3 - album
  albumProgress: { borderRadius: 16, padding: 14, gap: 8, borderWidth: 0.5 },
  albumProgressHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  albumNum: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  albumTotal: { fontSize: 14 },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  albumSub: { fontSize: 11 },
  albumGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  albumCromoCard: {
    width: (width - 32 - 40 - 6 * 5) / 6,
    aspectRatio: 3 / 4,
    borderRadius: 8,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumCromoImg: { width: '100%', height: '100%' },
  albumCromoBadge: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    right: 2,
    paddingVertical: 1,
    borderRadius: 4,
    alignItems: 'center',
  },
  albumCromoBadgeText: { fontSize: 6, fontWeight: '800' },
  albumCromoLocked: { opacity: 0.35 },
  albumLockText: { fontSize: 14, fontWeight: '800' },
  premioBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  premioIcon: { fontSize: 28 },
  premioInfo: { flex: 1 },
  premioTitulo: { fontSize: 14, fontWeight: '800' },
  premioDesc: { fontSize: 11, marginTop: 2, lineHeight: 16 },

  // Navegación
  btnSiguiente: {
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 8,
  },
  btnSiguienteText: { fontWeight: '800', fontSize: 16 },
  contador: { fontSize: 11, textAlign: 'center' },
});