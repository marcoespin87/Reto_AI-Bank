import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import HomeUI from "../../components/HomeUI";
import { supabase } from "../../lib/supabase";
import TutorialInteractivo from '../../components/TutorialInteractivo';
import TutorialMenu from '../../components/TutorialMenu';
import { useTutorial } from '../../hooks/useTutorial';

export default function HomeScreen() {
  const [userName, setUserName] = useState("");
  const [mailes, setMailes] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [saldo, setSaldo] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [misStickersRecientes, setMisStickersRecientes] = useState<any[]>([]);
  const [numeroCuenta, setNumeroCuenta] = useState("");
  const { mostrar, listo, completar, verificarParaUsuario, mostrarMenu, setMostrarMenu } = useTutorial();

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

    if (data) {
      setUserName(data.nombre?.split(" ")[0] || "Usuario");
      setMailes(data.mailes_acumulados || 0);
      setSaldo(data.saldo || 0);
      setNumeroCuenta(data.numero_cuenta || "");
      
      await verificarParaUsuario(data.id);

      const { data: txs } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", data.id)
        .order("fecha", { ascending: false })
        .limit(3);

      if (txs) setTransactions(txs);

      const { data: stickersRecientes } = await supabase
        .from("user_stickers")
        .select("*, stickers(*)")
        .eq("user_id", data.id)
        .order("fecha_obtencion", { ascending: false })
        .limit(3);

      if (stickersRecientes) setMisStickersRecientes(stickersRecientes);
    }
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
    <>
    <HomeUI
      userName={userName}
      mailes={mailes}
      saldo={saldo}
      numeroCuenta={numeroCuenta}
      transactions={transactions}
      misStickersRecientes={misStickersRecientes}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onCopiarCuenta={handleCopiarCuenta}
      formatNumeroCuenta={formatNumeroCuenta}
    />
    {listo && (
        <TutorialInteractivo
          visible={mostrar}
          onCompletar={completar}
          userName={userName}
        />
      )}
      <TutorialMenu 
        visible={mostrarMenu} 
        onClose={() => setMostrarMenu(false)} 
      />
    </>
  );
}
