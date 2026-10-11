import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts } from "../../theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const tabs: { name: string; title: string; icon: IconName }[] = [
  { name: "index", title: "Home", icon: "home-outline" },
  { name: "bookings", title: "Bookings", icon: "calendar-outline" },
  { name: "account", title: "Account", icon: "person-outline" },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 12 },
        tabBarStyle: { borderTopColor: colors.line, backgroundColor: colors.background },
      }}
    >
      {tabs.map(({ name, title, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{ title, tabBarIcon: ({ color, size }) => <Ionicons name={icon} size={size} color={color} /> }}
        />
      ))}
    </Tabs>
  );
}
