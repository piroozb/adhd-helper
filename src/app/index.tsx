import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Bell,
  BookOpen,
  CheckSquare,
  Settings,
  Wind,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { JournalTab } from "../components/Journal";
import { MeditationTab } from "../components/Meditation";
import { RemindersTab } from "../components/Reminders";
import { SettingsTab } from "../components/Settings";
import { TodoTab } from "../components/Todo";
import { useAuth } from "../lib/auth";

type Tab = "todo" | "journal" | "reminders" | "meditation" | "settings";

const TABS: { id: Tab; label: string; icon: React.ReactNode; short: string }[] =
  [
    {
      id: "todo",
      label: "To-Do",
      icon: <CheckSquare size={20} />,
      short: "Tasks",
    },
    {
      id: "journal",
      label: "Journal",
      icon: <BookOpen size={20} />,
      short: "Journal",
    },
    {
      id: "reminders",
      label: "Reminders",
      icon: <Bell size={20} />,
      short: "Remind",
    },
    {
      id: "meditation",
      label: "Breathe",
      icon: <Wind size={20} />,
      short: "Breathe",
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings size={20} />,
      short: "Settings",
    },
  ];

const TAB_TITLES: Record<Tab, { title: string; subtitle: string }> = {
  todo: {
    title: "Your Tasks",
    subtitle: "One thing at a time is still progress.",
  },
  journal: {
    title: "Journal",
    subtitle: "A space to think, vent, or celebrate.",
  },
  reminders: {
    title: "Reminders",
    subtitle: "Gentle nudges so nothing gets lost.",
  },
  meditation: { title: "Breathe", subtitle: "Pause. Reset. Come back." },
  settings: {
    title: "Settings",
    subtitle: "Make this app work for your brain.",
  },
};

const GREETINGS = [
  "Hey, you're here. 👋",
  "Ready when you are.",
  "No rush. Just one step.",
  "You've got this. 💜",
];

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();
  {
    /* MARKER-MAKE-KIT-INVOKED */
  }
  const [tab, setTab] = useState<Tab>("todo");
  const insets = useSafeAreaInsets();
  const greeting = GREETINGS[new Date().getHours() % GREETINGS.length];
  const { title, subtitle } = TAB_TITLES[tab];

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Loading your workspace…</Text>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-background"
      style={[{ flex: 1, backgroundColor: "#f7f5f2", paddingTop: insets.top }]}
    >
      {/* Header */}
      <View
        className="px-5 pt-4 pb-4"
        style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}
      >
        <Text
          className="text-muted-foreground"
          style={{ color: "#7a7568", marginBottom: 4 }}
        >
          {greeting}
        </Text>
        <View>
          <Text
            className="text-foreground text-2xl font-medium"
            style={{ color: "#2d2a35", fontSize: 24, fontWeight: "500" }}
          >
            {title}
          </Text>
          <Text
            className="text-muted-foreground mt-1"
            style={{ color: "#7a7568", marginTop: 4 }}
          >
            {subtitle}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        className="flex-1"
      >
        {tab === "todo" && <TodoTab />}
        {tab === "journal" && <JournalTab />}
        {tab === "reminders" && <RemindersTab />}
        {tab === "meditation" && <MeditationTab />}
        {tab === "settings" && <SettingsTab />}
      </ScrollView>

      {/* Bottom nav */}
      <View className="absolute bottom-4 left-4 right-4 bg-card/90 rounded-xl border border-border">
        <View className="flex-row">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => setTab(t.id)}
                className="flex-1 items-center py-3"
              >
                <MaterialIcons
                  name={
                    t.id === "todo"
                      ? "check-box"
                      : t.id === "journal"
                        ? "book"
                        : t.id === "reminders"
                          ? "notifications"
                          : t.id === "meditation"
                            ? "spa"
                            : "settings"
                  }
                  size={20}
                  color={active ? "#7c6bae" : "#7a7568"}
                />
                <Text
                  className={`${active ? "text-primary" : "text-muted-foreground"} text-xs mt-1`}
                >
                  {t.short}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
