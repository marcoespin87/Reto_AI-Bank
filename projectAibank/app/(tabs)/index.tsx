import { View, Text, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';

export default function HomeScreen() {
  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#071325', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#d7e3fc', fontSize: 18, marginBottom: 24 }}>Home temporal</Text>
      <TouchableOpacity
        onPress={handleLogout}
        style={{ backgroundColor: '#b2c5ff', padding: 16, borderRadius: 12 }}
      >
        <Text style={{ color: '#002b73', fontWeight: '800' }}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}