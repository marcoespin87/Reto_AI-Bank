import { Ionicons } from "@expo/vector-icons";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import BottomNav from "./BottomNav";
import SobreModal from "./SobreModal";

interface BancoUIProps {
  userName: string;
  saldo: number;
  numeroCuenta: string;
  transactions: any[];
  period: 7 | 30;
  setPeriod: (p: 7 | 30) => void;
  loading: boolean;
  modal: "transferir" | "pagar" | "compra" | null;
  setModal: (m: "transferir" | "pagar" | "compra" | null) => void;
  monto: string;
  setMonto: (v: string) => void;
  descripcion: string;
  setDescripcion: (v: string) => void;
  sobresModalVisible: boolean;
  setSobresModalVisible: (v: boolean) => void;
  cromosGanadosData: any[];
  handleTransaction: (categoria: string) => void;
  handleCopiarCuenta: () => void;
  formatNumeroCuenta: (num: string) => string;
  onAgregarAlbum: () => void;
}

const categoryIcon: Record<string, string> = {
  transferencia: "↗️",
  servicio: "💡",
  compra: "🛒",
  default: "💳",
};

const modalConfig = {
  transferir: {
    title: "Transferir",
    categoria: "Transferencia",
    placeholder: "Número de cuenta (16 dígitos)",
    icon: "↗️",
  },
  pagar: {
    title: "Pagar servicio",
    categoria: "Servicio",
    placeholder: "Nombre del servicio",
    icon: "💡",
  },
  compra: {
    title: "Compra en línea",
    categoria: "Compra",
    placeholder: "Descripción de la compra",
    icon: "🛒",
  },
};

export default function BancoUI({
  userName,
  saldo,
  numeroCuenta,
  transactions,
  period,
  setPeriod,
  loading,
  modal,
  setModal,
  monto,
  setMonto,
  descripcion,
  setDescripcion,
  sobresModalVisible,
  setSobresModalVisible,
  cromosGanadosData,
  handleTransaction,
  handleCopiarCuenta,
  formatNumeroCuenta,
  onAgregarAlbum,
}: BancoUIProps) {
  const { colors } = useTheme();
  const s = getStyles(colors);

  return (
    <SafeAreaView style={s.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
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
              <Text style={s.subGreeting}>SECCIÓN BANCO</Text>
            </View>
          </View>
          <TouchableOpacity style={s.leagueBadge}>
            <Text style={s.leagueBadgeText}>Liga Plata • Medalla 3</Text>
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
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
              onPress={handleCopiarCuenta}
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

        {/* Quick Actions */}
        <View style={s.actionsRow}>
          {(
            [
              {
                key: "transferir",
                ionicon: "arrow-up-circle-outline",
                label: "Transferir",
              },
              { key: "pagar", ionicon: "flash-outline", label: "Pagar" },
              {
                key: "compra",
                ionicon: "bag-handle-outline",
                label: "Compra online",
              },
            ] as const
          ).map((action) => (
            <TouchableOpacity
              key={action.key}
              style={s.actionBtn}
              onPress={() => setModal(action.key)}
            >
              <View style={s.actionIconWrap}>
                <Ionicons
                  name={action.ionicon}
                  size={26}
                  color={colors.primary}
                />
              </View>
              <Text style={s.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Period Selector */}
        <View style={s.periodRow}>
          <Text style={s.sectionTitle}>Historial</Text>
          <View style={s.periodBtns}>
            <TouchableOpacity
              style={[s.periodBtn, period === 7 && s.periodBtnActive]}
              onPress={() => setPeriod(7)}
            >
              <Text
                style={[s.periodBtnText, period === 7 && s.periodBtnTextActive]}
              >
                7 días
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.periodBtn, period === 30 && s.periodBtnActive]}
              onPress={() => setPeriod(30)}
            >
              <Text
                style={[
                  s.periodBtnText,
                  period === 30 && s.periodBtnTextActive,
                ]}
              >
                30 días
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transactions */}
        {transactions.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📭</Text>
            <Text style={s.emptyText}>
              Sin movimientos en los últimos {period} días
            </Text>
          </View>
        ) : (
          transactions.map((tx) => (
            <View key={tx.id} style={s.txItem}>
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
                <Text style={s.txAmount}>-${Number(tx.monto).toFixed(2)}</Text>
                {tx.mailes_generados > 0 && (
                  <Text style={s.txMailes}>+{tx.mailes_generados} mAiles</Text>
                )}
              </View>
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNav active="banco" />

      {/* Transaction Modal */}
      <Modal visible={modal !== null} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            {modal && (
              <View key={`modal-content-${modal}`}>
                <Text style={s.modalTitle}>
                  {modalConfig[modal].icon} {modalConfig[modal].title}
                </Text>

                <Text style={s.inputLabel}>
                  {modal === "transferir"
                    ? "NÚMERO DE CUENTA DESTINO"
                    : "DESCRIPCIÓN"}
                </Text>
                <TextInput
                  style={s.input}
                  placeholder={modalConfig[modal].placeholder}
                  placeholderTextColor={colors.textMuted}
                  value={descripcion}
                  onChangeText={setDescripcion}
                  keyboardType={
                    modal === "transferir" ? "number-pad" : "default"
                  }
                  maxLength={modal === "transferir" ? 16 : undefined}
                />

                <Text style={s.inputLabel}>MONTO ($)</Text>
                <TextInput
                  style={s.input}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  value={monto}
                  onChangeText={setMonto}
                  keyboardType="decimal-pad"
                />

                <Text style={s.mailesPreview}>
                  ⭐ Ganarás {Math.floor(Number(monto || 0) / 100) * 10} mAiles
                </Text>

                <TouchableOpacity
                  style={[s.btnConfirm, loading && { opacity: 0.7 }]}
                  onPress={() =>
                    handleTransaction(modalConfig[modal].categoria)
                  }
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#002b73" />
                  ) : (
                    <Text style={s.btnConfirmText}>Confirmar ✦</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={s.btnCancel}
                  onPress={() => {
                    setModal(null);
                    setMonto("");
                    setDescripcion("");
                  }}
                >
                  <Text style={s.btnCancelText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <SobreModal
        visible={sobresModalVisible}
        cromos={cromosGanadosData}
        onClose={() => setSobresModalVisible(false)}
        onAgregarAlbum={onAgregarAlbum}
      />
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
    },
    leagueBadgeText: { color: colors.primary, fontSize: 10, fontWeight: "700" },

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

    actionsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    actionBtn: { flex: 1, alignItems: "center", gap: 8 },
    actionIconWrap: {
      width: 58,
      height: 58,
      borderRadius: 16,
      backgroundColor: colors.cardBackground,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 0.5,
      borderColor: colors.borderStrong,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    actionIcon: { fontSize: 26 },
    actionLabel: { color: colors.textPrimary, fontSize: 11, fontWeight: "600" },

    periodRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    sectionTitle: {
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: "800",
    },
    periodBtns: { flexDirection: "row", gap: 8 },
    periodBtn: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colors.cardBackground,
      borderWidth: 0.5,
      borderColor: colors.borderStrong,
    },
    periodBtnActive: { backgroundColor: colors.borderMedium },
    periodBtnText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "600",
    },
    periodBtnTextActive: { color: colors.textSecondary, fontWeight: "700" },

    empty: { alignItems: "center", padding: 40, gap: 12 },
    emptyIcon: { fontSize: 40 },
    emptyText: { color: colors.textMuted, fontSize: 13, textAlign: "center" },

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
    txAmount: { color: colors.error, fontSize: 14, fontWeight: "700" },
    txMailes: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: "700",
      marginTop: 2,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: "flex-end",
    },
    modalCard: {
      backgroundColor: colors.cardBackgroundAlt,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      padding: 28,
      borderTopWidth: 0.5,
      borderColor: colors.borderStrong,
    },
    modalTitle: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: "800",
      marginBottom: 20,
    },
    inputLabel: {
      color: colors.primary,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 2,
      marginBottom: 6,
      marginLeft: 4,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: colors.textPrimary,
      fontSize: 15,
      marginBottom: 16,
      borderWidth: 0.5,
      borderColor: colors.borderStrong,
    },
    mailesPreview: {
      color: colors.gold,
      fontSize: 13,
      fontWeight: "600",
      textAlign: "center",
      marginBottom: 16,
    },
    btnConfirm: {
      backgroundColor: colors.gold,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: "center",
      marginBottom: 10,
      shadowColor: colors.goldShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 6,
    },
    btnConfirmText: {
      color: colors.textOnGold,
      fontWeight: "800",
      fontSize: 16,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    btnCancel: { alignItems: "center", paddingVertical: 10 },
    btnCancelText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: "600",
    },
  });
}
