import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { deleteAccount } from "../../api";
import { signOut } from "../../authSlice";
import type { AppDispatch, RootState } from "../../store";
import { Button, Field } from "../../ui";
import { colors, fonts } from "../../theme";

export default function Account() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token)!;
  const [deleting, setDeleting] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setError("");
    setLoading(true);
    try {
      await deleteAccount(token, password);
      await dispatch(signOut());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete your account");
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name[0]}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.detail}>{user?.email}</Text>
        <Text style={styles.detail}>{user?.phone}</Text>

        <View style={styles.block}>
          <Button title="Log out" variant="outline" onPress={() => dispatch(signOut())} />
        </View>

        <View style={styles.danger}>
          {deleting ? (
            <>
              <Text style={styles.warning}>
                This permanently deletes your account and all your bookings. Upcoming appointments are cancelled.
              </Text>
              <Field label="Confirm your password" value={password} onChangeText={setPassword} secureTextEntry />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button title="Delete my account" variant="danger" onPress={handleDelete} loading={loading} />
              <View style={{ marginTop: 12 }}>
                <Button
                  title="Keep my account"
                  variant="outline"
                  onPress={() => {
                    setDeleting(false);
                    setPassword("");
                    setError("");
                  }}
                />
              </View>
            </>
          ) : (
            <Text style={styles.deleteLink} onPress={() => setDeleting(true)}>
              Delete account
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { alignItems: "center", padding: 24, paddingTop: 48 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: fonts.heading, fontSize: 34, color: colors.primary },
  name: { fontFamily: fonts.heading, fontSize: 22, color: colors.ink, marginTop: 16 },
  detail: { fontFamily: fonts.body, fontSize: 15, color: colors.inkMuted, marginTop: 4 },
  block: { width: "100%", marginTop: 32 },
  danger: { width: "100%", marginTop: 48, paddingTop: 24, borderTopWidth: 1, borderTopColor: colors.line },
  warning: { fontFamily: fonts.body, fontSize: 14, color: colors.inkMuted, lineHeight: 21, marginBottom: 16 },
  error: { fontFamily: fonts.body, color: colors.dangerInk, marginBottom: 12 },
  deleteLink: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.dangerInk, textAlign: "center", textDecorationLine: "underline" },
});
