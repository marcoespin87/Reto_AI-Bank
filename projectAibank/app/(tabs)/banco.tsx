import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import BancoUI from "../../components/BancoUI";
import { useLigaMedal } from "../../lib/useLigaMedal";
import { supabase } from "../../lib/supabase";

export default function BancoScreen() {
  const { ligaNombre, medallaNombre, medallaActual } = useLigaMedal();
  const [userName, setUserName] = useState("");
  const [saldo, setSaldo] = useState(4280.5);
  const [userId, setUserId] = useState<number | null>(null);
  const [numeroCuenta, setNumeroCuenta] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [period, setPeriod] = useState<7 | 30>(7);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<"transferir" | "pagar" | "compra" | null>(
    null,
  );
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const DOLARES_POR_CROMO = 20;
  const [sobresModalVisible, setSobresModalVisible] = useState(false);
  const [cromosGanadosData, setCromosGanadosData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [period]);

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: userData } = await supabase
      .from("users")
      .select("id, nombre, mailes_acumulados, saldo, numero_cuenta")
      .eq("email", user.email)
      .single();

    if (userData) {
      setUserName(userData.nombre?.split(" ")[0] || "Usuario");
      setUserId(userData.id);
      setSaldo(userData.saldo || 4280.5);
      setNumeroCuenta(userData.numero_cuenta || "");
    }

    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - period);
    const fechaStr = fechaInicio.toISOString().split("T")[0];

    const { data: txs } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userData?.id)
      .gte("fecha", fechaStr)
      .order("fecha", { ascending: false });

    if (txs) setTransactions(txs);
  }

  async function handleTransaction(categoria: string) {
    if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) {
      Alert.alert("Error", "Ingresa un monto válido");
      return;
    }
    if (Number(monto) > saldo) {
      Alert.alert("Error", "Saldo insuficiente");
      return;
    }
    if (!userId) return;

    let destinatarioId: number | null = null;
    let destinatarioSaldo: number = 0;

    if (categoria === "Transferencia") {
      if (!descripcion || descripcion.trim().length !== 16) {
        Alert.alert("Error", "Ingresa un número de cuenta válido (16 dígitos)");
        return;
      }
      if (descripcion.trim() === numeroCuenta) {
        Alert.alert("Error", "No puedes transferirte a ti mismo");
        return;
      }
      const { data: destinatario, error: destError } = await supabase
        .from("users")
        .select("id, saldo")
        .eq("numero_cuenta", descripcion.trim())
        .single();

      if (destError || !destinatario) {
        Alert.alert("Error", "No se encontró ninguna cuenta con ese número");
        return;
      }
      destinatarioId = destinatario.id;
      destinatarioSaldo = destinatario.saldo || 0;
    }

    setLoading(true);

    const montoNum = Number(monto);
    const mailesGanados = Math.floor(montoNum / 100) * 10;
    const nuevoSaldo = saldo - montoNum;

    const { error: txError } = await supabase.from("transactions").insert({
      user_id: userId,
      monto: montoNum,
      categoria: categoria,
      fecha: new Date().toISOString().split("T")[0],
      mailes_generados: mailesGanados,
    });

    if (txError) {
      setLoading(false);
      Alert.alert("Error", txError.message);
      return;
    }

    const { data: currentUser } = await supabase
      .from("users")
      .select("mailes_acumulados")
      .eq("id", userId)
      .single();

    const nuevoMailes = (currentUser?.mailes_acumulados || 0) + mailesGanados;

    await supabase
      .from("users")
      .update({ saldo: nuevoSaldo, mailes_acumulados: nuevoMailes })
      .eq("id", userId);

    if (categoria === "Transferencia" && destinatarioId !== null) {
      await supabase
        .from("users")
        .update({ saldo: destinatarioSaldo + montoNum })
        .eq("id", destinatarioId);
    }

    const cromosGanados = Math.floor(montoNum / DOLARES_POR_CROMO);
    const cromosNuevos: any[] = [];

    if (cromosGanados > 0) {
      const { data: allStickers } = await supabase
        .from("stickers")
        .select("id, nombre, imagen_url, rareza");

      if (allStickers && allStickers.length > 0) {
        const cromosAInsertar = [];
        for (let i = 0; i < cromosGanados; i++) {
          const randomSticker =
            allStickers[Math.floor(Math.random() * allStickers.length)];
          cromosAInsertar.push({
            user_id: userId,
            sticker_id: randomSticker.id,
            fecha_obtencion: new Date().toISOString().split("T")[0],
            origen: "gasto",
          });
          cromosNuevos.push({ stickers: randomSticker });
        }
        await supabase.from("user_stickers").insert(cromosAInsertar);
      }
    }

    setSaldo(nuevoSaldo);
    setMonto("");
    setDescripcion("");
    setLoading(false);
    loadData();

    if (cromosNuevos.length > 0) {
      setCromosGanadosData(cromosNuevos);
      setModal(null);
      setTimeout(() => {
        setSobresModalVisible(true);
      }, 400);
    } else {
      setModal(null);
      Alert.alert(
        "¡Listo!",
        `Transacción de $${montoNum.toFixed(2)} realizada.\n+${mailesGanados} mAiles ganados 🌟`,
      );
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

  return (
    <BancoUI
      userName={userName}
      ligaNombre={ligaNombre}
      medallaNombre={medallaNombre}
      medallaActual={medallaActual}
      saldo={saldo}
      numeroCuenta={numeroCuenta}
      transactions={transactions}
      period={period}
      setPeriod={setPeriod}
      loading={loading}
      modal={modal}
      setModal={setModal}
      monto={monto}
      setMonto={setMonto}
      descripcion={descripcion}
      setDescripcion={setDescripcion}
      sobresModalVisible={sobresModalVisible}
      setSobresModalVisible={setSobresModalVisible}
      cromosGanadosData={cromosGanadosData}
      handleTransaction={handleTransaction}
      handleCopiarCuenta={handleCopiarCuenta}
      formatNumeroCuenta={formatNumeroCuenta}
      onAgregarAlbum={() => {
        setSobresModalVisible(false);
        router.replace("/(tabs)/album");
      }}
    />
  );
}
