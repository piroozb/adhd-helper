import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

type Priority = "high" | "medium" | "low";
type Todo = {
  id: string;
  text: string;
  done: boolean;
  priority: Priority;
  createdAt: Date;
};

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; dot: string }
> = {
  high: { label: "High", color: "text-red-500", dot: "bg-red-400" },
  medium: { label: "Medium", color: "text-amber-500", dot: "bg-amber-400" },
  low: { label: "Low", color: "text-green-500", dot: "bg-green-400" },
};

const initialTodos: Todo[] = [
  {
    id: "1",
    text: "Take a 5-minute break",
    done: false,
    priority: "high",
    createdAt: new Date(),
  },
  {
    id: "2",
    text: "Drink a glass of water",
    done: true,
    priority: "medium",
    createdAt: new Date(),
  },
  {
    id: "3",
    text: "Write in journal",
    done: false,
    priority: "low",
    createdAt: new Date(),
  },
];

export function TodoTab() {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");
  const [showCompleted, setShowCompleted] = useState(true);

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos([
      {
        id: Date.now().toString(),
        text: input.trim(),
        done: false,
        priority,
        createdAt: new Date(),
      },
      ...todos,
    ]);
    setInput("");
  };

  const toggle = (id: string) =>
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const remove = (id: string) => setTodos(todos.filter((t) => t.id !== id));

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  const active = filtered.filter((t) => !t.done);
  const done = filtered.filter((t) => t.done);

  return (
    <ScrollView className="flex-col gap-5">
      {/* Input row */}
      <View className="flex-row gap-2 mb-4 items-center">
        <TextInput
          className="flex-1 rounded-xl px-4 py-3 bg-card border border-border text-foreground"
          placeholder="What needs doing? Keep it small…"
          placeholderTextColor="#9ca3af"
          value={input}
          onChangeText={(t) => setInput(t)}
          onSubmitEditing={addTodo}
        />
        {/* Priority selector: cycle on press */}
        <Pressable
          onPress={() =>
            setPriority(
              priority === "high"
                ? "medium"
                : priority === "medium"
                  ? "low"
                  : "high",
            )
          }
          className="rounded-xl px-3 py-3 bg-card border border-border"
        >
          <Text>
            {priority === "high" ? "🔴" : priority === "medium" ? "🟡" : "🟢"}
          </Text>
        </Pressable>
        <Pressable
          onPress={addTodo}
          className="rounded-xl px-4 py-3 bg-primary"
        >
          <MaterialIcons name="add" size={18} color="#fff" />
        </Pressable>
      </View>

      {/* Filters */}
      <View className="flex-row gap-2 mb-2 items-center">
        {(["all", "active", "done"] as const).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full ${filter === f ? "bg-primary" : "bg-card"} border border-border`}
          >
            <Text className="capitalize">{f}</Text>
          </Pressable>
        ))}
        <Text className="ml-auto text-muted-foreground">
          {active.length} left
        </Text>
      </View>

      {/* Active todos */}
      <View className="flex-col gap-2">
        {active.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={toggle}
            onRemove={remove}
          />
        ))}
        {active.length === 0 && (
          <Text className="text-center text-muted-foreground py-6">
            Nothing active — you're doing great! 🎉
          </Text>
        )}
      </View>

      {/* Completed section */}
      {done.length > 0 && (
        <View>
          <Pressable
            onPress={() => setShowCompleted(!showCompleted)}
            className="flex-row items-center gap-2 mb-2"
          >
            {showCompleted ? (
              <MaterialIcons name="expand-less" size={16} />
            ) : (
              <MaterialIcons name="expand-more" size={16} />
            )}
            <Text className="text-muted-foreground">
              Completed ({done.length})
            </Text>
          </Pressable>
          {showCompleted && (
            <View className="flex-col gap-2">
              {done.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggle}
                  onRemove={remove}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function TodoItem({
  todo,
  onToggle,
  onRemove,
}: {
  todo: Todo;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const p = PRIORITY_CONFIG[todo.priority];
  return (
    <View
      className={`flex-row items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border ${todo.done ? "opacity-60" : ""}`}
    >
      <Pressable
        onPress={() => onToggle(todo.id)}
        className={`w-6 h-6 rounded-full border-2 items-center justify-center`}
      >
        {todo.done ? <MaterialIcons name="check" size={13} /> : null}
      </Pressable>
      <View className={`w-2 h-2 rounded-full ${p.dot}`} />
      <Text
        className={`flex-1 ${todo.done ? "line-through text-muted-foreground" : "text-foreground"}`}
      >
        {todo.text}
      </Text>
      <Text className={`text-xs ${p.color}`}>{p.label}</Text>
      <Pressable onPress={() => onRemove(todo.id)} className="ml-2">
        <MaterialIcons name="delete" size={15} />
      </Pressable>
    </View>
  );
}
