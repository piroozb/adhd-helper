import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAppData } from "../lib/app-data";

type Mood = "great" | "good" | "okay" | "low" | "rough";
type Entry = {
  id: string;
  date: string;
  mood: string;
  text: string;
  tags: string[];
};

const MOODS: { id: Mood; emoji: string; label: string; color: string }[] = [
  {
    id: "great",
    emoji: "😄",
    label: "Great",
    color: "bg-green-100 text-green-700 border-green-300",
  },
  {
    id: "good",
    emoji: "🙂",
    label: "Good",
    color: "bg-blue-100 text-blue-700 border-blue-300",
  },
  {
    id: "okay",
    emoji: "😐",
    label: "Okay",
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
  },
  {
    id: "low",
    emoji: "😔",
    label: "Low",
    color: "bg-orange-100 text-orange-700 border-orange-300",
  },
  {
    id: "rough",
    emoji: "😞",
    label: "Rough",
    color: "bg-red-100 text-red-700 border-red-300",
  },
];

const PROMPT_SUGGESTIONS = [
  "What's one thing I accomplished today, no matter how small?",
  "What distracted me most today, and what can I do differently?",
  "What helped me focus today?",
  "How is my energy level right now?",
  "What am I grateful for today?",
  "What do I need to let go of?",
];

export function JournalTab() {
  const { journalEntries, loading, saveJournalEntry, removeJournalEntry } =
    useAppData();
  const [writing, setWriting] = useState(false);
  const [mood, setMood] = useState<Mood>("good");
  const [text, setText] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [promptIdx, setPromptIdx] = useState(0);
  const [viewEntry, setViewEntry] = useState<Entry | null>(null);

  const addTag = () => {
    if (tagInput.trim()) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const save = async () => {
    if (!text.trim()) return;
    await saveJournalEntry({ mood, text, tags });
    setWriting(false);
    setText("");
    setTags([]);
    setMood("good");
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background py-10">
        <Text className="text-muted-foreground">Loading your journal…</Text>
      </View>
    );
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  return (
    <ScrollView className="flex-col gap-5">
      {!writing ? (
        <>
          <Pressable
            onPress={() => setWriting(true)}
            className="flex-row items-center gap-3 px-5 py-4 rounded-xl bg-primary"
          >
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text className="text-primary-foreground">New journal entry</Text>
          </Pressable>

          <View className="flex-col gap-3">
            {journalEntries.map((entry) => {
              const m = MOODS.find((mm) => mm.id === entry.mood)!;
              return (
                <Pressable
                  key={entry.id}
                  onPress={() => setViewEntry(entry)}
                  className="p-4 rounded-xl bg-card border border-border"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-muted-foreground">
                      {formatDate(entry.date)}
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <Text
                        className={`px-2 py-0.5 rounded-full border text-xs ${m.color}`}
                      >
                        {m.emoji} {m.label}
                      </Text>
                      <Pressable
                        onPress={() => removeJournalEntry(entry.id)}
                        className="rounded-full p-1 bg-secondary border border-border"
                      >
                        <MaterialIcons
                          name="delete"
                          size={16}
                          color="#ef4444"
                        />
                      </Pressable>
                    </View>
                  </View>
                  <Text className="text-foreground" numberOfLines={2}>
                    {entry.text}
                  </Text>
                  {entry.tags.length > 0 && (
                    <View className="flex-row gap-1 mt-2 flex-wrap">
                      {entry.tags.map((t) => (
                        <Text
                          key={t}
                          className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground"
                        >
                          #{t}
                        </Text>
                      ))}
                    </View>
                  )}
                </Pressable>
              );
            })}
            {journalEntries.length === 0 && (
              <View className="text-center py-12 items-center gap-3">
                <MaterialIcons
                  name="menu-book"
                  size={32}
                  style={{ opacity: 0.4 }}
                />
                <Text className="text-muted-foreground">
                  Your journal is empty. Start writing!
                </Text>
              </View>
            )}
          </View>
        </>
      ) : (
        <View className="flex-col gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-foreground text-lg font-medium">
              How are you feeling?
            </Text>
            <Pressable onPress={() => setWriting(false)}>
              <Text className="text-muted-foreground">Cancel</Text>
            </Pressable>
          </View>

          {/* Mood selector */}
          <View className="flex-row gap-2 flex-wrap">
            {MOODS.map((m) => (
              <Pressable
                key={m.id}
                onPress={() => setMood(m.id)}
                className={`px-3 py-2 rounded-xl border ${mood === m.id ? m.color : "bg-card border-border text-muted-foreground"}`}
              >
                <Text>
                  {m.emoji} {m.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Prompt suggestion */}
          <View className="p-3 rounded-xl bg-secondary border border-border">
            <Text className="text-muted-foreground italic">
              💭 {PROMPT_SUGGESTIONS[promptIdx]}
            </Text>
            <Pressable
              onPress={() =>
                setPromptIdx((promptIdx + 1) % PROMPT_SUGGESTIONS.length)
              }
            >
              <Text className="text-primary mt-1 text-sm">
                Try another prompt →
              </Text>
            </Pressable>
          </View>

          <TextInput
            multiline
            className="w-full rounded-xl px-4 py-3 bg-card border border-border text-foreground min-h-[160px]"
            placeholder="Write freely — no pressure, no judgment…"
            placeholderTextColor="#9ca3af"
            value={text}
            onChangeText={(t) => setText(t)}
          />

          {/* Tags */}
          <View className="flex-row flex-wrap gap-2 items-center">
            {tags.map((t) => (
              <View
                key={t}
                className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground flex-row items-center gap-1"
              >
                <Text className="text-muted-foreground">#{t}</Text>
                <Pressable onPress={() => removeTag(t)}>
                  <Text className="ml-2">×</Text>
                </Pressable>
              </View>
            ))}
            <TextInput
              className="flex-1 min-w-[120px] bg-transparent text-foreground"
              placeholder="Add tag, press Enter…"
              placeholderTextColor="#9ca3af"
              value={tagInput}
              onChangeText={(t) => setTagInput(t)}
              onSubmitEditing={addTag}
            />
          </View>

          <Pressable
            onPress={save}
            disabled={!text.trim()}
            className="px-5 py-3 rounded-xl bg-primary"
          >
            <Text className="text-primary-foreground">Save entry</Text>
          </Pressable>
        </View>
      )}

      {/* View entry modal */}
      <Modal
        visible={!!viewEntry}
        transparent
        animationType="fade"
        onRequestClose={() => setViewEntry(null)}
      >
        <Pressable
          onPress={() => setViewEntry(null)}
          className="flex-1 bg-black/40 items-center justify-center p-4"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-card rounded-2xl p-6 w-full max-h-[80%] border border-border"
          >
            {viewEntry && (
              <>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-muted-foreground">
                    {formatDate(viewEntry.date)}
                  </Text>
                  <Text
                    className={`px-2 py-0.5 rounded-full border text-xs ${MOODS.find((m) => m.id === viewEntry.mood)!.color}`}
                  >
                    {MOODS.find((m) => m.id === viewEntry.mood)!.emoji}{" "}
                    {MOODS.find((m) => m.id === viewEntry.mood)!.label}
                  </Text>
                </View>
                <Text className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {viewEntry.text}
                </Text>
                {viewEntry.tags.length > 0 && (
                  <View className="flex-row gap-1 mt-4 flex-wrap">
                    {viewEntry.tags.map((t) => (
                      <Text
                        key={t}
                        className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground"
                      >
                        #{t}
                      </Text>
                    ))}
                  </View>
                )}
                <View className="flex-row gap-2 mt-5">
                  <Pressable
                    onPress={() => removeJournalEntry(viewEntry.id)}
                    className="flex-1 py-3 rounded-xl bg-destructive items-center"
                  >
                    <Text className="text-primary-foreground text-center">
                      Delete entry
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setViewEntry(null)}
                    className="flex-1 py-3 rounded-xl bg-secondary items-center"
                  >
                    <Text className="text-foreground text-center">Close</Text>
                  </Pressable>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
