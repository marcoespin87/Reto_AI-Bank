import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BottomNav from "../../components/BottomNav";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";

export default function GrupoScreen() {
  const { colors } = useTheme();
  const [userId, setUserId] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState("");
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

  const [nombreGrupo, setNombreGrupo] = useState("");
  const [codigoInput, setCodigoInput] = useState("");
  const [userMailes, setUserMailes] = useState(0);
  const [gruposMatch, setGruposMatch] = useState<any[]>([]);
  const [modalResultadoMatch, setModalResultadoMatch] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: userData } = await supabase
      .from("users")
      .select("id, nombre, email, mailes_acumulados")
      .eq("email", user.email)
      .single();

    if (!userData) return;
    setUserId(userData.id);
    setUserEmail(userData.email);
    setUserMailes(userData.mailes_acumulados || 0);

    const { data: memberData } = await supabase
      .from("group_members")
      .select("group_id, estado")
      .eq("user_id", userData.id)
      .eq("estado", "activo")
      .single();

    if (!memberData) return;

    const { data: grupoData } = await supabase
      .from("groups")
      .select("*")
      .eq("id", memberData.group_id)
      .single();

    if (grupoData) {
      setGrupo(grupoData);

      const { data: miembrosData } = await supabase
        .from("group_members")
        .select("*, users(nombre, email, mailes_acumulados)")
        .eq("group_id", grupoData.id)
        .eq("estado", "activo");

      if (miembrosData) setMiembros(miembrosData);

      const { data: pendientesData } = await supabase
        .from("group_members")
        .select("*, users(nombre, email)")
        .eq("group_id", grupoData.id)
        .eq("estado", "pendiente");

      if (pendientesData) setPendientes(pendientesData);

      const { data: objData } = await supabase
        .from("liga_objectives")
        .select("*")
        .eq("liga_id", grupoData.liga_id);

      if (objData) setObjetivos(objData);

      const { data: progData } = await supabase
        .from("group_objective_progress")
        .select("*")
        .eq("group_id", grupoData.id);

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
      Alert.alert("Error", "Ingresa un nombre para el grupo");
      return;
    }
    if (!userId) return;
    setLoading(true);

    const codigo = generarCodigo();

    const { data: nuevoGrupo, error } = await supabase
      .from("groups")
      .insert({
        nombre: nombreGrupo,
        nombre_grupo: nombreGrupo,
        temporada_id: 3,
        creador_id: userId,
        liga_id: 8,
        tipo_formacion: "libre",
        max_miembros: 5,
        codigo_invitacion: codigo,
      })
      .select()
      .single();

    if (error) {
      setLoading(false);
      Alert.alert("Error", error.message);
      return;
    }

    await supabase.from("group_members").insert({
      group_id: nuevoGrupo.id,
      user_id: userId,
      estado: "activo",
      fecha_ingreso: new Date().toISOString().split("T")[0],
      mailes_aportados: 0,
      medalla_actual: 1,
      estrellas_actuales: 0,
    });

    setLoading(false);
    setModalCrear(false);
    setNombreGrupo("");
    loadData();
    Alert.alert(
      "¡Grupo creado!",
      `Código de invitación: ${codigo}\nCompártelo con tus amigos.`,
    );
  }

  async function unirseConCodigo() {
    if (!codigoInput.trim()) {
      Alert.alert("Error", "Ingresa el código de invitación");
      return;
    }
    if (!userId) return;
    setLoading(true);

    const { data: grupoEncontrado, error } = await supabase
      .from("groups")
      .select("*")
      .eq("codigo_invitacion", codigoInput.toUpperCase())
      .single();

    if (error || !grupoEncontrado) {
      setLoading(false);
      Alert.alert("Error", "Código inválido o grupo no encontrado");
      return;
    }

    if (miembros.length >= grupoEncontrado.max_miembros) {
      setLoading(false);
      Alert.alert("Error", "El grupo está lleno");
      return;
    }

    const { data: yaEsMiembro } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", grupoEncontrado.id)
      .eq("user_id", userId)
      .single();

    if (yaEsMiembro) {
      setLoading(false);
      Alert.alert("Aviso", "Ya eres miembro de este grupo");
      return;
    }

    await supabase.from("group_members").insert({
      group_id: grupoEncontrado.id,
      user_id: userId,
      estado: "pendiente",
      mailes_aportados: 0,
      medalla_actual: 1,
      estrellas_actuales: 0,
    });

    setLoading(false);
    setModalUnirse(false);
    setCodigoInput("");
    Alert.alert(
      "¡Solicitud enviada!",
      "Los miembros del grupo deben aprobar tu ingreso.",
    );
  }

  async function matchmaking() {
    if (!userId) return;
    setLoading(true);
    setModalMatchmaking(false);

    const RANGO_MAILES = 500;

    const { data: userData } = await supabase
      .from("users")
      .select("mailes_acumulados, liga_id:economic_tier_id")
      .eq("id", userId)
      .single();

    if (!userData) {
      setLoading(false);
      Alert.alert("Error", "No se pudo obtener tu perfil");
      return;
    }

    const misMailes = userData.mailes_acumulados || 0;
    const minMailes = misMailes - RANGO_MAILES;
    const maxMailes = misMailes + RANGO_MAILES;

    const { data: gruposDisponibles } = await supabase
      .from("groups")
      .select(
        `
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
    `,
      )
      .eq("liga_id", 8)
      .neq("creador_id", userId);

    if (!gruposDisponibles || gruposDisponibles.length === 0) {
      setLoading(false);
      Alert.alert(
        "Sin grupos disponibles",
        "No encontramos grupos con tu rango de mAiles (±500). Intenta crear uno nuevo.",
      );
      return;
    }

    const gruposFiltrados = gruposDisponibles.filter((g: any) => {
      const miembrosActivos =
        g.group_members?.filter((m: any) => m.estado === "activo") || [];
      if (miembrosActivos.length >= g.max_miembros) return false;

      const yaSoyMiembro = miembrosActivos.some(
        (m: any) => m.user_id === userId,
      );
      if (yaSoyMiembro) return false;

      const promedioMailes =
        miembrosActivos.reduce((sum: number, m: any) => {
          return sum + (m.users?.mailes_acumulados || 0);
        }, 0) / (miembrosActivos.length || 1);

      return promedioMailes >= minMailes && promedioMailes <= maxMailes;
    });

    if (gruposFiltrados.length === 0) {
      setLoading(false);
      Alert.alert(
        "Sin coincidencias",
        `No hay grupos con promedio de mAiles entre ${minMailes.toLocaleString()} y ${maxMailes.toLocaleString()}.\n\nTus mAiles actuales: ${misMailes.toLocaleString()}`,
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
      .from("group_members")
      .select("id")
      .eq("group_id", grupoId)
      .eq("user_id", userId)
      .single();

    if (yaExiste) {
      setLoading(false);
      Alert.alert("Aviso", "Ya tienes una solicitud pendiente en este grupo");
      return;
    }

    const { error } = await supabase.from("group_members").insert({
      group_id: grupoId,
      user_id: userId,
      estado: "pendiente",
      mailes_aportados: 0,
      medalla_actual: 1,
      estrellas_actuales: 0,
    });

    if (error) {
      setLoading(false);
      Alert.alert("Error", error.message);
      return;
    }

    setLoading(false);
    loadData();
    Alert.alert(
      "¡Solicitud enviada! 🎯",
      `Tu solicitud para unirte a "${grupoNombre}" fue enviada.\n\nTodos los miembros deben aprobarla para que puedas ingresar.`,
    );
  }

  async function aprobarMiembro(candidatoId: number) {
    if (!grupo || !userId) return;

    const { data: votosExistentes } = await supabase
      .from("group_join_votes")
      .select("id")
      .eq("group_id", grupo.id)
      .eq("candidato_id", candidatoId)
      .eq("votante_id", userId)
      .single();

    if (votosExistentes) {
      Alert.alert("Aviso", "Ya votaste por este candidato");
      return;
    }

    await supabase.from("group_join_votes").insert({
      group_id: grupo.id,
      candidato_id: candidatoId,
      votante_id: userId,
      voto: "aprobado",
      fecha: new Date().toISOString().split("T")[0],
    });

    const { count: votosAprobados } = await supabase
      .from("group_join_votes")
      .select("*", { count: "exact", head: true })
      .eq("group_id", grupo.id)
      .eq("candidato_id", candidatoId)
      .eq("voto", "aprobado");

    const totalMiembros = miembros.length;

    if ((votosAprobados || 0) >= totalMiembros) {
      await supabase
        .from("group_members")
        .update({
          estado: "activo",
          fecha_ingreso: new Date().toISOString().split("T")[0],
        })
        .eq("group_id", grupo.id)
        .eq("user_id", candidatoId);

      Alert.alert(
        "¡Aprobado! 🎉",
        "Todos los miembros aprobaron. El nuevo integrante ya es parte del grupo.",
      );
    } else {
      Alert.alert(
        "Voto registrado ✓",
        `${votosAprobados} de ${totalMiembros} votos necesarios.\nFaltan ${totalMiembros - (votosAprobados || 0)} votos más.`,
      );
    }
    loadData();
  }

  async function rechazarMiembro(candidatoId: number) {
    if (!grupo) return;
    await supabase
      .from("group_members")
      .delete()
      .eq("group_id", grupo.id)
      .eq("user_id", candidatoId);
    loadData();
    Alert.alert("Rechazado", "La solicitud fue rechazada.");
  }

  async function renombrarGrupo() {
    if (!nombreGrupo.trim() || !grupo) return;
    setLoading(true);

    await supabase
      .from("groups")
      .update({ nombre: nombreGrupo, nombre_grupo: nombreGrupo })
      .eq("id", grupo.id);

    setLoading(false);
    setModalRenombrar(false);
    setNombreGrupo("");
    loadData();
    Alert.alert("¡Listo!", "Nombre del grupo actualizado.");
  }

  async function compartirCodigo() {
    if (!grupo) return;
    await Share.share({
      message: `¡Únete a mi grupo ${grupo.nombre} en AI-Bank mAiles!\nCódigo de invitación: ${grupo.codigo_invitacion}`,
    });
  }

  function getProgreso(objectiveId: number) {
    const p = progresos.find((p) => p.objective_id === objectiveId);
    return p?.progreso_actual || 0;
  }

  const milesTotal = miembros.reduce(
    (sum, m) => sum + (m.users?.mailes_acumulados || 0),
    0,
  );
  const miembrosSorted = [...miembros].sort(
    (a, b) =>
      (b.users?.mailes_acumulados || 0) - (a.users?.mailes_acumulados || 0),
  );

  const s = getStyles(colors);

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
            colors={["#b2c5ff"]}
          />
        }
      >
        {/* PANTALLA SIN GRUPO - CONTENIDO DINÁMICO */}
        {!grupo ? (
          <View style={s.noGroupContainer}>
            <Text style={s.noGroupIcon}>👥</Text>
            <Text style={s.noGroupTitle}>Sin grupo activo</Text>
            <Text style={s.noGroupSub}>
              Crea un grupo o únete con un código
            </Text>

            <TouchableOpacity
              style={s.btnPrimary}
              onPress={() => setModalCrear(true)}
            >
              <Text style={s.btnPrimaryText}>➕ Crear grupo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.btnSecondary}
              onPress={() => setModalUnirse(true)}
            >
              <Text style={s.btnSecondaryText}>🔑 Unirse con código</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.btnSecondary}
              onPress={() => setModalMatchmaking(true)}
            >
              <Text style={s.btnSecondaryText}>
                🎯 Buscar grupo por matchmaking
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* PANTALLA CON GRUPO - Header */}
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
                <TouchableOpacity
                  onPress={() => setModalRenombrar(true)}
                  style={s.iconBtn}
                >
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
                <Text style={s.statValue}>
                  {miembros.length}/{grupo.max_miembros}
                </Text>
                <Text style={s.statLabel}>Miembros</Text>
              </View>
              <View style={s.statCard}>
                <Text style={s.statValue}>{objetivos.length}</Text>
                <Text style={s.statLabel}>Objetivos</Text>
              </View>
            </View>

            {/* Solicitudes pendientes - Renderizado condicional SEGURO */}
            {pendientes.length > 0 ? (
              <View style={s.sectionCard}>
                <Text style={s.sectionTitle}>⏳ Solicitudes pendientes</Text>
                {pendientes.map((p) => (
                  <View key={`pending-${p.user_id}`} style={s.pendienteItem}>
                    <View style={s.pendienteInfo}>
                      <View style={s.miniAvatar}>
                        <Text style={s.miniAvatarText}>
                          {p.users?.nombre?.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View>
                        <Text style={s.memberName}>{p.users?.nombre}</Text>
                        <Text style={s.memberSub}>{p.users?.email}</Text>
                      </View>
                    </View>
                    <View style={s.voteRow}>
                      <TouchableOpacity
                        style={s.btnAprobar}
                        onPress={() => aprobarMiembro(p.user_id)}
                      >
                        <Text style={s.btnAprobarText}>✓ Aprobar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={s.btnRechazar}
                        onPress={() => rechazarMiembro(p.user_id)}
                      >
                        <Text style={s.btnRechazarText}>✗ Rechazar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Miembros */}
            <View style={s.sectionCard}>
              <Text style={s.sectionTitle}>👥 Miembros del equipo</Text>
              {miembrosSorted.map((m, i) => (
                <View
                  key={m.id}
                  style={[s.memberItem, m.user_id === userId && s.memberItemMe]}
                >
                  <View style={s.memberLeft}>
                    <Text style={s.rankNumber}>{i + 1}</Text>
                    <View
                      style={[
                        s.miniAvatar,
                        m.user_id === userId && {
                          borderColor: "#b2c5ff",
                          borderWidth: 2,
                        },
                      ]}
                    >
                      <Text style={s.miniAvatarText}>
                        {m.users?.nombre?.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text
                        style={[
                          s.memberName,
                          m.user_id === userId && { color: "#b2c5ff" },
                        ]}
                      >
                        {m.users?.nombre}
                        {m.user_id === userId ? " (Tú)" : ""}
                      </Text>
                      <Text style={s.memberSub}>
                        Medalla {m.medalla_actual} • ⭐{m.estrellas_actuales}
                      </Text>
                    </View>
                  </View>
                  <Text style={s.memberMailes}>
                    {(m.users?.mailes_acumulados || 0).toLocaleString()} mA
                  </Text>
                </View>
              ))}

              {miembros.length < grupo.max_miembros ? (
                <TouchableOpacity
                  style={s.inviteSlot}
                  onPress={compartirCodigo}
                >
                  <View style={s.inviteIcon}>
                    <Text style={{ fontSize: 20 }}>➕</Text>
                  </View>
                  <Text style={s.inviteText}>Invitar a un amigo</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Objetivos */}
            <View style={s.sectionCard}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>🎯 Objetivos de liga</Text>
                <Text style={s.sectionSub}>ESTA SEMANA</Text>
              </View>
              {objetivos.map((obj) => {
                const progreso = getProgreso(obj.id);
                const pct = Math.min(
                  (progreso / obj.valor_objetivo) * 100,
                  100,
                );
                return (
                  <View key={obj.id} style={s.objetivoItem}>
                    <View style={s.objetivoHeader}>
                      <Text style={s.objetivoNombre}>{obj.nombre}</Text>
                      <View style={s.mailesReward}>
                        <Text style={s.mailesRewardText}>
                          +{obj.recompensa_mailes} mA
                        </Text>
                      </View>
                    </View>
                    <Text style={s.objetivoDesc}>{obj.descripcion}</Text>
                    <View style={s.progressRow}>
                      <Text style={s.progressText}>
                        {progreso}/{obj.valor_objetivo}
                      </Text>
                      <Text style={s.progressPct}>{Math.round(pct)}%</Text>
                    </View>
                    <View style={s.progressBar}>
                      <View
                        style={[
                          s.progressFill,
                          { width: `${pct}%` },
                          obj.es_objetivo_maximo && {
                            backgroundColor: "#ffd65b",
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modales - SIEMPRE EN ÁRBOL (nunca se eliminan) */}
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
              {loading ? (
                <ActivityIndicator color="#002b73" />
              ) : (
                <Text style={s.btnPrimaryText}>Crear grupo ✦</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={s.btnCancel}
              onPress={() => setModalCrear(false)}
            >
              <Text style={s.btnCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
              {loading ? (
                <ActivityIndicator color="#002b73" />
              ) : (
                <Text style={s.btnPrimaryText}>Unirse ✦</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={s.btnCancel}
              onPress={() => setModalUnirse(false)}
            >
              <Text style={s.btnCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
              {loading ? (
                <ActivityIndicator color="#002b73" />
              ) : (
                <Text style={s.btnPrimaryText}>Guardar ✦</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={s.btnCancel}
              onPress={() => setModalRenombrar(false)}
            >
              <Text style={s.btnCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalMatchmaking} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>🎯 Matchmaking</Text>
            <Text style={s.matchmakingDesc}>
              Buscaremos un grupo con perfiles de gasto similares al tuyo en
              Liga Plata.
            </Text>
            <TouchableOpacity
              style={[s.btnPrimary, loading && { opacity: 0.7 }]}
              onPress={matchmaking}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#002b73" />
              ) : (
                <Text style={s.btnPrimaryText}>🎯 Buscar match</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={s.btnCancel}
              onPress={() => setModalMatchmaking(false)}
            >
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
              Encontramos {gruposMatch.length} grupo
              {gruposMatch.length > 1 ? "s" : ""} con mAiles similares a los
              tuyos (±500).
            </Text>
            <ScrollView
              style={{ maxHeight: 300 }}
              showsVerticalScrollIndicator={false}
            >
              {gruposMatch.map((g: any) => {
                const miembrosActivos =
                  g.group_members?.filter((m: any) => m.estado === "activo") ||
                  [];
                const promedioMailes = Math.round(
                  miembrosActivos.reduce(
                    (sum: number, m: any) =>
                      sum + (m.users?.mailes_acumulados || 0),
                    0,
                  ) / (miembrosActivos.length || 1),
                );
                return (
                  <View key={g.id} style={s.grupoMatchItem}>
                    <View style={s.grupoMatchInfo}>
                      <Text style={s.grupoMatchNombre}>{g.nombre}</Text>
                      <Text style={s.grupoMatchSub}>
                        👥 {miembrosActivos.length}/{g.max_miembros} miembros
                        {"  "}⭐ {promedioMailes.toLocaleString()} mAiles
                        promedio
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
            <TouchableOpacity
              style={s.btnCancel}
              onPress={() => setModalResultadoMatch(false)}
            >
              <Text style={s.btnCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* BottomNav - SIEMPRE EN ÁRBOL */}
      <BottomNav active="grupo" />
    </SafeAreaView>
  );
}

function getStyles(
  colors: ReturnType<
    typeof import("../../context/ThemeContext").useTheme
  >["colors"],
) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    scroll: { paddingHorizontal: 20 },

    noGroupContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
      gap: 12,
      paddingBottom: 80,
    },
    noGroupIcon: { fontSize: 64, marginBottom: 8 },
    noGroupTitle: {
      color: colors.textPrimary,
      fontSize: 22,
      fontWeight: "800",
      textAlign: "center",
    },
    noGroupSub: {
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: "center",
      marginBottom: 16,
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingVertical: 16,
    },
    groupName: {
      color: colors.textPrimary,
      fontSize: 26,
      fontWeight: "800",
      letterSpacing: -0.5,
    },
    groupBadgeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 4,
    },
    groupBadge: {
      backgroundColor: colors.primaryDim,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      borderWidth: 0.5,
      borderColor: colors.primary,
    },
    groupBadgeText: {
      color: colors.primary,
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 1,
    },
    groupRank: { color: colors.primary, fontSize: 11, fontWeight: "700" },
    headerBtns: { flexDirection: "row", gap: 8 },
    iconBtn: {
      backgroundColor: colors.cardBackground,
      padding: 8,
      borderRadius: 12,
      borderWidth: 0.5,
      borderColor: colors.borderStrong,
    },

    codigoCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.primaryBorder,
      borderStyle: "dashed",
    },
    codigoLabel: {
      color: colors.textSecondary,
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 2,
      marginBottom: 4,
    },
    codigoCodigo: {
      color: colors.primary,
      fontSize: 28,
      fontWeight: "900",
      letterSpacing: 6,
    },
    codigoShare: { color: colors.textMuted, fontSize: 10, marginTop: 4 },

    statsRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
    statCard: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 14,
      padding: 14,
      alignItems: "center",
      borderWidth: 0.5,
      borderColor: colors.borderMedium,
    },
    statValue: { color: colors.textPrimary, fontSize: 18, fontWeight: "800" },
    statLabel: {
      color: colors.textSecondary,
      fontSize: 9,
      fontWeight: "600",
      textAlign: "center",
      marginTop: 2,
    },

    sectionCard: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      borderWidth: 0.5,
      borderColor: colors.borderMedium,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    sectionTitle: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 12,
    },
    sectionSub: {
      color: colors.textSecondary,
      fontSize: 9,
      fontWeight: "600",
      letterSpacing: 1,
    },

    pendienteItem: { marginBottom: 12, gap: 10 },
    pendienteInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
    voteRow: { flexDirection: "row", gap: 8 },
    btnAprobar: {
      flex: 1,
      backgroundColor: colors.primaryDim,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 8,
      alignItems: "center",
    },
    btnAprobarText: { color: colors.primary, fontSize: 12, fontWeight: "700" },
    btnRechazar: {
      flex: 1,
      backgroundColor: colors.errorDim,
      borderWidth: 1,
      borderColor: colors.error,
      borderRadius: 10,
      paddingVertical: 8,
      alignItems: "center",
    },
    btnRechazarText: { color: colors.error, fontSize: 12, fontWeight: "700" },

    memberItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.borderMedium,
    },
    memberItemMe: {
      backgroundColor: colors.primaryDim,
      borderRadius: 12,
      paddingHorizontal: 8,
    },
    memberLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    rankNumber: {
      color: colors.textSecondary,
      fontSize: 16,
      fontWeight: "800",
      fontStyle: "italic",
      width: 20,
    },
    miniAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.cardBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    miniAvatarText: { color: colors.primary, fontSize: 14, fontWeight: "700" },
    memberName: { color: colors.textPrimary, fontSize: 13, fontWeight: "700" },
    memberSub: { color: colors.textSecondary, fontSize: 10, marginTop: 1 },
    memberMailes: { color: colors.gold, fontSize: 13, fontWeight: "700" },

    inviteSlot: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 12,
      marginTop: 4,
    },
    inviteIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1.5,
      borderColor: colors.borderStrong,
      borderStyle: "dashed",
      alignItems: "center",
      justifyContent: "center",
    },
    inviteText: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },

    objetivoItem: { marginBottom: 16 },
    objetivoHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    objetivoNombre: {
      color: colors.textPrimary,
      fontSize: 13,
      fontWeight: "700",
      flex: 1,
    },
    objetivoDesc: {
      color: colors.textSecondary,
      fontSize: 11,
      marginBottom: 8,
    },
    mailesReward: {
      backgroundColor: colors.goldDim,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
    },
    mailesRewardText: { color: colors.gold, fontSize: 11, fontWeight: "700" },
    progressRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    progressText: { color: colors.textSecondary, fontSize: 10 },
    progressPct: { color: colors.textSecondary, fontSize: 10 },
    progressBar: {
      height: 6,
      backgroundColor: colors.borderMedium,
      borderRadius: 3,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 3,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: "flex-end",
    },
    modalCard: {
      backgroundColor: colors.cardBackgroundAlt,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      padding: 28,
      borderTopWidth: 0.5,
      borderColor: colors.borderStrong,
    },
    modalTitle: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: "800",
      marginBottom: 20,
    },
    inputLabel: {
      color: colors.primary,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 2,
      marginBottom: 6,
      marginLeft: 4,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: colors.textPrimary,
      fontSize: 15,
      marginBottom: 16,
      borderWidth: 0.5,
      borderColor: colors.borderStrong,
    },
    matchmakingDesc: {
      color: colors.textSecondary,
      fontSize: 13,
      marginBottom: 20,
      lineHeight: 20,
    },

    btnPrimary: {
      backgroundColor: colors.gold,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: "center",
      marginBottom: 10,
    },
    btnPrimaryText: {
      color: colors.textOnGold,
      fontWeight: "800",
      fontSize: 16,
    },
    btnSecondary: {
      backgroundColor: colors.cardBackground,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
      marginBottom: 10,
      width: "100%",
      borderWidth: 0.5,
      borderColor: colors.borderStrong,
    },
    btnSecondaryText: {
      color: colors.textPrimary,
      fontWeight: "700",
      fontSize: 15,
    },
    btnCancel: { alignItems: "center", paddingVertical: 10 },
    btnCancelText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: "600",
    },

    grupoMatchItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.borderMedium,
    },
    grupoMatchInfo: { flex: 1, marginRight: 12 },
    grupoMatchNombre: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: "700",
    },
    grupoMatchSub: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
    btnUnirse: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    btnUnirseText: { color: "#002b73", fontWeight: "800", fontSize: 12 },
  });
}
