import { MaterialIcons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";

type TabConfig = {
  name: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

const TABS: TabConfig[] = [
  { name: "Inicio", label: "Inicio", icon: "home" },
  { name: "Banco", label: "Banco", icon: "account-balance" },
  { name: "Mundial", label: "Mundial", icon: "sports-soccer" },
  { name: "Grupo", label: "Grupo", icon: "group" },
  { name: "Perfil", label: "Perfil", icon: "account-circle" },
];

export default function CustomTabBar({
  state,
  navigation,
  descriptors,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  // Obtiene la ruta actual del tab activo
  const currentTabRoute = state.routes[state.index];

  // Verifica si el tab actual es "Mundial" y si hay un state anidado
  const isMundialTab = currentTabRoute.name === "Mundial";

  // Si estamos en el stack de Mundial, accede a la ruta interna del stack
  let currentRouteInStack = currentTabRoute.name;
  if (isMundialTab && currentTabRoute.state) {
    const lastRouteInStack =
      currentTabRoute.state.routes[currentTabRoute.state.routes.length - 1];
    currentRouteInStack = lastRouteInStack?.name || currentTabRoute.name;
  }

  // Si estamos en PrediccionScreen, no mostrar la barra
  if (currentRouteInStack === "Prediccion") {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.surface, { paddingBottom: insets.bottom || 16 }]}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      </View>
      <View style={[styles.inner, { paddingBottom: insets.bottom || 16 }]}>
        {TABS.map((tab, index) => {
          const isFocused = state.index === index;
          const isMundial = tab.name === "Mundial";

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: state.routes[index].key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(state.routes[index].name);
            }
          };

          if (isMundial) {
            return (
              <TouchableOpacity
                key={tab.name}
                onPress={onPress}
                style={styles.mundialWrapper}
                activeOpacity={0.8}
              >
                <View style={styles.mundialGlow} />
                <LinearGradient
                  colors={[colors.primary, colors.primaryContainer]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.mundialButton}
                >
                  <MaterialIcons
                    name="sports-soccer"
                    size={30}
                    color={colors.onPrimary}
                  />
                </LinearGradient>
                <Text
                  style={[
                    styles.mundialLabel,
                    isFocused && { color: colors.primary },
                  ]}
                >
                  Mundial
                </Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={onPress}
              style={styles.tab}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name={tab.icon}
                size={24}
                color={isFocused ? colors.primary : `${colors.onSurface}99`}
              />
              <Text
                style={[
                  styles.label,
                  {
                    color: isFocused ? colors.primary : `${colors.onSurface}99`,
                  },
                  isFocused && styles.labelActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "visible",
    zIndex: 999,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 20,
  },
  surface: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: `${colors.surface}CC`,
  },
  inner: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 12,
    zIndex: 2,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
  },
  labelActive: {
    fontWeight: "700",
  },
  mundialWrapper: {
    flex: 1,
    alignItems: "center",
    marginTop: -36,
    zIndex: 3,
  },
  mundialGlow: {
    position: "absolute",
    top: 0,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.primary}33`,
    transform: [{ scale: 1.5 }],
  },
  mundialButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: colors.surface,
    elevation: 10,
    zIndex: 4,
  },
  mundialLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 6,
  },
});
