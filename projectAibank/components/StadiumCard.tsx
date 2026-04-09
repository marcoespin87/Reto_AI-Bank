import React, { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../lib/supabase";
import StadiumCardUI from "./StadiumCardUI";

interface StadiumCardProps {
  onPress?: () => void;
}

export default function StadiumCard({ onPress }: StadiumCardProps) {
  const { colors } = useTheme();
  const [userRanking, setUserRanking] = useState(0);
  const [liga, setLiga] = useState("Liga Plata");

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
      .select("id")
      .eq("email", user.email)
      .single();
    if (!userData) return;

    // Liga: group_members → groups → ligas
    const { data: member } = await supabase
      .from("group_members")
      .select("groups(liga_id, ligas(nombre))")
      .eq("user_id", userData.id)
      .maybeSingle();

    const ligaNombre = (member as any)?.groups?.ligas?.nombre;
    if (ligaNombre) setLiga(ligaNombre);

    // Ranking desde la vista user_rankings
    const { data: ranking } = await supabase
      .from("user_rankings")
      .select("ranking, liga")
      .eq("user_id", userData.id)
      .maybeSingle();

    if (ranking) {
      if (ranking.ranking) setUserRanking(ranking.ranking);
      if (ranking.liga) setLiga(ranking.liga);
    }
  }

  return (
    <StadiumCardUI
      userRanking={userRanking}
      liga={liga}
      colors={colors}
      onPress={onPress}
    />
  );
}
