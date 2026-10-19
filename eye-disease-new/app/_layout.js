import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack
      screenOptions={{ 
        headerShown: false,
        animation: "fade",
      }}
    >
      <Stack.Screen name="splash" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="index" />
      <Stack.Screen name="register" />
      <Stack.Screen name="upload" />
      <Stack.Screen name="result" />
      <Stack.Screen name="history" />
      <Stack.Screen name="feedback" />
      <Stack.Screen name="admin-login" />
      <Stack.Screen name="admin-dashboard" />
    </Stack>
  );
}
