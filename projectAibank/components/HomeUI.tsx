import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BottomNav from "./BottomNav";
import { useTheme } from "../context/ThemeContext";

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

const defaultTransactions = [
  {
    id: "default-1",
    name: "Supermercado Premium",
    time: "Hace 2 horas",
    amount: "$45.00",
    mailes: "+18 mAiles",
    icon: "🛒",
  },
  {
    id: "default-2",
    name: "Star Stadium Coffee",
    time: "Ayer, 09:15 AM",
    amount: "$8.50",
    mailes: "+2 mAiles",
    icon: "☕",
  },
  {
    id: "default-3",
    name: "Entradas Final Mundial",
    time: "12 Jun",
    amount: "$1,200.00",
    mailes: "+500 mAiles",
    icon: "⚽",
  },
];

export default function HomeUI({
  userName,
  mailes,
  saldo,
  numeroCuenta,
  transactions,
  misStickersRecientes,
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
          <TouchableOpacity style={s.leagueBadge}>
            <Ionicons
              name="trophy-outline"
              size={11}
              color={colors.primary}
              style={{ marginRight: 4 }}
            />
            <Text style={s.leagueBadgeText}>Liga Plata • Medalla 3</Text>
          </TouchableOpacity>
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
            <Text style={s.cardBalanceLabel}>Saldo disponible</Text>
            <Text style={s.cardBalance}>
              ${saldo.toLocaleString("es", { minimumFractionDigits: 2 })}
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
              <Text style={s.cardCopyHint}>Toca para copiar 📋</Text>
            </TouchableOpacity>
            <View style={s.cardChip}>
              <View style={s.chipCircle1} />
              <View style={s.chipCircle2} />
            </View>
          </View>
        </View>

        {/* mAiles Progress */}
        <View style={s.section}>
          <View style={s.mailesRow}>
            <View style={s.mailesLeft}>
              <View style={s.mailesIconWrap}>
                <Text style={s.mailesIcon}>⭐</Text>
              </View>
              <View>
                <Text style={s.mailesLabel}>Tu Progreso</Text>
                <Text style={s.mailesValue}>
                  {mailes.toLocaleString()} mAiles
                </Text>
              </View>
            </View>
            <View style={s.medalBadge}>
              <Text style={s.medalText}>🥇 Medalla 3</Text>
            </View>
          </View>
          <View style={s.progressRow}>
            <Text style={s.progressLabel}>
              12 compras para tu próxima estrella
            </Text>
            <Text style={s.starsText}>★★★☆☆</Text>
          </View>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: "60%" }]} />
          </View>
        </View>

        {/* Weekly Spending */}
        <View style={s.section}>
          <View style={s.weeklyRow}>
            <View>
              <Text style={s.sectionSubtitle}>Gasto semanal</Text>
              <Text style={s.weeklyText}>
                Esta semana: <Text style={s.weeklyAmount}>$340</Text> en compras
              </Text>
            </View>
            <View style={s.mailesBadge}>
              <Text style={s.mailesBadgeText}>⭐ +240 mAiles</Text>
            </View>
          </View>
          <View style={s.progressBar}>
            <View style={[s.progressFillGold, { width: "66%" }]} />
          </View>
          <Text style={s.nextStar}>⭐ próxima estrella en 4 compras más</Text>
        </View>

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
          {misStickersRecientes.length === 0 ? (
            <View style={s.emptyCromos}>
              <Text style={s.emptyCromosText}>
                🃏 Gasta ${DOLARES_POR_CROMO} para obtener tu primer cromo
              </Text>
            </View>
          ) : (
            misStickersRecientes.slice(0, 3).map((us) => {
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
          )}
        </ScrollView>

        {/* Recent Transactions */}
        <View style={s.transHeader}>
          <Text style={s.sectionTitle}>Movimientos recientes</Text>
          <TouchableOpacity onPress={() => router.replace("/(tabs)/banco")}>
            <Text style={s.seeAll}>Ver todo</Text>
          </TouchableOpacity>
        </View>

        <View>
          {transactions.length > 0 ? (
            transactions.map((tx) => (
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
            ))
          ) : (
            <>
              {defaultTransactions.map((item) => (
                <View key={`tx-default-${item.id}`} style={s.txItem}>
                  <View style={s.txIconWrap}>
                    <Text style={s.txIcon}>{item.icon}</Text>
                  </View>
                  <View style={s.txInfo}>
                    <Text style={s.txName}>{item.name}</Text>
                    <Text style={s.txDate}>{item.time}</Text>
                  </View>
                  <View style={s.txRight}>
                    <Text style={s.txAmount}>{item.amount}</Text>
                    <Text style={s.txMailes}>{item.mailes}</Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </View>

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
      aspectRatio: 1.6,
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
      backgroundColor: "rgba(255,255,255,0.12)",
    },
    cardPatternCircle2: {
      position: "absolute",
      bottom: -30,
      left: -30,
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: "rgba(255,214,91,0.15)",
    },
    cardPatternLine: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 70,
      backgroundColor: "rgba(0,0,0,0.06)",
    },
    cardTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    cardType: {
      color: "#002b73",
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    cardBrand: {
      color: "#002b73",
      fontSize: 22,
      fontWeight: "900",
      fontStyle: "italic",
    },
    cardMid: { marginBottom: 16 },
    cardBalanceLabel: {
      color: "rgba(0,43,115,0.65)",
      fontSize: 11,
      fontWeight: "500",
      marginBottom: 2,
    },
    cardBalance: {
      color: "#002b73",
      fontSize: 36,
      fontWeight: "800",
      letterSpacing: -1,
      textShadowColor: "rgba(0,43,115,0.15)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    cardBottom: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    cardNumberWrap: {},
    cardNumber: {
      color: "#002b73",
      fontFamily: "monospace",
      fontSize: 13,
      letterSpacing: 3,
      fontWeight: "600",
    },
    cardCopyHint: { color: "rgba(0,43,115,0.45)", fontSize: 9, marginTop: 2 },
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
