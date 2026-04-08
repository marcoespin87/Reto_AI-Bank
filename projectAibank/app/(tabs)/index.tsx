import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, RefreshControl, Image
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../context/ThemeContext';

export default function HomeScreen() {
  const [userName, setUserName] = useState('');
  const [mailes, setMailes] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [saldo, setSaldo] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const DOLARES_POR_CROMO = 20;
  const [misStickersRecientes, setMisStickersRecientes] = useState<any[]>([]);
  const [numeroCuenta, setNumeroCuenta] = useState('');
  const { colors, isDark, toggleTheme } = useTheme();

  useEffect(() => { loadUserData(); }, []);

  async function loadUserData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('users')
      .select('id, nombre, mailes_acumulados, saldo, numero_cuenta')
      .eq('email', user.email)
      .single();

    if (data) {
      setUserName(data.nombre?.split(' ')[0] || 'Usuario');
      setMailes(data.mailes_acumulados || 0);
      setSaldo(data.saldo || 0);
      setNumeroCuenta(data.numero_cuenta || '');

      const { data: txs } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', data.id)
        .order('fecha', { ascending: false })
        .limit(3);
      if (txs) setTransactions(txs);

      const { data: stickersRecientes } = await supabase
        .from('user_stickers')
        .select('*, stickers(*)')
        .eq('user_id', data.id)
        .order('fecha_obtencion', { ascending: false })
        .limit(3);
      if (stickersRecientes) setMisStickersRecientes(stickersRecientes);
    }
  }

  async function handleCopiarCuenta() {
    if (!numeroCuenta) return;
    await Clipboard.setStringAsync(numeroCuenta);
    Alert.alert('Copiado', 'Número de cuenta copiado al portapapeles');
  }

  function formatNumeroCuenta(num: string) {
    if (!num) return '•••• •••• •••• ••••';
    return num.replace(/(.{4})/g, '$1 ').trim();
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  }

  const categoryIcon: Record<string, string> = {
    supermercado: '🛒', cafe: '☕', entretenimiento: '🎭',
    transporte: '🚗', viajes: '✈️', default: '💳',
  };

  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={[s.avatar, { backgroundColor: colors.surfaceHigh, borderColor: colors.primary }]}>
              <Text style={[s.avatarText, { color: colors.primary }]}>{userName.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={[s.greeting, { color: colors.primary }]}>Hola, {userName}</Text>
              <Text style={[s.subGreeting, { color: colors.textMuted }]}>BIENVENIDO AL ESTADIO</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              onPress={toggleTheme}
              style={[s.themeBtn, { backgroundColor: colors.surfaceHigh, borderColor: colors.border }]}
            >
              <Text style={{ fontSize: 16 }}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.leagueBadge, { backgroundColor: colors.surfaceHigh, borderColor: colors.border }]}>
              <Text style={[s.leagueBadgeText, { color: colors.primary }]}>Liga Plata • Medalla 3</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bank Card */}
        <View style={[s.card, { backgroundColor: colors.card }]}>
          <View style={s.cardPatternCircle} />
          <View style={s.cardPatternLine} />
          <View style={s.cardTop}>
            <Text style={[s.cardType, { color: colors.cardText }]}>AI-Bank Débito</Text>
            <Text style={[s.cardBrand, { color: colors.cardText }]}>mAiles</Text>
          </View>
          <View style={s.cardMid}>
            <Text style={[s.cardBalanceLabel, { color: `${colors.cardText}99` }]}>Saldo disponible</Text>
            <Text style={[s.cardBalance, { color: colors.cardText }]}>${saldo.toLocaleString('es', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={s.cardBottom}>
            <TouchableOpacity onPress={handleCopiarCuenta} activeOpacity={0.7}>
              <Text style={[s.cardNumber, { color: colors.cardText }]}>{formatNumeroCuenta(numeroCuenta)}</Text>
              <Text style={{ color: `${colors.cardText}55`, fontSize: 9, marginTop: 2 }}>Toca para copiar</Text>
            </TouchableOpacity>
            <View style={s.cardChip}>
              <View style={s.chipCircle1} />
              <View style={s.chipCircle2} />
            </View>
          </View>
        </View>

        {/* mAiles Progress */}
        <View style={[s.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={s.mailesRow}>
            <View style={s.mailesLeft}>
              <View style={[s.mailesIconWrap, { backgroundColor: 'rgba(255,214,91,0.1)' }]}>
                <Text style={s.mailesIcon}>⭐</Text>
              </View>
              <View>
                <Text style={[s.mailesLabel, { color: colors.textSecondary }]}>Tu Progreso</Text>
                <Text style={s.mailesValue}>{mailes.toLocaleString()} mAiles</Text>
              </View>
            </View>
            <Text style={s.medalText}>Medalla 3</Text>
          </View>
          <View style={s.progressRow}>
            <Text style={[s.progressLabel, { color: colors.textSecondary }]}>12 compras para tu próxima estrella</Text>
            <Text style={s.starsText}>★★★☆☆</Text>
          </View>
          <View style={[s.progressBar, { backgroundColor: colors.surfaceHigh }]}>
            <View style={[s.progressFill, { width: '60%' }]} />
          </View>
        </View>

        {/* Weekly Spending */}
        <View style={[s.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={s.weeklyRow}>
            <View>
              <Text style={[s.sectionSubtitle, { color: colors.textSecondary }]}>Gasto semanal</Text>
              <Text style={[s.weeklyText, { color: colors.textPrimary }]}>
                Esta semana: <Text style={[s.weeklyAmount, { color: colors.primary }]}>$340</Text> en compras
              </Text>
            </View>
            <View style={s.mailesBadge}>
              <Text style={s.mailesBadgeText}>⭐ +240 mAiles</Text>
            </View>
          </View>
          <View style={[s.progressBar, { backgroundColor: colors.surfaceHigh }]}>
            <View style={[s.progressFillGold, { width: '66%' }]} />
          </View>
          <Text style={s.nextStar}>⭐ próxima estrella en 4 compras más</Text>
        </View>

        {/* Cromos Recientes */}
        <View style={s.transHeader}>
          <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Cromos recientes</Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/album')}>
            <Text style={[s.seeAll, { color: colors.primary }]}>Ver álbum →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {misStickersRecientes.length === 0 ? (
            <View style={[s.emptyCromos, { backgroundColor: colors.surface }]}>
              <Text style={[s.emptyCromosText, { color: colors.textMuted }]}>🃏 Gasta ${DOLARES_POR_CROMO} para obtener tu primer cromo</Text>
            </View>
          ) : (
            misStickersRecientes.slice(0, 3).map((us: any, i: number) => (
              <TouchableOpacity key={i} style={[s.cromoCard, { borderColor: colors.border }]} onPress={() => router.replace('/(tabs)/album')}>
                <Image source={{ uri: us.stickers?.imagen_url }} style={s.cromoImage} />
                <View style={[s.cromoBadge, {
                  backgroundColor: us.stickers?.rareza === 'epico' ? 'rgba(240,193,16,0.8)' :
                    us.stickers?.rareza === 'raro' ? 'rgba(91,140,255,0.8)' : 'rgba(66,70,85,0.8)'
                }]}>
                  <Text style={s.cromoBadgeText}>
                    {us.stickers?.rareza === 'epico' ? 'ÉPICO' : us.stickers?.rareza === 'raro' ? 'RARO' : 'COMÚN'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Recent Transactions */}
        <View style={s.transHeader}>
          <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Movimientos recientes</Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/banco')}>
            <Text style={[s.seeAll, { color: colors.primary }]}>Ver todo</Text>
          </TouchableOpacity>
        </View>

        {transactions.length > 0 ? (
          transactions.map((tx) => (
            <View key={tx.id} style={[s.txItem, { backgroundColor: colors.surface }]}>
              <View style={[s.txIconWrap, { backgroundColor: colors.surfaceHigh }]}>
                <Text style={s.txIcon}>{categoryIcon[tx.categoria?.toLowerCase()] || categoryIcon.default}</Text>
              </View>
              <View style={s.txInfo}>
                <Text style={[s.txName, { color: colors.textPrimary }]}>{tx.categoria}</Text>
                <Text style={[s.txDate, { color: colors.textSecondary }]}>{tx.fecha}</Text>
              </View>
              <View style={s.txRight}>
                <Text style={[s.txAmount, { color: colors.textPrimary }]}>-${Number(tx.monto).toFixed(2)}</Text>
                {tx.mailes_generados > 0 && <Text style={s.txMailes}>+{tx.mailes_generados} mAiles</Text>}
              </View>
            </View>
          ))
        ) : (
          <>
            {[
              { name: 'Supermercado Premium', time: 'Hace 2 horas', amount: '$45.00', mailes: '+18 mAiles', icon: '🛒' },
              { name: 'Star Stadium Coffee', time: 'Ayer, 09:15 AM', amount: '$8.50', mailes: '+2 mAiles', icon: '☕' },
              { name: 'Entradas Final Mundial', time: '12 Jun', amount: '$1,200.00', mailes: '+500 mAiles', icon: '⚽' },
            ].map((item, i) => (
              <View key={i} style={[s.txItem, { backgroundColor: colors.surface }]}>
                <View style={[s.txIconWrap, { backgroundColor: colors.surfaceHigh }]}>
                  <Text style={s.txIcon}>{item.icon}</Text>
                </View>
                <View style={s.txInfo}>
                  <Text style={[s.txName, { color: colors.textPrimary }]}>{item.name}</Text>
                  <Text style={[s.txDate, { color: colors.textSecondary }]}>{item.time}</Text>
                </View>
                <View style={s.txRight}>
                  <Text style={[s.txAmount, { color: colors.textPrimary }]}>{item.amount}</Text>
                  <Text style={s.txMailes}>{item.mailes}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={[s.bottomNav, { backgroundColor: colors.navBg, borderTopColor: colors.border }]}>
        <TouchableOpacity style={s.navItem}>
          <Text style={s.navIconActive}>🏠</Text>
          <Text style={[s.navLabelActive, { color: colors.primary }]}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem} onPress={() => router.replace('/(tabs)/banco')}>
          <Text style={s.navIcon}>🏦</Text>
          <Text style={[s.navLabel, { color: colors.textSecondary }]}>Banco</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navCenter} onPress={() => router.push('/(tabs)/mundial')}>
          <View style={[s.navCenterBtn, { backgroundColor: colors.primary, borderColor: colors.background }]}>
            <Text style={s.navCenterIcon}>⚽</Text>
          </View>
          <Text style={[s.navCenterLabel, { color: colors.primary }]}>Mundial</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem} onPress={() => router.replace('/(tabs)/grupo')}>
          <Text style={s.navIcon}>👥</Text>
          <Text style={[s.navLabel, { color: colors.textSecondary }]}>Grupo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem} onPress={() => router.replace('/(tabs)/perfil')}>
          <Text style={s.navIcon}>👤</Text>
          <Text style={[s.navLabel, { color: colors.textSecondary }]}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800', fontSize: 16 },
  greeting: { fontSize: 18, fontWeight: '800' },
  subGreeting: { fontSize: 9, fontWeight: '600', letterSpacing: 1.5 },
  themeBtn: { padding: 8, borderRadius: 12, borderWidth: 0.5 },
  leagueBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5 },
  leagueBadgeText: { fontSize: 10, fontWeight: '700' },

  card: { borderRadius: 24, padding: 24, marginBottom: 16, overflow: 'hidden', position: 'relative', aspectRatio: 1.6 },
  cardPatternCircle: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.1)' },
  cardPatternLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: 'rgba(0,0,0,0.05)' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  cardType: { fontSize: 12, fontWeight: '700' },
  cardBrand: { fontSize: 22, fontWeight: '900', fontStyle: 'italic' },
  cardMid: { marginBottom: 16 },
  cardBalanceLabel: { fontSize: 11, fontWeight: '500' },
  cardBalance: { fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardNumber: { fontFamily: 'monospace', fontSize: 13, letterSpacing: 3 },
  cardChip: { flexDirection: 'row' },
  chipCircle1: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,214,91,0.8)', marginRight: -8 },
  chipCircle2: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,181,157,0.8)' },

  section: { borderRadius: 20, padding: 18, marginBottom: 12, borderWidth: 0.5 },
  mailesRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  mailesLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mailesIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  mailesIcon: { fontSize: 20 },
  mailesLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase' },
  mailesValue: { color: '#ffd65b', fontSize: 20, fontWeight: '800' },
  medalText: { color: '#ffd65b', fontSize: 12, fontWeight: '700' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 11 },
  starsText: { color: '#ffd65b', fontSize: 12 },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', backgroundColor: '#b2c5ff', borderRadius: 4 },
  progressFillGold: { height: '100%', backgroundColor: '#ffd65b', borderRadius: 4 },

  weeklyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  sectionSubtitle: { fontSize: 11, fontWeight: '500' },
  weeklyText: { fontSize: 16, fontWeight: '700', marginTop: 2 },
  weeklyAmount: {},
  mailesBadge: { backgroundColor: 'rgba(255,214,91,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  mailesBadgeText: { color: '#ffd65b', fontSize: 11, fontWeight: '700' },
  nextStar: { color: '#ffd65b', fontSize: 10, marginTop: 6 },

  transHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  seeAll: { fontSize: 13, fontWeight: '600' },
  emptyTx: { borderRadius: 16, padding: 24, alignItems: 'center' },
  emptyTxText: { fontSize: 13 },
  txItem: { borderRadius: 16, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  txIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txIcon: { fontSize: 20 },
  txInfo: { flex: 1 },
  txName: { fontSize: 14, fontWeight: '700' },
  txDate: { fontSize: 11, marginTop: 2 },
  txRight: { alignItems: 'flex-end' },
  txAmount: { fontSize: 14, fontWeight: '700' },
  txMailes: { color: '#ffd65b', fontSize: 11, fontWeight: '700', marginTop: 2 },

  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12, paddingBottom: 24, borderTopWidth: 0.5, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  navItem: { alignItems: 'center', gap: 2 },
  navIcon: { fontSize: 22, opacity: 0.5 },
  navIconActive: { fontSize: 22 },
  navLabel: { fontSize: 9, fontWeight: '500', opacity: 0.5 },
  navLabelActive: { fontSize: 9, fontWeight: '700' },
  navCenter: { alignItems: 'center', marginTop: -20 },
  navCenterBtn: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 4, borderWidth: 3 },
  navCenterIcon: { fontSize: 26 },
  navCenterLabel: { fontSize: 9, fontWeight: '700' },

  emptyCromos: { borderRadius: 16, padding: 20, marginRight: 12, justifyContent: 'center', width: 280 },
  emptyCromosText: { fontSize: 12, textAlign: 'center' },
  cromoCard: { width: 100, aspectRatio: 3/4, borderRadius: 12, marginRight: 10, overflow: 'hidden', borderWidth: 1.5, position: 'relative' },
  cromoImage: { width: '100%', height: '100%' },
  cromoBadge: { position: 'absolute', bottom: 4, left: 4, right: 4, paddingVertical: 2, borderRadius: 6, alignItems: 'center' },
  cromoBadgeText: { color: '#fff', fontSize: 7, fontWeight: '800' },
});