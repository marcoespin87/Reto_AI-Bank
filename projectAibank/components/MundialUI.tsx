import {
  ActivityIndicator,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useState } from 'react';
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
  error?: string | null;
  semanas: number[];
  semana: number;
  semanaActual: number;
  onSemanaChange: (s: number) => void;
  prediccionesState: Record<number, PredState>;
  onVerDetalle: (id: number) => void;
  chatbotVisible: boolean;
  onOpenChatbot: () => void;
  onCloseChatbot: () => void;
  pulseAnim: Animated.Value;
  ligaNombre: string;
  posicionEnLiga: number | null;
  onBack: () => void;
}

export default function MundialUI({
  partidos,
  loading,
  error,
  semanas,
  semana,
  semanaActual,
  onSemanaChange,
  prediccionesState,
  onVerDetalle,
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

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const esActiva = semana === semanaActual;

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

      {/* Selector de semana desplegable */}
      <View style={s.selectorRow}>
        <TouchableOpacity
          style={[s.selectorBtn, esActiva && s.selectorBtnActiva]}
          onPress={() => setDropdownOpen(true)}
          activeOpacity={0.8}
        >
          <View style={s.selectorBtnInner}>
            <Text style={s.selectorCalendar}>📅</Text>
            <View>
              <Text style={[s.selectorLabel, esActiva && s.selectorLabelActiva]}>
                Semana {semana}
                {esActiva ? '  ✦ Activa' : ''}
              </Text>
              <Text style={s.selectorSub}>
                {esActiva ? 'Predicciones habilitadas' : 'Solo visualización'}
              </Text>
            </View>
          </View>
          <Text style={[s.selectorChevron, esActiva && s.selectorChevronActiva]}>
            {dropdownOpen ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

      </View>

      {/* Modal desplegable de semanas */}
      <Modal
        visible={dropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownOpen(false)}
      >
        <TouchableOpacity
          style={s.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownOpen(false)}
        >
          <View style={s.dropdownContainer}>
            <Text style={s.dropdownTitle}>Seleccionar semana</Text>
            <ScrollView style={s.dropdownScroll} showsVerticalScrollIndicator={false}>
              {semanas.map((s_) => {
                const isSelected = s_ === semana;
                const isActiva = s_ === semanaActual;
                return (
                  <TouchableOpacity
                    key={s_}
                    style={[s.dropdownItem, isSelected && s.dropdownItemSelected]}
                    onPress={() => { onSemanaChange(s_); setDropdownOpen(false); }}
                    activeOpacity={0.7}
                  >
                    <View style={s.dropdownItemLeft}>
                      <Text style={[s.dropdownItemText, isSelected && s.dropdownItemTextSelected]}>
                        Semana {s_}
                      </Text>
                      {isActiva && (
                        <View style={s.activaBadge}>
                          <Text style={s.activaBadgeText}>Activa</Text>
                        </View>
                      )}
                      {!isActiva && (
                        <Text style={s.dropdownItemSub}>Solo visualización</Text>
                      )}
                    </View>
                    {isSelected && (
                      <Text style={s.dropdownCheckmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

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
            <Text style={s.emptyEmoji}>{error ? '⚠️' : '🏟️'}</Text>
            <Text style={s.emptyTitle}>{error ? 'Error de acceso' : 'Sin partidos'}</Text>
            <Text style={s.emptyText}>
              {error
                ? error
                : `No hay partidos disponibles para la Semana ${semana}`}
            </Text>
            <Text style={[s.emptyText, { fontSize: 10, color: '#888', marginTop: 8 }]}>
              Semana: {semana} · Semana activa: {semanaActual}
            </Text>
          </View>
        ) : (
          partidos.map((partido) => {
            const pred = prediccionesState[partido.id];
            const enviada = pred?.enviada ?? partido.prediccion_usuario != null;
            const prediccion: PrediccionUsuario | null = enviada
              ? pred
                ? { goles_local: pred.goles_local, goles_visitante: pred.goles_visitante }
                : partido.prediccion_usuario
              : null;

            return (
              <PartidoCard
                key={partido.id}
                partido={partido}
                semanaActual={semanaActual}
                onVerDetalle={() => onVerDetalle(partido.id)}
                prediccion={prediccion}
                enviada={enviada}
                pulseAnim={pulseAnim}
              />
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB Chatbot */}
      <TouchableOpacity
        style={[s.chatFab, { bottom: fabBottom }]}
        onPress={onOpenChatbot}
      >
        <Text style={s.chatFabIcon}>🤖</Text>
      </TouchableOpacity>

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

    // ── Selector desplegable ──────────────────────────────────
    selectorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      gap: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.borderMedium,
      backgroundColor: colors.background,
    },
    selectorBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderWidth: 0.5,
      borderColor: colors.borderMedium,
    },
    selectorBtnActiva: {
      backgroundColor: colors.primaryDim,
      borderColor: colors.primary,
    },
    selectorBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    selectorCalendar: { fontSize: 20 },
    selectorLabel: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '800',
    },
    selectorLabelActiva: { color: colors.primary },
    selectorSub: { color: colors.textMuted, fontSize: 10, marginTop: 1 },
    selectorChevron: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
    selectorChevronActiva: { color: colors.primary },

    avisoBadge: {
      backgroundColor: colors.cardBackground,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderWidth: 0.5,
      borderColor: colors.borderMedium,
    },
    avisoText: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },

    // ── Modal / Dropdown ──────────────────────────────────────
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-start',
      paddingTop: 120,
      paddingHorizontal: 16,
    },
    dropdownContainer: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: colors.borderMedium,
      overflow: 'hidden',
      maxHeight: 360,
    },
    dropdownTitle: {
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.2,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 8,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.borderMedium,
    },
    dropdownScroll: { maxHeight: 300 },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.borderMedium,
    },
    dropdownItemSelected: {
      backgroundColor: colors.primaryDim,
    },
    dropdownItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    dropdownItemText: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: '700',
    },
    dropdownItemTextSelected: { color: colors.primary },
    dropdownItemSub: { color: colors.textMuted, fontSize: 11 },
    activaBadge: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    activaBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
    dropdownCheckmark: { color: colors.primary, fontSize: 16, fontWeight: '800' },

    // ── Empty / loading ───────────────────────────────────────
    emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyEmoji: { fontSize: 48 },
    emptyTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '800' },
    emptyText: { color: colors.textSecondary, fontSize: 13, textAlign: 'center' },

    // ── FAB ───────────────────────────────────────────────────
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
