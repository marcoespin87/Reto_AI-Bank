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

    const { data: misS } = await supabase
      .from("user_stickers")
      .select("*, stickers(*)")
      .eq("user_id", userData.id);
    if (misS) {
      setMisStickers(misS);
      const uniqueIds = new Set(misS.map((s: any) => s.sticker_id));
      if (uniqueIds.size >= TOTAL_ALBUM) setAlbumCompleto(true);
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
    />
  );
}
