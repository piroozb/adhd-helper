import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppDataProvider } from "../lib/app-data";
import { AuthProvider } from "../lib/auth";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppDataProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </AppDataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
