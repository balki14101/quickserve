import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { useSelector } from "react-redux";
import { cancelBooking, getMyBookings, type Booking } from "../../api";
import type { RootState } from "../../store";
import { Button, StatusBadge, confirm, formatSlot } from "../../ui";
import { colors, fonts } from "../../theme";

export default function Bookings() {
  const token = useSelector((state: RootState) => state.auth.token)!;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const { bookings } = await getMyBookings(token);
      setBookings(bookings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load bookings");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleCancel(bookingId: string) {
    if (!(await confirm("Cancel this appointment?"))) return;
    setCancellingId(bookingId);
    setError("");
    try {
      await cancelBooking(token, bookingId);
      setBookings((prev) => prev.map((b) => (b._id === bookingId ? { ...b, status: "cancelled" } : b)));
    } catch (err) {
      await load();
      setError(err instanceof Error ? err.message : "Could not cancel booking");
    } finally {
      setCancellingId("");
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <FlatList
        data={bookings}
        keyExtractor={(b) => b._id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>My bookings</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <Text style={styles.empty}>No bookings yet. Pick a provider on Home to book your first appointment.</Text>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.name}>{item.providerId.businessName}</Text>
              <StatusBadge status={item.status} />
            </View>
            <Text style={styles.service}>
              {item.serviceId.name} · ₹{item.serviceId.price}
            </Text>
            <Text style={styles.when}>{formatSlot(item.slotId.date, item.slotId.startTime, item.slotId.endTime)}</Text>
            {item.status === "confirmed" && (
              <View style={{ marginTop: 14 }}>
                <Button
                  title="Cancel booking"
                  variant="outline"
                  loading={cancellingId === item._id}
                  onPress={() => handleCancel(item._id)}
                />
              </View>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 32 },
  title: { fontFamily: fonts.heading, fontSize: 26, color: colors.ink, marginBottom: 16 },
  error: { fontFamily: fonts.body, color: colors.dangerInk, marginBottom: 12 },
  empty: { fontFamily: fonts.body, fontSize: 14, color: colors.inkMuted, textAlign: "center", marginTop: 40 },
  card: { padding: 16, borderWidth: 1, borderColor: colors.line, borderRadius: 16, marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  name: { fontFamily: fonts.headingMedium, fontSize: 16, color: colors.ink, flex: 1 },
  service: { fontFamily: fonts.body, fontSize: 14, color: colors.inkMuted, marginTop: 8 },
  when: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink, marginTop: 4 },
});
