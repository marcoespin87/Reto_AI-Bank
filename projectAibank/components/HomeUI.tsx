import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import BottomNav from "./BottomNav";
import ProgressToggleCard, { ProgressData } from "./ProgressToggleCard";
import StadiumCard from "./StadiumCard";

interface Transaction {
  id: string | number;
  categoria: string;
  fecha: string;
  monto: number;
  mailes_generados: number;
}

interface UserSticker {
  id: string | number;
  stickers: {
    id: string | number;
    imagen_url: string;
    rareza: string;
  };
}

interface HomeUIProps {
  userName: string;
  mailes: number;
  saldo: number;
  numeroCuenta: string;
  transactions: Transaction[];
  misStickersRecientes: UserSticker[];
  progressData: ProgressData;
  refreshing: boolean;
  onRefresh: () => void;
  onCopiarCuenta: () => void;
  formatNumeroCuenta: (num: string) => string;
}

const DOLARES_POR_CROMO = 20;

const categoryIcon: Record<string, string> = {
  supermercado: "🛒",
  cafe: "☕",
  entretenimiento: "🎭",
  transporte: "🚗",
  viajes: "✈️",
  default: "💳",
};

export default function HomeUI({
  userName,
  mailes,
  saldo,
  numeroCuenta,
  transactions,
  misStickersRecientes,
  progressData,
  refreshing,
  onRefresh,
  onCopiarCuenta,
  formatNumeroCuenta,
}: HomeUIProps) {
  const { colors } = useTheme();
  const s = getStyles(colors);

  return (
    <SafeAreaView style={s.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={s.greeting}>Hola, {userName}</Text>
              <Text style={s.subGreeting}>BIENVENIDO AL ESTADIO</Text>
            </View>
          </View>
          {(progressData.ligaNombre || progressData.medallaNombre) && (
            <TouchableOpacity style={s.leagueBadge}>
              <Ionicons
                name="trophy-outline"
                size={11}
                color={colors.primary}
                style={{ marginRight: 4 }}
              />
              <Text style={s.leagueBadgeText}>
                {[
                  progressData.ligaNombre,
                  progressData.medallaNombre ||
                    `Medalla ${progressData.medalla}`,
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Bank Card — premium */}
        <View style={s.card}>
          <View style={s.cardPatternCircle} />
          <View style={s.cardPatternCircle2} />
          <View style={s.cardPatternLine} />
          <View style={s.cardTop}>
            <Text style={s.cardType}>AI-Bank Débito</Text>
            <Text style={s.cardBrand}>mAiles</Text>
          </View>
          <View style={s.cardMid}>
            <Text style={s.cardBalanceLabel}>Mailes acumulados</Text>
            <Text style={s.cardBalance}>
              {mailes.toLocaleString("es")} mAiles
            </Text>
          </View>
          <View style={s.cardBottom}>
            <TouchableOpacity
              onPress={onCopiarCuenta}
              activeOpacity={0.7}
              style={s.cardNumberWrap}
            >
              <Text style={s.cardNumber}>
                {formatNumeroCuenta(numeroCuenta)}
              </Text>
            </TouchableOpacity>
            <View style={s.cardChip}>
              <View style={s.chipCircle1} />
              <View style={s.chipCircle2} />
            </View>
          </View>
        </View>

        {/* Tu Progreso / Gasto Semanal - Toggle Card */}
        <ProgressToggleCard
          mailes={mailes}
          colors={colors}
          progressData={progressData}
        />

        {/* Stadium Card - World Cup 2026 */}
        <StadiumCard onPress={() => router.replace("/(tabs)/mundial")} />

        {/* Cromos Recientes */}
        <View style={s.transHeader}>
          <Text style={s.sectionTitle}>Cromos recientes</Text>
          <TouchableOpacity onPress={() => router.replace("/(tabs)/album")}>
            <Text style={s.seeAll}>Ver álbum →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
        >
          {misStickersRecientes.length > 0
            ? misStickersRecientes.slice(0, 3).map((us) => {
                const rareza = us.stickers?.rareza;
                const borderColor =
                  rareza === "epico"
                    ? colors.rarityEpicBorder
                    : rareza === "raro"
                      ? colors.rarityRareBorder
                      : colors.rarityCommonBorder;
                const badgeBg =
                  rareza === "epico"
                    ? colors.rarityEpicBg
                    : rareza === "raro"
                      ? colors.rarityRareBg
                      : colors.rarityCommonBg;
                const badgeText =
                  rareza === "epico"
                    ? "ÉPICO"
                    : rareza === "raro"
                      ? "RARO"
                      : "COMÚN";
                const badgeColor =
                  rareza === "epico"
                    ? colors.rarityEpicText
                    : rareza === "raro"
                      ? colors.rarityRareText
                      : colors.rarityCommonText;
                return (
                  <TouchableOpacity
                    key={`cromo-${us.id ?? us.stickers?.id}`}
                    style={[s.cromoCard, { borderColor }]}
                    onPress={() => router.replace("/(tabs)/album")}
                  >
                    <Image
                      source={{ uri: us.stickers?.imagen_url }}
                      style={s.cromoImage}
                    />
                    <View style={[s.cromoBadge, { backgroundColor: badgeBg }]}>
                      <Text style={[s.cromoBadgeText, { color: badgeColor }]}>
                        {badgeText}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            : [0, 1, 2].map((i) => (
                <View
                  key={`cromo-placeholder-${i}`}
                  style={[
                    s.cromoCard,
                    {
                      borderColor: colors.borderMedium,
                      backgroundColor: colors.backgroundSecondary,
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  <Text style={{ color: colors.textMuted, fontSize: 32 }}>
                    🃏
                  </Text>
                </View>
              ))}
        </ScrollView>

        {/* Recent Transactions */}
        <View style={s.transHeader}>
          <Text style={s.sectionTitle}>Movimientos recientes</Text>
          <TouchableOpacity onPress={() => router.replace("/(tabs)/banco")}>
            <Text style={s.seeAll}>Ver todo</Text>
          </TouchableOpacity>
        </View>

        {transactions.length > 0 ? (
          <View>
            {transactions.map((tx) => (
              <View key={`tx-${tx.id}`} style={s.txItem}>
                <View style={s.txIconWrap}>
                  <Text style={s.txIcon}>
                    {categoryIcon[tx.categoria?.toLowerCase()] ||
                      categoryIcon.default}
                  </Text>
                </View>
                <View style={s.txInfo}>
                  <Text style={s.txName}>{tx.categoria}</Text>
                  <Text style={s.txDate}>{tx.fecha}</Text>
                </View>
                <View style={s.txRight}>
                  <Text style={s.txAmount}>
                    -${Number(tx.monto).toFixed(2)}
                  </Text>
                  {tx.mailes_generados > 0 && (
                    <Text style={s.txMailes}>
                      +{tx.mailes_generados} mAiles
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text
            style={{
              color: colors.textMuted,
              textAlign: "center",
              marginTop: 8,
            }}
          >
            No tienes movimientos recientes
          </Text>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNav active="home" />
    </SafeAreaView>
  );
}

function getStyles(
  colors: ReturnType<
    typeof import("../context/ThemeContext").useTheme
  >["colors"],
) {
  // Detectar modo: si primary es azul claro (#b2c5ff) es DARK, si es #0052cc es LIGHT
  const isDark = colors.primary === "#b2c5ff";

  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingHorizontal: 20 },

    // Header
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 16,
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.cardBackground,
      borderWidth: 2,
      borderColor: colors.gold,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { color: colors.gold, fontWeight: "800", fontSize: 17 },
    greeting: { color: colors.primary, fontSize: 18, fontWeight: "800" },
    subGreeting: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: "600",
      letterSpacing: 1.5,
    },
    leagueBadge: {
      backgroundColor: colors.cardBackground,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 0.5,
      borderColor: colors.borderStrong,
      flexDirection: "row",
      alignItems: "center",
    },
    leagueBadgeText: { color: colors.primary, fontSize: 10, fontWeight: "700" },

    // Bank Card — premium gradient effect via layered views
    card: {
      backgroundColor: colors.primary,
      borderRadius: 24,
      padding: 24,
      marginBottom: 16,
      overflow: "hidden",
      position: "relative",
      shadowColor: colors.shadowColorBlue,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 20,
      elevation: 10,
    },
    cardPatternCircle: {
      position: "absolute",
      top: -50,
      right: -50,
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: isDark
        ? "rgba(255,255,255,0.12)"
        : "rgba(255,255,255,0.15)",
    },
    cardPatternCircle2: {
      position: "absolute",
      bottom: -30,
      left: -30,
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: isDark
        ? "rgba(255,214,91,0.15)"
        : "rgba(255,214,91,0.2)",
    },
    cardPatternLine: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 70,
      backgroundColor: isDark ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0.08)",
    },
    cardTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    cardType: {
      color: isDark ? "#002b73" : "#ffffff",
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.5,
      opacity: isDark ? 1 : 0.9,
    },
    cardBrand: {
      color: isDark ? "#002b73" : "#ffffff",
      fontSize: 22,
      fontWeight: "900",
      fontStyle: "italic",
      opacity: isDark ? 1 : 0.95,
    },
    cardMid: { marginBottom: 16 },
    cardBalanceLabel: {
      color: isDark ? "rgba(0,43,115,0.65)" : "rgba(255,255,255,0.75)",
      fontSize: 11,
      fontWeight: "500",
      marginBottom: 2,
    },
    cardBalance: {
      color: isDark ? "#002b73" : "#ffffff",
      fontSize: 36,
      fontWeight: "800",
      letterSpacing: -1,
      textShadowColor: isDark ? "rgba(0,43,115,0.15)" : "rgba(0,0,0,0.2)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: isDark ? 4 : 3,
    },
    cardBottom: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    cardNumberWrap: {},
    cardNumber: {
      color: isDark ? "#002b73" : "#ffffff",
      fontFamily: "monospace",
      fontSize: 13,
      letterSpacing: 3,
      fontWeight: "600",
      opacity: isDark ? 1 : 0.85,
    },
    cardCopyHint: {
      color: isDark ? "rgba(0,43,115,0.45)" : "rgba(255,255,255,0.65)",
      fontSize: 9,
      marginTop: 2,
    },
    cardChip: { flexDirection: "row" },
    chipCircle1: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: "rgba(255,214,91,0.85)",
      marginRight: -9,
    },
    chipCircle2: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: "rgba(255,181,157,0.85)",
    },

    // mAiles
    section: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 20,
      padding: 18,
      marginBottom: 12,
      borderWidth: 0.5,
      borderColor: colors.borderMedium,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    mailesRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    mailesLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    mailesIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.goldDim,
      borderWidth: 1,
      borderColor: colors.goldBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    mailesIcon: { fontSize: 20 },
    mailesLabel: {
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    mailesValue: {
      color: colors.gold,
      fontSize: 22,
      fontWeight: "800",
      textShadowColor: colors.goldShadow,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    medalBadge: {
      backgroundColor: colors.goldDim,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.goldBorder,
    },
    medalText: { color: colors.gold, fontSize: 11, fontWeight: "700" },
    progressRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    progressLabel: { color: colors.textSecondary, fontSize: 11 },
    starsText: { color: colors.gold, fontSize: 12 },
    progressBar: {
      height: 8,
      backgroundColor: colors.borderMedium,
      borderRadius: 4,
      overflow: "hidden",
      marginBottom: 4,
    },
    progressFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 4,
    },
    progressFillGold: {
      height: "100%",
      backgroundColor: colors.gold,
      borderRadius: 4,
    },

    // Weekly
    weeklyRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    sectionSubtitle: {
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: "500",
    },
    weeklyText: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: "700",
      marginTop: 2,
    },
    weeklyAmount: { color: colors.primary },
    mailesBadge: {
      backgroundColor: colors.goldDim,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.goldBorder,
    },
    mailesBadgeText: { color: colors.gold, fontSize: 11, fontWeight: "700" },
    nextStar: { color: colors.gold, fontSize: 10, marginTop: 6 },

    // Transactions
    transHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
      marginTop: 4,
    },
    sectionTitle: {
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: "800",
    },
    seeAll: { color: colors.primary, fontSize: 13, fontWeight: "600" },
    txItem: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 16,
      padding: 14,
      marginBottom: 8,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 0.5,
      borderColor: colors.borderMedium,
    },
    txIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.cardBackground,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    txIcon: { fontSize: 22 },
    txInfo: { flex: 1 },
    txName: { color: colors.textPrimary, fontSize: 14, fontWeight: "700" },
    txDate: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
    txRight: { alignItems: "flex-end" },
    txAmount: { color: colors.textPrimary, fontSize: 14, fontWeight: "700" },
    txMailes: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: "700",
      marginTop: 2,
    },

    emptyCromos: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 16,
      padding: 20,
      marginRight: 12,
      justifyContent: "center",
      width: 280,
    },
    emptyCromosText: {
      color: colors.textMuted,
      fontSize: 12,
      textAlign: "center",
    },
    cromoCard: {
      width: 100,
      aspectRatio: 3 / 4,
      borderRadius: 12,
      marginRight: 10,
      overflow: "hidden",
      borderWidth: 1.5,
      position: "relative",
    },
    cromoImage: { width: "100%", height: "100%" },
    cromoBadge: {
      position: "absolute",
      bottom: 4,
      left: 4,
      right: 4,
      paddingVertical: 3,
      borderRadius: 6,
      alignItems: "center",
    },
    cromoBadgeText: { fontSize: 8, fontWeight: "800" },
  });
}
