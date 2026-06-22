"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./auth";
import { supabase } from "./supabase";

export type TodoPriority = "high" | "medium" | "low";

export type Todo = {
  id: string;
  text: string;
  done: boolean;
  priority: TodoPriority;
  createdAt: string;
};

export type JournalEntry = {
  id: string;
  date: string;
  mood: string;
  text: string;
  tags: string[];
};

export type ReminderRecurrence = "once" | "daily" | "weekdays" | "weekends";

export type Reminder = {
  id: string;
  title: string;
  time: string;
  recurrence: ReminderRecurrence;
  active: boolean;
  category: string;
};

export type AppSettings = {
  notifications: boolean;
  sounds: boolean;
  focusTimer: number;
  breakTimer: number;
  dailyGoal: number;
  morningCheckIn: boolean;
  eveningReflection: boolean;
  reduceMotion: boolean;
  accentColor: string;
};

const DEFAULT_SETTINGS: AppSettings = {
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

type AppDataContextType = {
  todos: Todo[];
  journalEntries: JournalEntry[];
  reminders: Reminder[];
  settings: AppSettings;
  loading: boolean;
  refresh: () => Promise<void>;
  addTodo: (text: string, priority: TodoPriority) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  removeTodo: (id: string) => Promise<void>;
  saveJournalEntry: (entry: Omit<JournalEntry, "id" | "date">) => Promise<void>;
  removeJournalEntry: (id: string) => Promise<void>;
  addReminder: (reminder: Omit<Reminder, "id" | "active">) => Promise<void>;
  toggleReminder: (id: string) => Promise<void>;
  removeReminder: (id: string) => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
};

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

function mapTodo(row: any): Todo {
  return {
    id: row.id,
    text: row.text,
    done: row.done,
    priority: row.priority,
    createdAt: row.created_at,
  };
}

function mapJournalEntry(row: any): JournalEntry {
  return {
    id: row.id,
    date: row.date,
    mood: row.mood,
    text: row.text,
    tags: row.tags || [],
  };
}

function mapReminder(row: any): Reminder {
  return {
    id: row.id,
    title: row.title,
    time: row.time,
    recurrence: row.recurrence,
    active: row.active,
    category: row.category,
  };
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);

  const logError = (operation: string, error: unknown) => {
    if (error) {
      console.error(`[AppData] ${operation} failed:`, error);
    }
  };

  const refresh = async () => {
    if (!user) {
      setTodos([]);
      setJournalEntries([]);
      setReminders([]);
      setSettings(DEFAULT_SETTINGS);
      return;
    }

    setLoading(true);

    const [todosResult, journalResult, remindersResult, settingsResult] =
      await Promise.all([
        supabase
          .from("todos")
          .select("id, text, done, priority, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("journal_entries")
          .select("id, date, mood, text, tags")
          .eq("user_id", user.id)
          .order("date", { ascending: false }),
        supabase
          .from("reminders")
          .select("id, title, time, recurrence, active, category")
          .eq("user_id", user.id)
          .order("time", { ascending: true }),
        supabase
          .from("user_settings")
          .select(
            "notifications, sounds, focus_timer, break_timer, daily_goal, morning_check_in, evening_reflection, reduce_motion, accent_color",
          )
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

    if (todosResult.error) {
      logError("refresh todos", todosResult.error);
    }
    if (!todosResult.error && todosResult.data) {
      setTodos(todosResult.data.map(mapTodo));
    }
    if (journalResult.error) {
      logError("refresh journal", journalResult.error);
    }
    if (!journalResult.error && journalResult.data) {
      setJournalEntries(journalResult.data.map(mapJournalEntry));
    }
    if (remindersResult.error) {
      logError("refresh reminders", remindersResult.error);
    }
    if (!remindersResult.error && remindersResult.data) {
      setReminders(remindersResult.data.map(mapReminder));
    }
    if (settingsResult.error) {
      logError("refresh settings", settingsResult.error);
    }
    if (!settingsResult.error && settingsResult.data) {
      setSettings({
        notifications: settingsResult.data.notifications,
        sounds: settingsResult.data.sounds,
        focusTimer: settingsResult.data.focus_timer,
        breakTimer: settingsResult.data.break_timer,
        dailyGoal: settingsResult.data.daily_goal,
        morningCheckIn: settingsResult.data.morning_check_in,
        eveningReflection: settingsResult.data.evening_reflection,
        reduceMotion: settingsResult.data.reduce_motion,
        accentColor: settingsResult.data.accent_color,
      });
    } else {
      setSettings(DEFAULT_SETTINGS);
    }

    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, [user]);

  const addTodo = async (text: string, priority: TodoPriority) => {
    if (!user) {
      console.warn(
        "[AppData] addTodo skipped because user is not authenticated.",
      );
      return;
    }
    const { data, error } = await supabase
      .from("todos")
      .insert({ user_id: user.id, text, priority, done: false })
      .select("id, text, done, priority, created_at")
      .single();
    if (error) {
      logError("addTodo", error);
      return;
    }
    if (data) {
      setTodos((current) => [mapTodo(data), ...current]);
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find((item) => item.id === id);
    if (!todo || !user) {
      console.warn(
        "[AppData] toggleTodo skipped because todo or user is missing.",
      );
      return;
    }
    const { data, error } = await supabase
      .from("todos")
      .update({ done: !todo.done })
      .eq("id", id)
      .select("id, text, done, priority, created_at")
      .single<Todo>();
    if (error) {
      logError("toggleTodo", error);
      return;
    }
    if (data) {
      setTodos((current: Todo[]) =>
        current.map((item: Todo) =>
          item.id === id ? { ...item, done: data.done } : item,
        ),
      );
    }
  };

  const removeTodo = async (id: string) => {
    if (!user) {
      console.warn(
        "[AppData] removeTodo skipped because user is not authenticated.",
      );
      return;
    }
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) {
      logError("removeTodo", error);
      return;
    }
    setTodos((current) => current.filter((item) => item.id !== id));
  };

  const saveJournalEntry = async (entry: Omit<JournalEntry, "id" | "date">) => {
    if (!user) {
      console.warn(
        "[AppData] saveJournalEntry skipped because user is not authenticated.",
      );
      return;
    }
    const { data, error } = await supabase
      .from("journal_entries")
      .insert({
        user_id: user.id,
        date: new Date().toISOString(),
        mood: entry.mood,
        text: entry.text,
        tags: entry.tags,
      })
      .select("id, date, mood, text, tags")
      .single();
    if (error) {
      logError("saveJournalEntry", error);
      return;
    }
    if (data) {
      setJournalEntries((current) => [mapJournalEntry(data), ...current]);
    }
  };

  const removeJournalEntry = async (id: string) => {
    if (!user) {
      console.warn(
        "[AppData] removeJournalEntry skipped because user is not authenticated.",
      );
      return;
    }
    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", id);
    if (error) {
      logError("removeJournalEntry", error);
      return;
    }
    setJournalEntries((current) => current.filter((entry) => entry.id !== id));
  };

  const addReminder = async (reminder: Omit<Reminder, "id" | "active">) => {
    if (!user) {
      console.warn(
        "[AppData] addReminder skipped because user is not authenticated.",
      );
      return;
    }
    const { data, error } = await supabase
      .from("reminders")
      .insert({
        user_id: user.id,
        title: reminder.title,
        time: reminder.time,
        recurrence: reminder.recurrence,
        active: true,
        category: reminder.category,
      })
      .select("id, title, time, recurrence, active, category")
      .single();
    if (error) {
      logError("addReminder", error);
      return;
    }
    if (data) {
      setReminders((current) => [mapReminder(data), ...current]);
    }
  };

  const toggleReminder = async (id: string) => {
    const reminder = reminders.find((item) => item.id === id);
    if (!reminder || !user) {
      console.warn(
        "[AppData] toggleReminder skipped because reminder or user is missing.",
      );
      return;
    }
    const { data, error } = await supabase
      .from("reminders")
      .update({ active: !reminder.active })
      .eq("id", id)
      .select("id, title, time, recurrence, active, category")
      .single<Reminder>();
    if (error) {
      logError("toggleReminder", error);
      return;
    }
    if (data) {
      setReminders((current: Reminder[]) =>
        current.map((item: Reminder) =>
          item.id === id ? { ...item, active: data.active } : item,
        ),
      );
    }
  };

  const removeReminder = async (id: string) => {
    if (!user) {
      console.warn(
        "[AppData] removeReminder skipped because user is not authenticated.",
      );
      return;
    }
    const { error } = await supabase.from("reminders").delete().eq("id", id);
    if (error) {
      logError("removeReminder", error);
      return;
    }
    setReminders((current) => current.filter((item) => item.id !== id));
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    if (!user) return;
    const payload = {
      user_id: user.id,
      notifications: updates.notifications ?? settings.notifications,
      sounds: updates.sounds ?? settings.sounds,
      focus_timer: updates.focusTimer ?? settings.focusTimer,
      break_timer: updates.breakTimer ?? settings.breakTimer,
      daily_goal: updates.dailyGoal ?? settings.dailyGoal,
      morning_check_in: updates.morningCheckIn ?? settings.morningCheckIn,
      evening_reflection:
        updates.eveningReflection ?? settings.eveningReflection,
      reduce_motion: updates.reduceMotion ?? settings.reduceMotion,
      accent_color: updates.accentColor ?? settings.accentColor,
    };

    const { data, error } = await supabase
      .from("user_settings")
      .upsert(payload, { onConflict: "user_id" })
      .select(
        "notifications, sounds, focus_timer, break_timer, daily_goal, morning_check_in, evening_reflection, reduce_motion, accent_color",
      )
      .single();

    if (error) {
      logError("updateSettings", error);
      return;
    }
    if (data) {
      setSettings({
        notifications: data.notifications,
        sounds: data.sounds,
        focusTimer: data.focus_timer,
        breakTimer: data.break_timer,
        dailyGoal: data.daily_goal,
        morningCheckIn: data.morning_check_in,
        eveningReflection: data.evening_reflection,
        reduceMotion: data.reduce_motion,
        accentColor: data.accent_color,
      });
    }
  };

  const value = useMemo(
    () => ({
      todos,
      journalEntries,
      reminders,
      settings,
      loading,
      refresh,
      addTodo,
      toggleTodo,
      removeTodo,
      saveJournalEntry,
      removeJournalEntry,
      addReminder,
      toggleReminder,
      removeReminder,
      updateSettings,
    }),
    [todos, journalEntries, reminders, settings, loading],
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within AppDataProvider");
  }
  return context;
}
