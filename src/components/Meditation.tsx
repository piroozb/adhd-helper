import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Brain, Heart, Sparkles, Wind } from "lucide-react-native";

type Exercise = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: number; // seconds
  color: string;
  type: "breathing" | "grounding" | "body-scan" | "focus";
  instructions: string[];
};

const EXERCISES: Exercise[] = [
  {
    id: "box",
    title: "Box Breathing",
    description: "4-4-4-4 pattern to calm an overwhelmed nervous system",
    icon: <Wind size={22} />,
    duration: 64,
    color: "from-blue-400/20 to-purple-400/20",
    type: "breathing",
    instructions: [
      "Inhale for 4 counts",
      "Hold for 4 counts",
      "Exhale for 4 counts",
      "Hold for 4 counts",
    ],
  },
  {
    id: "478",
    title: "4-7-8 Breathing",
    description: "Deep relaxation to reduce anxiety and aid focus",
    icon: <Wind size={22} />,
    duration: 76,
    color: "from-green-400/20 to-teal-400/20",
    type: "breathing",
    instructions: [
      "Inhale for 4 counts",
      "Hold for 7 counts",
      "Exhale for 8 counts",
    ],
  },
  {
    id: "54321",
    title: "5-4-3-2-1 Grounding",
    description: "Anchor yourself in the present moment",
    icon: <Brain size={22} />,
    duration: 120,
    color: "from-amber-400/20 to-orange-400/20",
    type: "grounding",
    instructions: [
      "Name 5 things you can see",
      "Name 4 things you can touch",
      "Name 3 things you can hear",
      "Name 2 things you can smell",
      "Name 1 thing you can taste",
    ],
  },
  {
    id: "body-scan",
    title: "Quick Body Scan",
    description: "Release tension you might not know you're holding",
    icon: <Heart size={22} />,
    duration: 90,
    color: "from-pink-400/20 to-rose-400/20",
    type: "body-scan",
    instructions: [
      "Relax your forehead and jaw",
      "Drop your shoulders down",
      "Unclench your hands",
      "Notice your breath",
      "Feel your feet on the floor",
    ],
  },
  {
    id: "focus",
    title: "Focus Prep",
    description: "2-minute ritual to prime your brain for deep work",
    icon: <Sparkles size={22} />,
    duration: 120,
    color: "from-violet-400/20 to-indigo-400/20",
    type: "focus",
    instructions: [
      "Close your eyes and breathe deeply",
      "Set your intention for the next task",
      "Visualize completing it successfully",
      "Take 3 energizing breaths",
      "Open your eyes — you're ready",
    ],
  },
];

type BreathPhase = "inhale" | "hold-in" | "exhale" | "hold-out";

const BOX_PHASES: { phase: BreathPhase; duration: number; label: string }[] = [
  { phase: "inhale", duration: 4, label: "Inhale" },
  { phase: "hold-in", duration: 4, label: "Hold" },
  { phase: "exhale", duration: 4, label: "Exhale" },
  { phase: "hold-out", duration: 4, label: "Hold" },
];

const FOUR78_PHASES: { phase: BreathPhase; duration: number; label: string }[] =
  [
    { phase: "inhale", duration: 4, label: "Inhale" },
    { phase: "hold-in", duration: 7, label: "Hold" },
    { phase: "exhale", duration: 8, label: "Exhale" },
  ];

export function MeditationTab() {
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [phaseElapsed, setPhaseElapsed] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phases =
    selected?.id === "box"
      ? BOX_PHASES
      : selected?.id === "478"
        ? FOUR78_PHASES
        : null;

  useEffect(() => {
    if (!running || !selected) return;
    intervalRef.current = setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= selected.duration) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          return selected.duration;
        }
        return e + 1;
      });
      if (phases) {
        setPhaseElapsed((pe) => {
          const cur = phases[phaseIdx];
          if (pe + 1 >= cur.duration) {
            setPhaseIdx((pi) => (pi + 1) % phases.length);
            return 0;
          }
          return pe + 1;
        });
      } else {
        // Step through instructions
        setPhaseElapsed((pe) => {
          const stepDuration = selected.duration / selected.instructions.length;
          if (pe + 1 >= stepDuration) {
            setStepIdx((si) =>
              Math.min(si + 1, selected.instructions.length - 1),
            );
            return 0;
          }
          return pe + 1;
        });
      }
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [running, phaseIdx, selected, phases]);

  const reset = () => {
    clearInterval(intervalRef.current!);
    setRunning(false);
    setElapsed(0);
    setPhaseIdx(0);
    setPhaseElapsed(0);
    setStepIdx(0);
  };

  const progress = selected ? elapsed / selected.duration : 0;
  const currentPhase = phases ? phases[phaseIdx] : null;

  return (
    <ScrollView className="flex-col gap-5">
      {!selected ? (
        <View className="flex-col gap-3">
          <Text className="text-muted-foreground">
            Short, evidence-based exercises designed for ADHD minds. Pick one
            and try it now.
          </Text>
          {EXERCISES.map((ex) => (
            <Pressable
              key={ex.id}
              onPress={() => {
                setSelected(ex);
                reset();
              }}
              className={`flex-row items-start gap-4 p-4 rounded-xl border border-border`}
            >
              <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center flex-shrink-0 mt-0.5">
                <MaterialIcons
                  name={
                    ex.id === "box" || ex.id === "478"
                      ? "spa"
                      : ex.id === "54321"
                        ? "psychology"
                        : ex.id === "body-scan"
                          ? "favorite"
                          : "stars"
                  }
                  size={22}
                />
              </View>
              <View className="flex-1">
                <Text className="text-foreground">{ex.title}</Text>
                <Text className="text-muted-foreground text-sm mt-1">
                  {ex.description}
                </Text>
                <Text className="text-muted-foreground text-xs mt-1">
                  {Math.floor(ex.duration / 60)} min{" "}
                  {ex.duration % 60 > 0 ? `${ex.duration % 60}s` : ""}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <View className="flex-col gap-6 items-center">
          <Pressable
            onPress={() => {
              setSelected(null);
              reset();
            }}
          >
            <Text className="text-muted-foreground">← Back to exercises</Text>
          </Pressable>

          <View className="text-center">
            <Text className="text-foreground text-lg">{selected.title}</Text>
            <Text className="text-muted-foreground mt-1">
              {selected.description}
            </Text>
          </View>

          {/* Breathing display */}
          {selected.type === "breathing" && currentPhase && (
            <View className="items-center justify-center w-48 h-48">
              <View className="rounded-full bg-primary/20 w-full h-full items-center justify-center" />
              <View className="absolute">
                <Text className="text-primary font-medium">
                  {currentPhase.label}
                </Text>
                <Text className="text-muted-foreground text-sm">
                  {currentPhase.duration - phaseElapsed}s
                </Text>
              </View>
            </View>
          )}

          {/* Grounding/body scan steps */}
          {selected.type !== "breathing" && (
            <View className="w-full p-5 rounded-xl bg-card border border-border text-center">
              <Text className="text-foreground text-lg">
                {selected.instructions[stepIdx]}
              </Text>
              <View className="flex-row gap-1 justify-center mt-4">
                {selected.instructions.map((_, i) => (
                  <View
                    key={i}
                    className={`w-2 h-2 rounded-full ${i === stepIdx ? "bg-primary" : "bg-muted"}`}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Progress */}
          <View className="items-center justify-center">
            <Text className="text-foreground">
              {elapsed >= selected.duration
                ? "Done!"
                : `${selected.duration - elapsed}s`}
            </Text>
          </View>

          {/* Controls */}
          <View className="flex-row gap-3">
            <Pressable
              onPress={reset}
              className="w-12 h-12 rounded-full bg-secondary items-center justify-center"
            >
              <MaterialIcons name="refresh" size={18} />
            </Pressable>
            {elapsed < selected.duration && (
              <Pressable
                onPress={() => setRunning(!running)}
                className="w-14 h-14 rounded-full bg-primary items-center justify-center"
              >
                <MaterialIcons
                  name={running ? "pause" : "play-arrow"}
                  size={22}
                  color="#fff"
                />
              </Pressable>
            )}
            {elapsed >= selected.duration && (
              <Pressable
                onPress={() => {
                  setSelected(null);
                  reset();
                }}
                className="px-6 h-14 rounded-full bg-accent items-center justify-center"
              >
                <Text className="text-accent-foreground">Well done! 🎉</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
