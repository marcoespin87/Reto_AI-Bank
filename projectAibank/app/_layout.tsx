import * as Linking from "expo-linking";
import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { ThemeProvider } from "../context/ThemeContext";
import { supabase } from "../lib/supabase";
import { TutorialProvider } from '../context/TutorialContext';

export default function RootLayout() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/login");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/login");
      }
    });

    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      const params: Record<string, string> = {};

      const hashPart = url.split("#")[1];
      if (hashPart) {
        hashPart.split("&").forEach((part) => {
          const [key, value] = part.split("=");
          if (key && value) params[key] = decodeURIComponent(value);
        });
      }

      if (params.access_token && params.refresh_token) {
        await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
      }
    };

    const linkingSub = Linking.addEventListener("url", handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      subscription.unsubscribe();
      linkingSub.remove();
    };
  }, []);

  return (
    <ThemeProvider>
      <TutorialProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      </TutorialProvider>
    </ThemeProvider>
  );
}
