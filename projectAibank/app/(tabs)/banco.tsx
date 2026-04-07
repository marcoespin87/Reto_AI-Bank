import SobreModal from '../../components/SobreModal';
import * as Clipboard from 'expo-clipboard';
import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Modal, TextInput,
  Alert, ActivityIndicator
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';

export default function BancoScreen() {
  const [userName, setUserName] = useState('');
  const [saldo, setSaldo] = useState(4280.50);
  const [userId, setUserId] = useState<number | null>(null);
  const [numeroCuenta, setNumeroCuenta] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [period, setPeriod] = useState<7 | 30>(7);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<'transferir' | 'pagar' | 'compra' | null>(null);
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const DOLARES_POR_CROMO = 20;
  const [sobresModalVisible, setSobresModalVisible] = useState(false);
  const [cromosGanadosData, setCromosGanadosData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [period]);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: userData } = await supabase
      .from('users')
      .select('id, nombre, mailes_acumulados, saldo, numero_cuenta')
      .eq('email', user.email)
      .single();

    if (userData) {
      setUserName(userData.nombre?.split(' ')[0] || 'Usuario');
      setUserId(userData.id);
      setSaldo(userData.saldo || 4280.50);
      setNumeroCuenta(userData.numero_cuenta || '');
    }

    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - period);
    const fechaStr = fechaInicio.toISOString().split('T')[0];

    const { data: txs } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userData?.id)
      .gte('fecha', fechaStr)
      .order('fecha', { ascending: false });

    if (txs) setTransactions(txs);
  }

  async function handleTransaction(categoria: string) {
    if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }
    if (Number(monto) > saldo) {
      Alert.alert('Error', 'Saldo insuficiente');
      return;
    }
    if (!userId) return;

    // Validar destinatario en transferencias
    let destinatarioId: number | null = null;
    let destinatarioSaldo: number = 0;

    if (categoria === 'Transferencia') {
      if (!descripcion || descripcion.trim().length !== 16) {
        Alert.alert('Error', 'Ingresa un número de cuenta válido (16 dígitos)');
        return;
      }
      if (descripcion.trim() === numeroCuenta) {
        Alert.alert('Error', 'No puedes transferirte a ti mismo');
        return;
      }
      const { data: destinatario, error: destError } = await supabase
        .from('users')
        .select('id, saldo')
        .eq('numero_cuenta', descripcion.trim())
        .single();

      if (destError || !destinatario) {
        Alert.alert('Error', 'No se encontró ninguna cuenta con ese número');
        return;
      }
      destinatarioId = destinatario.id;
      destinatarioSaldo = destinatario.saldo || 0;
    }

    setLoading(true);

    const montoNum = Number(monto);
    const mailesGanados = Math.floor(montoNum / 100) * 10;
    const nuevoSaldo = saldo - montoNum;

    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        monto: montoNum,
        categoria: categoria,
        fecha: new Date().toISOString().split('T')[0],
        mailes_generados: mailesGanados,
      });

    if (txError) {
      setLoading(false);
      Alert.alert('Error', txError.message);
      return;
    }

    const { data: currentUser } = await supabase
      .from('users')
      .select('mailes_acumulados')
      .eq('id', userId)
      .single();

    const nuevoMailes = (currentUser?.mailes_acumulados || 0) + mailesGanados;

    await supabase
      .from('users')
      .update({ saldo: nuevoSaldo, mailes_acumulados: nuevoMailes })
      .eq('id', userId);

    // Acreditar saldo al destinatario en transferencias
    if (categoria === 'Transferencia' && destinatarioId !== null) {
      await supabase
        .from('users')
        .update({ saldo: destinatarioSaldo + montoNum })
        .eq('id', destinatarioId);
    }

    const cromosGanados = Math.floor(montoNum / DOLARES_POR_CROMO);
    const cromosNuevos: any[] = [];

    if (cromosGanados > 0) {
      const { data: allStickers } = await supabase
        .from('stickers')
        .select('id, nombre, imagen_url, rareza');

      if (allStickers && allStickers.length > 0) {
        const cromosAInsertar = [];
        for (let i = 0; i < cromosGanados; i++) {
          const randomSticker = allStickers[Math.floor(Math.random() * allStickers.length)];
          cromosAInsertar.push({
            user_id: userId,
            sticker_id: randomSticker.id,
            fecha_obtencion: new Date().toISOString().split('T')[0],
            origen: 'gasto',
          });
          cromosNuevos.push({ stickers: randomSticker });
        }
        await supabase.from('user_stickers').insert(cromosAInsertar);
      }
    }

    setSaldo(nuevoSaldo);
    setMonto('');
    setDescripcion('');
    setLoading(false);
    loadData();

    if (cromosNuevos.length > 0) {
      setCromosGanadosData(cromosNuevos);
      setModal(null);
      setTimeout(() => {
        setSobresModalVisible(true);
      }, 400);
    } else {
      setModal(null);
      Alert.alert(
        '¡Listo!',
        `Transacción de $${montoNum.toFixed(2)} realizada.\n+${mailesGanados} mAiles ganados 🌟`
      );
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

  const categoryIcon: Record<string, string> = {
    transferencia: '↗️',
    servicio: '💡',
    compra: '🛒',
    default: '💳',
  };

  const modalConfig = {
    transferir: { title: 'Transferir', categoria: 'Transferencia', placeholder: 'Número de cuenta (16 dígitos)', icon: '↗️' },
    pagar: { title: 'Pagar servicio', categoria: 'Servicio', placeholder: 'Nombre del servicio', icon: '💡' },
    compra: { title: 'Compra en línea', categoria: 'Compra', placeholder: 'Descripción de la compra', icon: '🛒' },
  };

  return (
    <SafeAreaView style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
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
            </TouchableOpacity>
            <View style={s.cardChip}>
              <View style={s.chipCircle1} />
              <View style={s.chipCircle2} />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={s.actionsRow}>
          {[
            { key: 'transferir', icon: '↗️', label: 'Transferir' },
            { key: 'pagar', icon: '💡', label: 'Pagar' },
            { key: 'compra', icon: '🛒', label: 'Compra online' },
          ].map((action) => (
            <TouchableOpacity
              key={action.key}
              style={s.actionBtn}
              onPress={() => setModal(action.key as any)}
            >
              <View style={s.actionIconWrap}>
                <Text style={s.actionIcon}>{action.icon}</Text>
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
              <Text style={[s.periodBtnText, period === 7 && s.periodBtnTextActive]}>7 días</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.periodBtn, period === 30 && s.periodBtnActive]}
              onPress={() => setPeriod(30)}
            >
              <Text style={[s.periodBtnText, period === 30 && s.periodBtnTextActive]}>30 días</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transactions */}
        {transactions.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📭</Text>
            <Text style={s.emptyText}>Sin movimientos en los últimos {period} días</Text>
          </View>
        ) : (
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
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.bottomNav}>
        <TouchableOpacity style={s.navItem} onPress={() => router.replace('/(tabs)')}>
          <Text style={s.navIcon}>🏠</Text>
          <Text style={s.navLabel}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem}>
          <Text style={s.navIconActive}>🏦</Text>
          <Text style={s.navLabelActive}>Banco</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navCenter} onPress={() => router.replace('/(tabs)/mundial')}>
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

      {/* Modal */}
      <Modal visible={modal !== null} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            {modal && (
              <>
                <Text style={s.modalTitle}>
                  {modalConfig[modal].icon} {modalConfig[modal].title}
                </Text>

                <Text style={s.inputLabel}>
                  {modal === 'transferir' ? 'NÚMERO DE CUENTA DESTINO' : 'DESCRIPCIÓN'}
                </Text>
                <TextInput
                  style={s.input}
                  placeholder={modalConfig[modal].placeholder}
                  placeholderTextColor="#424655"
                  value={descripcion}
                  onChangeText={setDescripcion}
                  keyboardType={modal === 'transferir' ? 'number-pad' : 'default'}
                  maxLength={modal === 'transferir' ? 16 : undefined}
                />

                <Text style={s.inputLabel}>MONTO ($)</Text>
                <TextInput
                  style={s.input}
                  placeholder="0.00"
                  placeholderTextColor="#424655"
                  value={monto}
                  onChangeText={setMonto}
                  keyboardType="decimal-pad"
                />

                <Text style={s.mailesPreview}>
                  ⭐ Ganarás {Math.floor(Number(monto || 0) / 100) * 10} mAiles
                </Text>

                <TouchableOpacity
                  style={[s.btnConfirm, loading && { opacity: 0.7 }]}
                  onPress={() => handleTransaction(modalConfig[modal].categoria)}
                  disabled={loading}
                >
                  {loading
                    ? <ActivityIndicator color="#002b73" />
                    : <Text style={s.btnConfirmText}>Confirmar ✦</Text>
                  }
                </TouchableOpacity>

                <TouchableOpacity style={s.btnCancel} onPress={() => { setModal(null); setMonto(''); setDescripcion(''); }}>
                  <Text style={s.btnCancelText}>Cancelar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
      <SobreModal
        visible={sobresModalVisible}
        cromos={cromosGanadosData}
        onClose={() => setSobresModalVisible(false)}
        onAgregarAlbum={() => {
          setSobresModalVisible(false);
          router.replace('/(tabs)/album');
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#071325' },
  scroll: { paddingHorizontal: 20 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#1f2a3d', borderWidth: 2, borderColor: '#b2c5ff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#b2c5ff', fontWeight: '800', fontSize: 16 },
  greeting: { color: '#b2c5ff', fontSize: 18, fontWeight: '800' },
  subGreeting: { color: '#424655', fontSize: 9, fontWeight: '600', letterSpacing: 1.5 },
  leagueBadge: { backgroundColor: '#1f2a3d', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5, borderColor: '#424655' },
  leagueBadgeText: { color: '#b2c5ff', fontSize: 10, fontWeight: '700' },

  card: { backgroundColor: '#b2c5ff', borderRadius: 24, padding: 24, marginBottom: 16, overflow: 'hidden', position: 'relative' },
  cardPatternCircle: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.1)' },
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

  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  actionBtn: { flex: 1, alignItems: 'center', gap: 8 },
  actionIconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#1f2a3d', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: '#424655' },
  actionIcon: { fontSize: 24 },
  actionLabel: { color: '#d7e3fc', fontSize: 11, fontWeight: '600' },

  periodRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: '#d7e3fc', fontSize: 18, fontWeight: '800' },
  periodBtns: { flexDirection: 'row', gap: 8 },
  periodBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#1f2a3d', borderWidth: 0.5, borderColor: '#424655' },
  periodBtnActive: { backgroundColor: '#b2c5ff' },
  periodBtnText: { color: '#8c90a1', fontSize: 12, fontWeight: '600' },
  periodBtnTextActive: { color: '#002b73' },

  empty: { alignItems: 'center', padding: 40, gap: 12 },
  emptyIcon: { fontSize: 40 },
  emptyText: { color: '#424655', fontSize: 13, textAlign: 'center' },

  txItem: { backgroundColor: '#101c2e', borderRadius: 16, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  txIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#1f2a3d', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txIcon: { fontSize: 20 },
  txInfo: { flex: 1 },
  txName: { color: '#d7e3fc', fontSize: 14, fontWeight: '700' },
  txDate: { color: '#8c90a1', fontSize: 11, marginTop: 2 },
  txRight: { alignItems: 'flex-end' },
  txAmount: { color: '#ffb4ab', fontSize: 14, fontWeight: '700' },
  txMailes: { color: '#ffd65b', fontSize: 11, fontWeight: '700', marginTop: 2 },

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

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#142032', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, borderTopWidth: 0.5, borderColor: '#424655' },
  modalTitle: { color: '#d7e3fc', fontSize: 20, fontWeight: '800', marginBottom: 20 },
  inputLabel: { color: '#b2c5ff', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 6, marginLeft: 4 },
  input: { backgroundColor: '#030e20', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: '#d7e3fc', fontSize: 15, marginBottom: 16, borderWidth: 0.5, borderColor: '#424655' },
  mailesPreview: { color: '#ffd65b', fontSize: 13, fontWeight: '600', textAlign: 'center', marginBottom: 16 },
  btnConfirm: { backgroundColor: '#b2c5ff', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 10 },
  btnConfirmText: { color: '#002b73', fontWeight: '800', fontSize: 16 },
  btnCancel: { alignItems: 'center', paddingVertical: 10 },
  btnCancelText: { color: '#8c90a1', fontSize: 14, fontWeight: '600' },
});