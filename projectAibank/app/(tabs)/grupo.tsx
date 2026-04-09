import { useEffect, useState } from "react";
import { Alert, Share } from "react-native";
import GrupoView from "../../components/GrupoView";
import { supabase } from "../../lib/supabase";

export default function GrupoScreen() {
  const [userId, setUserId] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [grupo, setGrupo] = useState<any>(null);
  const [miembros, setMiembros] = useState<any[]>([]);
  const [objetivos, setObjetivos] = useState<any[]>([]);
  const [progresos, setProgresos] = useState<any[]>([]);
  const [pendientes, setPendientes] = useState<any[]>([]);
  const [grupoPendiente, setGrupoPendiente] = useState<any | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [modalCrear, setModalCrear] = useState(false);
  const [modalUnirse, setModalUnirse] = useState(false);
  const [modalRenombrar, setModalRenombrar] = useState(false);
  const [modalMatchmaking, setModalMatchmaking] = useState(false);
  const [modalResultadoMatch, setModalResultadoMatch] = useState(false);
  const [modalPendientes, setModalPendientes] = useState(false);

  const [nombreGrupo, setNombreGrupo] = useState("");
  const [codigoInput, setCodigoInput] = useState("");
  const [userMailes, setUserMailes] = useState(0);
  const [gruposMatch, setGruposMatch] = useState<any[]>([]);
  const [ligaNombre, setLigaNombre] = useState("");
  const [posicionEnLiga, setPosicionEnLiga] = useState<number | null>(null);

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

    // Buscar si hay un grupo donde el usuario está activo
    const { data: memberData } = await supabase
      .from("group_members")
      .select(
        "group_id, estado, medalla_actual, estrellas_actuales, mailes_aportados",
      )
      .eq("user_id", userData.id)
      .eq("estado", "activo")
      .maybeSingle();

    // Buscar si hay una solicitud pendiente en algún grupo
    if (!memberData) {
      const { data: pendienteMemberData } = await supabase
        .from("group_members")
        .select("*, groups(id, nombre, codigo_invitacion)")
        .eq("user_id", userData.id)
        .eq("estado", "pendiente")
        .maybeSingle();

      if (pendienteMemberData && pendienteMemberData.groups) {
        setGrupoPendiente(pendienteMemberData.groups);
      }
      return;
    }

    const { data: grupoData } = await supabase
      .from("groups")
      .select("*")
      .eq("id", memberData.group_id)
      .single();

    if (grupoData) {
      setGrupo(grupoData);

      if (grupoData.liga_id) {
        const { data: ligaData } = await supabase
          .from("ligas")
          .select("nombre")
          .eq("id", grupoData.liga_id)
          .maybeSingle();
        if (ligaData) setLigaNombre((ligaData as any).nombre ?? "");
      }

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

      // Calcular posición en liga
      const { data: todosGrupos } = await supabase
        .from('groups')
        .select(`id, group_members!inner(estado, users(mailes_acumulados))`)
        .eq('liga_id', grupoData.liga_id);

      if (todosGrupos) {
        const ranking = todosGrupos
          .map((g: any) => {
            const activos = g.group_members?.filter((m: any) => m.estado === 'activo') || [];
            const total = activos.reduce((sum: number, m: any) =>
              sum + (m.users?.mailes_acumulados || 0), 0);
            return { id: g.id, total };
          })
          .sort((a: any, b: any) => b.total - a.total);
        const pos = ranking.findIndex((g: any) => g.id === grupoData.id) + 1;
        setPosicionEnLiga(pos);
      }
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

    try {
      setLoading(true);

      const { error } = await supabase
        .from("group_members")
        .update({
          estado: "activo",
          fecha_ingreso: new Date().toISOString().split("T")[0],
        })
        .eq("group_id", grupo.id)
        .eq("user_id", candidatoId)
        .eq("estado", "pendiente");

      if (error) {
        Alert.alert("Error al aprobar", error.message);
        setLoading(false);
        return;
      }

      setLoading(false);
      loadData();
      Alert.alert("¡Aprobado! 🎉", "El miembro ya es parte del grupo.");
    } catch (err) {
      console.error("Error en aprobarMiembro:", err);
      Alert.alert("Error inesperado", String(err));
      setLoading(false);
    }
  }

  async function rechazarMiembro(candidatoId: number) {
    if (!grupo) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", grupo.id)
        .eq("user_id", candidatoId)
        .eq("estado", "pendiente");

      if (error) {
        Alert.alert("Error al rechazar", error.message);
        setLoading(false);
        return;
      }

      setLoading(false);
      loadData();
      Alert.alert("Rechazado ❌", "La solicitud fue rechazada.");
    } catch (err) {
      console.error("Error en rechazarMiembro:", err);
      Alert.alert("Error inesperado", String(err));
      setLoading(false);
    }
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

  async function onCancelarSolicitud() {
    if (!userId || !grupoPendiente) return;
    setLoading(true);

    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("user_id", userId)
      .eq("group_id", grupoPendiente.id);

    setLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    setGrupoPendiente(null);
    Alert.alert("¡Listo!", "Solicitud cancelada.");
    await loadData();
  }

  return (
    <GrupoView
      userId={userId}
      grupo={grupo}
      miembros={miembros}
      objetivos={objetivos}
      progresos={progresos}
      pendientes={pendientes}
      refreshing={refreshing}
      loading={loading}
      modalCrear={modalCrear}
      modalUnirse={modalUnirse}
      modalRenombrar={modalRenombrar}
      modalMatchmaking={modalMatchmaking}
      modalResultadoMatch={modalResultadoMatch}
      modalPendientes={modalPendientes}
      nombreGrupo={nombreGrupo}
      codigoInput={codigoInput}
      gruposMatch={gruposMatch}
      onRefresh={onRefresh}
      setModalCrear={setModalCrear}
      setModalUnirse={setModalUnirse}
      setModalRenombrar={setModalRenombrar}
      setModalMatchmaking={setModalMatchmaking}
      setModalResultadoMatch={setModalResultadoMatch}
      setModalPendientes={setModalPendientes}
      setNombreGrupo={setNombreGrupo}
      setCodigoInput={setCodigoInput}
      onCompartirCodigo={compartirCodigo}
      onCrearGrupo={crearGrupo}
      onUnirseConCodigo={unirseConCodigo}
      onMatchmaking={matchmaking}
      onUnirseAGrupoMatch={unirseAGrupoMatch}
      onAprobarMiembro={aprobarMiembro}
      onRechazarMiembro={rechazarMiembro}
      onRenombrarGrupo={renombrarGrupo}
      ligaNombre={ligaNombre}
      grupoPendiente={grupoPendiente}
      onCancelarSolicitud={onCancelarSolicitud}
      posicionEnLiga={posicionEnLiga}
    />
  );
}
