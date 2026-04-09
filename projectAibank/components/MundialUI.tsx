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
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import BottomNav from "./BottomNav";
import ChatbotModal from "./ChatbotModal";

export const PARTIDO = {
  id: "ecua-civ-2026",
  fase: "Fase de Grupos",
  jornada: "Jornada 1",
  cierrePrediccion: "2h 48m",
  estadio: "Estadio AT&T, Dallas",
  fecha: "15 de Junio",
  hora: "18:00",
  local: {
    nombre: "Ecuador",
    bandera: "🇪🇨",
    iso: "ec",
    alias: "ECU",
    ranking: 41,
    goles: { anotados: 4, recibidos: 3 },
    forma: ["G", "G", "E", "G", "P"] as Array<"G" | "E" | "P">,
    jugadorClave: { nombre: "Enner Valencia", stats: "5 goles mundialistas" },
    racha: "En racha",
  },
  visitante: {
    nombre: "Costa de Marfil",
    bandera: "🇨🇮",
    iso: "ci",
    alias: "CIV",
    ranking: 52,
    goles: { anotados: 3, recibidos: 2 },
    forma: ["G", "E", "G", "G", "P"] as Array<"G" | "E" | "P">,
    jugadorClave: {
      nombre: "Sébastien Haller",
      stats: "2 goles • 1 asistencia",
    },
    racha: "Irregular",
  },
  h2h: { ganados: 3, empates: 2, perdidos: 4 },
  recompensas: {
    marcadorExacto: 1000,
    ganadorCorrecto: 300,
    rachaBono: 200,
  },
};

export interface MundialUIProps {
  ligaNombre: string;
  medallaNombre: string;
  medallaActual: number;
  golesLocal: number;
  golesVisitante: number;
  prediccionEnviada: boolean;
  submitting: boolean;
  rachaActiva: boolean;
  mostrarPrediccion: boolean;
  chatbotVisible: boolean;
  pulseAnim: Animated.Value;
  onBack: () => void;
  onPredecir: () => void;
  onClosePredecir: () => void;
  onGolesLocalChange: (v: number) => void;
  onGolesVisitanteChange: (v: number) => void;
  onConfirmar: () => void;
  onOpenChatbot: () => void;
  onCloseChatbot: () => void;
}

export default function MundialUI({
  ligaNombre,
  medallaNombre,
  medallaActual,
  golesLocal,
  golesVisitante,
  prediccionEnviada,
  submitting,
  rachaActiva,
  mostrarPrediccion,
  chatbotVisible,
  pulseAnim,
  onBack,
  onPredecir,
  onClosePredecir,
  onGolesLocalChange,
  onGolesVisitanteChange,
  onConfirmar,
  onOpenChatbot,
  onCloseChatbot,
}: MundialUIProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  // BottomNav height ≈ 60px (paddingVertical + icon + label) + safe area bottom
  const navHeight = 60 + insets.bottom;
  // FAB sits just above BottomNav
  const fabBottom = navHeight + 14;

  const FORMA_COLOR: Record<"G" | "E" | "P", string> = {
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
          <TouchableOpacity onPress={onBack} style={s.backBtn}>
            <Text style={s.backIcon}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={s.topNavTitle}>Predicción</Text>
            <Text style={s.topNavSub}>
              {PARTIDO.fase} · {PARTIDO.jornada}
            </Text>
          </View>
        </View>
        {(ligaNombre || medallaNombre) && (
          <View style={s.topNavRight}>
            {ligaNombre ? <Text style={s.ligaText}>{ligaNombre}</Text> : null}
            <Text style={s.medalText}>{medallaNombre || `Medalla ${medallaActual}`}</Text>
          </View>
        )}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
        >
          {/* Hero Card */}
          <View style={s.heroCard}>
            <Animated.View style={[s.countdownBadge, { opacity: pulseAnim }]}>
              <Text style={s.countdownText}>
                ⏱ Predicción cierra en {PARTIDO.cierrePrediccion}
              </Text>
            </Animated.View>

            <View style={s.teamsRow}>
              <View style={s.teamCol}>
                <View style={s.flagCircle}>
                  <Image
                    source={{
                      uri: `https://flagcdn.com/w80/${PARTIDO.local.iso}.png`,
                    }}
                    style={s.flagImg}
                    resizeMode="cover"
                  />
                </View>
                <Text style={s.teamName}>{PARTIDO.local.nombre}</Text>
              </View>
              <View style={s.vsCol}>
                <Text style={s.vsText}>VS</Text>
                <View style={s.vsDivider} />
              </View>
              <View style={s.teamCol}>
                <View style={s.flagCircle}>
                  <Image
                    source={{
                      uri: `https://flagcdn.com/w80/${PARTIDO.visitante.iso}.png`,
                    }}
                    style={s.flagImg}
                    resizeMode="cover"
                  />
                </View>
                <Text style={s.teamName}>{PARTIDO.visitante.nombre}</Text>
              </View>
            </View>

            <View style={s.matchInfoRow}>
              <Text style={s.matchEstadio}>{PARTIDO.estadio}</Text>
              <Text style={s.matchFecha}>
                {PARTIDO.fecha} · {PARTIDO.hora}
              </Text>
              <TouchableOpacity style={s.predecirBtn} onPress={onPredecir}>
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
                  <View
                    key={i}
                    style={[s.dot, { backgroundColor: FORMA_COLOR[r] }]}
                  />
                ))}
              </View>
              <View style={s.formaDots}>
                {PARTIDO.visitante.forma.map((r, i) => (
                  <View
                    key={i}
                    style={[s.dot, { backgroundColor: FORMA_COLOR[r] }]}
                  />
                ))}
              </View>
            </View>
            <View style={s.rachaRow}>
              <View style={s.rachaBadge}>
                <Text style={s.rachaBadgeText}>{PARTIDO.local.racha}</Text>
              </View>
              <View style={[s.rachaBadge, s.rachaBadgeMuted]}>
                <Text style={s.rachaBadgeTextMuted}>
                  {PARTIDO.visitante.racha}
                </Text>
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
                <Text style={s.rankBig}>
                  {PARTIDO.local.goles.anotados}:{PARTIDO.local.goles.recibidos}
                </Text>
                <Text style={s.rankVs}> vs </Text>
                <Text style={s.rankSmall}>
                  {PARTIDO.visitante.goles.anotados}:
                  {PARTIDO.visitante.goles.recibidos}
                </Text>
              </View>
            </View>
          </View>
          {/* Bento: Jugadores Clave */}
          <View style={s.bentoCard}>
            <Text style={s.bentoLabel}>JUGADORES CLAVE 🏆</Text>
            <View style={s.jugadoresRow}>
              <View style={s.jugadorLeft}>
                <View style={s.jugadorAvatar}>
                  <Image
                    source={{
                      uri: `https://flagcdn.com/w80/${PARTIDO.local.iso}.png`,
                    }}
                    style={s.jugadorFlagImg}
                    resizeMode="cover"
                  />
                </View>
                <View>
                  <Text style={s.jugadorNombre}>
                    {PARTIDO.local.jugadorClave.nombre}
                  </Text>
                  <Text style={s.jugadorStats}>
                    {PARTIDO.local.jugadorClave.stats}
                  </Text>
                </View>
              </View>
              <View style={s.jugadorRight}>
                <View>
                  <Text
                    style={[
                      s.jugadorNombre,
                      { textAlign: "right", opacity: 0.7 },
                    ]}
                  >
                    {PARTIDO.visitante.jugadorClave.nombre}
                  </Text>
                  <Text style={[s.jugadorStats, { textAlign: "right" }]}>
                    {PARTIDO.visitante.jugadorClave.stats}
                  </Text>
                </View>
                <View
                  style={[
                    s.jugadorAvatar,
                    { borderColor: colors.borderStrong },
                  ]}
                >
                  <Image
                    source={{
                      uri: `https://flagcdn.com/w80/${PARTIDO.visitante.iso}.png`,
                    }}
                    style={s.jugadorFlagImg}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </View>{" "}
            {/* <-- Cierre de jugadoresRow */}
          </View>{" "}
          {/* <-- Cierre de bentoCard */}
          {/* Bento: H2H */}
          <View style={s.bentoCard}>
            <Text style={s.bentoLabel}>CARA A CARA (H2H)</Text>
            <View style={s.h2hBar}>
              <View
                style={[
                  s.h2hSegment,
                  {
                    flex: PARTIDO.h2h.ganados,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
              <View
                style={[
                  s.h2hSegment,
                  {
                    flex: PARTIDO.h2h.empates,
                    backgroundColor: colors.textMuted,
                  },
                ]}
              />
              <View
                style={[
                  s.h2hSegment,
                  {
                    flex: PARTIDO.h2h.perdidos,
                    backgroundColor: colors.borderMedium,
                  },
                ]}
              />
            </View>
            <View style={s.h2hLabels}>
              <Text style={s.h2hLabel}>{PARTIDO.h2h.ganados} Ganados</Text>
              <Text style={[s.h2hLabel, { color: colors.textSecondary }]}>
                {PARTIDO.h2h.empates} Empates
              </Text>
              <Text style={[s.h2hLabel, { color: colors.textMuted }]}>
                {PARTIDO.h2h.perdidos} Perdidos
              </Text>
            </View>
          </View>
          <View style={{ height: 260 }} />
        </ScrollView>

        {/* Sticky Bottom: Predicción */}
        {mostrarPrediccion && (
          <View style={[s.stickyBottom, { bottom: navHeight }]}>
            <TouchableOpacity onPress={onClosePredecir} style={s.closeBtn}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>

            <View style={s.steppersRow}>
              <View style={s.stepperCol}>
                <Image
                  source={{
                    uri: `https://flagcdn.com/w80/${PARTIDO.local.iso}.png`,
                  }}
                  style={s.stepperFlagImg}
                  resizeMode="cover"
                />
                <View style={s.stepperBox}>
                  <TouchableOpacity
                    style={s.stepperBtn}
                    onPress={() =>
                      onGolesLocalChange(Math.max(0, golesLocal - 1))
                    }
                    disabled={prediccionEnviada}
                  >
                    <Text style={s.stepperBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={s.stepperValue}>{golesLocal}</Text>
                  <TouchableOpacity
                    style={s.stepperBtn}
                    onPress={() => onGolesLocalChange(golesLocal + 1)}
                    disabled={prediccionEnviada}
                  >
                    <Text style={s.stepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={s.stepperDash}>—</Text>

              <View style={s.stepperCol}>
                <Image
                  source={{
                    uri: `https://flagcdn.com/w80/${PARTIDO.visitante.iso}.png`,
                  }}
                  style={s.stepperFlagImg}
                  resizeMode="cover"
                />
                <View style={s.stepperBox}>
                  <TouchableOpacity
                    style={s.stepperBtn}
                    onPress={() =>
                      onGolesVisitanteChange(Math.max(0, golesVisitante - 1))
                    }
                    disabled={prediccionEnviada}
                  >
                    <Text style={s.stepperBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={s.stepperValue}>{golesVisitante}</Text>
                  <TouchableOpacity
                    style={s.stepperBtn}
                    onPress={() => onGolesVisitanteChange(golesVisitante + 1)}
                    disabled={prediccionEnviada}
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
                  +{PARTIDO.recompensas.marcadorExacto.toLocaleString()} mAiles
                </Text>
              </View>
              <View style={s.rewardRow}>
                <Text style={s.rewardLabel}>Ganador correcto</Text>
                <Text style={s.rewardBlue}>
                  +{PARTIDO.recompensas.ganadorCorrecto} mAiles
                </Text>
              </View>
              {rachaActiva && (
                <View style={[s.rewardRow, s.rewardBorder]}>
                  <Text style={s.rewardRacha}>Racha activa 🔥</Text>
                  <Text style={s.rewardRacha}>
                    +{PARTIDO.recompensas.rachaBono} mAiles extra
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[s.ctaBtn, prediccionEnviada && s.ctaBtnDone]}
              onPress={onConfirmar}
              disabled={prediccionEnviada || submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#002b73" />
              ) : (
                <Text
                  style={[
                    s.ctaBtnText,
                    prediccionEnviada && { color: colors.primary },
                  ]}
                >
                  {prediccionEnviada
                    ? `✓ Predicción enviada · ${golesLocal}-${golesVisitante}`
                    : "Confirmar predicción ⭐"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* FAB Chatbot — positioned above BottomNav using safe area insets */}
      {!mostrarPrediccion && (
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
  colors: ReturnType<
    typeof import("../context/ThemeContext").useTheme
  >["colors"],
) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingHorizontal: 16, paddingTop: 8 },

    topNav: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 14,
      backgroundColor: colors.background,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.borderMedium,
    },
    topNavLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.backgroundSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    backIcon: { color: colors.primary, fontSize: 18, fontWeight: "700" },
    topNavTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "800" },
    topNavSub: {
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: "500",
      marginTop: 1,
    },
    topNavRight: { alignItems: "flex-end" },
    ligaText: { color: colors.primary, fontSize: 12, fontWeight: "700" },
    medalText: { color: colors.textSecondary, fontSize: 10, fontWeight: "500" },

    heroCard: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 20,
      padding: 20,
      marginBottom: 12,
      borderWidth: 0.5,
      borderColor: colors.borderMedium,
      boxShadow: `0 4px 20px ${colors.shadowColorBlue}`,
      elevation: 6,
    },
    countdownBadge: {
      alignSelf: "flex-end",
      backgroundColor: colors.errorDim,
      borderWidth: 1,
      borderColor: colors.error,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      marginBottom: 16,
    },
    countdownText: { color: colors.error, fontSize: 10, fontWeight: "700" },
    teamsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    teamCol: { alignItems: "center", gap: 8, flex: 1 },
    flagCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.cardBackground,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1.5,
      borderColor: colors.borderMedium,
    },
    flagEmoji: { fontSize: 44 },
    flagImg: { width: 58, height: 58, borderRadius: 29 },
    teamName: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: "800",
      textAlign: "center",
    },
    vsCol: { alignItems: "center", gap: 4 },
    vsText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: "800",
    },
    vsDivider: { width: 24, height: 1, backgroundColor: colors.borderStrong },
    matchInfoRow: { alignItems: "center", gap: 2 },
    matchEstadio: {
      color: colors.textPrimary,
      fontSize: 11,
      fontWeight: "600",
      fontStyle: "italic",
      marginTop: 8,
      textShadowColor: colors.shadowColor,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 0,
    },
    matchFecha: {
      color: colors.textSecondary,
      fontSize: 11,
      marginTop: 2,
    },
    matchQuote: {
      color: colors.textSecondary,
      fontSize: 11,
      fontStyle: "italic",
      marginTop: 8,
      textAlign: "center",
    },
    predecirBtn: {
      backgroundColor: colors.gold,
      borderRadius: 14,
      paddingHorizontal: 24,
      paddingVertical: 12,
      marginTop: 12,
      boxShadow: `0 4px 8px ${colors.goldShadow}`,
      elevation: 6,
    },
    predecirBtnText: {
      color: colors.textOnGold,
      fontWeight: "800",
      fontSize: 14,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    bentoCard: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 16,
      padding: 16,
      marginBottom: 10,
      borderWidth: 0.5,
      borderColor: colors.borderMedium,
    },
    bentoRow: { flexDirection: "row", gap: 10 },
    bentoHalf: { flex: 1, marginBottom: 10 },
    bentoLabel: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 1.2,
      marginBottom: 10,
    },

    formaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    formaDots: { flexDirection: "row", gap: 6 },
    dot: { width: 12, height: 12, borderRadius: 6 },
    rachaRow: { flexDirection: "row", justifyContent: "space-between" },
    rachaBadge: {
      backgroundColor: colors.primaryDim,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
    },
    rachaBadgeMuted: { backgroundColor: colors.cardBackground },
    rachaBadgeText: {
      color: colors.primary,
      fontSize: 9,
      fontWeight: "700",
      textShadowColor: colors.shadowColor,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 0,
    },
    rachaBadgeTextMuted: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: "700",
      textShadowColor: colors.shadowColor,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 0,
    },

    rankRow: { flexDirection: "row", alignItems: "baseline", marginTop: 4 },
    rankBig: {
      color: colors.gold,
      fontSize: 24,
      fontWeight: "800",
      textShadowColor: colors.shadowColor,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 0,
    },
    rankVs: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: "800",
      textShadowColor: colors.shadowColor,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 0,
    },
    rankSmall: {
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: "700",
      textShadowColor: colors.shadowColor,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 0,
    },

    jugadoresRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    jugadorLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
    },
    jugadorRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
      justifyContent: "flex-end",
    },
    jugadorAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: colors.primaryBorder,
      backgroundColor: colors.cardBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    jugadorEmoji: { fontSize: 22 },
    jugadorFlagImg: { width: 36, height: 36, borderRadius: 18 },
    jugadorNombre: {
      color: colors.textPrimary,
      fontSize: 13,
      fontWeight: "700",
    },
    jugadorStats: {
      color: colors.textMuted,
      fontSize: 10,
      marginTop: 1,
    },

    h2hBar: {
      flexDirection: "row",
      height: 8,
      borderRadius: 4,
      overflow: "hidden",
      marginBottom: 8,
    },
    h2hSegment: { height: "100%" },
    h2hLabels: { flexDirection: "row", justifyContent: "space-between" },
    h2hLabel: {
      color: colors.textPrimary,
      fontSize: 10,
      fontWeight: "800",
    },

    chatFab: {
      position: "absolute",
      bottom: 80,
      right: 20,
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.cardBackground,
      borderWidth: 1.5,
      borderColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      boxShadow: `0 4px 12px ${colors.shadowColorBlue}`,
      elevation: 8,
    },
    chatFabIcon: { fontSize: 24 },

    stickyBottom: {
      position: "absolute",
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
      position: "absolute",
      top: 12,
      right: 16,
      zIndex: 10,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.cardBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    closeBtnText: {
      color: colors.textSecondary,
      fontSize: 16,
      fontWeight: "700",
    },
    steppersRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    },
    stepperCol: { alignItems: "center", gap: 8 },
    stepperFlag: { fontSize: 28 },
    stepperFlagImg: { width: 44, height: 30, borderRadius: 4 },
    stepperBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 4,
    },
    stepperBtn: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    stepperBtnText: { color: colors.primary, fontSize: 22, fontWeight: "700" },
    stepperValue: {
      color: colors.textPrimary,
      fontSize: 24,
      fontWeight: "800",
      width: 40,
      textAlign: "center",
    },
    stepperDash: { color: colors.textMuted, fontSize: 28, fontWeight: "200" },
    rewardsCard: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 14,
      padding: 12,
      marginBottom: 12,
    },
    rewardRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    rewardBorder: {
      borderTopWidth: 0.5,
      borderTopColor: colors.borderMedium,
      paddingTop: 8,
      marginTop: 4,
    },
    rewardLabel: { color: colors.textSecondary, fontSize: 11 },
    rewardGold: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: "700",
      textShadowColor: colors.shadowColor,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 0,
    },
    rewardBlue: {
      color: colors.primary,
      fontSize: 11,
      fontWeight: "700",
      textShadowColor: colors.shadowColor,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 0,
    },
    rewardRacha: {
      color: colors.warning,
      fontSize: 11,
      fontWeight: "700",
      textShadowColor: colors.shadowColor,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 0,
    },
    ctaBtn: {
      height: 52,
      borderRadius: 16,
      backgroundColor: colors.gold,
      alignItems: "center",
      justifyContent: "center",
      boxShadow: `0 4px 8px ${colors.goldShadow}`,
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
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      textShadowColor: colors.shadowColor,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 0,
    },
  });
}
