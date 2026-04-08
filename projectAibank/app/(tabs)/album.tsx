import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Image, Modal,
  RefreshControl
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

const DOLARES_POR_CROMO = 20;
const TOTAL_ALBUM = 28;

const RAREZA_CONFIG = {
  epico:  { color: '#ffd65b', border: '#f0c110', label: 'ÉPICO',  bg: 'rgba(240,193,16,0.15)' },
  raro:   { color: '#b2c5ff', border: '#5b8cff', label: 'RARO',   bg: 'rgba(91,140,255,0.15)' },
  comun:  { color: '#c2c6d8', border: '#424655', label: 'COMÚN',  bg: 'rgba(66,70,85,0.15)'   },
};

export default function AlbumScreen() {
  const { colors } = useTheme();
  const [userId, setUserId] = useState<number | null>(null);
  const [todosStickers, setTodosStickers] = useState<any[]>([]);
  const [misStickers, setMisStickers] = useState<any[]>([]);
  const [filtro, setFiltro] = useState<'todos' | 'epico' | 'raro' | 'comun'>('todos');
  const [stickerSeleccionado, setStickerSeleccionado] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [albumCompleto, setAlbumCompleto] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: userData } = await supabase
      .from('users').select('id').eq('email', user.email).single();
    if (!userData) return;
    setUserId(userData.id);

    const { data: stickers } = await supabase
      .from('stickers').select('*').order('rareza', { ascending: false });
    if (stickers) setTodosStickers(stickers);

    const { data: misS } = await supabase
      .from('user_stickers').select('*, stickers(*)').eq('user_id', userData.id);
    if (misS) {
      setMisStickers(misS);
      const uniqueIds = new Set(misS.map((s: any) => s.sticker_id));
      if (uniqueIds.size >= TOTAL_ALBUM) setAlbumCompleto(true);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  function getCantidad(stickerId: number) {
    return misStickers.filter(s => s.sticker_id === stickerId).length;
  }

  const stickersFiltrados = filtro === 'todos'
    ? todosStickers
    : todosStickers.filter(s => s.rareza === filtro);

  const totalUnicos = new Set(misStickers.map(s => s.sticker_id)).size;
  const progresoPct = (totalUnicos / TOTAL_ALBUM) * 100;

  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[s.backText, { color: colors.primary }]}>← Volver</Text>
          </TouchableOpacity>
          <View style={[s.leagueBadge, { backgroundColor: colors.surfaceHigh, borderColor: colors.border }]}>
            <Text style={[s.leagueBadgeText, { color: colors.primary }]}>Liga Plata • Medalla 3</Text>
          </View>
        </View>

        {/* Banner album completo */}
        {albumCompleto && (
          <View style={s.goldenBanner}>
            <Text style={s.goldenIcon}>🎫</Text>
            <View style={s.goldenInfo}>
              <Text style={s.goldenTitle}>¡Álbum completo!</Text>
              <Text style={[s.goldenSub, { color: colors.textSecondary }]}>Tienes un boleto dorado al sorteo VIP Mundial 2026 ✈️🏨🍽️</Text>
            </View>
          </View>
        )}

        {/* Progreso */}
        <View style={s.progresoSection}>
          <View style={s.progresoHeader}>
            <Text style={s.progresoNum}>{totalUnicos}</Text>
            <Text style={[s.progresoTotal, { color: colors.textSecondary }]}>/ {TOTAL_ALBUM} cromos</Text>
          </View>
          <View style={[s.progressBar, { backgroundColor: colors.surfaceHigh }]}>
            <View style={[s.progressFill, { width: `${progresoPct}%`, backgroundColor: colors.primary }]} />
          </View>
          <Text style={[s.progresoSub, { color: colors.textSecondary }]}>
            {totalUnicos === TOTAL_ALBUM
              ? '🏆 ¡Álbum completo! Eres un crack'
              : `¡Estás a ${TOTAL_ALBUM - totalUnicos} cromos de completar tu colección!`}
          </Text>
          <View style={[s.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[s.infoText, { color: colors.primary }]}>⭐ Ganas 1 cromo por cada ${DOLARES_POR_CROMO} gastados</Text>
          </View>
        </View>

        {/* Filtros */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filtrosRow}>
          {(['todos', 'epico', 'raro', 'comun'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                s.filtroBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
                filtro === f && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setFiltro(f)}
            >
              <Text style={[
                s.filtroBtnText,
                { color: colors.textSecondary },
                filtro === f && { color: colors.cardText, fontWeight: '800' },
              ]}>
                {f === 'todos' ? 'Todos' : f === 'epico' ? '⭐ Épico' : f === 'raro' ? '💎 Raro' : '⚪ Común'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Grid */}
        <View style={s.grid}>
          {stickersFiltrados.map((sticker) => {
            const cantidad = getCantidad(sticker.id);
            const lo_tengo = cantidad > 0;
            const rareza = RAREZA_CONFIG[sticker.rareza as keyof typeof RAREZA_CONFIG] || RAREZA_CONFIG.comun;
            return (
              <TouchableOpacity
                key={sticker.id}
                style={[
                  s.stickerCard,
                  { borderColor: lo_tengo ? rareza.border : colors.border, backgroundColor: colors.surface },
                  !lo_tengo && s.stickerCardLocked,
                ]}
                onPress={() => lo_tengo && setStickerSeleccionado(sticker)}
                activeOpacity={lo_tengo ? 0.8 : 1}
              >
                {lo_tengo ? (
                  <>
                    <Image source={{ uri: sticker.imagen_url }} style={s.stickerImage} resizeMode="cover" />
                    <View style={[s.rarezaBadge, { backgroundColor: rareza.bg }]}>
                      <Text style={[s.rarezaBadgeText, { color: rareza.color }]}>{rareza.label}</Text>
                    </View>
                    {cantidad > 1 && (
                      <View style={s.cantidadBadge}>
                        <Text style={s.cantidadText}>x{cantidad}</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <View style={[s.stickerLocked, { backgroundColor: colors.surfaceHigh }]}>
                    <Text style={[s.stickerLockedText, { color: colors.textMuted }]}>?</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal detalle */}
      <Modal visible={stickerSeleccionado !== null} transparent animationType="fade">
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setStickerSeleccionado(null)}>
          {stickerSeleccionado && (() => {
            const rareza = RAREZA_CONFIG[stickerSeleccionado.rareza as keyof typeof RAREZA_CONFIG] || RAREZA_CONFIG.comun;
            const cantidad = getCantidad(stickerSeleccionado.id);
            return (
              <View style={[s.modalCard, { backgroundColor: colors.surface, borderColor: rareza.border }]}>
                <Image source={{ uri: stickerSeleccionado.imagen_url }} style={s.modalImage} resizeMode="cover" />
                <View style={s.modalInfo}>
                  <Text style={[s.modalRareza, { color: rareza.color }]}>{rareza.label}</Text>
                  <Text style={[s.modalNombre, { color: colors.textPrimary }]}>{stickerSeleccionado.nombre}</Text>
                  {cantidad > 1 && (
                    <Text style={s.modalCantidad}>Tienes {cantidad} copias de este cromo</Text>
                  )}
                  <Text style={[s.modalTap, { color: colors.textMuted }]}>Toca fuera para cerrar</Text>
                </View>
              </View>
            );
          })()}
        </TouchableOpacity>
      </Modal>

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
  scroll: { paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  backText: { fontSize: 14, fontWeight: '600' },
  leagueBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5 },
  leagueBadgeText: { fontSize: 10, fontWeight: '700' },
  goldenBanner: { backgroundColor: 'rgba(240,193,16,0.1)', borderRadius: 16, padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(240,193,16,0.3)' },
  goldenIcon: { fontSize: 36 },
  goldenInfo: { flex: 1 },
  goldenTitle: { color: '#ffd65b', fontSize: 16, fontWeight: '800' },
  goldenSub: { fontSize: 12, marginTop: 2 },
  progresoSection: { marginBottom: 16 },
  progresoHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 8 },
  progresoNum: { color: '#ffd65b', fontSize: 40, fontWeight: '800', letterSpacing: -1 },
  progresoTotal: { fontSize: 16, fontWeight: '500' },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 4 },
  progresoSub: { fontSize: 12, marginBottom: 8 },
  infoBox: { borderRadius: 10, padding: 10, borderWidth: 0.5 },
  infoText: { fontSize: 11, fontWeight: '600' },
  filtrosRow: { marginBottom: 16 },
  filtroBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 0.5 },
  filtroBtnText: { fontSize: 12, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stickerCard: { width: '30%', aspectRatio: 3/4, borderRadius: 12, borderWidth: 1.5, overflow: 'hidden', position: 'relative' },
  stickerCardLocked: { opacity: 0.4 },
  stickerImage: { width: '100%', height: '100%' },
  rarezaBadge: { position: 'absolute', bottom: 4, left: 4, right: 4, paddingVertical: 2, borderRadius: 6, alignItems: 'center' },
  rarezaBadgeText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
  cantidadBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: '#ffd65b', borderRadius: 10, paddingHorizontal: 5, paddingVertical: 2 },
  cantidadText: { color: '#002b73', fontSize: 9, fontWeight: '800' },
  stickerLocked: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  stickerLockedText: { fontSize: 32, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { borderRadius: 24, overflow: 'hidden', borderWidth: 2, width: '80%' },
  modalImage: { width: '100%', aspectRatio: 3/4 },
  modalInfo: { padding: 16, alignItems: 'center' },
  modalRareza: { fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 4 },
  modalNombre: { fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  modalCantidad: { color: '#ffd65b', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  modalTap: { fontSize: 10, marginTop: 8 },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12, paddingBottom: 24, borderTopWidth: 0.5, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  navItem: { alignItems: 'center', gap: 2 },
  navIcon: { fontSize: 22, opacity: 0.5 },
  navLabel: { fontSize: 9, fontWeight: '500', opacity: 0.5 },
  navCenter: { alignItems: 'center', marginTop: -20 },
  navCenterBtn: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 4, borderWidth: 3 },
  navCenterIcon: { fontSize: 26 },
  navCenterLabel: { fontSize: 9, fontWeight: '700' },
});