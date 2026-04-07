import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, Modal,
  TextInput, ActivityIndicator, RefreshControl, Share
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';

export default function GrupoScreen() {
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
      .from('users')
      .select('id, nombre, email, mailes_acumulados')
      .eq('email', user.email)
      .single();

    if (!userData) return;
    setUserId(userData.id);
    setUserEmail(userData.email);
    setUserMailes(userData.mailes_acumulados || 0);

    const { data: memberData } = await supabase
      .from('group_members')
      .select('group_id, estado')
      .eq('user_id', userData.id)
      .eq('estado', 'activo')
      .single();

    if (!memberData) return;

    const { data: grupoData } = await supabase
      .from('groups')
      .select('*')
      .eq('id', memberData.group_id)
      .single();

    if (grupoData) {
      setGrupo(grupoData);

      const { data: miembrosData } = await supabase
        .from('group_members')
        .select('*, users(nombre, email, mailes_acumulados)')
        .eq('group_id', grupoData.id)
        .eq('estado', 'activo');

      if (miembrosData) setMiembros(miembrosData);

      const { data: pendientesData } = await supabase
        .from('group_members')
        .select('*, users(nombre, email)')
        .eq('group_id', grupoData.id)
        .eq('estado', 'pendiente');

      if (pendientesData) setPendientes(pendientesData);

      const { data: objData } = await supabase
        .from('liga_objectives')
        .select('*')
        .eq('liga_id', grupoData.liga_id);

      if (objData) setObjetivos(objData);

      const { data: progData } = await supabase
        .from('group_objective_progress')
        .select('*')
        .eq('group_id', grupoData.id);

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
    if (!nombreGrupo.trim()) {
      Alert.alert('Error', 'Ingresa un nombre para el grupo');
      return;
    }
    if (!userId) return;
    setLoading(true);

    const codigo = generarCodigo();

    const { data: nuevoGrupo, error } = await supabase
      .from('groups')
      .insert({
        nombre: nombreGrupo,
        nombre_grupo: nombreGrupo,
        temporada_id: 3,
        creador_id: userId,
        liga_id: 8,
        tipo_formacion: 'libre',
        max_miembros: 5,
        codigo_invitacion: codigo,
      })
      .select()
      .single();

    if (error) {
      setLoading(false);
      Alert.alert('Error', error.message);
      return;
    }

    await supabase
      .from('group_members')
      .insert({
        group_id: nuevoGrupo.id,
        user_id: userId,
        estado: 'activo',
        fecha_ingreso: new Date().toISOString().split('T')[0],
        mailes_aportados: 0,
        medalla_actual: 1,
        estrellas_actuales: 0,
      });

    setLoading(false);
    setModalCrear(false);
    setNombreGrupo('');
    loadData();
    Alert.alert('¡Grupo creado!', `Código de invitación: ${codigo}\nCompártelo con tus amigos.`);
  }

  async function unirseConCodigo() {
    if (!codigoInput.trim()) {
      Alert.alert('Error', 'Ingresa el código de invitación');
      return;
    }
    if (!userId) return;
    setLoading(true);

    const { data: grupoEncontrado, error } = await supabase
      .from('groups')
      .select('*')
      .eq('codigo_invitacion', codigoInput.toUpperCase())
      .single();

    if (error || !grupoEncontrado) {
      setLoading(false);
      Alert.alert('Error', 'Código inválido o grupo no encontrado');
      return;
    }

    if (miembros.length >= grupoEncontrado.max_miembros) {
      setLoading(false);
      Alert.alert('Error', 'El grupo está lleno');
      return;
    }

    const { data: yaEsMiembro } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', grupoEncontrado.id)
      .eq('user_id', userId)
      .single();

    if (yaEsMiembro) {
      setLoading(false);
      Alert.alert('Aviso', 'Ya eres miembro de este grupo');
      return;
    }

    await supabase
      .from('group_members')
      .insert({
        group_id: grupoEncontrado.id,
        user_id: userId,
        estado: 'pendiente',
        mailes_aportados: 0,
        medalla_actual: 1,
        estrellas_actuales: 0,
      });

    setLoading(false);
    setModalUnirse(false);
    setCodigoInput('');
    Alert.alert('¡Solicitud enviada!', 'Los miembros del grupo deben aprobar tu ingreso.');
  }

async function matchmaking() {
  if (!userId) return;
  setLoading(true);
  setModalMatchmaking(false);

  const RANGO_MAILES = 500;

  const { data: userData } = await supabase
    .from('users')
    .select('mailes_acumulados, liga_id:economic_tier_id')
    .eq('id', userId)
    .single();

  if (!userData) {
    setLoading(false);
    Alert.alert('Error', 'No se pudo obtener tu perfil');
    return;
  }

  const misMailes = userData.mailes_acumulados || 0;
  const minMailes = misMailes - RANGO_MAILES;
  const maxMailes = misMailes + RANGO_MAILES;

  const { data: gruposDisponibles } = await supabase
    .from('groups')
    .select(`
      id,
      nombre,
      codigo_invitacion,
      max_miembros,
      liga_id,
      group_members!inner(
        user_id,
        estado,
        users(mailes_acumulados)
      )
    `)
    .eq('liga_id', 8)
    .neq('creador_id', userId);

  if (!gruposDisponibles || gruposDisponibles.length === 0) {
    setLoading(false);
    Alert.alert(
      'Sin grupos disponibles',
      'No encontramos grupos con tu rango de mAiles (±500). Intenta crear uno nuevo.'
    );
    return;
  }

  const gruposFiltrados = gruposDisponibles.filter((g: any) => {
    const miembrosActivos = g.group_members?.filter((m: any) => m.estado === 'activo') || [];
    if (miembrosActivos.length >= g.max_miembros) return false;

    const yaSoyMiembro = miembrosActivos.some((m: any) => m.user_id === userId);
    if (yaSoyMiembro) return false;

    const promedioMailes = miembrosActivos.reduce((sum: number, m: any) => {
      return sum + (m.users?.mailes_acumulados || 0);
    }, 0) / (miembrosActivos.length || 1);

    return promedioMailes >= minMailes && promedioMailes <= maxMailes;
  });

  if (gruposFiltrados.length === 0) {
    setLoading(false);
    Alert.alert(
      'Sin coincidencias',
      `No hay grupos con promedio de mAiles entre ${minMailes.toLocaleString()} y ${maxMailes.toLocaleString()}.\n\nTus mAiles actuales: ${misMailes.toLocaleString()}`
    );
    return;
  }

  setGruposMatch(gruposFiltrados);
  setLoading(false);
  setModalResultadoMatch(true);
}

async function unirseAGrupoMatch(grupoId: number, grupoNombre: string) {
  if (!userId) return;
  setLoading(true);
  setModalResultadoMatch(false);

  const { data: yaExiste } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', grupoId)
    .eq('user_id', userId)
    .single();

  if (yaExiste) {
    setLoading(false);
    Alert.alert('Aviso', 'Ya tienes una solicitud pendiente en este grupo');
    return;
  }

  const { error } = await supabase
    .from('group_members')
    .insert({
      group_id: grupoId,
      user_id: userId,
      estado: 'pendiente',
      mailes_aportados: 0,
      medalla_actual: 1,
      estrellas_actuales: 0,
    });

  if (error) {
    setLoading(false);
    Alert.alert('Error', error.message);
    return;
  }

  setLoading(false);
  loadData();
  Alert.alert(
    '¡Solicitud enviada! 🎯',
    `Tu solicitud para unirte a "${grupoNombre}" fue enviada.\n\nTodos los miembros deben aprobarla para que puedas ingresar.`
  );
}

async function aprobarMiembro(candidatoId: number) {
  if (!grupo || !userId) return;

  const { data: votosExistentes } = await supabase
    .from('group_join_votes')
    .select('id')
    .eq('group_id', grupo.id)
    .eq('candidato_id', candidatoId)
    .eq('votante_id', userId)
    .single();

  if (votosExistentes) {
    Alert.alert('Aviso', 'Ya votaste por este candidato');
    return;
  }

  await supabase
    .from('group_join_votes')
    .insert({
      group_id: grupo.id,
      candidato_id: candidatoId,
      votante_id: userId,
      voto: 'aprobado',
      fecha: new Date().toISOString().split('T')[0],
    });

  const { count: votosAprobados } = await supabase
    .from('group_join_votes')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', grupo.id)
    .eq('candidato_id', candidatoId)
    .eq('voto', 'aprobado');

  const totalMiembros = miembros.length;

  if ((votosAprobados || 0) >= totalMiembros) {
    await supabase
      .from('group_members')
      .update({
        estado: 'activo',
        fecha_ingreso: new Date().toISOString().split('T')[0],
      })
      .eq('group_id', grupo.id)
      .eq('user_id', candidatoId);

    Alert.alert('¡Aprobado! 🎉', 'Todos los miembros aprobaron. El nuevo integrante ya es parte del grupo.');
  } else {
    Alert.alert(
      'Voto registrado ✓',
      `${votosAprobados} de ${totalMiembros} votos necesarios.\nFaltan ${totalMiembros - (votosAprobados || 0)} votos más.`
    );
  }
  loadData();
}

  async function rechazarMiembro(candidatoId: number) {
    if (!grupo) return;
    await supabase
      .from('group_members')
      .delete()
      .eq('group_id', grupo.id)
      .eq('user_id', candidatoId);
    loadData();
    Alert.alert('Rechazado', 'La solicitud fue rechazada.');
  }

  async function renombrarGrupo() {
    if (!nombreGrupo.trim() || !grupo) return;
    setLoading(true);

    await supabase
      .from('groups')
      .update({ nombre: nombreGrupo, nombre_grupo: nombreGrupo })
      .eq('id', grupo.id);

    setLoading(false);
    setModalRenombrar(false);
    setNombreGrupo('');
    loadData();
    Alert.alert('¡Listo!', 'Nombre del grupo actualizado.');
  }

  async function compartirCodigo() {
    if (!grupo) return;
    await Share.share({
      message: `¡Únete a mi grupo ${grupo.nombre} en AI-Bank mAiles!\nCódigo de invitación: ${grupo.codigo_invitacion}`,
    });
  }

  function getProgreso(objectiveId: number) {
    const p = progresos.find(p => p.objective_id === objectiveId);
    return p?.progreso_actual || 0;
  }

  const milesTotal = miembros.reduce((sum, m) => sum + (m.users?.mailes_acumulados || 0), 0);
  const miembrosSorted = [...miembros].sort((a, b) => (b.users?.mailes_acumulados || 0) - (a.users?.mailes_acumulados || 0));

  if (!grupo) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.noGroupContainer}>
          <Text style={s.noGroupIcon}>👥</Text>
          <Text style={s.noGroupTitle}>Sin grupo activo</Text>
          <Text style={s.noGroupSub}>Crea un grupo o únete con un código</Text>

          <TouchableOpacity style={s.btnPrimary} onPress={() => setModalCrear(true)}>
            <Text style={s.btnPrimaryText}>➕ Crear grupo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.btnSecondary} onPress={() => setModalUnirse(true)}>
            <Text style={s.btnSecondaryText}>🔑 Unirse con código</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.btnSecondary} onPress={() => setModalMatchmaking(true)}>
            <Text style={s.btnSecondaryText}>🎯 Buscar grupo por matchmaking</Text>
          </TouchableOpacity>
        </View>

        {/* Modal Crear */}
        <Modal visible={modalCrear} transparent animationType="slide">
          <View style={s.modalOverlay}>
            <View style={s.modalCard}>
              <Text style={s.modalTitle}>➕ Crear grupo</Text>
              <Text style={s.inputLabel}>NOMBRE DEL GRUPO</Text>
              <TextInput
                style={s.input}
                placeholder="Ej: Los Cracks FC"
                placeholderTextColor="#424655"
                value={nombreGrupo}
                onChangeText={setNombreGrupo}
              />
              <TouchableOpacity
                style={[s.btnPrimary, loading && { opacity: 0.7 }]}
                onPress={crearGrupo}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#002b73" /> : <Text style={s.btnPrimaryText}>Crear grupo ✦</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={s.btnCancel} onPress={() => setModalCrear(false)}>
                <Text style={s.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal Unirse */}
        <Modal visible={modalUnirse} transparent animationType="slide">
          <View style={s.modalOverlay}>
            <View style={s.modalCard}>
              <Text style={s.modalTitle}>🔑 Unirse con código</Text>
              <Text style={s.inputLabel}>CÓDIGO DE INVITACIÓN</Text>
              <TextInput
                style={s.input}
                placeholder="Ej: ABC123"
                placeholderTextColor="#424655"
                value={codigoInput}
                onChangeText={setCodigoInput}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={[s.btnPrimary, loading && { opacity: 0.7 }]}
                onPress={unirseConCodigo}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#002b73" /> : <Text style={s.btnPrimaryText}>Unirse ✦</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={s.btnCancel} onPress={() => setModalUnirse(false)}>
                <Text style={s.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal Matchmaking */}
        <Modal visible={modalMatchmaking} transparent animationType="slide">
          <View style={s.modalOverlay}>
            <View style={s.modalCard}>
              <Text style={s.modalTitle}>🎯 Matchmaking</Text>
              <Text style={s.matchmakingDesc}>
                Buscaremos un grupo con perfiles de gasto similares al tuyo en Liga Plata.
              </Text>
              <TouchableOpacity
                style={[s.btnPrimary, loading && { opacity: 0.7 }]}
                onPress={matchmaking}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#002b73" /> : <Text style={s.btnPrimaryText}>🎯 Buscar match</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={s.btnCancel} onPress={() => setModalMatchmaking(false)}>
                <Text style={s.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={modalResultadoMatch} transparent animationType="slide">
          <View style={s.modalOverlay}>
            <View style={s.modalCard}>
              <Text style={s.modalTitle}>🎯 Grupos compatibles</Text>
              <Text style={s.matchmakingDesc}>
                Encontramos {gruposMatch.length} grupo{gruposMatch.length > 1 ? 's' : ''} con mAiles similares a los tuyos (±500).
              </Text>
              <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                {gruposMatch.map((g: any) => {
                  const miembrosActivos = g.group_members?.filter((m: any) => m.estado === 'activo') || [];
                  const promedioMailes = Math.round(
                    miembrosActivos.reduce((sum: number, m: any) =>
                      sum + (m.users?.mailes_acumulados || 0), 0
                    ) / (miembrosActivos.length || 1)
                  );
                  return (
                    <View key={g.id} style={s.grupoMatchItem}>
                      <View style={s.grupoMatchInfo}>
                        <Text style={s.grupoMatchNombre}>{g.nombre}</Text>
                        <Text style={s.grupoMatchSub}>
                          👥 {miembrosActivos.length}/{g.max_miembros} miembros
                          {'  '}⭐ {promedioMailes.toLocaleString()} mAiles promedio
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={s.btnUnirse}
                        onPress={() => unirseAGrupoMatch(g.id, g.nombre)}
                        disabled={loading}
                      >
                        <Text style={s.btnUnirseText}>Unirse</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
              <TouchableOpacity style={s.btnCancel} onPress={() => setModalResultadoMatch(false)}>
                <Text style={s.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
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
          <TouchableOpacity style={s.navItem}>
            <Text style={s.navIconActive}>👥</Text>
            <Text style={s.navLabelActive}>Grupo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.navItem} onPress={() => router.replace('/(tabs)/perfil')}>
            <Text style={s.navIcon}>👤</Text>
            <Text style={s.navLabel}>Perfil</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#b2c5ff" colors={['#b2c5ff']} />}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.groupName}>{grupo.nombre}</Text>
            <View style={s.groupBadgeRow}>
              <View style={s.groupBadge}>
                <Text style={s.groupBadgeText}>LIGA PLATA</Text>
              </View>
              <Text style={s.groupRank}>#2 en liga</Text>
            </View>
          </View>
          <View style={s.headerBtns}>
            <TouchableOpacity onPress={onRefresh} style={s.iconBtn}>
              <Text>🔄</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalRenombrar(true)} style={s.iconBtn}>
              <Text>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={compartirCodigo} style={s.iconBtn}>
              <Text>🔗</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Codigo invitacion */}
        <TouchableOpacity style={s.codigoCard} onPress={compartirCodigo}>
          <Text style={s.codigoLabel}>CÓDIGO DE INVITACIÓN</Text>
          <Text style={s.codigoCodigo}>{grupo.codigo_invitacion}</Text>
          <Text style={s.codigoShare}>Toca para compartir 🔗</Text>
        </TouchableOpacity>

        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statValue}>{milesTotal.toLocaleString()}</Text>
            <Text style={s.statLabel}>mAiles totales</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statValue}>{miembros.length}/{grupo.max_miembros}</Text>
            <Text style={s.statLabel}>Miembros</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statValue}>{objetivos.length}</Text>
            <Text style={s.statLabel}>Objetivos</Text>
          </View>
        </View>

        {/* Solicitudes pendientes */}
        {pendientes.length > 0 && (
          <View style={s.sectionCard}>
            <Text style={s.sectionTitle}>⏳ Solicitudes pendientes</Text>
            {pendientes.map((p) => (
              <View key={p.id} style={s.pendienteItem}>
                <View style={s.pendienteInfo}>
                  <View style={s.miniAvatar}>
                    <Text style={s.miniAvatarText}>{p.users?.nombre?.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View>
                    <Text style={s.memberName}>{p.users?.nombre}</Text>
                    <Text style={s.memberSub}>{p.users?.email}</Text>
                  </View>
                </View>
                <View style={s.voteRow}>
                  <TouchableOpacity style={s.btnAprobar} onPress={() => aprobarMiembro(p.user_id)}>
                    <Text style={s.btnAprobarText}>✓ Aprobar</Text>
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
        <View style={s.sectionCard}>
          <Text style={s.sectionTitle}>👥 Miembros del equipo</Text>
          {miembrosSorted.map((m, i) => (
            <View key={m.id} style={[s.memberItem, m.user_id === userId && s.memberItemMe]}>
              <View style={s.memberLeft}>
                <Text style={s.rankNumber}>{i + 1}</Text>
                <View style={[s.miniAvatar, m.user_id === userId && { borderColor: '#b2c5ff', borderWidth: 2 }]}>
                  <Text style={s.miniAvatarText}>{m.users?.nombre?.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={[s.memberName, m.user_id === userId && { color: '#b2c5ff' }]}>
                    {m.users?.nombre}{m.user_id === userId ? ' (Tú)' : ''}
                  </Text>
                  <Text style={s.memberSub}>Medalla {m.medalla_actual} • ⭐{m.estrellas_actuales}</Text>
                </View>
              </View>
              <Text style={s.memberMailes}>{(m.users?.mailes_acumulados || 0).toLocaleString()} mA</Text>
            </View>
          ))}

          {miembros.length < grupo.max_miembros && (
            <TouchableOpacity style={s.inviteSlot} onPress={compartirCodigo}>
              <View style={s.inviteIcon}>
                <Text style={{ fontSize: 20 }}>➕</Text>
              </View>
              <Text style={s.inviteText}>Invitar a un amigo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Objetivos */}
        <View style={s.sectionCard}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>🎯 Objetivos de liga</Text>
            <Text style={s.sectionSub}>ESTA SEMANA</Text>
          </View>
          {objetivos.map((obj) => {
            const progreso = getProgreso(obj.id);
            const pct = Math.min((progreso / obj.valor_objetivo) * 100, 100);
            return (
              <View key={obj.id} style={s.objetivoItem}>
                <View style={s.objetivoHeader}>
                  <Text style={s.objetivoNombre}>{obj.nombre}</Text>
                  <View style={s.mailesReward}>
                    <Text style={s.mailesRewardText}>+{obj.recompensa_mailes} mA</Text>
                  </View>
                </View>
                <Text style={s.objetivoDesc}>{obj.descripcion}</Text>
                <View style={s.progressRow}>
                  <Text style={s.progressText}>{progreso}/{obj.valor_objetivo}</Text>
                  <Text style={s.progressPct}>{Math.round(pct)}%</Text>
                </View>
                <View style={s.progressBar}>
                  <View style={[s.progressFill, { width: `${pct}%` }, obj.es_objetivo_maximo && { backgroundColor: '#ffd65b' }]} />
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modales */}
      <Modal visible={modalRenombrar} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>✏️ Renombrar grupo</Text>
            <Text style={s.inputLabel}>NUEVO NOMBRE</Text>
            <TextInput
              style={s.input}
              placeholder="Nombre del grupo"
              placeholderTextColor="#424655"
              value={nombreGrupo}
              onChangeText={setNombreGrupo}
            />
            <TouchableOpacity
              style={[s.btnPrimary, loading && { opacity: 0.7 }]}
              onPress={renombrarGrupo}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#002b73" /> : <Text style={s.btnPrimaryText}>Guardar ✦</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={s.btnCancel} onPress={() => setModalRenombrar(false)}>
              <Text style={s.btnCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
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
        <TouchableOpacity style={s.navItem}>
          <Text style={s.navIconActive}>👥</Text>
          <Text style={s.navLabelActive}>Grupo</Text>
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

  noGroupContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, gap: 12, paddingBottom: 80 },
  noGroupIcon: { fontSize: 64, marginBottom: 8 },
  noGroupTitle: { color: '#d7e3fc', fontSize: 22, fontWeight: '800', textAlign: 'center' },
  noGroupSub: { color: '#8c90a1', fontSize: 14, textAlign: 'center', marginBottom: 16 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 16 },
  groupName: { color: '#d7e3fc', fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  groupBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  groupBadge: { backgroundColor: 'rgba(178,197,255,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 0.5, borderColor: '#b2c5ff' },
  groupBadgeText: { color: '#b2c5ff', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  groupRank: { color: '#b2c5ff', fontSize: 11, fontWeight: '700' },
  headerBtns: { flexDirection: 'row', gap: 8 },
  iconBtn: { backgroundColor: '#1f2a3d', padding: 8, borderRadius: 12, borderWidth: 0.5, borderColor: '#424655' },

  codigoCard: { backgroundColor: '#1f2a3d', borderRadius: 16, padding: 16, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(178,197,255,0.2)', borderStyle: 'dashed' },
  codigoLabel: { color: '#8c90a1', fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  codigoCodigo: { color: '#b2c5ff', fontSize: 28, fontWeight: '900', letterSpacing: 6 },
  codigoShare: { color: '#424655', fontSize: 10, marginTop: 4 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: '#101c2e', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 0.5, borderColor: '#1f2a3d' },
  statValue: { color: '#d7e3fc', fontSize: 18, fontWeight: '800' },
  statLabel: { color: '#8c90a1', fontSize: 9, fontWeight: '600', textAlign: 'center', marginTop: 2 },

  sectionCard: { backgroundColor: '#101c2e', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 0.5, borderColor: '#1f2a3d' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: '#d7e3fc', fontSize: 15, fontWeight: '700', marginBottom: 12 },
  sectionSub: { color: '#8c90a1', fontSize: 9, fontWeight: '600', letterSpacing: 1 },

  pendienteItem: { marginBottom: 12, gap: 10 },
  pendienteInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  voteRow: { flexDirection: 'row', gap: 8 },
  btnAprobar: { flex: 1, backgroundColor: 'rgba(178,197,255,0.1)', borderWidth: 1, borderColor: '#b2c5ff', borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  btnAprobarText: { color: '#b2c5ff', fontSize: 12, fontWeight: '700' },
  btnRechazar: { flex: 1, backgroundColor: 'rgba(255,180,171,0.1)', borderWidth: 1, borderColor: '#ffb4ab', borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  btnRechazarText: { color: '#ffb4ab', fontSize: 12, fontWeight: '700' },

  memberItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#1f2a3d' },
  memberItemMe: { backgroundColor: 'rgba(178,197,255,0.05)', borderRadius: 12, paddingHorizontal: 8 },
  memberLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rankNumber: { color: '#8c90a1', fontSize: 16, fontWeight: '800', fontStyle: 'italic', width: 20 },
  miniAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1f2a3d', alignItems: 'center', justifyContent: 'center' },
  miniAvatarText: { color: '#b2c5ff', fontSize: 14, fontWeight: '700' },
  memberName: { color: '#d7e3fc', fontSize: 13, fontWeight: '700' },
  memberSub: { color: '#8c90a1', fontSize: 10, marginTop: 1 },
  memberMailes: { color: '#ffd65b', fontSize: 13, fontWeight: '700' },

  inviteSlot: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, marginTop: 4 },
  inviteIcon: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: '#424655', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  inviteText: { color: '#424655', fontSize: 13, fontWeight: '600' },

  objetivoItem: { marginBottom: 16 },
  objetivoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  objetivoNombre: { color: '#d7e3fc', fontSize: 13, fontWeight: '700', flex: 1 },
  objetivoDesc: { color: '#8c90a1', fontSize: 11, marginBottom: 8 },
  mailesReward: { backgroundColor: 'rgba(255,214,91,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  mailesRewardText: { color: '#ffd65b', fontSize: 11, fontWeight: '700' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  progressText: { color: '#8c90a1', fontSize: 10 },
  progressPct: { color: '#8c90a1', fontSize: 10 },
  progressBar: { height: 6, backgroundColor: '#1f2a3d', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#b2c5ff', borderRadius: 3 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#142032', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, borderTopWidth: 0.5, borderColor: '#424655' },
  modalTitle: { color: '#d7e3fc', fontSize: 20, fontWeight: '800', marginBottom: 20 },
  inputLabel: { color: '#b2c5ff', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 6, marginLeft: 4 },
  input: { backgroundColor: '#030e20', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: '#d7e3fc', fontSize: 15, marginBottom: 16, borderWidth: 0.5, borderColor: '#424655' },
  matchmakingDesc: { color: '#8c90a1', fontSize: 13, marginBottom: 20, lineHeight: 20 },

  btnPrimary: { backgroundColor: '#b2c5ff', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 10 },
  btnPrimaryText: { color: '#002b73', fontWeight: '800', fontSize: 16 },
  btnSecondary: { backgroundColor: '#1f2a3d', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 10, width: '100%', borderWidth: 0.5, borderColor: '#424655' },
  btnSecondaryText: { color: '#d7e3fc', fontWeight: '700', fontSize: 15 },
  btnCancel: { alignItems: 'center', paddingVertical: 10 },
  btnCancelText: { color: '#8c90a1', fontSize: 14, fontWeight: '600' },

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
  grupoMatchItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#1f2a3d' },
grupoMatchInfo: { flex: 1, marginRight: 12 },
grupoMatchNombre: { color: '#d7e3fc', fontSize: 14, fontWeight: '700' },
grupoMatchSub: { color: '#8c90a1', fontSize: 11, marginTop: 2 },
btnUnirse: { backgroundColor: '#b2c5ff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
btnUnirseText: { color: '#002b73', fontWeight: '800', fontSize: 12 },
});