import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, RefreshControl, Image
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';


export default function HomeScreen() {
  const [userName, setUserName] = useState('');
  const [mailes, setMailes] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [saldo, setSaldo] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const DOLARES_POR_CROMO = 20;
  const [misStickersRecientes, setMisStickersRecientes] = useState<any[]>([]);
  const [numeroCuenta, setNumeroCuenta] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

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

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  }

  const categoryIcon: Record<string, string> = {
    supermercado: '🛒',
    cafe: '☕',
    entretenimiento: '🎭',
    transporte: '🚗',
    viajes: '✈️',
    default: '💳',
  };

  return (
    <SafeAreaView style={s.root}>
<ScrollView
  showsVerticalScrollIndicator={false}
  contentContainerStyle={s.scroll}
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor="#b2c5ff"
      colors={['#b2c5ff']}
    />
  }
>
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={s.greeting}>Hola, {userName}</Text>
              <Text style={s.subGreeting}>BIENVENIDO AL ESTADIO</Text>
            </View>
          </View>
          <TouchableOpacity style={s.leagueBadge}>
            <Text style={s.leagueBadgeText}>Liga Plata • Medalla 3</Text>
          </TouchableOpacity>
        </View>

        {/* Bank Card */}
        <View style={s.card}>
          <View style={s.cardPatternCircle} />
          <View style={s.cardPatternLine} />
          <View style={s.cardTop}>
            <Text style={s.cardType}>AI-Bank Débito</Text>
            <Text style={s.cardBrand}>mAiles</Text>
          </View>
          <View style={s.cardMid}>
            <Text style={s.cardBalanceLabel}>Saldo disponible</Text>
            <Text style={s.cardBalance}>${saldo.toLocaleString('es', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={s.cardBottom}>
            <TouchableOpacity onPress={handleCopiarCuenta} activeOpacity={0.7}>
              <Text style={s.cardNumber}>{formatNumeroCuenta(numeroCuenta)}</Text>
              <Text style={{ color: 'rgba(0,43,115,0.5)', fontSize: 9, marginTop: 2 }}> </Text>
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
                <Text style={s.mailesValue}>{mailes.toLocaleString()} mAiles</Text>
              </View>
            </View>
            <Text style={s.medalText}>Medalla 3</Text>
          </View>
          <View style={s.progressRow}>
            <Text style={s.progressLabel}>12 compras para tu próxima estrella</Text>
            <Text style={s.starsText}>★★★☆☆</Text>
          </View>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: '60%' }]} />
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
            <View style={[s.progressFillGold, { width: '66%' }]} />
          </View>
          <Text style={s.nextStar}>⭐ próxima estrella en 4 compras más</Text>
        </View>

        {/* Cromos Recientes */}
        <View style={s.transHeader}>
          <Text style={s.sectionTitle}>Cromos recientes</Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/album')}>
            <Text style={s.seeAll}>Ver álbum →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {misStickersRecientes.length === 0 ? (
            <View style={s.emptyCromos}>
              <Text style={s.emptyCromosText}>🃏 Gasta ${DOLARES_POR_CROMO} para obtener tu primer cromo</Text>
            </View>
          ) : (
            misStickersRecientes.slice(0, 3).map((us: any, i: number) => (
              <TouchableOpacity
                key={i}
                style={s.cromoCard}
                onPress={() => router.replace('/(tabs)/album')}
              >
                <Image
                  source={{ uri: us.stickers?.imagen_url }}
                  style={s.cromoImage}
                />
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
          <Text style={s.sectionTitle}>Movimientos recientes</Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/banco')}>
            <Text style={s.seeAll}>Ver todo</Text>
          </TouchableOpacity>
        </View>

        {transactions.length > 0 ? (
        transactions.map((tx) => (
          <View key={tx.id} style={s.txItem}>
            <View style={s.txIconWrap}>
              <Text style={s.txIcon}>
                {categoryIcon[tx.categoria?.toLowerCase()] || categoryIcon.default}
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
      ) : (
        <>
          {[
            { name: 'Supermercado Premium', time: 'Hace 2 horas', amount: '$45.00', mailes: '+18 mAiles', icon: '🛒' },
            { name: 'Star Stadium Coffee', time: 'Ayer, 09:15 AM', amount: '$8.50', mailes: '+2 mAiles', icon: '☕' },
            { name: 'Entradas Final Mundial', time: '12 Jun', amount: '$1,200.00', mailes: '+500 mAiles', icon: '⚽' },
          ].map((item, i) => (
            <View key={i} style={s.txItem}>
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

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.bottomNav}>
        <TouchableOpacity style={s.navItem}>
          <Text style={s.navIconActive}>🏠</Text>
          <Text style={s.navLabelActive}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem} onPress={() => router.replace('/(tabs)/banco')}>
          <Text style={s.navIcon}>🏦</Text>
          <Text style={s.navLabel}>Banco</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navCenter} onPress={() => router.push('/(tabs)/mundial')}>
          <View style={s.navCenterBtn}>
            <Text style={s.navCenterIcon}>⚽</Text>
          </View>
          <Text style={s.navCenterLabel}>Mundial</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem} onPress={() => router.replace('/(tabs)/grupo')}>
          <Text style={s.navIcon}>👥</Text>
          <Text style={s.navLabel}>Grupo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem} onPress={() => router.replace('/(tabs)/perfil')}>
          <Text style={s.navIcon}>👤</Text>
          <Text style={s.navLabel}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#071325' },
  scroll: { paddingHorizontal: 20 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#1f2a3d', borderWidth: 2, borderColor: '#b2c5ff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#b2c5ff', fontWeight: '800', fontSize: 16 },
  greeting: { color: '#b2c5ff', fontSize: 18, fontWeight: '800' },
  subGreeting: { color: '#424655', fontSize: 9, fontWeight: '600', letterSpacing: 1.5 },
  leagueBadge: { backgroundColor: '#1f2a3d', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5, borderColor: '#424655' },
  leagueBadgeText: { color: '#b2c5ff', fontSize: 10, fontWeight: '700' },

  // Bank Card
  card: { backgroundColor: '#b2c5ff', borderRadius: 24, padding: 24, marginBottom: 16, overflow: 'hidden', position: 'relative', aspectRatio: 1.6 },
  cardPatternCircle: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.1)' },
  cardPatternLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: 'rgba(0,0,0,0.05)' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  cardType: { color: '#002b73', fontSize: 12, fontWeight: '700' },
  cardBrand: { color: '#002b73', fontSize: 22, fontWeight: '900', fontStyle: 'italic' },
  cardMid: { marginBottom: 16 },
  cardBalanceLabel: { color: 'rgba(0,43,115,0.6)', fontSize: 11, fontWeight: '500' },
  cardBalance: { color: '#002b73', fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardNumber: { color: '#002b73', fontFamily: 'monospace', fontSize: 13, letterSpacing: 3 },
  cardChip: { flexDirection: 'row' },
  chipCircle1: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,214,91,0.8)', marginRight: -8 },
  chipCircle2: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,181,157,0.8)' },
  cardActions: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 0.5, borderTopColor: 'rgba(0,43,115,0.2)', paddingTop: 16 },
  cardAction: { alignItems: 'center', gap: 4 },
  cardActionIcon: { fontSize: 20, color: '#002b73' },
  cardActionLabel: { color: '#002b73', fontSize: 11, fontWeight: '700' },

  // mAiles
  section: { backgroundColor: '#101c2e', borderRadius: 20, padding: 18, marginBottom: 12, borderWidth: 0.5, borderColor: '#1f2a3d' },
  mailesRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  mailesLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mailesIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,214,91,0.1)', alignItems: 'center', justifyContent: 'center' },
  mailesIcon: { fontSize: 20 },
  mailesLabel: { color: '#8c90a1', fontSize: 10, fontWeight: '500', textTransform: 'uppercase' },
  mailesValue: { color: '#ffd65b', fontSize: 20, fontWeight: '800' },
  medalText: { color: '#ffd65b', fontSize: 12, fontWeight: '700' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { color: '#8c90a1', fontSize: 11 },
  starsText: { color: '#ffd65b', fontSize: 12 },
  progressBar: { height: 8, backgroundColor: '#1f2a3d', borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', backgroundColor: '#b2c5ff', borderRadius: 4 },
  progressFillGold: { height: '100%', backgroundColor: '#ffd65b', borderRadius: 4 },

  // Weekly
  weeklyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  sectionSubtitle: { color: '#8c90a1', fontSize: 11, fontWeight: '500' },
  weeklyText: { color: '#d7e3fc', fontSize: 16, fontWeight: '700', marginTop: 2 },
  weeklyAmount: { color: '#b2c5ff' },
  mailesBadge: { backgroundColor: 'rgba(255,214,91,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  mailesBadgeText: { color: '#ffd65b', fontSize: 11, fontWeight: '700' },
  nextStar: { color: '#ffd65b', fontSize: 10, marginTop: 6 },

  // Transactions
  transHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 4 },
  sectionTitle: { color: '#d7e3fc', fontSize: 18, fontWeight: '800' },
  seeAll: { color: '#b2c5ff', fontSize: 13, fontWeight: '600' },
  emptyTx: { backgroundColor: '#101c2e', borderRadius: 16, padding: 24, alignItems: 'center' },
  emptyTxText: { color: '#424655', fontSize: 13 },
  txItem: { backgroundColor: '#101c2e', borderRadius: 16, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  txIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#1f2a3d', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txIcon: { fontSize: 20 },
  txInfo: { flex: 1 },
  txName: { color: '#d7e3fc', fontSize: 14, fontWeight: '700' },
  txDate: { color: '#8c90a1', fontSize: 11, marginTop: 2 },
  txRight: { alignItems: 'flex-end' },
  txAmount: { color: '#d7e3fc', fontSize: 14, fontWeight: '700' },
  txMailes: { color: '#ffd65b', fontSize: 11, fontWeight: '700', marginTop: 2 },

  // Bottom Nav
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(7,19,37,0.95)', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12, paddingBottom: 24, borderTopWidth: 0.5, borderTopColor: '#1f2a3d', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  navItem: { alignItems: 'center', gap: 2 },
  navIcon: { fontSize: 22, opacity: 0.5 },
  navIconActive: { fontSize: 22 },
  navLabel: { color: '#d7e3fc', fontSize: 9, fontWeight: '500', opacity: 0.5 },
  navLabelActive: { color: '#b2c5ff', fontSize: 9, fontWeight: '700' },
  navCenter: { alignItems: 'center', marginTop: -20 },
  navCenterBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#b2c5ff', alignItems: 'center', justifyContent: 'center', marginBottom: 4, borderWidth: 3, borderColor: '#071325' },
  navCenterIcon: { fontSize: 26 },
  navCenterLabel: { color: '#b2c5ff', fontSize: 9, fontWeight: '700' },
  emptyCromos: { backgroundColor: '#101c2e', borderRadius: 16, padding: 20, marginRight: 12, justifyContent: 'center', width: 280 },
  emptyCromosText: { color: '#424655', fontSize: 12, textAlign: 'center' },
  cromoCard: { width: 100, aspectRatio: 3/4, borderRadius: 12, marginRight: 10, overflow: 'hidden', borderWidth: 1.5, borderColor: '#1f2a3d', position: 'relative' },
  cromoImage: { width: '100%', height: '100%' },
  cromoBadge: { position: 'absolute', bottom: 4, left: 4, right: 4, paddingVertical: 2, borderRadius: 6, alignItems: 'center' },
  cromoBadgeText: { color: '#fff', fontSize: 7, fontWeight: '800' },
});