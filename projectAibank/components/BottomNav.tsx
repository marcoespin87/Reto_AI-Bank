import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

type Tab = "home" | "banco" | "mundial" | "grupo" | "perfil";

interface BottomNavProps {
  active: Tab;
}

const TABS: {
  key: Tab;
  icon: string;
  iconActive: string;
  label: string;
  route: string;
}[] = [
  {
    key: "home",
    icon: "home-outline",
    iconActive: "home",
    label: "Inicio",
    route: "/(tabs)",
  },
  {
    key: "banco",
    icon: "wallet-outline",
    iconActive: "wallet",
    label: "Banco",
    route: "/(tabs)/banco",
  },
  {
    key: "mundial",
    icon: "football-outline",
    iconActive: "football",
    label: "Mundial",
    route: "/(tabs)/mundial",
  },
  {
    key: "grupo",
    icon: "people-outline",
    iconActive: "people",
    label: "Grupo",
    route: "/(tabs)/grupo",
  },
  {
    key: "perfil",
    icon: "person-outline",
    iconActive: "person",
    label: "Perfil",
    route: "/(tabs)/perfil",
  },
];

export default function BottomNav({ active }: BottomNavProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const s = getStyles(colors);

  const handleNavigation = (tab: (typeof TABS)[0]) => {
    const isActive = tab.key === active;
    if (!isActive) {
      // Usa setTimeout para asegurar que la navegación ocurra DESPUÉS del render
      setTimeout(() => {
        router.replace(tab.route as any);
      }, 0);
    }
  };

  return (
    <View style={[s.bottomNav, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        const isMundial = tab.key === "mundial";

        return (
          <TouchableOpacity
            key={`nav-${tab.key}`}
            style={[s.navItem, isMundial && s.navCenter]}
            onPress={() => handleNavigation(tab)}
          >
            {/* Contenedor ESTABLE - Siempre es View (no { flex: 0 }) */}
            <View
              style={[
                s.navIconWrapper,
                isMundial && s.navCenterBtn,
                isMundial && isActive && s.navCenterBtnActive,
              ]}
            >
              <Ionicons
                name={isActive ? (tab.iconActive as any) : (tab.icon as any)}
                size={isMundial ? 28 : 24}
                color={
                  isActive
                    ? isMundial
                      ? "#002b73"
                      : colors.primary
                    : isMundial
                      ? colors.textPrimary
                      : colors.textSecondary
                }
                style={!isMundial ? { opacity: isActive ? 1 : 0.6 } : {}}
              />
            </View>
            <Text style={[s.navLabel, isActive && s.navLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function getStyles(
  colors: ReturnType<
    typeof import("../context/ThemeContext").useTheme
  >["colors"],
) {
  return StyleSheet.create({
    bottomNav: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.background,
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      paddingVertical: 10,
      paddingBottom: 24,
      borderTopWidth: 0.5,
      borderTopColor: colors.borderMedium,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    navItem: { alignItems: "center", gap: 3, flex: 1 },
    navCenter: { alignItems: "center", marginTop: -22, flex: 1 },
    /**
     * 🔧 ESTABLE: Contenedor consistente que SIEMPRE existe
     * Sin cambios radicales de estructura para evitar removeChild errors
     */
    navIconWrapper: {
      width: "auto",
      height: "auto",
      alignItems: "center",
      justifyContent: "center",
      flex: 0,
    },
    navCenterBtn: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: colors.cardBackground,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 3,
      borderWidth: 3,
      borderColor: colors.background,
      boxShadow: `0 4px 8px ${colors.shadowColorBlue}`,
      elevation: 8,
    },
    navCenterBtnActive: {
      backgroundColor: colors.primary,
    },
    navLabel: {
      color: colors.textSecondary,
      fontSize: 9,
      fontWeight: "500",
      opacity: 0.6,
    },
    navLabelActive: {
      color: colors.primary,
      fontWeight: "700",
      opacity: 1,
    },
  });
}
