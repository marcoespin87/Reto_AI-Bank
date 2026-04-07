import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="banco" />
      <Tabs.Screen name="perfil" />
      <Tabs.Screen name="grupo" />
      <Tabs.Screen name="album" />
      <Tabs.Screen name="mundial" />
      <Tabs.Screen name="premios" />
    </Tabs>
  );
}