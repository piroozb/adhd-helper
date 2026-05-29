import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

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

const initialReminders: Reminder[] = [
  {
    id: "1",
    title: "Take medication",
    time: "08:00",
    recurrence: "daily",
    active: true,
    category: "💊 Medication",
  },
  {
    id: "2",
    title: "Drink water",
    time: "10:00",
    recurrence: "daily",
    active: true,
    category: "💧 Hydration",
  },
  {
    id: "3",
    title: "5-minute stretch break",
    time: "14:00",
    recurrence: "weekdays",
    active: true,
    category: "🏃 Movement",
  },
  {
    id: "4",
    title: "Wind-down routine",
    time: "21:30",
    recurrence: "daily",
    active: false,
    category: "😴 Sleep",
  },
];

const RECURRENCE_LABELS: Record<Recurrence, string> = {
  once: "Once",
  daily: "Every day",
  weekdays: "Weekdays",
  weekends: "Weekends",
};

export function RemindersTab() {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [recurrence, setRecurrence] = useState<Recurrence>("daily");
  const [category, setCategory] = useState(CATEGORIES[0]);

  const save = () => {
    if (!title.trim()) return;
    setReminders([
      {
        id: Date.now().toString(),
        title,
        time,
        recurrence,
        active: true,
        category,
      },
      ...reminders,
    ]);
    setAdding(false);
    setTitle("");
    setTime("09:00");
    setRecurrence("daily");
  };

  const toggle = (id: string) =>
    setReminders(
      reminders.map((r) => (r.id === id ? { ...r, active: !r.active } : r)),
    );

  const remove = (id: string) =>
    setReminders(reminders.filter((r) => r.id !== id));

  const sorted = [...reminders].sort((a, b) => a.time.localeCompare(b.time));

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
            <Pressable
              onPress={() => toggle(r.id)}
              className={`w-10 h-6 rounded-full ${r.active ? "bg-primary" : "bg-muted"} justify-center`}
            >
              <View
                className={`w-4 h-4 rounded-full bg-white ${r.active ? "ml-6" : "ml-1"}`}
              />
            </Pressable>
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
            <Pressable onPress={() => remove(r.id)} className="opacity-0">
              <MaterialIcons name="delete" size={15} />
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
