import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { signOut } from "../../authSlice";
import type { AppDispatch, RootState } from "../../store";
import { Button } from "../../ui";
import { colors, fonts } from "../../theme";

export default function Account() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name[0]}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.detail}>{user?.email}</Text>
        <Text style={styles.detail}>{user?.phone}</Text>
        <View style={{ width: "100%", marginTop: 32 }}>
          <Button title="Log out" variant="outline" onPress={() => dispatch(signOut())} />
        </View>
      </View>
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
});
