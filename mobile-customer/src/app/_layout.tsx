import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Provider, useDispatch, useSelector } from "react-redux";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { WorkSans_600SemiBold, WorkSans_700Bold } from "@expo-google-fonts/work-sans";
import { IBMPlexSans_400Regular, IBMPlexSans_500Medium } from "@expo-google-fonts/ibm-plex-sans";
import { store, type AppDispatch, type RootState } from "../store";
import { restoreSession } from "../authSlice";
import { colors } from "../theme";

function Routes() {
  const dispatch = useDispatch<AppDispatch>();
  const { token, ready } = useSelector((state: RootState) => state.auth);
  const [fontsLoaded] = useFonts({ WorkSans_600SemiBold, WorkSans_700Bold, IBMPlexSans_400Regular, IBMPlexSans_500Medium });

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  if (!ready || !fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!token}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
      </Stack.Protected>
      <Stack.Protected guard={!!token}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="provider/[id]"
          options={{ headerShown: true, title: "", headerShadowVisible: false, headerTintColor: colors.ink }}
        />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <StatusBar style="dark" />
      <Routes />
    </Provider>
  );
}
