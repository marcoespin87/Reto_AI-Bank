import { useEffect, useState } from "react";
import AlbumUI from "../../components/AlbumUI";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";

const DOLARES_POR_CROMO = 20;
const TOTAL_ALBUM = 28;

export default function AlbumScreen() {
  const { colors } = useTheme();
  const [userId, setUserId] = useState<number | null>(null);
  const [todosStickers, setTodosStickers] = useState<any[]>([]);
  const [misStickers, setMisStickers] = useState<any[]>([]);
  const [filtro, setFiltro] = useState<"todos" | "epico" | "raro" | "comun">(
    "todos",
  );
  const [stickerSeleccionado, setStickerSeleccionado] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [albumCompleto, setAlbumCompleto] = useState(false);
  const [ligaNombre, setLigaNombre] = useState("");
  const [posicionEnLiga, setPosicionEnLiga] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    // Cargar todos los stickers primero (datos públicos, no requieren auth)
    const { data: stickers } = await supabase
      .from("stickers")
      .select("*")
      .order("rareza", { ascending: false });
    if (stickers) setTodosStickers(stickers);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("email", user.email)
      .single();

    if (!userData) return;
    setUserId(userData.id);

    const [stickersResult, memberResult] = await Promise.all([
      supabase.from("user_stickers").select("*, stickers(*)").eq("user_id", userData.id),
      supabase
        .from("group_members")
        .select("group_id, groups(liga_id)")
        .eq("user_id", userData.id)
        .eq("estado", "activo")
        .maybeSingle(),
    ]);

    if (stickersResult.data) {
      setMisStickers(stickersResult.data);
      const uniqueIds = new Set(stickersResult.data.map((s: any) => s.sticker_id));
      if (uniqueIds.size >= TOTAL_ALBUM) setAlbumCompleto(true);
    }

    const memberData = memberResult.data;
    const grupoInfo = memberData?.groups as any;
    if (grupoInfo?.liga_id) {
      const [{ data: ligaData }, { data: todosGrupos }] = await Promise.all([
        supabase.from("ligas").select("nombre").eq("id", grupoInfo.liga_id).maybeSingle(),
        supabase.from("groups").select("id, group_members!inner(estado, users(mailes_acumulados))").eq("liga_id", grupoInfo.liga_id),
      ]);
      if (ligaData) setLigaNombre((ligaData as any).nombre ?? "");
      if (todosGrupos && todosGrupos.length > 0) {
        const ranking = todosGrupos
          .map((g: any) => {
            const activos = g.group_members?.filter((m: any) => m.estado === "activo") || [];
            const total = activos.reduce((sum: number, m: any) =>
              sum + (m.users?.mailes_acumulados || 0), 0);
            return { id: g.id, total };
          })
          .sort((a: any, b: any) => b.total - a.total);
        const pos = ranking.findIndex((g: any) => g.id === memberData?.group_id) + 1;
        setPosicionEnLiga(pos > 0 ? pos : null);
      }
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  function getCantidad(stickerId: number) {
    return misStickers.filter((s) => s.sticker_id === stickerId).length;
  }

  return (
    <AlbumUI
      colors={colors}
      todosStickers={todosStickers}
      misStickers={misStickers}
      filtro={filtro}
      setFiltro={setFiltro}
      stickerSeleccionado={stickerSeleccionado}
      setStickerSeleccionado={setStickerSeleccionado}
      refreshing={refreshing}
      onRefresh={onRefresh}
      albumCompleto={albumCompleto}
      getCantidad={getCantidad}
      DOLARES_POR_CROMO={DOLARES_POR_CROMO}
      TOTAL_ALBUM={TOTAL_ALBUM}
      ligaNombre={ligaNombre}
      posicionEnLiga={posicionEnLiga}
    />
  );
}
