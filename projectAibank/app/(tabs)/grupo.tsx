import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, Modal,
  TextInput, ActivityIndicator, RefreshControl, Share
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

export default function GrupoScreen() {
  const { colors } = useTheme();
  const [userId, setUserId] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [grupo, setGrupo] = useState<any>(null);
  const [miembros, setMiembros] = useState<any[]>([]);
  const [objetivos, setObjetivos] = useState<any[]>([]);
  const [progresos, setProgresos] = useState<any[]>([]);
  const [pendientes, setPendientes] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalUnirse, setModalUnirse] = useState(false);
  const [modalRenombrar, setModalRenombrar] = useState(false);
  const [modalMatchmaking, setModalMatchmaking] = useState(false);
  const [nombreGrupo, setNombreGrupo] = useState('');
  const [codigoInput, setCodigoInput] = useState('');
  const [userMailes, setUserMailes] = useState(0);
  const [gruposMatch, setGruposMatch] = useState<any[]>([]);
  const [modalResultadoMatch, setModalResultadoMatch] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: userData } = await supabase
      .from('users').select('id, nombre, email, mailes_acumulados')
      .eq('email', user.email).single();
    if (!userData) return;
    setUserId(userData.id);
    setUserEmail(userData.email);
    setUserMailes(userData.mailes_acumulados || 0);

    const { data: memberData } = await supabase
      .from('group_members').select('group_id, estado')
      .eq('user_id', userData.id).eq('estado', 'activo').single();
    if (!memberData) return;

    const { data: grupoData } = await supabase
      .from('groups').select('*').eq('id', memberData.group_id).single();
    if (grupoData) {
      setGrupo(grupoData);
      const { data: miembrosData } = await supabase
        .from('group_members').select('*, users(nombre, email, mailes_acumulados)')
        .eq('group_id', grupoData.id).eq('estado', 'activo');
      if (miembrosData) setMiembros(miembrosData);

      const { data: pendientesData } = await supabase
        .from('group_members').select('*, users(nombre, email)')
        .eq('group_id', grupoData.id).eq('estado', 'pendiente');
      if (pendientesData) setPendientes(pendientesData);

      const { data: objData } = await supabase
        .from('liga_objectives').select('*').eq('liga_id', grupoData.liga_id);
      if (objData) setObjetivos(objData);

      const { data: progData } = await supabase
        .from('group_objective_progress').select('*').eq('group_id', grupoData.id);
      if (progData) setProgresos(progData);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  function generarCodigo() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async function crearGrupo() {
    if (!nombreGrupo.trim()) { Alert.alert('Error', 'Ingresa un nombre para el grupo'); return; }
    if (!userId) return;
    setLoading(true);
    const codigo = generarCodigo();
    const { data: nuevoGrupo, error } = await supabase.from('groups').insert({
      nombre: nombreGrupo, nombre_grupo: nombreGrupo,
      temporada_id: 3, creador_id: userId, liga_id: 8,
      tipo_formacion: 'libre', max_miembros: 5, codigo_invitacion: codigo,
    }).select().single();
    if (error) { setLoading(false); Alert.alert('Error', error.message); return; }
    await supabase.from('group_members').insert({
      group_id: nuevoGrupo.id, user_id: userId, estado: 'activo',
      fecha_ingreso: new Date().toISOString().split('T')[0],
      mailes_aportados: 0, medalla_actual: 1, estrellas_actuales: 0,
    });
    setLoading(false); setModalCrear(false); setNombreGrupo('');
    loadData();
    Alert.alert('¡Grupo creado!', `Código de invitación: ${codigo}`);
  }

  async function unirseConCodigo() {
    if (!codigoInput.trim()) { Alert.alert('Error', 'Ingresa el código'); return; }
    if (!userId) return;
    setLoading(true);
    const { data: grupoEncontrado, error } = await supabase
      .from('groups').select('*').eq('codigo_invitacion', codigoInput.toUpperCase()).single();
    if (error || !grupoEncontrado) { setLoading(false); Alert.alert('Error', 'Código inválido'); return; }
    const { data: yaEsMiembro } = await supabase
      .from('group_members').select('id')
      .eq('group_id', grupoEncontrado.id).eq('user_id', userId).single();
    if (yaEsMiembro) { setLoading(false); Alert.alert('Aviso', 'Ya eres miembro'); return; }
    await supabase.from('group_members').insert({
      group_id: grupoEncontrado.id, user_id: userId, estado: 'pendiente',
      mailes_aportados: 0, medalla_actual: 1, estrellas_actuales: 0,
    });
    setLoading(false); setModalUnirse(false); setCodigoInput('');
    Alert.alert('¡Solicitud enviada!', 'Los miembros deben aprobar tu ingreso.');
  }

  async function matchmaking() {
    if (!userId) return;
    setLoading(true); setModalMatchmaking(false);
    const RANGO_MAILES = 500;
    const { data: userData } = await supabase
      .from('users').select('mailes_acumulados').eq('id', userId).single();
    if (!userData) { setLoading(false); Alert.alert('Error', 'No se pudo obtener tu perfil'); return; }
    const misMailes = userData.mailes_acumulados || 0;
    const minMailes = misMailes - RANGO_MAILES;
    const maxMailes = misMailes + RANGO_MAILES;
    const { data: gruposDisponibles } = await supabase
      .from('groups').select(`id, nombre, codigo_invitacion, max_miembros, liga_id,
        group_members!inner(user_id, estado, users(mailes_acumulados))`)
      .eq('liga_id', 8).neq('creador_id', userId);
    if (!gruposDisponibles || gruposDisponibles.length === 0) {
      setLoading(false);
      Alert.alert('Sin grupos disponibles', 'No encontramos grupos con tu rango de mAiles (±500).');
      return;
    }
    const gruposFiltrados = gruposDisponibles.filter((g: any) => {
      const activos = g.group_members?.filter((m: any) => m.estado === 'activo') || [];
      if (activos.length >= g.max_miembros) return false;
      if (activos.some((m: any) => m.user_id === userId)) return false;
      const promedio = activos.reduce((sum: number, m: any) =>
        sum + (m.users?.mailes_acumulados || 0), 0) / (activos.length || 1);
      return promedio >= minMailes && promedio <= maxMailes;
    });
    if (gruposFiltrados.length === 0) {
      setLoading(false);
      Alert.alert('Sin coincidencias', `No hay grupos con promedio entre ${minMailes.toLocaleString()} y ${maxMailes.toLocaleString()} mAiles.`);
      return;
    }
    setGruposMatch(gruposFiltrados); setLoading(false); setModalResultadoMatch(true);
  }

  async function unirseAGrupoMatch(grupoId: number, grupoNombre: string) {
    if (!userId) return;
    setLoading(true); setModalResultadoMatch(false);
    const { data: yaExiste } = await supabase
      .from('group_members').select('id').eq('group_id', grupoId).eq('user_id', userId).single();
    if (yaExiste) { setLoading(false); Alert.alert('Aviso', 'Ya tienes solicitud pendiente'); return; }
    const { error } = await supabase.from('group_members').insert({
      group_id: grupoId, user_id: userId, estado: 'pendiente',
      mailes_aportados: 0, medalla_actual: 1, estrellas_actuales: 0,
    });
    if (error) { setLoading(false); Alert.alert('Error', error.message); return; }
    setLoading(false); loadData();
    Alert.alert('¡Solicitud enviada! 🎯', `Tu solicitud para "${grupoNombre}" fue enviada.\nTodos los miembros deben aprobarla.`);
  }

  async function aprobarMiembro(candidatoId: number) {
    if (!grupo || !userId) return;
    const { data: votosExistentes } = await supabase
      .from('group_join_votes').select('id')
      .eq('group_id', grupo.id).eq('candidato_id', candidatoId).eq('votante_id', userId).single();
    if (votosExistentes) { Alert.alert('Aviso', 'Ya votaste por este candidato'); return; }
    await supabase.from('group_join_votes').insert({
      group_id: grupo.id, candidato_id: candidatoId, votante_id: userId,
      voto: 'aprobado', fecha: new Date().toISOString().split('T')[0],
    });
    const { count: votosAprobados } = await supabase
      .from('group_join_votes').select('*', { count: 'exact', head: true })
      .eq('group_id', grupo.id).eq('candidato_id', candidatoId).eq('voto', 'aprobado');
    const totalMiembros = miembros.length;
    if ((votosAprobados || 0) >= totalMiembros) {
      await supabase.from('group_members').update({
        estado: 'activo', fecha_ingreso: new Date().toISOString().split('T')[0],
      }).eq('group_id', grupo.id).eq('user_id', candidatoId);
      Alert.alert('¡Aprobado! 🎉', 'Todos aprobaron. El nuevo integrante ya es parte del grupo.');
    } else {
      Alert.alert('Voto registrado ✓', `${votosAprobados} de ${totalMiembros} votos.\nFaltan ${totalMiembros - (votosAprobados || 0)} más.`);
    }
    loadData();
  }

  async function rechazarMiembro(candidatoId: number) {
    if (!grupo) return;
    await supabase.from('group_members').delete()
      .eq('group_id', grupo.id).eq('user_id', candidatoId);
    loadData(); Alert.alert('Rechazado', 'La solicitud fue rechazada.');
  }

  async function renombrarGrupo() {
    if (!nombreGrupo.trim() || !grupo) return;
    setLoading(true);
    await supabase.from('groups').update({ nombre: nombreGrupo, nombre_grupo: nombreGrupo }).eq('id', grupo.id);
    setLoading(false); setModalRenombrar(false); setNombreGrupo(''); loadData();
    Alert.alert('¡Listo!', 'Nombre actualizado.');
  }

  async function compartirCodigo() {
    if (!grupo) return;
    await Share.share({ message: `¡Únete a ${grupo.nombre}!\nCódigo: ${grupo.codigo_invitacion}` });
  }

  function getProgreso(objectiveId: number) {
    return progresos.find(p => p.objective_id === objectiveId)?.progreso_actual || 0;
  }

  const milesTotal = miembros.reduce((sum, m) => sum + (m.users?.mailes_acumulados || 0), 0);
  const miembrosSorted = [...miembros].sort((a, b) => (b.users?.mailes_acumulados || 0) - (a.users?.mailes_acumulados || 0));

  const BottomNav = () => (
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
      <TouchableOpacity style={s.navItem}>
        <Text style={s.navIconActive}>👥</Text>
        <Text style={[s.navLabelActive, { color: colors.primary }]}>Grupo</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.navItem} onPress={() => router.replace('/(tabs)/perfil')}>
        <Text style={s.navIcon}>👤</Text>
        <Text style={[s.navLabel, { color: colors.textSecondary }]}>Perfil</Text>
      </TouchableOpacity>
    </View>
  );

  if (!grupo) {
    return (
      <SafeAreaView style={[s.root, { backgroundColor: colors.background }]}>
        <View style={s.noGroupContainer}>
          <Text style={s.noGroupIcon}>👥</Text>
          <Text style={[s.noGroupTitle, { color: colors.textPrimary }]}>Sin grupo activo</Text>
          <Text style={[s.noGroupSub, { color: colors.textSecondary }]}>Crea un grupo o únete con un código</Text>
          <TouchableOpacity style={[s.btnPrimary, { backgroundColor: colors.primary }]} onPress={() => setModalCrear(true)}>
            <Text style={[s.btnPrimaryText, { color: colors.cardText }]}>➕ Crear grupo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btnSecondary, { backgroundColor: colors.surfaceHigh, borderColor: colors.border }]} onPress={() => setModalUnirse(true)}>
            <Text style={[s.btnSecondaryText, { color: colors.textPrimary }]}>🔑 Unirse con código</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btnSecondary, { backgroundColor: colors.surfaceHigh, borderColor: colors.border }]} onPress={() => setModalMatchmaking(true)}>
            <Text style={[s.btnSecondaryText, { color: colors.textPrimary }]}>🎯 Buscar grupo por matchmaking</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={modalCrear} transparent animationType="slide">
          <View style={s.modalOverlay}>
            <View style={[s.modalCard, { backgroundColor: colors.surface }]}>
              <Text style={[s.modalTitle, { color: colors.textPrimary }]}>➕ Crear grupo</Text>
              <Text style={[s.inputLabel, { color: colors.primary }]}>NOMBRE DEL GRUPO</Text>
              <TextInput style={[s.input, { backgroundColor: colors.surfaceHigh, color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="Ej: Los Cracks FC" placeholderTextColor={colors.textMuted}
                value={nombreGrupo} onChangeText={setNombreGrupo} />
              <TouchableOpacity style={[s.btnPrimary, { backgroundColor: colors.primary }, loading && { opacity: 0.7 }]} onPress={crearGrupo} disabled={loading}>
                {loading ? <ActivityIndicator color={colors.cardText} /> : <Text style={[s.btnPrimaryText, { color: colors.cardText }]}>Crear grupo ✦</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={s.btnCancel} onPress={() => setModalCrear(false)}>
                <Text style={[s.btnCancelText, { color: colors.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={modalUnirse} transparent animationType="slide">
          <View style={s.modalOverlay}>
            <View style={[s.modalCard, { backgroundColor: colors.surface }]}>
              <Text style={[s.modalTitle, { color: colors.textPrimary }]}>🔑 Unirse con código</Text>
              <Text style={[s.inputLabel, { color: colors.primary }]}>CÓDIGO DE INVITACIÓN</Text>
              <TextInput style={[s.input, { backgroundColor: colors.surfaceHigh, color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="Ej: ABC123" placeholderTextColor={colors.textMuted}
                value={codigoInput} onChangeText={setCodigoInput} autoCapitalize="characters" />
              <TouchableOpacity style={[s.btnPrimary, { backgroundColor: colors.primary }, loading && { opacity: 0.7 }]} onPress={unirseConCodigo} disabled={loading}>
                {loading ? <ActivityIndicator color={colors.cardText} /> : <Text style={[s.btnPrimaryText, { color: colors.cardText }]}>Unirse ✦</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={s.btnCancel} onPress={() => setModalUnirse(false)}>
                <Text style={[s.btnCancelText, { color: colors.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={modalMatchmaking} transparent animationType="slide">
          <View style={s.modalOverlay}>
            <View style={[s.modalCard, { backgroundColor: colors.surface }]}>
              <Text style={[s.modalTitle, { color: colors.textPrimary }]}>🎯 Matchmaking</Text>
              <Text style={[s.matchmakingDesc, { color: colors.textSecondary }]}>
                Buscaremos un grupo con mAiles similares al tuyo (±500).
              </Text>
              <TouchableOpacity style={[s.btnPrimary, { backgroundColor: colors.primary }, loading && { opacity: 0.7 }]} onPress={matchmaking} disabled={loading}>
                {loading ? <ActivityIndicator color={colors.cardText} /> : <Text style={[s.btnPrimaryText, { color: colors.cardText }]}>🎯 Buscar match</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={s.btnCancel} onPress={() => setModalMatchmaking(false)}>
                <Text style={[s.btnCancelText, { color: colors.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={modalResultadoMatch} transparent animationType="slide">
          <View style={s.modalOverlay}>
            <View style={[s.modalCard, { backgroundColor: colors.surface }]}>
              <Text style={[s.modalTitle, { color: colors.textPrimary }]}>🎯 Grupos compatibles</Text>
              <Text style={[s.matchmakingDesc, { color: colors.textSecondary }]}>
                Encontramos {gruposMatch.length} grupo{gruposMatch.length > 1 ? 's' : ''} con mAiles similares (±500).
              </Text>
              <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                {gruposMatch.map((g: any) => {
                  const activos = g.group_members?.filter((m: any) => m.estado === 'activo') || [];
                  const promedio = Math.round(activos.reduce((sum: number, m: any) =>
                    sum + (m.users?.mailes_acumulados || 0), 0) / (activos.length || 1));
                  return (
                    <View key={g.id} style={[s.grupoMatchItem, { borderBottomColor: colors.border }]}>
                      <View style={s.grupoMatchInfo}>
                        <Text style={[s.grupoMatchNombre, { color: colors.textPrimary }]}>{g.nombre}</Text>
                        <Text style={[s.grupoMatchSub, { color: colors.textSecondary }]}>
                          👥 {activos.length}/{g.max_miembros} miembros  ⭐ {promedio.toLocaleString()} mAiles promedio
                        </Text>
                      </View>
                      <TouchableOpacity style={[s.btnUnirse, { backgroundColor: colors.primary }]}
                        onPress={() => unirseAGrupoMatch(g.id, g.nombre)} disabled={loading}>
                        <Text style={[s.btnUnirseText, { color: colors.cardText }]}>Unirse</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
              <TouchableOpacity style={s.btnCancel} onPress={() => setModalResultadoMatch(false)}>
                <Text style={[s.btnCancelText, { color: colors.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <BottomNav />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={[s.groupName, { color: colors.textPrimary }]}>{grupo.nombre}</Text>
            <View style={s.groupBadgeRow}>
              <View style={[s.groupBadge, { backgroundColor: `${colors.primary}20`, borderColor: colors.primary }]}>
                <Text style={[s.groupBadgeText, { color: colors.primary }]}>LIGA PLATA</Text>
              </View>
              <Text style={[s.groupRank, { color: colors.primary }]}>#2 en liga</Text>
            </View>
          </View>
          <View style={s.headerBtns}>
            {[{ fn: onRefresh, icon: '🔄' }, { fn: () => setModalRenombrar(true), icon: '✏️' }, { fn: compartirCodigo, icon: '🔗' }].map((btn, i) => (
              <TouchableOpacity key={i} onPress={btn.fn} style={[s.iconBtn, { backgroundColor: colors.surfaceHigh, borderColor: colors.border }]}>
                <Text>{btn.icon}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Codigo */}
        <TouchableOpacity style={[s.codigoCard, { backgroundColor: colors.surfaceHigh, borderColor: `${colors.primary}40` }]} onPress={compartirCodigo}>
          <Text style={[s.codigoLabel, { color: colors.textSecondary }]}>CÓDIGO DE INVITACIÓN</Text>
          <Text style={[s.codigoCodigo, { color: colors.primary }]}>{grupo.codigo_invitacion}</Text>
          <Text style={[s.codigoShare, { color: colors.textMuted }]}>Toca para compartir 🔗</Text>
        </TouchableOpacity>

        {/* Stats */}
        <View style={s.statsRow}>
          {[
            { value: milesTotal.toLocaleString(), label: 'mAiles totales' },
            { value: `${miembros.length}/${grupo.max_miembros}`, label: 'Miembros' },
            { value: objetivos.length, label: 'Objetivos' },
          ].map((stat, i) => (
            <View key={i} style={[s.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[s.statValue, { color: colors.textPrimary }]}>{stat.value}</Text>
              <Text style={[s.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Pendientes */}
        {pendientes.length > 0 && (
          <View style={[s.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>⏳ Solicitudes pendientes</Text>
            {pendientes.map((p) => (
              <View key={p.id} style={s.pendienteItem}>
                <View style={s.pendienteInfo}>
                  <View style={[s.miniAvatar, { backgroundColor: colors.surfaceHigh }]}>
                    <Text style={[s.miniAvatarText, { color: colors.primary }]}>{p.users?.nombre?.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View>
                    <Text style={[s.memberName, { color: colors.textPrimary }]}>{p.users?.nombre}</Text>
                    <Text style={[s.memberSub, { color: colors.textSecondary }]}>{p.users?.email}</Text>
                  </View>
                </View>
                <View style={s.voteRow}>
                  <TouchableOpacity style={[s.btnAprobar, { borderColor: colors.primary, backgroundColor: `${colors.primary}20` }]} onPress={() => aprobarMiembro(p.user_id)}>
                    <Text style={[s.btnAprobarText, { color: colors.primary }]}>✓ Aprobar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.btnRechazar} onPress={() => rechazarMiembro(p.user_id)}>
                    <Text style={s.btnRechazarText}>✗ Rechazar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Miembros */}
        <View style={[s.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>👥 Miembros del equipo</Text>
          {miembrosSorted.map((m, i) => (
            <View key={m.id} style={[s.memberItem, { borderBottomColor: colors.border }, m.user_id === userId && { backgroundColor: `${colors.primary}10`, borderRadius: 12, paddingHorizontal: 8 }]}>
              <View style={s.memberLeft}>
                <Text style={[s.rankNumber, { color: colors.textSecondary }]}>{i + 1}</Text>
                <View style={[s.miniAvatar, { backgroundColor: colors.surfaceHigh }, m.user_id === userId && { borderColor: colors.primary, borderWidth: 2 }]}>
                  <Text style={[s.miniAvatarText, { color: colors.primary }]}>{m.users?.nombre?.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={[s.memberName, { color: m.user_id === userId ? colors.primary : colors.textPrimary }]}>
                    {m.users?.nombre}{m.user_id === userId ? ' (Tú)' : ''}
                  </Text>
                  <Text style={[s.memberSub, { color: colors.textSecondary }]}>Medalla {m.medalla_actual} • ⭐{m.estrellas_actuales}</Text>
                </View>
              </View>
              <Text style={s.memberMailes}>{(m.users?.mailes_acumulados || 0).toLocaleString()} mA</Text>
            </View>
          ))}
          {miembros.length < grupo.max_miembros && (
            <TouchableOpacity style={s.inviteSlot} onPress={compartirCodigo}>
              <View style={[s.inviteIcon, { borderColor: colors.border }]}>
                <Text style={{ fontSize: 20 }}>➕</Text>
              </View>
              <Text style={[s.inviteText, { color: colors.textMuted }]}>Invitar a un amigo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Objetivos */}
        <View style={[s.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={s.sectionHeader}>
            <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>🎯 Objetivos de liga</Text>
            <Text style={[s.sectionSub, { color: colors.textSecondary }]}>ESTA SEMANA</Text>
          </View>
          {objetivos.map((obj) => {
            const progreso = getProgreso(obj.id);
            const pct = Math.min((progreso / obj.valor_objetivo) * 100, 100);
            return (
              <View key={obj.id} style={s.objetivoItem}>
                <View style={s.objetivoHeader}>
                  <Text style={[s.objetivoNombre, { color: colors.textPrimary }]}>{obj.nombre}</Text>
                  <View style={s.mailesReward}>
                    <Text style={s.mailesRewardText}>+{obj.recompensa_mailes} mA</Text>
                  </View>
                </View>
                <Text style={[s.objetivoDesc, { color: colors.textSecondary }]}>{obj.descripcion}</Text>
                <View style={s.progressRow}>
                  <Text style={[s.progressText, { color: colors.textSecondary }]}>{progreso}/{obj.valor_objetivo}</Text>
                  <Text style={[s.progressPct, { color: colors.textSecondary }]}>{Math.round(pct)}%</Text>
                </View>
                <View style={[s.progressBar, { backgroundColor: colors.surfaceHigh }]}>
                  <View style={[s.progressFill, { width: `${pct}%`, backgroundColor: obj.es_objetivo_maximo ? '#ffd65b' : colors.primary }]} />
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={modalRenombrar} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[s.modalTitle, { color: colors.textPrimary }]}>✏️ Renombrar grupo</Text>
            <Text style={[s.inputLabel, { color: colors.primary }]}>NUEVO NOMBRE</Text>
            <TextInput style={[s.input, { backgroundColor: colors.surfaceHigh, color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Nombre del grupo" placeholderTextColor={colors.textMuted}
              value={nombreGrupo} onChangeText={setNombreGrupo} />
            <TouchableOpacity style={[s.btnPrimary, { backgroundColor: colors.primary }, loading && { opacity: 0.7 }]} onPress={renombrarGrupo} disabled={loading}>
              {loading ? <ActivityIndicator color={colors.cardText} /> : <Text style={[s.btnPrimaryText, { color: colors.cardText }]}>Guardar ✦</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={s.btnCancel} onPress={() => setModalRenombrar(false)}>
              <Text style={[s.btnCancelText, { color: colors.textSecondary }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomNav />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  noGroupContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, gap: 12, paddingBottom: 80 },
  noGroupIcon: { fontSize: 64, marginBottom: 8 },
  noGroupTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  noGroupSub: { fontSize: 14, textAlign: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 16 },
  groupName: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  groupBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  groupBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 0.5 },
  groupBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  groupRank: { fontSize: 11, fontWeight: '700' },
  headerBtns: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 8, borderRadius: 12, borderWidth: 0.5 },
  codigoCard: { borderRadius: 16, padding: 16, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed' },
  codigoLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  codigoCodigo: { fontSize: 28, fontWeight: '900', letterSpacing: 6 },
  codigoShare: { fontSize: 10, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 0.5 },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 9, fontWeight: '600', textAlign: 'center', marginTop: 2 },
  sectionCard: { borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 0.5 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  sectionSub: { fontSize: 9, fontWeight: '600', letterSpacing: 1 },
  pendienteItem: { marginBottom: 12, gap: 10 },
  pendienteInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  voteRow: { flexDirection: 'row', gap: 8 },
  btnAprobar: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  btnAprobarText: { fontSize: 12, fontWeight: '700' },
  btnRechazar: { flex: 1, backgroundColor: 'rgba(255,180,171,0.1)', borderWidth: 1, borderColor: '#ffb4ab', borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  btnRechazarText: { color: '#ffb4ab', fontSize: 12, fontWeight: '700' },
  memberItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5 },
  memberLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rankNumber: { fontSize: 16, fontWeight: '800', fontStyle: 'italic', width: 20 },
  miniAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  miniAvatarText: { fontSize: 14, fontWeight: '700' },
  memberName: { fontSize: 13, fontWeight: '700' },
  memberSub: { fontSize: 10, marginTop: 1 },
  memberMailes: { color: '#ffd65b', fontSize: 13, fontWeight: '700' },
  inviteSlot: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, marginTop: 4 },
  inviteIcon: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  inviteText: { fontSize: 13, fontWeight: '600' },
  objetivoItem: { marginBottom: 16 },
  objetivoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  objetivoNombre: { fontSize: 13, fontWeight: '700', flex: 1 },
  objetivoDesc: { fontSize: 11, marginBottom: 8 },
  mailesReward: { backgroundColor: 'rgba(255,214,91,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  mailesRewardText: { color: '#ffd65b', fontSize: 11, fontWeight: '700' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  progressText: { fontSize: 10 },
  progressPct: { fontSize: 10 },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, borderTopWidth: 0.5 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20 },
  inputLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 6, marginLeft: 4 },
  input: { borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, marginBottom: 16, borderWidth: 0.5 },
  matchmakingDesc: { fontSize: 13, marginBottom: 20, lineHeight: 20 },
  btnPrimary: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 10 },
  btnPrimaryText: { fontWeight: '800', fontSize: 16 },
  btnSecondary: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 10, width: '100%', borderWidth: 0.5 },
  btnSecondaryText: { fontWeight: '700', fontSize: 15 },
  btnCancel: { alignItems: 'center', paddingVertical: 10 },
  btnCancelText: { fontSize: 14, fontWeight: '600' },
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
  grupoMatchItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 0.5 },
  grupoMatchInfo: { flex: 1, marginRight: 12 },
  grupoMatchNombre: { fontSize: 14, fontWeight: '700' },
  grupoMatchSub: { fontSize: 11, marginTop: 2 },
  btnUnirse: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  btnUnirseText: { fontWeight: '800', fontSize: 12 },
});