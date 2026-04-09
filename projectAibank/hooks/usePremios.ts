import { useCallback, useState } from "react";
import { supabase } from "../lib/supabase";

interface SegmentacionResult {
  categoria: string;
  confianza_pct: number;
  premio_id: string;
  premio_nombre: string;
  afinidad_pct: number;
  razones: string[];
  alternativas: { premio: string; nombre: string; afinidad: number }[];
  top3_categorias: [string, number][];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function boolToInt(val: boolean | null | undefined): number {
  return val ? 1 : 0;
}

function hasEnoughData(userData: any): boolean {
  const gasto = Number(userData.gasto_mensual_usd) || 0;
  const mailes = Number(userData.mailes_acumulados) || 0;
  const transacciones = Number(userData.frecuencia_transacciones_mes) || 0;
  const diasActivo = Number(userData.dias_activo_temporada) || 0;
  return gasto > 0 || mailes >= 50 || transacciones >= 3 || diasActivo >= 5;
}

function mapScore(score: string | null | undefined): string {
  if (!score) return "B";
  if (["AAA", "AA", "A", "B", "C"].includes(score)) return score;
  if (score.startsWith("BB") || score === "B+") return "B";
  return "B";
}

function medallaALigaTier(medalla: number): string {
  if (medalla <= 2) return "Bronce";
  if (medalla <= 4) return "Plata";
  if (medalla === 5) return "Oro";
  return "Diamante";
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePremios() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SegmentacionResult | null>(null);
  const [userName, setUserName] = useState("");
  const [ligaTier, setLigaTier] = useState("");
  const [sinDatos, setSinDatos] = useState(false);

  const fetchAndSegmentar = useCallback(async () => {
    setError(null);
    setSinDatos(false);
    setLoading(true);
    try {
      // 1. Usuario autenticado
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay sesión activa");

      // 2. Datos del usuario + liga tier
      const { data: userData, error: userErr } = await supabase
        .from("users")
        .select(
          `
          id, nombre, mailes_acumulados, antiguedad_cliente_meses,
          num_productos_bancarios, score_crediticio,
          tiene_credito_activo, tiene_cuenta_ahorro, meses_sin_mora,
          pct_gasto_tecnologia, pct_gasto_viajes, pct_gasto_restaurantes,
          pct_gasto_entretenimiento, pct_gasto_supermercado, pct_gasto_salud,
          pct_gasto_educacion, pct_gasto_hogar, pct_gasto_otros,
          predicciones_correctas_pct, racha_maxima_predicciones,
          cromos_coleccionados, cromos_epicos_obtenidos, objetivos_completados,
          participo_en_grupo, rol_en_grupo, votos_emitidos, dias_activo_temporada,
          edad, genero, ciudad, nivel_educacion, ocupacion,
          usa_app_movil, sesiones_app_semana, notificaciones_activadas,
          compras_online_pct, dispositivo_preferido,
          gasto_mensual_usd, frecuencia_transacciones_mes,
          economic_tier_id,
          economic_tiers ( nombre )
        `,
        )
        .eq("email", user.email)
        .single();

      if (userErr || !userData) throw new Error("No se pudo cargar el perfil");

      setUserName((userData.nombre as string)?.split(" ")[0] || "Usuario");

      // Verificar si el usuario tiene suficiente actividad
      if (!hasEnoughData(userData)) {
        setSinDatos(true);
        return;
      }

      // 3. Medalla y estrellas actuales
      const { data: memberData } = await supabase
        .from("group_members")
        .select("medalla_actual, estrellas_actuales")
        .eq("user_id", userData.id)
        .eq("estado", "activo")
        .order("medalla_actual", { ascending: false })
        .limit(1)
        .single();

      const medallaFinal = memberData?.medalla_actual ?? 1;
      const estrellasFinal = memberData?.estrellas_actuales ?? 0;

      const tierNombre =
        (userData.economic_tiers as any)?.nombre ||
        medallaALigaTier(medallaFinal);
      setLigaTier(tierNombre);

      // 4. Construir payload para el modelo
      const payload = {
        liga_tier: tierNombre,
        gasto_mensual_usd: Number(userData.gasto_mensual_usd) || 0,
        frecuencia_transacciones_mes:
          userData.frecuencia_transacciones_mes || 0,
        antiguedad_cliente_meses: userData.antiguedad_cliente_meses || 0,
        num_productos_bancarios: userData.num_productos_bancarios || 1,
        score_crediticio: mapScore(userData.score_crediticio),
        tiene_credito_activo: boolToInt(userData.tiene_credito_activo),
        tiene_cuenta_ahorro: boolToInt(userData.tiene_cuenta_ahorro),
        meses_sin_mora: userData.meses_sin_mora || 0,

        pct_gasto_tecnologia: userData.pct_gasto_tecnologia || 0,
        pct_gasto_viajes: userData.pct_gasto_viajes || 0,
        pct_gasto_restaurantes: userData.pct_gasto_restaurantes || 0,
        pct_gasto_entretenimiento: userData.pct_gasto_entretenimiento || 0,
        pct_gasto_supermercado: userData.pct_gasto_supermercado || 0,
        pct_gasto_salud: userData.pct_gasto_salud || 0,
        pct_gasto_educacion: userData.pct_gasto_educacion || 0,
        pct_gasto_hogar: userData.pct_gasto_hogar || 0,
        pct_gasto_otros: userData.pct_gasto_otros || 0,

        medalla_final: medallaFinal,
        estrellas_finales: estrellasFinal,
        mailes_acumulados: userData.mailes_acumulados || 0,
        predicciones_correctas_pct:
          Number(userData.predicciones_correctas_pct) || 0,
        racha_maxima_predicciones: userData.racha_maxima_predicciones || 0,
        cromos_coleccionados: userData.cromos_coleccionados || 0,
        cromos_epicos_obtenidos: userData.cromos_epicos_obtenidos || 0,
        objetivos_completados: userData.objetivos_completados || 0,

        participo_en_grupo: boolToInt(userData.participo_en_grupo),
        rol_en_grupo:
          userData.rol_en_grupo === "ninguno"
            ? "sin_grupo"
            : userData.rol_en_grupo || "sin_grupo",
        votos_emitidos: userData.votos_emitidos || 0,
        dias_activo_temporada: userData.dias_activo_temporada || 0,

        edad: userData.edad || 25,
        genero: userData.genero || "No_especificado",
        ciudad: userData.ciudad || "Quito",
        nivel_educacion: userData.nivel_educacion || "universitario",
        ocupacion: userData.ocupacion || "empleado_privado",

        usa_app_movil: 1,
        sesiones_app_semana: userData.sesiones_app_semana || 4,
        notificaciones_activadas: boolToInt(userData.notificaciones_activadas),
        compras_online_pct: Number(userData.compras_online_pct) || 0,
        dispositivo_preferido: userData.dispositivo_preferido || "Android",
      };

      // 5. Llamar a la API
      const response = await fetch(
        `https://ai-bank-backend-o83m.onrender.com/segmentacion/segmentar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Error del servidor: ${response.status} — ${errText}`);
      }

      const data: SegmentacionResult = await response.json();
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Error desconocido");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAndSegmentar();
  }, [fetchAndSegmentar]);

  return {
    loading,
    refreshing,
    error,
    result,
    userName,
    ligaTier,
    sinDatos,
    fetchAndSegmentar,
    onRefresh,
  };
}
