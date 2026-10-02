"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validation";
import { createSession, destroySession } from "@/server/auth";

export type LoginState = { error?: string; email?: string };

const DUMMY_HASH =
  "$2b$10$Ju4xJcwijOG8NUY/GGeciOQ/FD7rUmkdGUlW580vQKZLm/NZbBsjO";

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  const email = String(formData.get("email") ?? "");

  if (!parsed.success) {
    return { error: "Enter your email and password.", email };
  }

  try {
    const user = await db.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });
    const valid = await bcrypt.compare(
      parsed.data.password,
      user?.passwordHash ?? DUMMY_HASH,
    );

    if (!user || !valid) {
      return { error: "Invalid email or password.", email };
    }

    await createSession(user.id);
  } catch (err) {
    console.error("Login failed", err);
    return {
      error: "We couldn't sign you in right now. Please try again.",
      email,
    };
  }

  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
