import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useAppData } from "../lib/app-data";
import { AnimatedToggle } from "./ui/animated-toggle";

type Recurrence = "once" | "daily" | "weekdays" | "weekends";
type Reminder = {
  id: string;
  title: string;
  time: string;
  recurrence: Recurrence;
  active: boolean;
  category: string;
};

const CATEGORIES = [
  "💊 Medication",
  "💧 Hydration",
  "🏃 Movement",
  "🧘 Mindfulness",
  "📚 Study",
  "🍎 Nutrition",
  "😴 Sleep",
  "📋 Task",
];

const RECURRENCE_LABELS: Record<Recurrence, string> = {
  once: "Once",
  daily: "Every day",
  weekdays: "Weekdays",
  weekends: "Weekends",
};

export function RemindersTab() {
  const {
    reminders,
    loading,
    addReminder,
    toggleReminder,
    removeReminder,
    settings,
  } = useAppData();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [recurrence, setRecurrence] = useState<Recurrence>("daily");
  const [category, setCategory] = useState(CATEGORIES[0]);

  const save = async () => {
    if (!title.trim()) return;
    await addReminder({ title, time, recurrence, category });
    setAdding(false);
    setTitle("");
    setTime("09:00");
    setRecurrence("daily");
  };

  const accentColor =
    {
      lavender: "#7c6bae",
      sage: "#6a9c64",
      sky: "#4a90b8",
      rose: "#b8556a",
      amber: "#b87c3a",
    }[settings.accentColor] ?? "#7c6bae";

  const toggle = async (id: string) => {
    await toggleReminder(id);
  };

  const remove = async (id: string) => {
    await removeReminder(id);
  };

  const sorted = [...reminders].sort((a, b) => a.time.localeCompare(b.time));

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background py-10">
        <Text className="text-muted-foreground">Loading your reminders…</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-col gap-5">
      <Pressable
        onPress={() => setAdding(true)}
        className="flex-row items-center gap-3 px-5 py-4 rounded-xl bg-primary"
      >
        <MaterialIcons name="add" size={20} color="#fff" />
        <Text className="text-primary-foreground">New reminder</Text>
      </Pressable>

      {/* Add form */}
      {adding && (
        <View className="p-4 rounded-xl bg-card border border-border flex-col gap-3">
          <Text className="text-foreground text-lg">New reminder</Text>
          <TextInput
            className="w-full rounded-xl px-4 py-3 bg-input-background border border-border text-foreground"
            placeholder="Reminder title…"
            placeholderTextColor="#9ca3af"
            value={title}
            onChangeText={(t) => setTitle(t)}
            onSubmitEditing={save}
          />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-muted-foreground">Time</Text>
              <TextInput
                className="rounded-xl px-4 py-3 bg-input-background border border-border text-foreground"
                placeholder="09:00"
                value={time}
                onChangeText={(t) => setTime(t)}
              />
            </View>
            <View className="flex-1">
              <Text className="text-muted-foreground">Repeat</Text>
              <View className="rounded-xl px-4 py-3 bg-input-background border border-border">
                {(Object.keys(RECURRENCE_LABELS) as Recurrence[]).map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => setRecurrence(r)}
                    className="py-1"
                  >
                    <Text
                      className={`${recurrence === r ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {RECURRENCE_LABELS[r]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
          <View>
            <Text className="text-muted-foreground">Category</Text>
            <View className="flex-row flex-wrap gap-2 mt-2">
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-full ${category === c ? "bg-primary" : "bg-card"} border border-border`}
                >
                  <Text
                    className={`${category === c ? "text-primary-foreground" : "text-muted-foreground"}`}
                  >
                    {c}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View className="flex-row gap-2 mt-3">
            <Pressable
              onPress={save}
              className="flex-1 py-3 rounded-xl bg-primary items-center"
            >
              <Text className="text-primary-foreground">Add reminder</Text>
            </Pressable>
            <Pressable
              onPress={() => setAdding(false)}
              className="flex-1 py-3 rounded-xl bg-secondary items-center"
            >
              <Text className="text-foreground">Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Reminders list */}
      <View className="flex-col gap-2">
        {sorted.map((r) => (
          <View
            key={r.id}
            className={`flex-row items-center gap-3 px-4 py-3 rounded-xl bg-card border ${r.active ? "" : "opacity-50"}`}
          >
            <AnimatedToggle
              checked={r.active}
              onChange={() => toggle(r.id)}
              activeColor={accentColor}
            />
            <View className="flex-1">
              <Text
                className={`${r.active ? "text-foreground" : "text-muted-foreground"}`}
              >
                {r.title}
              </Text>
              <View className="flex-row items-center gap-2 mt-1">
                <Text className="text-xs text-muted-foreground">
                  {r.category}
                </Text>
                <Text className="text-muted-foreground">·</Text>
                <View className="flex-row items-center gap-1">
                  <MaterialIcons name="schedule" size={11} />
                  <Text className="text-xs text-muted-foreground">
                    {r.time}
                  </Text>
                </View>
                <Text className="text-muted-foreground">·</Text>
                <Text className="text-xs text-muted-foreground">
                  {RECURRENCE_LABELS[r.recurrence]}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => remove(r.id)}
              className="rounded-full p-2 bg-secondary border border-border"
            >
              <MaterialIcons name="delete" size={16} color="#ef4444" />
            </Pressable>
          </View>
        ))}

        {reminders.length === 0 && (
          <View className="text-center py-12 items-center gap-3">
            <MaterialIcons
              name="notifications"
              size={32}
              style={{ opacity: 0.4 }}
            />
            <Text className="text-muted-foreground">
              No reminders yet. Add one to get started!
            </Text>
          </View>
        )}
      </View>

      {/* Tip */}
      <View className="p-4 rounded-xl bg-secondary border border-border">
        <Text className="text-muted-foreground text-sm">
          💡 <Text className="text-foreground font-medium">Remember:</Text> Set
          reminders for transitions, not just tasks. Reminders 5 minutes before
          an activity can help you mentally prepare.
        </Text>
      </View>
    </ScrollView>
  );
}
