import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useUserSummary } from '../hooks/useUserSummary';
import { formatCurrency, formatDate } from '../utils/format';

export default function BancoScreen() {
  const insets = useSafeAreaInsets();
  const { token, displayName } = useAuth();
  const { data, loading, error, loadSummary } = useUserSummary();

  useEffect(() => {
    if (token) {
      loadSummary(token);
    }
  }, [loadSummary, token]);

  const quickActions = data?.ui.banco.quickActions ?? [];
  const bankCard = data?.ui.banco.card;
  const spendingHints = data?.ui.banco.spending;

  return (
    <View style={s.root}>
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <View style={s.headerLeft}>
          <Text style={s.greeting}>Hola, {data?.user.displayName ?? displayName}</Text>
          <Text style={s.subGreeting}>RESUMEN BANCARIO</Text>
        </View>
        <View style={s.ligaBadge}>
          <Text style={s.ligaText}>{data?.user.leagueTier ?? 'Sin tier'} · Medalla {data?.user.medalLevel ?? 0}</Text>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, { paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.bankCard}
        >
          <View style={s.cardDecoration} />
          <View style={s.cardTop}>
            <Text style={s.cardBrand}>{bankCard?.brand ?? 'Banco'}</Text>
            <Text style={s.cardWordmark}>{bankCard?.wordmark ?? 'Cuenta'}</Text>
          </View>
          <View style={s.cardMiddle}>
            <Text style={s.cardBalanceLabel}>Saldo disponible</Text>
            <Text style={s.cardBalance}>
              {loading ? 'Cargando...' : formatCurrency(data?.user.balance ?? 0)}
            </Text>
          </View>
          <View style={s.cardBottom}>
            <Text style={s.cardNumber}> </Text>
            <View style={s.cardChip}>
              <View style={[s.chipCircle, { backgroundColor: `${colors.secondary}CC`, marginRight: -8 }]} />
              <View style={[s.chipCircle, { backgroundColor: `${colors.tertiary}CC` }]} />
            </View>
          </View>
        </LinearGradient>

        <View style={s.quickActions}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={s.quickAction}
              activeOpacity={0.7}
              onPress={() => Alert.alert(action.label, action.message)}
            >
              <View style={s.quickActionIcon}>
                <MaterialIcons name={action.icon as any} size={24} color={colors.primary} />
              </View>
              <Text style={s.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? (
          <View style={s.errorCard}>
            <MaterialIcons name="error-outline" size={18} color={colors.error} />
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={s.spendingCard}>
          <View style={s.spendingHeader}>
            <View>
              <Text style={s.spendingLabel}>Gasto semanal</Text>
              <Text style={s.spendingValue}>
                Esta semana: <Text style={{ color: colors.primary }}>{formatCurrency(data?.bank.weeklySpend ?? 0)}</Text>
              </Text>
            </View>
            <View style={s.milesChip}>
              <MaterialIcons name="star" size={14} color={colors.secondary} />
              <Text style={s.milesChipText}>Compras: {data?.bank.weeklyTransactions ?? 0}</Text>
            </View>
          </View>
          <View style={s.spendingMeta}>
            <Text style={s.spendingHint}>{spendingHints?.primaryHint ?? 'Sin detalle disponible'}</Text>
            <Text style={[s.spendingHint, { color: colors.secondary }]}>
              {spendingHints?.secondaryHint ?? 'Sin detalle disponible'}
            </Text>
          </View>
          <View style={s.progressBg}>
            <LinearGradient
              colors={[colors.primary, colors.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[s.progressFill, { width: `${data?.bank.progressPercent ?? 0}%` }]}
            />
          </View>
        </View>

        <View>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Movimientos recientes</Text>
            <TouchableOpacity onPress={() => Alert.alert('Movimientos', 'Proximamente veras el historial completo.')}>
              <Text style={s.seeAll}>Ver todo</Text>
            </TouchableOpacity>
          </View>
          <View style={s.transactionsList}>
            {data?.bank.recentTransactions.length ? (
              data.bank.recentTransactions.map((transaction) => (
                <View key={transaction.id} style={s.txCard}>
                  <View style={s.txMain}>
                    <View style={s.txIcon}>
                      <MaterialIcons name="receipt-long" size={22} color={colors.primary} />
                    </View>
                    <View style={s.txInfo}>
                      <Text style={s.txTitle}>{transaction.title}</Text>
                      <Text style={s.txTime}>{formatDate(transaction.date)}</Text>
                    </View>
                    <View style={s.txAmountBlock}>
                      <Text style={s.txAmount}>{formatCurrency(transaction.amount)}</Text>
                      <View style={s.txMilesRow}>
                        <View style={s.txMilesDot}>
                          <MaterialIcons name="toll" size={10} color={colors.onSecondary} />
                        </View>
                        <Text style={s.txMilesText}>+{transaction.milesGenerated} mAiles</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={s.txCard}>
                <Text style={s.txTime}>No hay transacciones recientes cargadas para este usuario.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  header: {
    backgroundColor: colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerLeft: {},
  greeting: { fontSize: 20, fontWeight: '700', color: colors.primary },
  subGreeting: { fontSize: 10, color: `${colors.onSurface}99`, letterSpacing: 1, textTransform: 'uppercase' },
  ligaBadge: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ligaText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, gap: 24 },
  bankCard: {
    borderRadius: 24,
    padding: 28,
    aspectRatio: 1.6,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  cardDecoration: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardBrand: { fontSize: 12, fontWeight: '700', color: colors.onPrimary, letterSpacing: 1 },
  cardWordmark: { fontSize: 22, fontWeight: '900', color: colors.onPrimary, fontStyle: 'italic', letterSpacing: -0.5 },
  cardMiddle: {},
  cardBalanceLabel: { fontSize: 10, fontWeight: '500', color: 'rgba(0,43,115,0.6)', marginBottom: 4 },
  cardBalance: { fontSize: 36, fontWeight: '700', color: colors.onPrimary },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardNumber: { fontFamily: 'monospace', fontSize: 12, color: colors.onPrimary, letterSpacing: 1 },
  cardChip: { flexDirection: 'row', alignItems: 'center' },
  chipCircle: { width: 24, height: 24, borderRadius: 12 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between' },
  quickAction: { alignItems: 'center', gap: 8, flex: 1 },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: { fontSize: 11, fontWeight: '500', color: `${colors.onSurface}CC` },
  errorCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: `${colors.error}1A`,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: `${colors.error}33`,
  },
  errorText: { flex: 1, color: colors.error, fontSize: 13 },
  spendingCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 24,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: `${colors.outlineVariant}1A`,
  },
  spendingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  spendingLabel: { fontSize: 14, fontWeight: '600', color: `${colors.onSurface}99` },
  spendingValue: { fontSize: 18, fontWeight: '700', color: colors.onSurface, marginTop: 4 },
  milesChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${colors.secondary}1A`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  milesChipText: { fontSize: 12, fontWeight: '700', color: colors.secondary },
  spendingMeta: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  spendingHint: { fontSize: 11, fontWeight: '500', color: colors.onSurfaceVariant, flex: 1 },
  progressBg: {
    height: 10,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 5 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.onSurface },
  seeAll: { fontSize: 14, fontWeight: '600', color: colors.primary },
  transactionsList: { gap: 12 },
  txCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  txMain: { flexDirection: 'row', alignItems: 'center' },
  txIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    backgroundColor: `${colors.primary}1A`,
  },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 15, fontWeight: '700', color: colors.onSurface },
  txTime: { fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },
  txAmountBlock: { alignItems: 'flex-end', gap: 4 },
  txAmount: { fontSize: 15, fontWeight: '700', color: colors.onSurface },
  txMilesRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  txMilesDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txMilesText: { fontSize: 12, fontWeight: '700', color: colors.secondary },
});
