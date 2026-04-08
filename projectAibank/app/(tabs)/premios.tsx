import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SEGMENTACION_API_URL } from "../../lib/api";
import { supabase } from "../../lib/supabase";

// ─── Tipos ───────────────────────────────────────────────────────────────────

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

// ─── Mapas de display ────────────────────────────────────────────────────────

const CATEGORIA_ICON: Record<string, string> = {
  tecnologia: "📱",
  viajes_nacionales: "🏝️",
  viajes_internacionales: "✈️",
  gastronomia: "🍽️",
  experiencias_entretenimiento: "🎭",
  salud_bienestar: "💚",
  educacion_desarrollo: "📚",
  hogar_lifestyle: "🏠",
  premium_financiero: "💎",
};

const CATEGORIA_COLOR: Record<string, string> = {
  tecnologia: "#4FC3F7",
  viajes_nacionales: "#81C784",
  viajes_internacionales: "#FFB74D",
  gastronomia: "#F06292",
  experiencias_entretenimiento: "#CE93D8",
  salud_bienestar: "#80DEEA",
  educacion_desarrollo: "#FFD54F",
  hogar_lifestyle: "#A5D6A7",
  premium_financiero: "#FFD700",
};

const CATEGORIA_LABEL: Record<string, string> = {
  tecnologia: "Tecnología",
  viajes_nacionales: "Viajes Nacionales",
  viajes_internacionales: "Viajes Internacionales",
  gastronomia: "Gastronomía",
  experiencias_entretenimiento: "Entretenimiento",
  salud_bienestar: "Salud & Bienestar",
  educacion_desarrollo: "Educación",
  hogar_lifestyle: "Hogar & Lifestyle",
  premium_financiero: "Premium Financiero",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function boolToInt(val: boolean | null | undefined): number {
  return val ? 1 : 0;
}

/** Mapea scores como 'BB' al esquema que espera el modelo: AAA|AA|A|B|C */
function mapScore(score: string | null | undefined): string {
  if (!score) return "B";
  if (["AAA", "AA", "A", "B", "C"].includes(score)) return score;
  if (score.startsWith("BB") || score === "B+") return "B";
  return "B";
}

/** Medalla actual → liga_tier que espera el modelo */
function medallaALigaTier(medalla: number): string {
  if (medalla <= 2) return "Bronce";
  if (medalla <= 4) return "Plata";
  if (medalla === 5) return "Oro";
  return "Diamante";
}

// ─── Pantalla ─────────────────────────────────────────────────────────────────

export default function PremiosScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SegmentacionResult | null>(null);
  const [userName, setUserName] = useState("");
  const [ligaTier, setLigaTier] = useState("");

  useEffect(() => {
    fetchAndSegmentar();
  }, []);

  const fetchAndSegmentar = useCallback(async () => {
    setError(null);
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

      // 3. Medalla y estrellas actuales (desde group_members)
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

      // liga_tier: viene de economic_tiers o se infiere de la medalla
      const tierNombre =
        (userData.economic_tiers as any)?.nombre ||
        medallaALigaTier(medallaFinal);
      setLigaTier(tierNombre);

      // 4. Construir payload para el modelo
      const payload = {
        // Bloque A
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

        // Bloque B
        pct_gasto_tecnologia: userData.pct_gasto_tecnologia || 0,
        pct_gasto_viajes: userData.pct_gasto_viajes || 0,
        pct_gasto_restaurantes: userData.pct_gasto_restaurantes || 0,
        pct_gasto_entretenimiento: userData.pct_gasto_entretenimiento || 0,
        pct_gasto_supermercado: userData.pct_gasto_supermercado || 0,
        pct_gasto_salud: userData.pct_gasto_salud || 0,
        pct_gasto_educacion: userData.pct_gasto_educacion || 0,
        pct_gasto_hogar: userData.pct_gasto_hogar || 0,
        pct_gasto_otros: userData.pct_gasto_otros || 0,

        // Bloque C
        medalla_final: medallaFinal,
        estrellas_finales: estrellasFinal,
        mailes_acumulados: userData.mailes_acumulados || 0,
        predicciones_correctas_pct:
          Number(userData.predicciones_correctas_pct) || 0,
        racha_maxima_predicciones: userData.racha_maxima_predicciones || 0,
        cromos_coleccionados: userData.cromos_coleccionados || 0,
        cromos_epicos_obtenidos: userData.cromos_epicos_obtenidos || 0,
        objetivos_completados: userData.objetivos_completados || 0,

        // Bloque D
        participo_en_grupo: boolToInt(userData.participo_en_grupo),
        rol_en_grupo:
          userData.rol_en_grupo === "ninguno"
            ? "sin_grupo"
            : userData.rol_en_grupo || "sin_grupo",
        votos_emitidos: userData.votos_emitidos || 0,
        dias_activo_temporada: userData.dias_activo_temporada || 0,

        // Bloque E
        edad: userData.edad || 25,
        genero: userData.genero || "No_especificado",
        ciudad: userData.ciudad || "Quito",
        nivel_educacion: userData.nivel_educacion || "universitario",
        ocupacion: userData.ocupacion || "empleado_privado",

        // Bloque F
        usa_app_movil: 1,
        sesiones_app_semana: userData.sesiones_app_semana || 4,
        notificaciones_activadas: boolToInt(userData.notificaciones_activadas),
        compras_online_pct: Number(userData.compras_online_pct) || 0,
        dispositivo_preferido: userData.dispositivo_preferido || "Android",
      };

      // 5. Llamar a la API
      const response = await fetch(`${SEGMENTACION_API_URL}/segmentar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

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

  const categoriaColor = result
    ? (CATEGORIA_COLOR[result.categoria] ?? "#b2c5ff")
    : "#b2c5ff";

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
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>Mis Premios</Text>
            <Text style={s.headerSub}>Temporada FIFA 2026</Text>
          </View>
          {ligaTier ? (
            <View style={s.tierBadge}>
              <Text style={s.tierBadgeText}>{ligaTier}</Text>
            </View>
          ) : (
            <View style={{ width: 60 }} />
          )}
        </View>

        {/* ── Estado: cargando ── */}
        {loading && (
          <View style={s.stateContainer}>
            <ActivityIndicator
              size="large"
              color="#b2c5ff"
              style={{ marginBottom: 16 }}
            />
            <Text style={s.stateTitle}>Analizando tu perfil…</Text>
            <Text style={s.stateSub}>
              El modelo está personalizando tu premio
            </Text>
          </View>
        )}

        {/* ── Estado: error ── */}
        {!loading && error && (
          <View style={s.stateContainer}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>⚠️</Text>
            <Text style={s.stateTitle}>No se pudo conectar</Text>
            <Text style={s.stateSub}>{error}</Text>
            <Text style={[s.stateSub, { marginTop: 12, color: "#8c90a1" }]}>
              Asegúrate de que la API de segmentación esté corriendo:{"\n"}
              <Text style={{ color: "#b2c5ff" }}>
                uvicorn api:app --reload --port 8000
              </Text>
            </Text>
            <TouchableOpacity style={s.retryBtn} onPress={fetchAndSegmentar}>
              <Text style={s.retryBtnText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Estado: resultado ── */}
        {!loading && !error && result && (
          <View key={`result-content-${result.categoria}`}>
            {/* Tarjeta principal del premio */}
            <View style={[s.prizeCard, { borderColor: categoriaColor }]}>
              <View
                style={[
                  s.prizeCardGlow,
                  { backgroundColor: categoriaColor + "18" },
                ]}
              />

              {/* Badge de categoría */}
              <View
                style={[
                  s.categoryBadge,
                  {
                    backgroundColor: categoriaColor + "22",
                    borderColor: categoriaColor + "55",
                  },
                ]}
              >
                <Text style={s.categoryBadgeIcon}>
                  {CATEGORIA_ICON[result.categoria] ?? "🎁"}
                </Text>
                <Text style={[s.categoryBadgeText, { color: categoriaColor }]}>
                  {CATEGORIA_LABEL[result.categoria] ?? result.categoria}
                </Text>
              </View>

              {/* Premio principal */}
              <Text style={s.prizeEmoji}>
                {CATEGORIA_ICON[result.categoria] ?? "🎁"}
              </Text>
              <Text style={s.prizeName}>{result.premio_nombre}</Text>

              {/* Métricas */}
              <View style={s.metricsRow}>
                <View style={s.metricItem}>
                  <Text style={[s.metricValue, { color: categoriaColor }]}>
                    {result.afinidad_pct}%
                  </Text>
                  <Text style={s.metricLabel}>Afinidad</Text>
                </View>
                <View style={s.metricDivider} />
                <View style={s.metricItem}>
                  <Text style={[s.metricValue, { color: categoriaColor }]}>
                    {result.confianza_pct}%
                  </Text>
                  <Text style={s.metricLabel}>Confianza</Text>
                </View>
              </View>
            </View>

            {/* Por qué este premio */}
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionIcon}>🤖</Text>
                <Text style={s.sectionTitle}>Por qué este premio</Text>
              </View>
              <View style={s.reasonsList}>
                {result.razones.map((r, i) => (
                  <View key={i} style={s.reasonItem}>
                    <View
                      style={[s.reasonDot, { backgroundColor: categoriaColor }]}
                    />
                    <Text style={s.reasonText}>{r}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Top 3 categorías */}
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionIcon}>📊</Text>
                <Text style={s.sectionTitle}>Tus categorías principales</Text>
              </View>
              {result.top3_categorias.map(([cat, pct]) => {
                const col = CATEGORIA_COLOR[cat] ?? "#b2c5ff";
                return (
                  <View key={cat} style={s.catRow}>
                    <Text style={s.catIcon}>{CATEGORIA_ICON[cat] ?? "🎁"}</Text>
                    <View style={s.catBarContainer}>
                      <Text style={s.catLabel}>
                        {CATEGORIA_LABEL[cat] ?? cat}
                      </Text>
                      <View style={s.catBarTrack}>
                        <View
                          style={[
                            s.catBarFill,
                            { width: `${pct}%`, backgroundColor: col },
                          ]}
                        />
                      </View>
                    </View>
                    <Text style={[s.catPct, { color: col }]}>{pct}%</Text>
                  </View>
                );
              })}
            </View>

            {/* Premios alternativos */}
            {result.alternativas.length > 0 && (
              <View style={s.section}>
                <View style={s.sectionHeader}>
                  <Text style={s.sectionIcon}>🎁</Text>
                  <Text style={s.sectionTitle}>También podrías ganar</Text>
                </View>
                {result.alternativas.map((alt) => (
                  <View key={alt.premio} style={s.altItem}>
                    <Text style={s.altEmoji}>
                      {CATEGORIA_ICON[result.categoria] ?? "🎁"}
                    </Text>
                    <View style={s.altInfo}>
                      <Text style={s.altName}>{alt.nombre}</Text>
                      <Text style={s.altAfinidad}>
                        {alt.afinidad}% de afinidad
                      </Text>
                    </View>
                    <View
                      style={[
                        s.altBadge,
                        { borderColor: categoriaColor + "55" },
                      ]}
                    >
                      <Text style={[s.altBadgeText, { color: categoriaColor }]}>
                        Alt.
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={{ height: 12 }} />
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.bottomNav}>
        <TouchableOpacity
          style={s.navItem}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={s.navIcon}>🏠</Text>
          <Text style={s.navLabel}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.navItem}
          onPress={() => router.replace("/(tabs)/banco")}
        >
          <Text style={s.navIcon}>🏦</Text>
          <Text style={s.navLabel}>Banco</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.navCenter}
          onPress={() => router.replace("/(tabs)/mundial")}
        >
          <View style={s.navCenterBtn}>
            <Text style={s.navCenterIcon}>⚽</Text>
          </View>
          <Text style={s.navCenterLabel}>Mundial</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.navItem}
          onPress={() => router.replace("/(tabs)/grupo")}
        >
          <Text style={s.navIcon}>👥</Text>
          <Text style={s.navLabel}>Grupo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.navItem}
          onPress={() => router.replace("/(tabs)/perfil")}
        >
          <Text style={s.navIcon}>👤</Text>
          <Text style={s.navLabel}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#071325" },
  scroll: { paddingHorizontal: 20 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1f2a3d",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "#424655",
  },
  backIcon: { color: "#b2c5ff", fontSize: 24, lineHeight: 30, marginTop: -2 },
  headerCenter: { alignItems: "center" },
  headerTitle: { color: "#d7e3fc", fontSize: 18, fontWeight: "800" },
  headerSub: { color: "#8c90a1", fontSize: 11, marginTop: 1 },
  tierBadge: {
    backgroundColor: "#1f2a3d",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "#ffd65b55",
  },
  tierBadgeText: { color: "#ffd65b", fontSize: 10, fontWeight: "700" },

  // Estados
  stateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  stateTitle: {
    color: "#d7e3fc",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  stateSub: {
    color: "#8c90a1",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 24,
    backgroundColor: "#b2c5ff",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryBtnText: { color: "#071325", fontSize: 14, fontWeight: "800" },

  // Tarjeta principal
  prizeCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 24,
    marginTop: 8,
    marginBottom: 16,
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "#101c2e",
  },
  prizeCardGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  categoryBadgeIcon: { fontSize: 14 },
  categoryBadgeText: { fontSize: 12, fontWeight: "700" },
  prizeEmoji: { fontSize: 64, marginBottom: 12 },
  prizeName: {
    color: "#d7e3fc",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 28,
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    backgroundColor: "#0d1829",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "100%",
    justifyContent: "center",
  },
  metricItem: { alignItems: "center", flex: 1 },
  metricValue: { fontSize: 26, fontWeight: "900" },
  metricLabel: {
    color: "#8c90a1",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  metricDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#1f2a3d",
    marginHorizontal: 12,
  },

  // Secciones
  section: {
    backgroundColor: "#101c2e",
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: "#1f2a3d",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionIcon: { fontSize: 16 },
  sectionTitle: { color: "#d7e3fc", fontSize: 15, fontWeight: "700" },

  // Razones
  reasonsList: { gap: 10 },
  reasonItem: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  reasonDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  reasonText: { color: "#c2c6d8", fontSize: 13, flex: 1, lineHeight: 20 },

  // Barras de categoría
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  catIcon: { fontSize: 18, width: 24, textAlign: "center" },
  catBarContainer: { flex: 1 },
  catLabel: {
    color: "#c2c6d8",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  catBarTrack: {
    height: 6,
    backgroundColor: "#1f2a3d",
    borderRadius: 3,
    overflow: "hidden",
  },
  catBarFill: { height: "100%", borderRadius: 3 },
  catPct: { fontSize: 13, fontWeight: "700", width: 38, textAlign: "right" },

  // Alternativas
  altItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#1f2a3d",
  },
  altEmoji: { fontSize: 28 },
  altInfo: { flex: 1 },
  altName: { color: "#d7e3fc", fontSize: 14, fontWeight: "600" },
  altAfinidad: { color: "#8c90a1", fontSize: 11, marginTop: 2 },
  altBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  altBadgeText: { fontSize: 10, fontWeight: "700" },

  // Bottom Nav
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(7,19,37,0.95)",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 0.5,
    borderTopColor: "#1f2a3d",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  navItem: { alignItems: "center", gap: 2 },
  navIcon: { fontSize: 22, opacity: 0.5 },
  navLabel: { color: "#d7e3fc", fontSize: 9, fontWeight: "500", opacity: 0.5 },
  navCenter: { alignItems: "center", marginTop: -20 },
  navCenterBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#b2c5ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    borderWidth: 3,
    borderColor: "#071325",
  },
  navCenterIcon: { fontSize: 26 },
  navCenterLabel: { color: "#b2c5ff", fontSize: 9, fontWeight: "700" },
});
