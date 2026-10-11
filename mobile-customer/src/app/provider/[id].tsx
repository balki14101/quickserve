import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { bookSlot, getProvider, getSlots, type Provider, type Service, type Slot } from "../../api";
import type { RootState } from "../../store";
import { Button, formatSlot } from "../../ui";
import { colors, fonts } from "../../theme";

export default function ProviderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.token)!;
  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [slotId, setSlotId] = useState("");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [detail, open] = await Promise.all([getProvider(id), getSlots(id)]);
      setProvider(detail.provider);
      setServices(detail.services);
      setSlots(open.slots);
      setServiceId((current) => current || detail.services[0]?._id || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load this provider");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleBook() {
    if (!slotId) return setError("Pick a time slot first");
    setError("");
    setBooking(true);
    try {
      await bookSlot(token, slotId);
      router.navigate("/bookings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not book this slot");
      setSlotId("");
      load();
    } finally {
      setBooking(false);
    }
  }

  if (loading) return <ActivityIndicator color={colors.primary} style={{ marginTop: 80 }} />;
  if (!provider) return <Text style={[styles.hint, { margin: 24 }]}>{error}</Text>;

  const serviceSlots = slots.filter((s) => s.serviceId === serviceId);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.tile}>
        <Text style={styles.tileText}>{provider.businessName[0]}</Text>
      </View>
      <Text style={styles.name}>{provider.businessName}</Text>
      <Text style={styles.category}>{provider.category}</Text>
      <Text style={styles.description}>{provider.description}</Text>

      <Text style={styles.section}>Choose a service</Text>
      {services.map((s) => (
        <Pressable
          key={s._id}
          onPress={() => {
            setServiceId(s._id);
            setSlotId("");
          }}
          style={[styles.option, s._id === serviceId && styles.optionActive]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.optionTitle}>{s.name}</Text>
            <Text style={styles.optionMeta}>{s.durationMinutes} min</Text>
          </View>
          <Text style={styles.optionTitle}>₹{s.price}</Text>
        </Pressable>
      ))}

      <Text style={styles.section}>Pick a time</Text>
      {serviceSlots.length === 0 && <Text style={styles.hint}>No open slots for this service right now.</Text>}
      <View style={styles.slots}>
        {serviceSlots.map((s) => (
          <Pressable
            key={s._id}
            onPress={() => setSlotId(s._id)}
            style={[styles.slot, s._id === slotId && styles.slotActive]}
          >
            <Text style={styles.slotText}>{formatSlot(s.date, s.startTime, s.endTime)}</Text>
          </Pressable>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={{ marginTop: 24 }}>
        <Button title="Book appointment" onPress={handleBook} loading={booking} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  tile: { width: 88, height: 88, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  tileText: { fontFamily: fonts.heading, fontSize: 36, color: colors.primary },
  name: { fontFamily: fonts.heading, fontSize: 24, color: colors.ink, marginTop: 16 },
  category: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.primary, marginTop: 2, textTransform: "capitalize" },
  description: { fontFamily: fonts.body, fontSize: 15, color: colors.inkMuted, marginTop: 8, lineHeight: 22 },
  section: { fontFamily: fonts.headingMedium, fontSize: 17, color: colors.ink, marginTop: 28, marginBottom: 12 },
  option: { flexDirection: "row", alignItems: "center", padding: 14, borderWidth: 1, borderColor: colors.line, borderRadius: 14, marginBottom: 10 },
  optionActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  optionTitle: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.ink },
  optionMeta: { fontFamily: fonts.body, fontSize: 13, color: colors.inkMuted, marginTop: 2 },
  slots: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  slot: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: colors.line },
  slotActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  slotText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink },
  hint: { fontFamily: fonts.body, fontSize: 14, color: colors.inkMuted },
  error: { fontFamily: fonts.body, color: colors.dangerInk, marginTop: 16 },
});
