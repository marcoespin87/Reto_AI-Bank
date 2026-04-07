import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, RefreshControl
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';

export default function PerfilScreen() {
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

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: userData } = await supabase
      .from('users')
      .select('id, nombre, email, mailes_acumulados, fecha_registro')
      .eq('email', user.email)
      .single();

    if (userData) {
      setUserName(userData.nombre || 'Usuario');
      setEmail(userData.email || '');
      setMailes(userData.mailes_acumulados || 0);
      setFechaRegistro(userData.fecha_registro || '');

      const { count: predCount } = await supabase
        .from('predictions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userData.id);

      setPredicciones(predCount || 0);

      const { data: memberData } = await supabase
        .from('group_members')
        .select('medalla_actual, estrellas_actuales')
        .eq('user_id', userData.id)
        .single();

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
    const d = new Date(fecha);
    return d.toLocaleDateString('es', { month: 'long', year: 'numeric' });
  };

  const estrellasFill = estrellasActuales % 5;
  const progresoPct = (estrellasFill / 5) * 100;

  return (
    <SafeAreaView style={s.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#b2c5ff" colors={['#b2c5ff']} />
        }
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.headerTitle}>Hola, {userName.split(' ')[0]}</Text>
          </View>
          <View style={s.headerRight}>
            <TouchableOpacity onPress={onRefresh} style={s.refreshBtn}>
              <Text style={{ fontSize: 16 }}>🔄</Text>
            </TouchableOpacity>
            <View style={s.leagueBadge}>
              <Text style={s.leagueBadgeText}>Liga Plata • Medalla {medallaActual}</Text>
            </View>
          </View>
        </View>

        {/* Avatar Section */}
        <View style={s.avatarSection}>
          <View style={s.avatarRing}>
            <View style={s.avatarInner}>
              <Text style={s.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={s.medalBadge}>
              <Text style={s.medalBadgeText}>Liga Plata</Text>
            </View>
          </View>
          <Text style={s.profileName}>{userName}</Text>
          <Text style={s.profileEmail}>{email}</Text>
          <Text style={s.profileSince}>Miembro desde {formatFecha(fechaRegistro)}</Text>
        </View>

        {/* Star Progress */}
        <View style={s.section}>
          <View style={s.progressHeader}>
            <Text style={s.progressTitle}>Medalla {medallaActual} · Avanzando hacia Medalla {medallaActual + 1}</Text>
            <Text style={s.progressCount}>{estrellasFill}/5 ⭐</Text>
          </View>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${progresoPct}%` }]} />
          </View>
        </View>

        {/* Stats Grid */}
        <View style={s.statsGrid}>
          <View style={s.statCard}>
            <Text style={s.statValue}>{mailes.toLocaleString()}</Text>
            <Text style={s.statIcon}>⭐</Text>
            <Text style={s.statLabel}>Total mAiles</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statValue}>{predicciones}</Text>
            <Text style={s.statIcon}>⚽</Text>
            <Text style={s.statLabel}>Predicciones</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statValue}>1</Text>
            <Text style={s.statIcon}>📅</Text>
            <Text style={s.statLabel}>Temporadas</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statValue}>{rachaMax}</Text>
            <Text style={s.statIcon}>🔥</Text>
            <Text style={s.statLabel}>Racha Máx</Text>
          </View>
        </View>

        {/* Medal History */}
        <View style={s.sectionCard}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Mis medallas</Text>
            <Text style={s.seeAll}>Ver todas</Text>
          </View>
          <View style={s.medalsRow}>
            {medallas.map((m) => (
              <View key={m} style={[s.medalItem, m === medallaActual && s.medalItemActive]}>
                {m === medallaActual ? (
                  <View style={s.medalCircleActive}>
                    <Text style={s.medalCircleText}>🏅</Text>
                  </View>
                ) : m < medallaActual ? (
                  <View style={s.medalCircleDone}>
                    <Text style={s.medalCircleText}>🏅</Text>
                  </View>
                ) : (
                  <View style={s.medalCircleLocked}>
                    <Text style={s.medalCircleText}>🔒</Text>
                  </View>
                )}
                {m === medallaActual && (
                  <Text style={s.medalCurrentLabel}>ACTUAL</Text>
                )}
                {m !== medallaActual && (
                  <Text style={s.medalLabel}>M{m}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Benefits */}
        <View style={s.sectionCard}>
          <TouchableOpacity
            style={s.sectionHeader}
            onPress={() => setBeneficiosOpen(!beneficiosOpen)}
          >
            <View style={s.benefitsTitleRow}>
              <Text style={s.benefitsIcon}>✅</Text>
              <Text style={s.sectionTitle}>Beneficios Medalla {medallaActual}</Text>
            </View>
            <Text style={s.chevron}>{beneficiosOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {beneficiosOpen && (
            <View style={s.benefitsList}>
              {(beneficios[medallaActual] || []).map((b, i) => (
                <View key={i} style={s.benefitItem}>
                  <Text style={s.benefitCheck}>✓</Text>
                  <Text style={s.benefitText}>{b}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Next Medal Benefits */}
        {medallaActual < 6 && (
          <View style={[s.sectionCard, { opacity: 0.5 }]}>
            <View style={s.sectionHeader}>
              <View style={s.benefitsTitleRow}>
                <Text style={s.benefitsIcon}>🔒</Text>
                <Text style={s.sectionTitle}>Beneficios Medalla {medallaActual + 1}</Text>
              </View>
              <Text style={s.chevron}>▼</Text>
            </View>
          </View>
        )}

        {/* Settings */}
        <View style={s.sectionCard}>
          {[
            { icon: '🔔', label: 'Notificaciones' },
            { icon: '🔐', label: 'Seguridad' },
            { icon: '🌐', label: 'Idioma', sub: 'Español' },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={s.settingItem}>
              <View style={s.settingLeft}>
                <Text style={s.settingIcon}>{item.icon}</Text>
                <View>
                  <Text style={s.settingLabel}>{item.label}</Text>
                  {item.sub && <Text style={s.settingSub}>{item.sub}</Text>}
                </View>
              </View>
              <Text style={s.chevron}>›</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={s.settingItem} onPress={handleLogout}>
            <View style={s.settingLeft}>
              <Text style={s.settingIcon}>🚪</Text>
              <Text style={[s.settingLabel, { color: '#ffb4ab' }]}>Cerrar sesión</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.bottomNav}>
        <TouchableOpacity style={s.navItem} onPress={() => router.replace('/(tabs)')}>
          <Text style={s.navIcon}>🏠</Text>
          <Text style={s.navLabel}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem} onPress={() => router.replace('/(tabs)/banco')}>
          <Text style={s.navIcon}>🏦</Text>
          <Text style={s.navLabel}>Banco</Text>
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
        <TouchableOpacity style={s.navItem}>
          <Text style={s.navIconActive}>👤</Text>
          <Text style={s.navLabelActive}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#071325' },
  scroll: { paddingHorizontal: 20 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  headerLeft: {},
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { color: '#b2c5ff', fontSize: 20, fontWeight: '800' },
  refreshBtn: { backgroundColor: '#1f2a3d', padding: 8, borderRadius: 12, borderWidth: 0.5, borderColor: '#424655' },
  leagueBadge: { backgroundColor: '#1f2a3d', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5, borderColor: '#424655' },
  leagueBadgeText: { color: '#b2c5ff', fontSize: 10, fontWeight: '700' },

  avatarSection: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  avatarRing: { width: 120, height: 120, borderRadius: 60, padding: 3, backgroundColor: '#ffd65b', alignItems: 'center', justifyContent: 'center', marginBottom: 16, position: 'relative' },
  avatarInner: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#1f2a3d', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#071325' },
  avatarText: { color: '#b2c5ff', fontSize: 42, fontWeight: '800' },
  medalBadge: { position: 'absolute', bottom: -8, backgroundColor: '#ffd65b', paddingHorizontal: 12, paddingVertical: 3, borderRadius: 20 },
  medalBadgeText: { color: '#002b73', fontSize: 9, fontWeight: '800' },
  profileName: { color: '#d7e3fc', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  profileEmail: { color: '#8c90a1', fontSize: 13, marginBottom: 4 },
  profileSince: { color: '#424655', fontSize: 12 },

  section: { backgroundColor: '#101c2e', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 0.5, borderColor: '#1f2a3d' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressTitle: { color: '#b2c5ff', fontSize: 12, fontWeight: '600', flex: 1 },
  progressCount: { color: '#ffd65b', fontSize: 12, fontWeight: '700' },
  progressBar: { height: 8, backgroundColor: '#1f2a3d', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#ffd65b', borderRadius: 4 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: '#101c2e', borderRadius: 16, padding: 16, alignItems: 'flex-start', borderWidth: 0.5, borderColor: '#1f2a3d' },
  statValue: { color: '#d7e3fc', fontSize: 24, fontWeight: '800', marginBottom: 2 },
  statIcon: { fontSize: 16, marginBottom: 4 },
  statLabel: { color: '#8c90a1', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },

  sectionCard: { backgroundColor: '#101c2e', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 0.5, borderColor: '#1f2a3d' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: '#d7e3fc', fontSize: 15, fontWeight: '700' },
  seeAll: { color: '#b2c5ff', fontSize: 12, fontWeight: '600' },
  chevron: { color: '#8c90a1', fontSize: 16 },

  medalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  medalItem: { alignItems: 'center', gap: 4 },
  medalItemActive: { transform: [{ scale: 1.2 }] },
  medalCircleActive: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#ffd65b', alignItems: 'center', justifyContent: 'center' },
  medalCircleDone: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1f2a3d', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ffd65b' },
  medalCircleLocked: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1f2a3d', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: '#424655', opacity: 0.4 },
  medalCircleText: { fontSize: 20 },
  medalCurrentLabel: { color: '#ffd65b', fontSize: 8, fontWeight: '800' },
  medalLabel: { color: '#8c90a1', fontSize: 9 },

  benefitsTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  benefitsIcon: { fontSize: 16 },
  benefitsList: { gap: 10 },
  benefitItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  benefitCheck: { color: '#ffd65b', fontSize: 14, fontWeight: '700', marginTop: 1 },
  benefitText: { color: '#c2c6d8', fontSize: 13, flex: 1 },

  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#1f2a3d' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  settingIcon: { fontSize: 20 },
  settingLabel: { color: '#d7e3fc', fontSize: 14, fontWeight: '600' },
  settingSub: { color: '#8c90a1', fontSize: 11, marginTop: 1 },

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
});