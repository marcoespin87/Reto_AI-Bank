import {
  ActivityIndicator,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import BottomNav from './BottomNav';
import ChatbotModal from './ChatbotModal';
import PartidoCard from './PartidoCard';
import { PartidoDetalle, PrediccionUsuario } from '../lib/useMundialPartidos';

export interface PredState {
  goles_local: number;
  goles_visitante: number;
  enviada: boolean;
  submitting: boolean;
}

export interface MundialUIProps {
  partidos: PartidoDetalle[];
  loading: boolean;
  semana: number;
  onSemanaChange: (s: number) => void;
  prediccionesState: Record<number, PredState>;
  partidoActivoId: number | null;           // ID del partido con stepper abierto
  expandedIds: Set<number>;
  onToggleExpand: (id: number) => void;
  onAbrirPrediccion: (id: number) => void;
  onCerrarPrediccion: () => void;
  onGolesLocalChange: (id: number, v: number) => void;
  onGolesVisitanteChange: (id: number, v: number) => void;
  onConfirmar: (id: number) => void;
  rachaActiva: boolean;
  chatbotVisible: boolean;
  onOpenChatbot: () => void;
  onCloseChatbot: () => void;
  pulseAnim: Animated.Value;
  ligaNombre: string;
  posicionEnLiga: number | null;
  onBack: () => void;
}

const SEMANAS = [1, 2];

export default function MundialUI({
  partidos,
  loading,
  semana,
  onSemanaChange,
  prediccionesState,
  partidoActivoId,
  expandedIds,
  onToggleExpand,
  onAbrirPrediccion,
  onCerrarPrediccion,
  onGolesLocalChange,
  onGolesVisitanteChange,
  onConfirmar,
  rachaActiva,
  chatbotVisible,
  onOpenChatbot,
  onCloseChatbot,
  pulseAnim,
  ligaNombre,
  posicionEnLiga,
  onBack,
}: MundialUIProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navHeight = 60 + insets.bottom;
  const fabBottom = navHeight + 14;
  const s = getStyles(colors);

  const partidoActivo = partidoActivoId != null
    ? partidos.find((p) => p.id === partidoActivoId) ?? null
    : null;
  const predActiva = partidoActivoId != null
    ? prediccionesState[partidoActivoId] ?? { goles_local: 1, goles_visitante: 0, enviada: false, submitting: false }
    : null;

  return (
    <SafeAreaView style={s.root}>
      {/* Top Nav */}
      <View style={s.topNav}>
        <View style={s.topNavLeft}>
          <TouchableOpacity onPress={onBack} style={s.backBtn}>
            <Text style={s.backIcon}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={s.topNavTitle}>Mundial 2026</Text>
            <Text style={s.topNavSub}>Fase de Grupos · Predicciones</Text>
          </View>
        </View>
        {ligaNombre ? (
          <View style={s.topNavRight}>
            <Text style={s.ligaText}>{ligaNombre}</Text>
            {posicionEnLiga ? (
              <Text style={s.medalText}>#{posicionEnLiga} en liga</Text>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* Filtro por semana */}
      <View style={s.semanaTabsRow}>
        {SEMANAS.map((s_) => (
          <TouchableOpacity
            key={s_}
            style={[s.semanaTab, semana === s_ && s.semanaTabActive]}
            onPress={() => onSemanaChange(s_)}
            activeOpacity={0.8}
          >
            <Text style={[s.semanaTabText, semana === s_ && s.semanaTabTextActive]}>
              Semana {s_}
            </Text>
          </TouchableOpacity>
        ))}
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
          {loading ? (
            <View style={s.emptyState}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={s.emptyText}>Cargando partidos...</Text>
            </View>
          ) : partidos.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyEmoji}>🏟️</Text>
              <Text style={s.emptyTitle}>Sin partidos</Text>
              <Text style={s.emptyText}>No hay partidos disponibles para la Semana {semana}</Text>
            </View>
          ) : (
            partidos.map((partido) => {
              const pred = prediccionesState[partido.id];
              return (
                <PartidoCard
                  key={partido.id}
                  partido={partido}
                  expanded={expandedIds.has(partido.id)}
                  onToggleExpand={() => onToggleExpand(partido.id)}
                  onPredecir={() => onAbrirPrediccion(partido.id)}
                  prediccion={
                    pred?.enviada
                      ? { goles_local: pred.goles_local, goles_visitante: pred.goles_visitante }
                      : partido.prediccion_usuario
                  }
                  enviada={pred?.enviada ?? partido.prediccion_usuario != null}
                  pulseAnim={pulseAnim}
                />
              );
            })
          )}
          <View style={{ height: 260 }} />
        </ScrollView>

        {/* Sticky Bottom: Formulario de predicción */}
        {partidoActivo && predActiva && (
          <View style={[s.stickyBottom, { bottom: navHeight }]}>
            <TouchableOpacity onPress={onCerrarPrediccion} style={s.closeBtn}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>

            <Text style={s.stickyTitle}>
              {partidoActivo.equipo_local.nombre} vs {partidoActivo.equipo_visitante.nombre}
            </Text>

            <View style={s.steppersRow}>
              <View style={s.stepperCol}>
                <Image
                  source={{
                    uri: `https://flagcdn.com/w80/${partidoActivo.equipo_local.codigo_iso}.png`,
                  }}
                  style={s.stepperFlagImg}
                  resizeMode="cover"
                />
                <View style={s.stepperBox}>
                  <TouchableOpacity
                    style={s.stepperBtn}
                    onPress={() =>
                      onGolesLocalChange(
                        partidoActivo.id,
                        Math.max(0, predActiva.goles_local - 1),
                      )
                    }
                    disabled={predActiva.enviada}
                  >
                    <Text style={s.stepperBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={s.stepperValue}>{predActiva.goles_local}</Text>
                  <TouchableOpacity
                    style={s.stepperBtn}
                    onPress={() =>
                      onGolesLocalChange(partidoActivo.id, predActiva.goles_local + 1)
                    }
                    disabled={predActiva.enviada}
                  >
                    <Text style={s.stepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={s.stepperDash}>—</Text>

              <View style={s.stepperCol}>
                <Image
                  source={{
                    uri: `https://flagcdn.com/w80/${partidoActivo.equipo_visitante.codigo_iso}.png`,
                  }}
                  style={s.stepperFlagImg}
                  resizeMode="cover"
                />
                <View style={s.stepperBox}>
                  <TouchableOpacity
                    style={s.stepperBtn}
                    onPress={() =>
                      onGolesVisitanteChange(
                        partidoActivo.id,
                        Math.max(0, predActiva.goles_visitante - 1),
                      )
                    }
                    disabled={predActiva.enviada}
                  >
                    <Text style={s.stepperBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={s.stepperValue}>{predActiva.goles_visitante}</Text>
                  <TouchableOpacity
                    style={s.stepperBtn}
                    onPress={() =>
                      onGolesVisitanteChange(
                        partidoActivo.id,
                        predActiva.goles_visitante + 1,
                      )
                    }
                    disabled={predActiva.enviada}
                  >
                    <Text style={s.stepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={s.rewardsCard}>
              <View style={s.rewardRow}>
                <Text style={s.rewardLabel}>Marcador exacto</Text>
                <Text style={s.rewardGold}>
                  +{partidoActivo.recompensa_exacto.toLocaleString()} mAiles
                </Text>
              </View>
              <View style={s.rewardRow}>
                <Text style={s.rewardLabel}>Ganador correcto</Text>
                <Text style={s.rewardBlue}>
                  +{partidoActivo.recompensa_ganador} mAiles
                </Text>
              </View>
              {rachaActiva && (
                <View style={[s.rewardRow, s.rewardBorder]}>
                  <Text style={s.rewardRacha}>Racha activa 🔥</Text>
                  <Text style={s.rewardRacha}>
                    +{partidoActivo.recompensa_racha} mAiles extra
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[s.ctaBtn, predActiva.enviada && s.ctaBtnDone]}
              onPress={() => onConfirmar(partidoActivo.id)}
              disabled={predActiva.enviada || predActiva.submitting}
              activeOpacity={0.85}
            >
              {predActiva.submitting ? (
                <ActivityIndicator color="#002b73" />
              ) : (
                <Text
                  style={[s.ctaBtnText, predActiva.enviada && { color: colors.primary }]}
                >
                  {predActiva.enviada
                    ? `✓ Enviada · ${predActiva.goles_local}-${predActiva.goles_visitante}`
                    : 'Confirmar predicción ⭐'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* FAB Chatbot */}
      {!partidoActivo && (
        <TouchableOpacity
          style={[s.chatFab, { bottom: fabBottom }]}
          onPress={onOpenChatbot}
        >
          <Text style={s.chatFabIcon}>🤖</Text>
        </TouchableOpacity>
      )}

      <ChatbotModal visible={chatbotVisible} onClose={onCloseChatbot} />
      <BottomNav active="mundial" />
    </SafeAreaView>
  );
}

function getStyles(
  colors: ReturnType<typeof import('../context/ThemeContext').useTheme>['colors'],
) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingHorizontal: 16, paddingTop: 8 },

    topNav: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 14,
      backgroundColor: colors.background,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.borderMedium,
    },
    topNavLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.backgroundSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backIcon: { color: colors.primary, fontSize: 18, fontWeight: '700' },
    topNavTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '800' },
    topNavSub: { color: colors.textSecondary, fontSize: 10, fontWeight: '500', marginTop: 1 },
    topNavRight: { alignItems: 'flex-end' },
    ligaText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
    medalText: { color: colors.textSecondary, fontSize: 10, fontWeight: '500' },

    // Tabs de semana
    semanaTabsRow: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 10,
      gap: 8,
      backgroundColor: colors.background,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.borderMedium,
    },
    semanaTab: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 10,
      alignItems: 'center',
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 0.5,
      borderColor: colors.borderMedium,
    },
    semanaTabActive: {
      backgroundColor: colors.primaryDim,
      borderColor: colors.primary,
    },
    semanaTabText: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
    semanaTabTextActive: { color: colors.primary },

    // Estados vacíos / carga
    emptyState: {
      alignItems: 'center',
      paddingTop: 60,
      gap: 12,
    },
    emptyEmoji: { fontSize: 48 },
    emptyTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '800' },
    emptyText: { color: colors.textSecondary, fontSize: 13, textAlign: 'center' },

    // Sticky bottom predicción
    stickyBottom: {
      position: 'absolute',
      bottom: 72,
      left: 0,
      right: 0,
      backgroundColor: colors.background,
      borderTopWidth: 0.5,
      borderTopColor: colors.borderMedium,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 12,
    },
    closeBtn: {
      position: 'absolute',
      top: 12,
      right: 16,
      zIndex: 10,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.cardBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeBtnText: { color: colors.textSecondary, fontSize: 16, fontWeight: '700' },
    stickyTitle: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 12,
    },
    steppersRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    stepperCol: { alignItems: 'center', gap: 8 },
    stepperFlagImg: { width: 44, height: 30, borderRadius: 4 },
    stepperBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 4,
    },
    stepperBtn: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepperBtnText: { color: colors.primary, fontSize: 22, fontWeight: '700' },
    stepperValue: {
      color: colors.textPrimary,
      fontSize: 24,
      fontWeight: '800',
      width: 40,
      textAlign: 'center',
    },
    stepperDash: { color: colors.textMuted, fontSize: 28, fontWeight: '200' },
    rewardsCard: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 14,
      padding: 12,
      marginBottom: 12,
    },
    rewardRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    rewardBorder: {
      borderTopWidth: 0.5,
      borderTopColor: colors.borderMedium,
      paddingTop: 8,
      marginTop: 4,
    },
    rewardLabel: { color: colors.textSecondary, fontSize: 11 },
    rewardGold: { color: colors.gold, fontSize: 11, fontWeight: '700' },
    rewardBlue: { color: colors.primary, fontSize: 11, fontWeight: '700' },
    rewardRacha: { color: colors.warning, fontSize: 11, fontWeight: '700' },
    ctaBtn: {
      height: 52,
      borderRadius: 16,
      backgroundColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 6,
    },
    ctaBtnDone: {
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    ctaBtnText: {
      color: colors.textOnGold,
      fontSize: 15,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    // FAB
    chatFab: {
      position: 'absolute',
      right: 20,
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.cardBackground,
      borderWidth: 1.5,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 8,
    },
    chatFabIcon: { fontSize: 24 },
  });
}
