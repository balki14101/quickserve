import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { getProviders, type Provider } from "../../api";
import type { RootState } from "../../store";
import { Button } from "../../ui";
import { colors, fonts } from "../../theme";

export default function Home() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const { providers } = await getProviders();
      setProviders(providers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load providers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categories = ["All", ...new Set(providers.map((p) => p.category))];
  const visible = category === "All" ? providers : providers.filter((p) => p.category === category);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <FlatList
        data={visible}
        keyExtractor={(p) => p._id}
        contentContainerStyle={styles.content}
        refreshing={loading && providers.length > 0}
        onRefresh={load}
        ListHeaderComponent={
          <View>
            <Text style={styles.greeting}>Hi, {user?.name.split(" ")[0]}</Text>
            <Text style={styles.subtitle}>Find your next appointment</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
              {categories.map((c) => (
                <Pressable key={c} onPress={() => setCategory(c)} style={[styles.chip, c === category && styles.chipActive]}>
                  <Text style={[styles.chipText, c === category && { color: colors.ink }]}>{c}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.hint}>Loading providers. The first load can take up to a minute.</Text>
            </View>
          ) : error ? (
            <View style={styles.center}>
              <Text style={styles.hint}>{error}</Text>
              <Button title="Try again" onPress={load} variant="outline" />
            </View>
          ) : (
            <Text style={styles.hint}>No providers in this category yet.</Text>
          )
        }
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/provider/${item._id}`)}>
            <View style={styles.tile}>
              <Text style={styles.tileText}>{item.businessName[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.businessName}</Text>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 32 },
  greeting: { fontFamily: fonts.heading, fontSize: 26, color: colors.ink },
  subtitle: { fontFamily: fonts.body, fontSize: 15, color: colors.inkMuted, marginTop: 4 },
  chips: { marginVertical: 20 },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999, backgroundColor: colors.chip, marginRight: 8 },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.inkMuted, textTransform: "capitalize" },
  card: {
    flexDirection: "row",
    gap: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    marginBottom: 12,
  },
  tile: { width: 64, height: 64, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  tileText: { fontFamily: fonts.heading, fontSize: 26, color: colors.primary },
  name: { fontFamily: fonts.headingMedium, fontSize: 16, color: colors.ink },
  category: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.primary, marginTop: 2, textTransform: "capitalize" },
  description: { fontFamily: fonts.body, fontSize: 13, color: colors.inkMuted, marginTop: 4 },
  center: { alignItems: "center", gap: 12, paddingVertical: 40 },
  hint: { fontFamily: fonts.body, fontSize: 14, color: colors.inkMuted, textAlign: "center" },
});
