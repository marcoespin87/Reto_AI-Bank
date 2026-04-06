import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CustomTabBar from "../components/CustomTabBar";
import BancoScreen from "../screens/BancoScreen";
import GrupoScreen from "../screens/GrupoScreen";
import HomeScreen from "../screens/HomeScreen";
import MundialScreen from "../screens/MundialScreen";
import PerfilScreen from "../screens/PerfilScreen";
import PrediccionScreen from "../screens/PrediccionScreen";

export type MundialStackParamList = {
  MundialHub: undefined;
  Prediccion: undefined;
};

const Tab = createBottomTabNavigator();
const MundialStack = createNativeStackNavigator<MundialStackParamList>();

function MundialStackNavigator() {
  return (
    <MundialStack.Navigator screenOptions={{ headerShown: false }}>
      <MundialStack.Screen name="MundialHub" component={MundialScreen} />
      <MundialStack.Screen name="Prediccion" component={PrediccionScreen} />
    </MundialStack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Banco" component={BancoScreen} />
      <Tab.Screen name="Mundial" component={MundialStackNavigator} />
      <Tab.Screen name="Grupo" component={GrupoScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}
