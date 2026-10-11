import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors, fonts } from "./theme";

export function Logo({ size = 32 }: { size?: number }) {
  return <Text style={{ fontFamily: fonts.logo, fontSize: size, color: colors.ink }}>QuickServe</Text>;
}

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "solid" | "outline" | "danger";
  loading?: boolean;
}

export function Button({ title, onPress, variant = "solid", loading }: ButtonProps) {
  const danger = variant === "danger";
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={[styles.button, buttonStyles[variant], loading && { opacity: 0.6 }]}
    >
      {loading ? (
        <ActivityIndicator color={danger ? "#FFFFFF" : colors.ink} />
      ) : (
        <Text style={[styles.buttonText, danger && { color: "#FFFFFF" }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.inkFaint} autoCapitalize="none" style={styles.input} {...props} />
    </View>
  );
}

const badgeColors = {
  confirmed: { bg: colors.primarySoft, text: colors.ink },
  completed: { bg: colors.chip, text: colors.inkMuted },
  cancelled: { bg: colors.dangerSoft, text: colors.dangerInk },
};

export function StatusBadge({ status }: { status: keyof typeof badgeColors }) {
  const { bg, text } = badgeColors[status];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: text }]}>{status}</Text>
    </View>
  );
}

export function formatSlot(date: string, start: string, end: string) {
  const day = new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return `${day} · ${start}–${end}`;
}

export function confirm(message: string): Promise<boolean> {
  if (Platform.OS === "web") return Promise.resolve(window.confirm(message));
  return new Promise((resolve) =>
    Alert.alert("Are you sure?", message, [
      { text: "No", style: "cancel", onPress: () => resolve(false) },
      { text: "Yes", onPress: () => resolve(true) },
    ])
  );
}

const buttonStyles = StyleSheet.create({
  solid: { backgroundColor: colors.primary },
  outline: { borderWidth: 1.5, borderColor: colors.primary },
  danger: { backgroundColor: colors.dangerInk },
});

const styles = StyleSheet.create({
  button: { height: 52, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  buttonText: { fontFamily: fonts.headingMedium, fontSize: 16, color: colors.ink },
  label: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink, marginBottom: 6 },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
  },
  badge: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontFamily: fonts.bodyMedium, fontSize: 12, textTransform: "capitalize" },
});
