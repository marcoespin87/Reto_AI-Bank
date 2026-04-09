import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import HomeUI from "../../components/HomeUI";
import { ProgressData } from "../../components/ProgressToggleCard";
import { supabase } from "../../lib/supabase";

const DEFAULT_PROGRESS: ProgressData = {
  medalla: 1,
  medallaNombre: "",
  estrellas: 0,
  comprasParaStar: 10,
  comprasUmbral: 10,
  comprasActuales: 0,
  gastoSemanal: 0,
  mailesEstaSemana: 0,
  comprasEstaSemana: 0,
  grupoNombre: null,
  grupoMailesTotal: 0,
  grupoMailesMeta: 0,
  grupoMiembrosCount: 0,
};

export default function HomeScreen() {
  const [userName, setUserName] = useState("");
  const [mailes, setMailes] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [saldo, setSaldo] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [misStickersRecientes, setMisStickersRecientes] = useState<any[]>([]);
  const [numeroCuenta, setNumeroCuenta] = useState("");
  const [progressData, setProgressData] = useState<ProgressData>(DEFAULT_PROGRESS);

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("users")
      .select("id, nombre, mailes_acumulados, saldo, numero_cuenta")
      .eq("email", user.email)
      .single();

    if (!data) return;

    setUserName(data.nombre?.split(" ")[0] || "Usuario");
    setMailes(data.mailes_acumulados || 0);
    setSaldo(data.saldo || 0);
    setNumeroCuenta(data.numero_cuenta || "");

    // Run independent queries in parallel
    const [txsResult, stickersResult, memberResult, weeklyResult] =
      await Promise.all([
        supabase
          .from("transactions")
          .select("*")
          .eq("user_id", data.id)
          .order("fecha", { ascending: false })
          .limit(3),

        supabase
          .from("user_stickers")
          .select("*, stickers(*)")
          .eq("user_id", data.id)
          .order("fecha_obtencion", { ascending: false })
          .limit(3),

        supabase
          .from("group_members")
          .select(
            "group_id, medalla_actual, estrellas_actuales, mailes_aportados, groups(liga_id, nombre_grupo)"
          )
          .eq("user_id", data.id)
          .eq("estado", "activo")
          .maybeSingle(),

        supabase
          .from("transactions")
          .select("monto, mailes_generados")
          .eq("user_id", data.id)
          .gte("fecha", getWeekStart()),
      ]);

    if (txsResult.data) setTransactions(txsResult.data);
    if (stickersResult.data) setMisStickersRecientes(stickersResult.data);

    // Weekly data
    const weeklyTxs = weeklyResult.data ?? [];
    const gastoSemanal = weeklyTxs.reduce(
      (s: number, tx: any) => s + Number(tx.monto ?? 0),
      0
    );
    const mailesEstaSemana = weeklyTxs.reduce(
      (s: number, tx: any) => s + (tx.mailes_generados ?? 0),
      0
    );
    const comprasEstaSemana = weeklyTxs.length;

    const memberInfo = memberResult.data;
    const grupo = memberInfo?.groups as any;

    if (!memberInfo || !grupo) {
      setProgressData({
        ...DEFAULT_PROGRESS,
        gastoSemanal,
        mailesEstaSemana,
        comprasEstaSemana,
      });
      return;
    }

    const medallaActual = memberInfo.medalla_actual ?? 1;
    const estrellasActuales = memberInfo.estrellas_actuales ?? 0;
    const grupoId = memberInfo.group_id;
    const ligaId = grupo.liga_id;
    const grupoNombre = grupo.nombre_grupo ?? null;

    // Fetch medal data + group members + total transactions in parallel
    const [medalResult, groupMembersResult, totalTxCount] = await Promise.all([
      supabase
        .from("liga_medals")
        .select("umbral_compras_por_estrella, nombre_medalla")
        .eq("liga_id", ligaId)
        .eq("numero_medalla", medallaActual)
        .maybeSingle(),

      supabase
        .from("group_members")
        .select("mailes_aportados")
        .eq("group_id", grupoId)
        .eq("estado", "activo"),

      supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", data.id),
    ]);

    // Fetch group objectives meta (first active objective)
    const { data: objetivoData } = await supabase
      .from("liga_objectives")
      .select("valor_objetivo")
      .eq("liga_id", ligaId)
      .limit(1)
      .maybeSingle();

    const umbral = medalResult.data?.umbral_compras_por_estrella ?? 10;
    const medallaNombre = medalResult.data?.nombre_medalla ?? "";
    const totalCompras = totalTxCount.count ?? 0;
    const comprasActuales = umbral > 0 ? totalCompras % umbral : 0;
    const comprasParaStar = umbral > 0 ? umbral - comprasActuales : 0;

    const grupoMembers = groupMembersResult.data ?? [];
    const grupoMailesTotal = grupoMembers.reduce(
      (s: number, m: any) => s + (m.mailes_aportados ?? 0),
      0
    );
    const grupoMiembrosCount = grupoMembers.length;
    const grupoMailesMeta = Number(objetivoData?.valor_objetivo ?? 0);

    setProgressData({
      medalla: medallaActual,
      medallaNombre,
      estrellas: estrellasActuales,
      comprasParaStar,
      comprasUmbral: umbral,
      comprasActuales,
      gastoSemanal,
      mailesEstaSemana,
      comprasEstaSemana,
      grupoNombre,
      grupoMailesTotal,
      grupoMailesMeta,
      grupoMiembrosCount,
    });
  }

  function getWeekStart(): string {
    const today = new Date();
    const day = today.getDay();
    const daysToMonday = day === 0 ? 6 : day - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysToMonday);
    return monday.toISOString().split("T")[0];
  }

  async function handleCopiarCuenta() {
    if (!numeroCuenta) return;
    await Clipboard.setStringAsync(numeroCuenta);
    Alert.alert("Copiado", "Número de cuenta copiado al portapapeles");
  }

  function formatNumeroCuenta(num: string) {
    if (!num) return "•••• •••• •••• ••••";
    return num.replace(/(.{4})/g, "$1 ").trim();
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/(auth)/login");
  }

  return (
    <HomeUI
      userName={userName}
      mailes={mailes}
      saldo={saldo}
      numeroCuenta={numeroCuenta}
      transactions={transactions}
      misStickersRecientes={misStickersRecientes}
      progressData={progressData}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onCopiarCuenta={handleCopiarCuenta}
      formatNumeroCuenta={formatNumeroCuenta}
    />
  );
}
