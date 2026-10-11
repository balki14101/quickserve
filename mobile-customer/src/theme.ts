import { Platform } from "react-native";

export const colors = {
  primary: "#FFB800",
  primarySoft: "#FFF6DE",
  ink: "#111111",
  inkMuted: "#6B6B6B",
  inkFaint: "#9A9A9A",
  line: "#E8E8E8",
  chip: "#F3F3F3",
  background: "#FFFFFF",
  dangerSoft: "#FFE0E0",
  dangerInk: "#B42318",
};

export const fonts = {
  heading: "WorkSans_700Bold",
  headingMedium: "WorkSans_600SemiBold",
  body: "IBMPlexSans_400Regular",
  bodyMedium: "IBMPlexSans_500Medium",
  logo: Platform.select({ ios: "Georgia", default: "serif" }),
};
