import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { useDispatch } from "react-redux";
import { login } from "../api";
import { signIn } from "../authSlice";
import type { AppDispatch } from "../store";
import { Button, Field, Logo } from "../ui";
import { colors, fonts } from "../theme";

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");
    setLoading(true);
    try {
      const session = await login({ email: email.trim(), password });
      if (session.user.role !== "customer") throw new Error("This app is for customers. Providers use the web dashboard.");
      await dispatch(signIn(session));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Logo />
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to book your next appointment</Text>

        <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="you@example.com" />
        <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Your password" />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Sign in" onPress={handleLogin} loading={loading} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>New here? </Text>
          <Link href="/signup" style={styles.link}>
            Create an account
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingTop: 48 },
  title: { fontFamily: fonts.heading, fontSize: 28, color: colors.ink, marginTop: 40 },
  subtitle: { fontFamily: fonts.body, fontSize: 15, color: colors.inkMuted, marginTop: 6, marginBottom: 28 },
  error: { fontFamily: fonts.body, color: colors.dangerInk, marginBottom: 12 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  footerText: { fontFamily: fonts.body, color: colors.inkMuted },
  link: { fontFamily: fonts.bodyMedium, color: colors.ink, textDecorationLine: "underline" },
});
