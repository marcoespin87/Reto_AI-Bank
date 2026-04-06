import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FloatingChatBubble from "../components/FloatingChatBubble";
import { useAuth } from "../context/AuthContext";
import { useNextMatch } from "../hooks/useNextMatch";
import { useUserSummary } from "../hooks/useUserSummary";
import { colors } from "../theme/colors";
import { formatDateTime, getCountdown } from "../utils/format";

// Component: Forma Reciente dots — datos vienen del API (forma_actual: "WWLWW")
function RecentFormDots({ formaActual }: { formaActual?: string | null }) {
  const results = (formaActual ?? "").split("").filter((c) => ["W", "D", "L"].includes(c));
  if (!results.length) return null;
  return (
    <View style={s.formDotsRow}>
      {results.map((result, i) => (
        <View
          key={i}
          style={[
            s.formDot,
            {
              backgroundColor:
                result === "W" ? colors.primary : colors.outlineVariant,
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function PrediccionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { token } = useAuth();
  const { data, error, loading, saving, loadMatch, submitPrediction } =
    useNextMatch();
  const { data: userData, loadSummary } = useUserSummary();
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);

  useEffect(() => {
    if (token) {
      loadMatch(token);
      loadSummary(token);
    }
  }, [loadMatch, loadSummary, token]);

  useEffect(() => {
    if (data?.currentPrediction) {
      setScoreA(data.currentPrediction.homeScore);
      setScoreB(data.currentPrediction.awayScore);
    }
  }, [data]);

  const handleSave = async () => {
    if (!token || !data) {
      Alert.alert("Error", "No hay datos del partido disponibles");
      return;
    }

    Alert.alert(
      "Confirmar predicción",
      `Vas a guardar: ${data.homeTeam} ${scoreA} - ${scoreB} ${data.awayTeam}`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Aceptar",
          onPress: async () => {
            try {
              const saved = await submitPrediction(token, {
                matchId: data.id,
                homeScore: scoreA,
                awayScore: scoreB,
              });

              if (saved) {
                Alert.alert(
                  "✓ Predicción guardada",
                  `${saved.mailes} mAiles ganados 🎉`,
                  [{ text: "Finalizar", onPress: () => navigation.goBack() }],
                );
              } else {
                Alert.alert(
                  "Error",
                  "No se pudo guardar la predicción. Intenta de nuevo.",
                );
              }
            } catch (err) {
              Alert.alert(
                "Error",
                "Ocurrió un error al guardar. Intenta de nuevo.",
              );
              console.error("Error saving prediction:", err);
            }
          },
        },
      ],
    );
  };

  if (loading && !data) {
    return (
      <View style={s.root}>
        <View style={[s.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={s.headerInfo}>
            <Text style={s.headerTitle}>Predicción</Text>
            <Text style={s.headerSub}>Fase de Grupos</Text>
          </View>
        </View>
        <View style={s.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.loadingText}>Cargando partido...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.root}>
      {/* Top Navigation */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <View style={s.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={s.headerInfo}>
            <Text style={s.headerTitle}>Predicción</Text>
            <Text style={s.headerSub}>Fase de Grupos</Text>
          </View>
        </View>
        <View style={s.headerRight}>
          <Text style={s.headerRank}>{userData?.user.leagueTier ?? ''}</Text>
          <Text style={s.headerMedal}>
            {userData?.user.medalLevel ? `Medalla ${userData.user.medalLevel}` : ''}
          </Text>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Match Card */}
        <View style={s.heroCard}>
          <View style={s.heroBadge}>
            <Text style={s.heroBadgeText}>{getCountdown(data?.matchDate ?? null)}</Text>
          </View>

          {data ? (
            <>
              {/* Matchup */}
              <View style={s.matchupContainer}>
                {/* Home Team */}
                <View style={s.teamBlock}>
                  <View style={s.teamFlag}>
                    <Text style={s.flagEmoji}>🌐</Text>
                  </View>
                  <Text style={s.teamName}>{data.homeTeam}</Text>
                </View>

                {/* Divider */}
                <View style={s.divider}>
                  <Text style={s.dividerText}>VS</Text>
                  <View style={s.dividerLine} />
                </View>

                {/* Away Team */}
                <View style={s.teamBlock}>
                  <View style={s.teamFlag}>
                    <Text style={s.flagEmoji}>🌐</Text>
                  </View>
                  <Text style={s.teamName}>{data.awayTeam}</Text>
                </View>
              </View>

              {/* Location & Date */}
              <View style={s.heroFooter}>
                <Text style={s.stadiumText}>{(data as any)?.venue ?? 'Estadio por confirmar'}</Text>
                <Text style={s.dateText}>{formatDateTime(data?.matchDate ?? null)}</Text>
              </View>
            </>
          ) : null}
        </View>

        {/* Error Card */}
        {error ? (
          <View style={s.errorCard}>
            <MaterialIcons
              name="error-outline"
              size={18}
              color={colors.error}
            />
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Stats Grid - Bento Style */}
        {data && (
          <>
            {/* Forma Reciente - Full Width */}
            {(data.stats?.home?.forma_actual || data.stats?.away?.forma_actual) && (
              <View style={[s.statBox, s.statBoxFull]}>
                <Text style={s.statLabel}>Forma Reciente</Text>
                <View style={s.formaContainer}>
                  <View style={s.formaTeam}>
                    <RecentFormDots formaActual={data.stats?.home?.forma_actual} />
                    <Text style={s.formaLabel}>{data.homeTeam}</Text>
                  </View>
                  <View style={s.formaTeam}>
                    <RecentFormDots formaActual={data.stats?.away?.forma_actual} />
                    <Text style={s.formaLabel}>{data.awayTeam}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* 2-Column Grid */}
            <View style={s.twoColumnGrid}>
              {/* FIFA Ranking */}
              <View style={s.statBox}>
                <Text style={s.statLabel}>FIFA Ranking</Text>
                <View style={s.statCompare}>
                  <View style={s.statCompareItem}>
                    <Text style={s.statValue}>
                      #{data.stats?.home?.ranking_fifa ?? "?"}
                    </Text>
                  </View>
                  <Text style={s.statCompareConnector}>vs</Text>
                  <View style={s.statCompareItem}>
                    <Text style={s.statValueSmall}>
                      #{data.stats?.away?.ranking_fifa ?? "?"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Goals Stats */}
              <View style={s.statBox}>
                <Text style={s.statLabel}>Goles (A:R)</Text>
                <View style={s.statCompare}>
                  <View style={s.statCompareItem}>
                    <Text style={s.statValue}>
                      {data.stats?.home?.goles_anotados_temporada ?? 0}:
                      {data.stats?.home?.goles_recibidos_temporada ?? 0}
                    </Text>
                  </View>
                  <Text style={s.statCompareConnector}>vs</Text>
                  <View style={s.statCompareItem}>
                    <Text style={s.statValueSmall}>
                      {data.stats?.away?.goles_anotados_temporada ?? 0}:
                      {data.stats?.away?.goles_recibidos_temporada ?? 0}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Key Players - pendiente de datos del backend (jugador_clave) */}

            {/* H2H Record */}
            {(() => {
              const ganados = data.stats?.home?.h2h_ganados ?? 0;
              const empatados = data.stats?.home?.h2h_empatados ?? 0;
              const perdidos = data.stats?.home?.h2h_perdidos ?? 0;
              const total = ganados + empatados + perdidos;
              const wPct = total > 0 ? `${((ganados / total) * 100).toFixed(0)}%` : '0%';
              const dPct = total > 0 ? `${((empatados / total) * 100).toFixed(0)}%` : '0%';
              const lPct = total > 0 ? `${((perdidos / total) * 100).toFixed(0)}%` : '0%';
              return (
                <View style={[s.statBox, s.statBoxFull]}>
                  <Text style={s.statLabel}>Cara a Cara (H2H)</Text>
                  <View style={s.h2hBar}>
                    <View style={[s.h2hSegment, { width: wPct, backgroundColor: colors.primary }]} />
                    <View style={[s.h2hSegment, { width: dPct, backgroundColor: colors.outlineVariant }]} />
                    <View style={[s.h2hSegment, { width: lPct, backgroundColor: colors.surfaceVariant }]} />
                  </View>
                  <View style={s.h2hLabels}>
                    <Text style={s.h2hLabel}>
                      <Text style={{ color: colors.primary }}>{ganados} Ganados</Text>
                    </Text>
                    <Text style={s.h2hLabel}>{empatados} Empates</Text>
                    <Text style={s.h2hLabel}>{perdidos} Perdidos</Text>
                  </View>
                </View>
              );
            })()}

            {/* Rewards Preview */}
            <View style={s.rewardsCard}>
              <View style={s.rewardRow}>
                <Text style={s.rewardLabel}>Marcador exacto</Text>
                <Text style={[s.rewardAmount, { color: colors.secondary }]}>
                  +1,000 mAiles
                </Text>
              </View>
              <View style={s.rewardRow}>
                <Text style={s.rewardLabel}>Ganador correcto</Text>
                <Text style={[s.rewardAmount, { color: colors.primary }]}>
                  +300 mAiles
                </Text>
              </View>
              <View style={[s.rewardRow, s.rewardRowDivider]}>
                <Text style={s.rewardLabel}>Racha activa</Text>
                <Text style={[s.rewardAmount, { color: colors.tertiary }]}>
                  +200 mAiles extra
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom Action Bar - with Glassmorphism */}
      <View style={[s.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        {/* Score Selectors */}
        <View style={s.scoreRow}>
          {/* Home Score */}
          <View style={s.scoreColumn}>
            <Text style={s.scoreTeamLabel}>{data?.homeTeam ?? "Local"}</Text>
            <View style={s.scoreControl}>
              <TouchableOpacity
                style={s.scoreBtn}
                onPress={() => setScoreA(Math.max(0, scoreA - 1))}
              >
                <MaterialIcons name="remove" size={20} color={colors.primary} />
              </TouchableOpacity>
              <Text style={s.scoreNumber}>{scoreA}</Text>
              <TouchableOpacity
                style={s.scoreBtn}
                onPress={() => setScoreA(scoreA + 1)}
              >
                <MaterialIcons name="add" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Divider */}
          <Text style={s.scoreDivider}>-</Text>

          {/* Away Score */}
          <View style={s.scoreColumn}>
            <Text style={s.scoreTeamLabel}>
              {data?.awayTeam ?? "Visitante"}
            </Text>
            <View style={s.scoreControl}>
              <TouchableOpacity
                style={s.scoreBtn}
                onPress={() => setScoreB(Math.max(0, scoreB - 1))}
              >
                <MaterialIcons name="remove" size={20} color={colors.primary} />
              </TouchableOpacity>
              <Text style={s.scoreNumber}>{scoreB}</Text>
              <TouchableOpacity
                style={s.scoreBtn}
                onPress={() => setScoreB(scoreB + 1)}
              >
                <MaterialIcons name="add" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <LinearGradient
          colors={[colors.primary, colors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.confirmBtn}
        >
          <TouchableOpacity
            onPress={handleSave}
            disabled={!data || saving}
            style={s.confirmBtnInner}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.onPrimary} />
            ) : (
              <>
                <MaterialIcons name="star" size={20} color={colors.onPrimary} />
                <Text style={s.confirmBtnText}>Confirmar predicción</Text>
              </>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <FloatingChatBubble visible />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.outlineVariant}1A`,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    lineHeight: 20,
  },
  headerSub: {
    fontSize: 10,
    color: `${colors.onSurface}99`,
    marginTop: 2,
  },
  headerRank: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  headerMedal: {
    fontSize: 10,
    color: colors.onSurface,
    marginTop: 2,
  },

  // Content
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 12, gap: 14, paddingTop: 8 },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: { fontSize: 14, color: colors.onSurfaceVariant },

  // Hero Card with Stadium Glow
  heroCard: {
    borderRadius: 14,
    padding: 16,
    gap: 12,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: `${colors.outlineVariant}1A`,
    marginHorizontal: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: `${colors.secondary}2A`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${colors.secondary}33`,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.secondary,
  },

  matchupContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  teamBlock: { alignItems: "center", gap: 8 },
  teamFlag: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerHighest,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  flagEmoji: { fontSize: 28 },
  teamName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.onSurface,
  },

  divider: { alignItems: "center", gap: 4 },
  dividerText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.onSurfaceVariant,
  },
  dividerLine: {
    width: 20,
    height: 1,
    backgroundColor: `${colors.outlineVariant}4D`,
  },

  heroFooter: { alignItems: "center", gap: 2 },
  stadiumText: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    fontWeight: "600",
  },
  dateText: { fontSize: 10, color: `${colors.onSurfaceVariant}99` },

  // Error
  errorCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: `${colors.error}1A`,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: `${colors.error}33`,
    alignItems: "center",
    marginHorizontal: 4,
  },
  errorText: { flex: 1, color: colors.error, fontSize: 12 },

  // Stats Grid
  twoColumnGrid: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 4,
  },
  statBox: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 12,
    flex: 1,
    borderWidth: 1,
    borderColor: `${colors.outlineVariant}1A`,
  },
  statBoxFull: {
    marginHorizontal: 4,
    flex: undefined,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.onSurfaceVariant,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Forma Reciente
  formaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  formaTeam: {
    flex: 1,
    gap: 8,
  },
  formDotsRow: {
    flexDirection: "row",
    gap: 6,
  },
  formDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  formaLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.primary,
    backgroundColor: `${colors.primary}1A`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },

  // Stat Compare
  statCompare: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statCompareItem: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.onSurface,
  },
  statValueSmall: {
    fontSize: 16,
    fontWeight: "700",
    color: `${colors.onSurface}99`,
  },
  statCompareConnector: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginHorizontal: 8,
  },

  // Key Players
  keyPlayersBox: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  keyPlayersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  playerItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  playerItemRight: {
    justifyContent: "flex-end",
    gap: 10,
  },
  playerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: `${colors.surfaceVariant}`,
  },
  playerEmoji: {
    fontSize: 16,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.onSurface,
  },
  playerNameRight: {
    textAlign: "right",
  },
  playerStat: {
    fontSize: 10,
    color: colors.primary,
    marginTop: 2,
  },
  playerStatRight: {
    textAlign: "right",
    color: colors.onSurfaceVariant,
  },

  // H2H
  h2hBar: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: colors.surfaceContainerHighest,
    marginBottom: 10,
  },
  h2hSegment: {
    height: "100%",
  },
  h2hLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  h2hLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.onSurfaceVariant,
  },

  // Rewards
  rewardsCard: {
    backgroundColor: `${colors.surfaceContainerLowest}CC`,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: `${colors.outlineVariant}1A`,
  },
  rewardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rewardRowDivider: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: `${colors.outlineVariant}1A`,
    marginTop: 6,
  },
  rewardLabel: { fontSize: 11, color: colors.onSurfaceVariant },
  rewardAmount: { fontSize: 11, fontWeight: "700" },

  // Bottom Bar - Glassmorphic Effect
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `${colors.surface}E6`,
    paddingHorizontal: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: `${colors.outlineVariant}1A`,
    gap: 12,
  },

  // Score Row
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  scoreColumn: { alignItems: "center", gap: 6, flex: 1 },
  scoreTeamLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.onSurfaceVariant,
  },
  scoreControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${colors.outlineVariant}2A`,
  },
  scoreBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.onSurface,
    minWidth: 28,
    textAlign: "center",
  },
  scoreDivider: {
    fontSize: 18,
    fontWeight: "300",
    color: `${colors.onSurfaceVariant}33`,
  },

  // Confirm Button
  confirmBtn: {
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 2,
  },
  confirmBtnInner: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.onPrimary,
  },
});
