import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { useDispatch } from "react-redux";
import { signup } from "../api";
import { signIn } from "../authSlice";
import type { AppDispatch } from "../store";
import { Button, Field, Logo } from "../ui";
import { colors, fonts } from "../theme";

export default function Signup() {
  const dispatch = useDispatch<AppDispatch>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setError("");
    setLoading(true);
    try {
      const session = await signup({ name: name.trim(), email: email.trim(), phone: phone.trim(), password });
      await dispatch(signIn(session));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Logo />
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Book trusted local services in a few taps</Text>

        <Field label="Name" value={name} onChangeText={setName} autoCapitalize="words" placeholder="Enter your name" />
        <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="you@example.com" />
        <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Enter your phone" />
        <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Choose a password" />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Create account" onPress={handleSignup} loading={loading} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/login" style={styles.link}>
            Sign in
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingTop: 48 },
  title: { fontFamily: fonts.heading, fontSize: 28, color: colors.ink, marginTop: 32 },
  subtitle: { fontFamily: fonts.body, fontSize: 15, color: colors.inkMuted, marginTop: 6, marginBottom: 24 },
  error: { fontFamily: fonts.body, color: colors.dangerInk, marginBottom: 12 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  footerText: { fontFamily: fonts.body, color: colors.inkMuted },
  link: { fontFamily: fonts.bodyMedium, color: colors.ink, textDecorationLine: "underline" },
});
