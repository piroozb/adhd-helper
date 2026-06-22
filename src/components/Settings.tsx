import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useAppData } from "../lib/app-data";
import { useAuth } from "../lib/auth";
import { AnimatedToggle } from "./ui/animated-toggle";

type Theme = "light" | "dark" | "system";

type Settings = {
  theme: Theme;
  notifications: boolean;
  sounds: boolean;
  focusTimer: number; // minutes
  breakTimer: number;
  dailyGoal: number; // todos
  morningCheckIn: boolean;
  eveningReflection: boolean;
  reduceMotion: boolean;
  accentColor: string;
};

const ACCENT_COLORS = [
  { id: "lavender", label: "Lavender", value: "#7c6bae" },
  { id: "sage", label: "Sage", value: "#6a9c64" },
  { id: "sky", label: "Sky", value: "#4a90b8" },
  { id: "rose", label: "Rose", value: "#b8556a" },
  { id: "amber", label: "Amber", value: "#b87c3a" },
];

const defaultSettings: Settings = {
  theme: "system",
  notifications: true,
  sounds: false,
  focusTimer: 25,
  breakTimer: 5,
  dailyGoal: 3,
  morningCheckIn: true,
  eveningReflection: false,
  reduceMotion: false,
  accentColor: "lavender",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-col gap-1">
      <Text className="text-muted-foreground text-sm px-1 mb-1">{title}</Text>
      <View className="bg-card rounded-xl border border-border overflow-hidden">
        {children}
      </View>
    </View>
  );
}

function Row({
  icon,
  label,
  sublabel,
  right,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  right: React.ReactNode;
  last?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center gap-3 px-4 py-3.5 ${!last ? "border-b border-border" : ""}`}
    >
      <View className="w-8 h-8 rounded-lg bg-secondary items-center justify-center">
        {icon}
      </View>
      <View className="flex-1 min-w-0">
        <Text className="text-foreground">{label}</Text>
        {sublabel && (
          <Text className="text-muted-foreground text-sm">{sublabel}</Text>
        )}
      </View>
      {right}
    </View>
  );
}

export function SettingsTab() {
  const { settings, loading, updateSettings } = useAppData();
  const { user, signOut, updateUser } = useAuth();
  const [newEmail, setNewEmail] = useState(user?.email ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountMessage, setAccountMessage] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);

  useEffect(() => {
    setNewEmail(user?.email ?? "");
  }, [user]);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    updateSettings({ [key]: value } as Partial<Settings>);

  const handleUpdateEmail = async () => {
    setAccountError(null);
    setAccountMessage(null);
    if (!newEmail.trim()) {
      setAccountError("Please enter a valid email.");
      return;
    }
    const { error } = await updateUser({ email: newEmail.trim() });
    if (error) {
      setAccountError(error);
      return;
    }
    setAccountMessage("Email update requested. Check your inbox to confirm.");
  };

  const handleUpdatePassword = async () => {
    setAccountError(null);
    setAccountMessage(null);
    if (!newPassword) {
      setAccountError("Please enter a new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setAccountError("Passwords do not match.");
      return;
    }
    const { error } = await updateUser({ password: newPassword });
    if (error) {
      setAccountError(error);
      return;
    }
    setAccountMessage("Password updated successfully.");
    setNewPassword("");
    setConfirmPassword("");
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-10">
        <Text className="text-muted-foreground">Loading settings…</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-col gap-5">
      <Section title="APPEARANCE">
        <Row
          icon={<MaterialIcons title="wb_sunny" size={16} />}
          label="Theme"
          right={
            <View className="flex-row gap-1">
              {(["light", "dark", "system"] as Theme[]).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => update("theme", t)}
                  className={`px-2.5 py-1 rounded-lg capitalize ${settings.theme === t ? "bg-primary" : "bg-secondary"}`}
                >
                  <Text
                    className={`${settings.theme === t ? "text-primary-foreground" : "text-muted-foreground"}`}
                  >
                    {t}
                  </Text>
                </Pressable>
              ))}
            </View>
          }
        />
        <Row
          icon={<MaterialIcons name="palette" size={16} />}
          label="Accent color"
          last
          right={
            <View className="flex-row gap-2">
              {ACCENT_COLORS.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => update("accentColor", c.id)}
                  className={`w-6 h-6 rounded-full ${settings.accentColor === c.id ? "ring-2" : ""}`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </View>
          }
        />
      </Section>

      <Section title="NOTIFICATIONS">
        <Row
          icon={<MaterialIcons name="notifications" size={16} />}
          label="Enable notifications"
          sublabel="Get reminded for your scheduled alerts"
          right={
            <AnimatedToggle
              checked={settings.notifications}
              onChange={() => update("notifications", !settings.notifications)}
              activeColor={
                ACCENT_COLORS.find((c) => c.id === settings.accentColor)
                  ?.value ?? "#0ea5e9"
              }
            />
          }
        />
        <Row
          icon={<MaterialIcons name="volume-up" size={16} />}
          label="Sound effects"
          sublabel="Soft chimes for reminders"
          last
          right={
            <AnimatedToggle
              checked={settings.sounds}
              onChange={() => update("sounds", !settings.sounds)}
              activeColor={
                ACCENT_COLORS.find((c) => c.id === settings.accentColor)
                  ?.value ?? "#0ea5e9"
              }
            />
          }
        />
      </Section>

      <Section title="FOCUS TIMER">
        <Row
          icon={<MaterialIcons name="schedule" size={16} />}
          label="Focus session"
          sublabel="Pomodoro work block length"
          right={
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={() =>
                  update("focusTimer", Math.max(5, settings.focusTimer - 5))
                }
                className="w-7 h-7 rounded-full bg-secondary items-center justify-center"
              >
                <Text>−</Text>
              </Pressable>
              <Text className="text-foreground w-12 text-center">
                {settings.focusTimer}m
              </Text>
              <Pressable
                onPress={() =>
                  update("focusTimer", Math.min(60, settings.focusTimer + 5))
                }
                className="w-7 h-7 rounded-full bg-secondary items-center justify-center"
              >
                <Text>+</Text>
              </Pressable>
            </View>
          }
        />
        <Row
          icon={<MaterialIcons name="refresh" size={16} />}
          label="Break length"
          last
          right={
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={() =>
                  update("breakTimer", Math.max(1, settings.breakTimer - 1))
                }
                className="w-7 h-7 rounded-full bg-secondary items-center justify-center"
              >
                <Text>−</Text>
              </Pressable>
              <Text className="text-foreground w-12 text-center">
                {settings.breakTimer}m
              </Text>
              <Pressable
                onPress={() =>
                  update("breakTimer", Math.min(30, settings.breakTimer + 1))
                }
                className="w-7 h-7 rounded-full bg-secondary items-center justify-center"
              >
                <Text>+</Text>
              </Pressable>
            </View>
          }
        />
      </Section>

      <Section title="DAILY HABITS">
        <Row
          icon={<Text style={{ fontSize: 16 }}>🌅</Text>}
          label="Morning check-in"
          sublabel="Gentle prompt to plan your day"
          right={
            <AnimatedToggle
              checked={settings.morningCheckIn}
              onChange={() =>
                update("morningCheckIn", !settings.morningCheckIn)
              }
              activeColor={
                ACCENT_COLORS.find((c) => c.id === settings.accentColor)
                  ?.value ?? "#0ea5e9"
              }
            />
          }
        />
        <Row
          icon={<Text style={{ fontSize: 16 }}>🌙</Text>}
          label="Evening reflection"
          sublabel="Review and wind down"
          right={
            <AnimatedToggle
              checked={settings.eveningReflection}
              onChange={() =>
                update("eveningReflection", !settings.eveningReflection)
              }
              activeColor={
                ACCENT_COLORS.find((c) => c.id === settings.accentColor)
                  ?.value ?? "#0ea5e9"
              }
            />
          }
        />
        <Row
          icon={<Text style={{ fontSize: 16 }}>🎯</Text>}
          label="Daily task goal"
          sublabel="Aim small — done beats perfect"
          last
          right={
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={() =>
                  update("dailyGoal", Math.max(1, settings.dailyGoal - 1))
                }
                className="w-7 h-7 rounded-full bg-secondary items-center justify-center"
              >
                <Text>−</Text>
              </Pressable>
              <Text className="text-foreground w-8 text-center">
                {settings.dailyGoal}
              </Text>
              <Pressable
                onPress={() =>
                  update("dailyGoal", Math.min(10, settings.dailyGoal + 1))
                }
                className="w-7 h-7 rounded-full bg-secondary items-center justify-center"
              >
                <Text>+</Text>
              </Pressable>
            </View>
          }
        />
      </Section>

      <Section title="ACCESSIBILITY">
        <Row
          icon={<Text style={{ fontSize: 16 }}>⚡</Text>}
          label="Reduce motion"
          sublabel="Minimize animations throughout the app"
          last
          right={
            <AnimatedToggle
              checked={settings.reduceMotion}
              onChange={() => update("reduceMotion", !settings.reduceMotion)}
              activeColor={
                ACCENT_COLORS.find((c) => c.id === settings.accentColor)
                  ?.value ?? "#0ea5e9"
              }
            />
          }
        />
      </Section>

      <Section title="ACCOUNT">
        <Row
          icon={<MaterialIcons name="person" size={16} />}
          label="Signed in as"
          sublabel={user?.email ?? "No email"}
          right={
            <Pressable
              onPress={signOut}
              className="rounded-full bg-destructive px-3 py-2 items-center justify-center"
            >
              <Text className="text-primary-foreground text-xs">Log out</Text>
            </Pressable>
          }
        />
        <View className="flex-col gap-3 px-4 py-3">
          <Text className="text-muted-foreground text-sm">Update email</Text>
          <TextInput
            className="rounded-2xl border border-border bg-card px-4 py-3 text-foreground"
            placeholder="your@email.com"
            placeholderTextColor="#9ca3af"
            value={newEmail}
            onChangeText={setNewEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Pressable
            onPress={handleUpdateEmail}
            className="rounded-2xl bg-primary px-4 py-3 items-center"
          >
            <Text className="text-primary-foreground">Update email</Text>
          </Pressable>

          <Text className="text-muted-foreground text-sm">Update password</Text>
          <TextInput
            secureTextEntry
            className="rounded-2xl border border-border bg-card px-4 py-3 text-foreground"
            placeholder="New password"
            placeholderTextColor="#9ca3af"
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextInput
            secureTextEntry
            className="rounded-2xl border border-border bg-card px-4 py-3 text-foreground"
            placeholder="Confirm password"
            placeholderTextColor="#9ca3af"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          {accountError ? (
            <Text className="text-sm text-destructive">{accountError}</Text>
          ) : null}
          {accountMessage ? (
            <Text className="text-sm text-foreground">{accountMessage}</Text>
          ) : null}
          <Pressable
            onPress={handleUpdatePassword}
            className="rounded-2xl bg-secondary px-4 py-3 items-center"
          >
            <Text className="text-foreground">Update password</Text>
          </Pressable>
        </View>
      </Section>

      <View className="p-4 rounded-xl bg-secondary border border-border">
        <Text className="text-muted-foreground text-sm leading-relaxed">
          💜 <Text className="text-foreground">Remember:</Text> This app is a
          tool, not a test. Use what helps, ignore what doesn't. Progress over
          perfection.
        </Text>
      </View>
    </ScrollView>
  );
}
