import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const expoConfig = (Constants.expoConfig ?? Constants.manifest) as
  | {
      extra?: {
        SUPABASE_URL?: string;
        SUPABASE_ANON_KEY?: string;
      };
    }
  | undefined;
const extra = (expoConfig?.extra ?? {}) as {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
};

const SUPABASE_URL =
  extra.SUPABASE_URL ?? process.env.SUPABASE_URL ?? undefined;
const SUPABASE_ANON_KEY =
  extra.SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? undefined;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_ANON_KEY. Set them in your local .env and restart the app.",
  );
}

const isServer = typeof window === "undefined";

const storage = isServer
  ? {
      getItem: async (_key: string) => null,
      setItem: async (_key: string, _value: string) => {},
      removeItem: async (_key: string) => {},
    }
  : {
      getItem: async (key: string) => AsyncStorage.getItem(key),
      setItem: async (key: string, value: string) => {
        await AsyncStorage.setItem(key, value);
      },
      removeItem: async (key: string) => {
        await AsyncStorage.removeItem(key);
      },
    };

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
