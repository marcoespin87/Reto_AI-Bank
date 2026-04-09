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
  const [grupoPendiente, setGrupoPendiente] = useState<any>(null);

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
      .maybeSingle();

    if (!memberData) {
      // Sin grupo activo — verificar si hay solicitud pendiente
      const { data: pendingMember } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", userData.id)
        .eq("estado", "pendiente")
        .maybeSingle();

      if (pendingMember) {
        const { data: pendingGrupo } = await supabase
          .from("groups")
          .select("id, nombre")
          .eq("id", pendingMember.group_id)
          .maybeSingle();
        setGrupoPendiente(pendingGrupo || null);
      } else {
        setGrupoPendiente(null);
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

  function cosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    if (normA === 0 || normB === 0) return 0;
    return dot / (normA * normB);
  }

  async function matchmaking() {
    console.log("[matchmaking] userId:", userId);
    if (!userId) {
      Alert.alert("Sin sesión", "userId es null — recarga la pantalla");
      return;
    }
    setLoading(true);
    setModalMatchmaking(false);

    // Normalización suave: penaliza diferencia de mAiles pero no excluye grupos
    const MAILES_NORMALIZACION = 5000;

    console.log("[matchmaking] fetching user spending profile...");
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(
        `mailes_acumulados,
        pct_gasto_tecnologia, pct_gasto_viajes, pct_gasto_restaurantes,
        pct_gasto_entretenimiento, pct_gasto_supermercado, pct_gasto_salud,
        pct_gasto_educacion, pct_gasto_hogar, pct_gasto_otros`,
      )
      .eq("id", userId)
      .single();

    console.log("[matchmaking] userData:", userData, "error:", userError);

    if (userError || !userData) {
      setLoading(false);
      Alert.alert("Error al cargar perfil", userError?.message || "Sin datos");
      return;
    }

    const ud = userData as any;
    const misMailes = ud.mailes_acumulados || 0;

    const userVector = [
      ud.pct_gasto_tecnologia || 0,
      ud.pct_gasto_viajes || 0,
      ud.pct_gasto_restaurantes || 0,
      ud.pct_gasto_entretenimiento || 0,
      ud.pct_gasto_supermercado || 0,
      ud.pct_gasto_salud || 0,
      ud.pct_gasto_educacion || 0,
      ud.pct_gasto_hogar || 0,
      ud.pct_gasto_otros || 0,
    ];

    console.log("[matchmaking] fetching groups...");
    const { data: gruposDisponibles, error: gruposError } = await supabase
      .from("groups")
      .select(
        `id, nombre, codigo_invitacion, max_miembros, liga_id,
        group_members!inner(
          user_id, estado,
          users(
            mailes_acumulados,
            pct_gasto_tecnologia, pct_gasto_viajes, pct_gasto_restaurantes,
            pct_gasto_entretenimiento, pct_gasto_supermercado, pct_gasto_salud,
            pct_gasto_educacion, pct_gasto_hogar, pct_gasto_otros
          )
        )`,
      )
      .eq("liga_id", 8)
      .neq("creador_id", userId);

    console.log("[matchmaking] gruposDisponibles:", gruposDisponibles?.length, "error:", gruposError);

    if (gruposError) {
      setLoading(false);
      Alert.alert("Error al buscar grupos", gruposError.message);
      return;
    }

    if (!gruposDisponibles || gruposDisponibles.length === 0) {
      setLoading(false);
      Alert.alert(
        "Sin grupos disponibles",
        "No encontramos grupos disponibles. Intenta crear uno nuevo.",
      );
      return;
    }

    const gruposScorados: any[] = [];

    for (const g of gruposDisponibles) {
      const miembrosActivos =
        g.group_members?.filter((m: any) => m.estado === "activo") || [];

      console.log(`[matchmaking] grupo "${g.nombre}": miembrosActivos=${miembrosActivos.length}, max=${g.max_miembros}`);

      if (miembrosActivos.length >= g.max_miembros) {
        console.log(`[matchmaking] SKIP: grupo lleno`);
        continue;
      }

      const yaEsMiembro = miembrosActivos.some((m: any) => m.user_id === userId);
      console.log(`[matchmaking] yaEsMiembro=${yaEsMiembro}`);
      if (yaEsMiembro) {
        console.log(`[matchmaking] SKIP: ya soy miembro`);
        continue;
      }

      const promedioMailes =
        miembrosActivos.reduce(
          (sum: number, m: any) => sum + (m.users?.mailes_acumulados || 0),
          0,
        ) / (miembrosActivos.length || 1);

      console.log(`[matchmaking] promedioMailes=${promedioMailes}`);

      // Score de proximidad de mAiles (0–1): 1 = match exacto, decrece con la diferencia
      const mailesScore = Math.max(
        0,
        1 - Math.abs(misMailes - promedioMailes) / MAILES_NORMALIZACION,
      );

      // Vector promedio de gastos del grupo
      const groupVector = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      for (const m of miembrosActivos) {
        const u = (m.users as any) || {};
        groupVector[0] += u.pct_gasto_tecnologia || 0;
        groupVector[1] += u.pct_gasto_viajes || 0;
        groupVector[2] += u.pct_gasto_restaurantes || 0;
        groupVector[3] += u.pct_gasto_entretenimiento || 0;
        groupVector[4] += u.pct_gasto_supermercado || 0;
        groupVector[5] += u.pct_gasto_salud || 0;
        groupVector[6] += u.pct_gasto_educacion || 0;
        groupVector[7] += u.pct_gasto_hogar || 0;
        groupVector[8] += u.pct_gasto_otros || 0;
      }
      const n = miembrosActivos.length || 1;
      const avgGroupVector = groupVector.map((v) => v / n);

      const spendingScore = cosineSimilarity(userVector, avgGroupVector);

      const score = 0.7 * mailesScore + 0.3 * spendingScore;

      gruposScorados.push({
        ...g,
        _score: score,
        _mailesScore: mailesScore,
        _spendingScore: spendingScore,
        _promedioMailes: Math.round(promedioMailes),
      });
    }

    console.log("[matchmaking] gruposScorados final:", gruposScorados.length, gruposScorados.map(g => ({ nombre: g.nombre, score: g._score, mailes: g._promedioMailes })));

    gruposScorados.sort((a, b) => b._score - a._score);

    console.log("[matchmaking] mostrando modal con", gruposScorados.length, "grupos");
    setGruposMatch(gruposScorados);
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

  async function cancelarSolicitud() {
    if (!userId || !grupoPendiente) return;
    setLoading(true);
    await supabase
      .from("group_members")
      .delete()
      .eq("group_id", grupoPendiente.id)
      .eq("user_id", userId);
    setGrupoPendiente(null);
    setLoading(false);
  }

  async function compartirCodigo() {
    if (!grupo) return;
    await Share.share({
      message: `¡Únete a mi grupo ${grupo.nombre} en AI-Bank mAiles!\nCódigo de invitación: ${grupo.codigo_invitacion}`,
    });
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
      nombreGrupo={nombreGrupo}
      codigoInput={codigoInput}
      gruposMatch={gruposMatch}
      onRefresh={onRefresh}
      setModalCrear={setModalCrear}
      setModalUnirse={setModalUnirse}
      setModalRenombrar={setModalRenombrar}
      setModalMatchmaking={setModalMatchmaking}
      setModalResultadoMatch={setModalResultadoMatch}
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
      grupoPendiente={grupoPendiente}
      onCancelarSolicitud={cancelarSolicitud}
    />
  );
}
