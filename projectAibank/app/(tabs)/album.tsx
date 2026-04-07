import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Image, Modal,
  RefreshControl, Alert
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';

// ─── CONFIGURACIÓN DE CROMOS ───────────────────────────────────────────────
const DOLARES_POR_CROMO = 20; // cada $20 = 1 cromo
const TOTAL_ALBUM = 28;       // total de cromos para completar

const RAREZA_CONFIG = {
  epico:  { color: '#ffd65b', border: '#f0c110', label: 'ÉPICO',  bg: 'rgba(240,193,16,0.15)' },
  raro:   { color: '#b2c5ff', border: '#5b8cff', label: 'RARO',   bg: 'rgba(91,140,255,0.15)' },
  comun:  { color: '#c2c6d8', border: '#424655', label: 'COMÚN',  bg: 'rgba(66,70,85,0.15)'   },
};

export default function AlbumScreen() {
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
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!userData) return;
    setUserId(userData.id);

    const { data: stickers } = await supabase
      .from('stickers')
      .select('*')
      .order('rareza', { ascending: false });

    if (stickers) setTodosStickers(stickers);

    const { data: misS } = await supabase
      .from('user_stickers')
      .select('*, stickers(*)')
      .eq('user_id', userData.id);

    if (misS) {
      setMisStickers(misS);
      const uniqueIds = new Set(misS.map((s: any) => s.sticker_id));
      if (uniqueIds.size >= TOTAL_ALBUM) {
        setAlbumCompleto(true);
      }
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

  function tengo(stickerId: number) {
    return getCantidad(stickerId) > 0;
  }

  const stickersFiltrados = filtro === 'todos'
    ? todosStickers
    : todosStickers.filter(s => s.rareza === filtro);

  const totalUnicos = new Set(misStickers.map(s => s.sticker_id)).size;
  const progresoPct = (totalUnicos / TOTAL_ALBUM) * 100;

  return (
    <SafeAreaView style={s.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#b2c5ff" colors={['#b2c5ff']} />}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backText}>← Volver</Text>
          </TouchableOpacity>
          <View style={s.leagueBadge}>
            <Text style={s.leagueBadgeText}>Liga Plata • Medalla 3</Text>
          </View>
        </View>

        {/* Album completo banner */}
        {albumCompleto && (
          <View style={s.goldenBanner}>
            <Text style={s.goldenIcon}>🎫</Text>
            <View style={s.goldenInfo}>
              <Text style={s.goldenTitle}>¡Álbum completo!</Text>
              <Text style={s.goldenSub}>Tienes un boleto dorado al sorteo VIP Mundial 2026 ✈️🏨🍽️</Text>
            </View>
          </View>
        )}

        {/* Progreso */}
        <View style={s.progresoSection}>
          <View style={s.progresoHeader}>
            <Text style={s.progresoNum}>{totalUnicos}</Text>
            <Text style={s.progresoTotal}>/ {TOTAL_ALBUM} cromos</Text>
          </View>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${progresoPct}%` }]} />
          </View>
          <Text style={s.progresoSub}>
            {totalUnicos === TOTAL_ALBUM
              ? '🏆 ¡Álbum completo! Eres un crack'
              : `¡Estás a ${TOTAL_ALBUM - totalUnicos} cromos de completar tu colección!`}
          </Text>
          <View style={s.infoBox}>
            <Text style={s.infoText}>⭐ Ganas 1 cromo por cada ${DOLARES_POR_CROMO} gastados</Text>
          </View>
        </View>

        {/* Filtros */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filtrosRow}>
          {(['todos', 'epico', 'raro', 'comun'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[s.filtroBtn, filtro === f && s.filtroBtnActive]}
              onPress={() => setFiltro(f)}
            >
              <Text style={[s.filtroBtnText, filtro === f && s.filtroBtnTextActive]}>
                {f === 'todos' ? 'Todos' : f === 'epico' ? '⭐ Épico' : f === 'raro' ? '💎 Raro' : '⚪ Común'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Grid de stickers */}
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
                  { borderColor: lo_tengo ? rareza.border : '#1f2a3d' },
                  !lo_tengo && s.stickerCardLocked,
                ]}
                onPress={() => lo_tengo && setStickerSeleccionado(sticker)}
                activeOpacity={lo_tengo ? 0.8 : 1}
              >
                {lo_tengo ? (
                  <>
                    <Image
                      source={{ uri: sticker.imagen_url }}
                      style={s.stickerImage}
                      resizeMode="cover"
                    />
                    <View style={[s.rarezaBadge, { backgroundColor: rareza.bg }]}>
                      <Text style={[s.rarezaBadgeText, { color: rareza.color }]}>
                        {rareza.label}
                      </Text>
                    </View>
                    {cantidad > 1 && (
                      <View style={s.cantidadBadge}>
                        <Text style={s.cantidadText}>x{cantidad}</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <View style={s.stickerLocked}>
                    <Text style={s.stickerLockedText}>?</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal detalle sticker */}
      <Modal visible={stickerSeleccionado !== null} transparent animationType="fade">
        <TouchableOpacity
          style={s.modalOverlay}
          activeOpacity={1}
          onPress={() => setStickerSeleccionado(null)}
        >
          {stickerSeleccionado && (() => {
            const rareza = RAREZA_CONFIG[stickerSeleccionado.rareza as keyof typeof RAREZA_CONFIG] || RAREZA_CONFIG.comun;
            const cantidad = getCantidad(stickerSeleccionado.id);
            return (
              <View style={[s.modalCard, { borderColor: rareza.border }]}>
                <Image
                  source={{ uri: stickerSeleccionado.imagen_url }}
                  style={s.modalImage}
                  resizeMode="cover"
                />
                <View style={s.modalInfo}>
                  <Text style={[s.modalRareza, { color: rareza.color }]}>{rareza.label}</Text>
                  <Text style={s.modalNombre}>{stickerSeleccionado.nombre}</Text>
                  {cantidad > 1 && (
                    <Text style={s.modalCantidad}>Tienes {cantidad} copias de este cromo</Text>
                  )}
                  <Text style={s.modalTap}>Toca fuera para cerrar</Text>
                </View>
              </View>
            );
          })()}
        </TouchableOpacity>
      </Modal>

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
  scroll: { paddingHorizontal: 16 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  backBtn: {},
  backText: { color: '#b2c5ff', fontSize: 14, fontWeight: '600' },
  leagueBadge: { backgroundColor: '#1f2a3d', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5, borderColor: '#424655' },
  leagueBadgeText: { color: '#b2c5ff', fontSize: 10, fontWeight: '700' },

  goldenBanner: { backgroundColor: 'rgba(240,193,16,0.1)', borderRadius: 16, padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(240,193,16,0.3)' },
  goldenIcon: { fontSize: 36 },
  goldenInfo: { flex: 1 },
  goldenTitle: { color: '#ffd65b', fontSize: 16, fontWeight: '800' },
  goldenSub: { color: '#c2c6d8', fontSize: 12, marginTop: 2 },

  progresoSection: { marginBottom: 16 },
  progresoHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 8 },
  progresoNum: { color: '#ffd65b', fontSize: 40, fontWeight: '800', letterSpacing: -1 },
  progresoTotal: { color: '#8c90a1', fontSize: 16, fontWeight: '500' },
  progressBar: { height: 8, backgroundColor: '#1f2a3d', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#b2c5ff', borderRadius: 4 },
  progresoSub: { color: '#8c90a1', fontSize: 12, marginBottom: 8 },
  infoBox: { backgroundColor: '#101c2e', borderRadius: 10, padding: 10, borderWidth: 0.5, borderColor: '#1f2a3d' },
  infoText: { color: '#b2c5ff', fontSize: 11, fontWeight: '600' },

  filtrosRow: { marginBottom: 16 },
  filtroBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#101c2e', marginRight: 8, borderWidth: 0.5, borderColor: '#1f2a3d' },
  filtroBtnActive: { backgroundColor: '#b2c5ff' },
  filtroBtnText: { color: '#8c90a1', fontSize: 12, fontWeight: '600' },
  filtroBtnTextActive: { color: '#002b73', fontWeight: '800' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stickerCard: { width: '30%', aspectRatio: 3 / 4, borderRadius: 12, borderWidth: 1.5, overflow: 'hidden', position: 'relative', backgroundColor: '#101c2e' },
  stickerCardLocked: { opacity: 0.4 },
  stickerImage: { width: '100%', height: '100%' },
  rarezaBadge: { position: 'absolute', bottom: 4, left: 4, right: 4, paddingVertical: 2, borderRadius: 6, alignItems: 'center' },
  rarezaBadgeText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
  cantidadBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: '#ffd65b', borderRadius: 10, paddingHorizontal: 5, paddingVertical: 2 },
  cantidadText: { color: '#002b73', fontSize: 9, fontWeight: '800' },
  stickerLocked: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a1628' },
  stickerLockedText: { color: '#424655', fontSize: 32, fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: '#142032', borderRadius: 24, overflow: 'hidden', borderWidth: 2, width: '80%' },
  modalImage: { width: '100%', aspectRatio: 3 / 4 },
  modalInfo: { padding: 16, alignItems: 'center' },
  modalRareza: { fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 4 },
  modalNombre: { color: '#d7e3fc', fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  modalCantidad: { color: '#ffd65b', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  modalTap: { color: '#424655', fontSize: 10, marginTop: 8 },

  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(7,19,37,0.95)', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12, paddingBottom: 24, borderTopWidth: 0.5, borderTopColor: '#1f2a3d', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  navItem: { alignItems: 'center', gap: 2 },
  navIcon: { fontSize: 22, opacity: 0.5 },
  navLabel: { color: '#d7e3fc', fontSize: 9, fontWeight: '500', opacity: 0.5 },
  navCenter: { alignItems: 'center', marginTop: -20 },
  navCenterBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#b2c5ff', alignItems: 'center', justifyContent: 'center', marginBottom: 4, borderWidth: 3, borderColor: '#071325' },
  navCenterIcon: { fontSize: 26 },
  navCenterLabel: { color: '#b2c5ff', fontSize: 9, fontWeight: '700' },
});