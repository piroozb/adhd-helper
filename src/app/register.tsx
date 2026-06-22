"use client";

import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useAuth } from "../lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  const handleSubmit = async () => {
    setError(null);
    setMessage(null);
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const { error } = await signUp(email.trim(), password);
    if (error) {
      setError(error);
      return;
    }
    setMessage("Check your email for a confirmation link, then sign in.");
  };

  return (
    <View
      className="flex-1 bg-background px-5 py-10"
      style={{ paddingHorizontal: 20 }}
    >
      <Text className="text-3xl font-semibold text-foreground mb-2">
        Create an account
      </Text>
      <Text className="text-muted-foreground mb-8">
        Sign up once and keep your data synced across devices.
      </Text>
      <View className="space-y-4">
        <View>
          <Text className="text-sm text-muted-foreground mb-2">Email</Text>
          <TextInput
            className="rounded-2xl border border-border bg-card px-4 py-3 text-foreground"
            placeholder="you@example.com"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View>
          <Text className="text-sm text-muted-foreground mb-2">Password</Text>
          <TextInput
            secureTextEntry
            className="rounded-2xl border border-border bg-card px-4 py-3 text-foreground"
            placeholder="••••••••"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
          />
        </View>
        <View>
          <Text className="text-sm text-muted-foreground mb-2">
            Confirm password
          </Text>
          <TextInput
            secureTextEntry
            className="rounded-2xl border border-border bg-card px-4 py-3 text-foreground"
            placeholder="••••••••"
            placeholderTextColor="#9ca3af"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>
        {error ? (
          <Text className="text-sm text-destructive">{error}</Text>
        ) : null}
        {message ? (
          <Text className="text-sm text-foreground">{message}</Text>
        ) : null}
        <Pressable
          onPress={handleSubmit}
          className="rounded-2xl bg-primary px-4 py-4 items-center"
        >
          <Text className="text-primary-foreground font-semibold">Sign up</Text>
        </Pressable>
      </View>
      <View className="mt-6 flex-row justify-center gap-2">
        <Text className="text-muted-foreground">Already have an account?</Text>
        <Link href="/login" className="text-primary font-semibold">
          Sign in
        </Link>
      </View>
    </View>
  );
}
