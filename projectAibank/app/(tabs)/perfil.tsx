import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, RefreshControl
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

export default function PerfilScreen() {
  const { colors } = useTheme();
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [mailes, setMailes] = useState(0);
  const [fechaRegistro, setFechaRegistro] = useState('');
  const [predicciones, setPredicciones] = useState(0);
  const [rachaMax, setRachaMax] = useState(0);
  const [medallaActual, setMedallaActual] = useState(1);
  const [estrellasActuales, setEstrellasActuales] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [beneficiosOpen, setBeneficiosOpen] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: userData } = await supabase
      .from('users')
      .select('id, nombre, email, mailes_acumulados, fecha_registro')
      .eq('email', user.email).single();
    if (userData) {
      setUserName(userData.nombre || 'Usuario');
      setEmail(userData.email || '');
      setMailes(userData.mailes_acumulados || 0);
      setFechaRegistro(userData.fecha_registro || '');
      const { count: predCount } = await supabase
        .from('predictions').select('*', { count: 'exact', head: true })
        .eq('user_id', userData.id);
      setPredicciones(predCount || 0);
      const { data: memberData } = await supabase
        .from('group_members').select('medalla_actual, estrellas_actuales')
        .eq('user_id', userData.id).single();
      if (memberData) {
        setMedallaActual(memberData.medalla_actual || 1);
        setEstrellasActuales(memberData.estrellas_actuales || 0);
        setRachaMax(memberData.estrellas_actuales || 0);
      }
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  }

  const medallas = [1, 2, 3, 4, 5, 6];
  const beneficios: Record<number, string[]> = {
    1: ['Acceso básico a pronósticos', 'Acumulación de mAiles x1.0'],
    2: ['Todo de Medalla 1', 'Multiplicador mAiles x1.1', 'Acceso a ligas grupales'],
    3: ['Todo de Medalla 2', 'Multiplicador mAiles x1.2', 'Acceso anticipado a preventas', 'Personalización de tarjeta digital'],
    4: ['Todo de Medalla 3', 'Multiplicador mAiles x1.5', 'Sala VIP en aeropuertos', 'Pronósticos exclusivos de semifinales'],
    5: ['Todo de Medalla 4', 'Multiplicador mAiles x2.0', 'Upgrades de vuelo', 'Experiencias exclusivas del Mundial'],
    6: ['Todo de Medalla 5', 'Multiplicador mAiles x3.0', 'Acceso a palco VIP', 'Beneficios ilimitados AI-Bank'],
  };

  const formatFecha = (fecha: string) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es', { month: 'long', year: 'numeric' });
  };

  const estrellasFill = estrellasActuales % 5;
  const progresoPct = (estrellasFill / 5) * 100;

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
          <Text style={[s.headerTitle, { color: colors.primary }]}>Hola, {userName.split(' ')[0]}</Text>
          <View style={s.headerRight}>
            <TouchableOpacity onPress={onRefresh} style={[s.refreshBtn, { backgroundColor: colors.surfaceHigh, borderColor: colors.border }]}>
              <Text style={{ fontSize: 16 }}>🔄</Text>
            </TouchableOpacity>
            <View style={[s.leagueBadge, { backgroundColor: colors.surfaceHigh, borderColor: colors.border }]}>
              <Text style={[s.leagueBadgeText, { color: colors.primary }]}>Liga Plata • Medalla {medallaActual}</Text>
            </View>
          </View>
        </View>

        {/* Avatar Section */}
        <View style={s.avatarSection}>
          <View style={s.avatarRing}>
            <View style={[s.avatarInner, { backgroundColor: colors.surfaceHigh, borderColor: colors.background }]}>
              <Text style={[s.avatarText, { color: colors.primary }]}>{userName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={s.medalBadge}>
              <Text style={s.medalBadgeText}>Liga Plata</Text>
            </View>
          </View>
          <Text style={[s.profileName, { color: colors.textPrimary }]}>{userName}</Text>
          <Text style={[s.profileEmail, { color: colors.textSecondary }]}>{email}</Text>
          <Text style={[s.profileSince, { color: colors.textMuted }]}>Miembro desde {formatFecha(fechaRegistro)}</Text>
        </View>

        {/* Star Progress */}
        <View style={[s.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={s.progressHeader}>
            <Text style={[s.progressTitle, { color: colors.primary }]}>Medalla {medallaActual} · Avanzando hacia Medalla {medallaActual + 1}</Text>
            <Text style={s.progressCount}>{estrellasFill}/5 ⭐</Text>
          </View>
          <View style={[s.progressBar, { backgroundColor: colors.surfaceHigh }]}>
            <View style={[s.progressFill, { width: `${progresoPct}%` }]} />
          </View>
        </View>

        {/* Stats Grid */}
        <View style={s.statsGrid}>
          {[
            { value: mailes.toLocaleString(), icon: '⭐', label: 'Total mAiles' },
            { value: predicciones, icon: '⚽', label: 'Predicciones' },
            { value: 1, icon: '📅', label: 'Temporadas' },
            { value: rachaMax, icon: '🔥', label: 'Racha Máx' },
          ].map((stat, i) => (
            <View key={i} style={[s.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.statValue, { color: colors.textPrimary }]}>{stat.value}</Text>
              <Text style={s.statIcon}>{stat.icon}</Text>
              <Text style={[s.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Medal History */}
        <View style={[s.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Mis medallas</Text>
            <Text style={[s.seeAll, { color: colors.primary }]}>Ver todas</Text>
          </View>
          <View style={s.medalsRow}>
            {medallas.map((m) => (
              <View key={m} style={[s.medalItem, m === medallaActual && s.medalItemActive]}>
                {m === medallaActual ? (
                  <View style={s.medalCircleActive}>
                    <Text style={s.medalCircleText}>🏅</Text>
                  </View>
                ) : m < medallaActual ? (
                  <View style={[s.medalCircleDone, { backgroundColor: colors.surfaceHigh }]}>
                    <Text style={s.medalCircleText}>🏅</Text>
                  </View>
                ) : (
                  <View style={[s.medalCircleLocked, { backgroundColor: colors.surfaceHigh, borderColor: colors.border }]}>
                    <Text style={s.medalCircleText}>🔒</Text>
                  </View>
                )}
                {m === medallaActual
                  ? <Text style={s.medalCurrentLabel}>ACTUAL</Text>
                  : <Text style={[s.medalLabel, { color: colors.textSecondary }]}>M{m}</Text>
                }
              </View>
            ))}
          </View>
        </View>

        {/* Benefits */}
        <View style={[s.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity style={s.sectionHeader} onPress={() => setBeneficiosOpen(!beneficiosOpen)}>
            <View style={s.benefitsTitleRow}>
              <Text style={s.benefitsIcon}>✅</Text>
              <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Beneficios Medalla {medallaActual}</Text>
            </View>
            <Text style={[s.chevron, { color: colors.textSecondary }]}>{beneficiosOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {beneficiosOpen && (
            <View style={s.benefitsList}>
              {(beneficios[medallaActual] || []).map((b, i) => (
                <View key={i} style={s.benefitItem}>
                  <Text style={s.benefitCheck}>✓</Text>
                  <Text style={[s.benefitText, { color: colors.textSecondary }]}>{b}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Next Medal */}
        {medallaActual < 6 && (
          <View style={[s.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border, opacity: 0.5 }]}>
            <View style={s.sectionHeader}>
              <View style={s.benefitsTitleRow}>
                <Text style={s.benefitsIcon}>🔒</Text>
                <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Beneficios Medalla {medallaActual + 1}</Text>
              </View>
              <Text style={[s.chevron, { color: colors.textSecondary }]}>▼</Text>
            </View>
          </View>
        )}

        {/* Premio */}
        <TouchableOpacity style={[s.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={s.prizeRow}>
            <View style={s.prizeRowLeft}>
              <Text style={{ fontSize: 28 }}>🏆</Text>
              <View>
                <Text style={s.prizeRowTitle}>Mi Premio de Temporada</Text>
                <Text style={[s.prizeRowSub, { color: colors.textSecondary }]}>Descubre tu recompensa personalizada</Text>
              </View>
            </View>
            <Text style={[s.chevron, { color: colors.textSecondary }]}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Settings */}
        <View style={[s.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {[
            { icon: '🔔', label: 'Notificaciones' },
            { icon: '🔐', label: 'Seguridad' },
            { icon: '🌐', label: 'Idioma', sub: 'Español' },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={[s.settingItem, { borderBottomColor: colors.border }]}>
              <View style={s.settingLeft}>
                <Text style={s.settingIcon}>{item.icon}</Text>
                <View>
                  <Text style={[s.settingLabel, { color: colors.textPrimary }]}>{item.label}</Text>
                  {item.sub && <Text style={[s.settingSub, { color: colors.textSecondary }]}>{item.sub}</Text>}
                </View>
              </View>
              <Text style={[s.chevron, { color: colors.textSecondary }]}>›</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[s.settingItem, { borderBottomColor: colors.border }]} onPress={handleLogout}>
            <View style={s.settingLeft}>
              <Text style={s.settingIcon}>🚪</Text>
              <Text style={[s.settingLabel, { color: colors.error }]}>Cerrar sesión</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={[s.bottomNav, { backgroundColor: colors.navBg, borderTopColor: colors.border }]}>
        <TouchableOpacity style={s.navItem} onPress={() => router.replace('/(tabs)')}>
          <Text style={s.navIcon}>🏠</Text>
          <Text style={[s.navLabel, { color: colors.textSecondary }]}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem} onPress={() => router.replace('/(tabs)/banco')}>
          <Text style={s.navIcon}>🏦</Text>
          <Text style={[s.navLabel, { color: colors.textSecondary }]}>Banco</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navCenter} onPress={() => router.replace('/(tabs)/mundial')}>
          <View style={[s.navCenterBtn, { backgroundColor: colors.primary, borderColor: colors.background }]}>
            <Text style={s.navCenterIcon}>⚽</Text>
          </View>
          <Text style={[s.navCenterLabel, { color: colors.primary }]}>Mundial</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem} onPress={() => router.replace('/(tabs)/grupo')}>
          <Text style={s.navIcon}>👥</Text>
          <Text style={[s.navLabel, { color: colors.textSecondary }]}>Grupo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem}>
          <Text style={s.navIconActive}>👤</Text>
          <Text style={[s.navLabelActive, { color: colors.primary }]}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  refreshBtn: { padding: 8, borderRadius: 12, borderWidth: 0.5 },
  leagueBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5 },
  leagueBadgeText: { fontSize: 10, fontWeight: '700' },
  avatarSection: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  avatarRing: { width: 120, height: 120, borderRadius: 60, padding: 3, backgroundColor: '#ffd65b', alignItems: 'center', justifyContent: 'center', marginBottom: 16, position: 'relative' },
  avatarInner: { width: 110, height: 110, borderRadius: 55, alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
  avatarText: { fontSize: 42, fontWeight: '800' },
  medalBadge: { position: 'absolute', bottom: -8, backgroundColor: '#ffd65b', paddingHorizontal: 12, paddingVertical: 3, borderRadius: 20 },
  medalBadgeText: { color: '#002b73', fontSize: 9, fontWeight: '800' },
  profileName: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  profileEmail: { fontSize: 13, marginBottom: 4 },
  profileSince: { fontSize: 12 },
  section: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 0.5 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressTitle: { fontSize: 12, fontWeight: '600', flex: 1 },
  progressCount: { color: '#ffd65b', fontSize: 12, fontWeight: '700' },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#ffd65b', borderRadius: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  statCard: { flex: 1, minWidth: '45%', borderRadius: 16, padding: 16, alignItems: 'flex-start', borderWidth: 0.5 },
  statValue: { fontSize: 24, fontWeight: '800', marginBottom: 2 },
  statIcon: { fontSize: 16, marginBottom: 4 },
  statLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  sectionCard: { borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 0.5 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  seeAll: { fontSize: 12, fontWeight: '600' },
  chevron: { fontSize: 16 },
  medalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  medalItem: { alignItems: 'center', gap: 4 },
  medalItemActive: { transform: [{ scale: 1.2 }] },
  medalCircleActive: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#ffd65b', alignItems: 'center', justifyContent: 'center' },
  medalCircleDone: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ffd65b' },
  medalCircleLocked: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, opacity: 0.4 },
  medalCircleText: { fontSize: 20 },
  medalCurrentLabel: { color: '#ffd65b', fontSize: 8, fontWeight: '800' },
  medalLabel: { fontSize: 9 },
  benefitsTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  benefitsIcon: { fontSize: 16 },
  benefitsList: { gap: 10 },
  benefitItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  benefitCheck: { color: '#ffd65b', fontSize: 14, fontWeight: '700', marginTop: 1 },
  benefitText: { fontSize: 13, flex: 1 },
  prizeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  prizeRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  prizeRowTitle: { color: '#ffd65b', fontSize: 15, fontWeight: '700' },
  prizeRowSub: { fontSize: 12, marginTop: 2 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  settingIcon: { fontSize: 20 },
  settingLabel: { fontSize: 14, fontWeight: '600' },
  settingSub: { fontSize: 11, marginTop: 1 },
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
});