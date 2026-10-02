"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { useToast } from "@/components/toast";
import { login, type LoginState } from "./actions";

export function LoginForm() {
  const router = useRouter();
  const showToast = useToast();

  async function submit(prev: LoginState, formData: FormData) {
    const result = await login(prev, formData);
    if (result.success) {
      showToast("Logged in successfully");
      router.push("/dashboard");
    } else if (result.error) {
      showToast(result.error, "error");
    }
    return result;
  }

  const [state, formAction, pending] = useActionState(submit, {});

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email}
          className="input"
        />
      </div>

      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="input"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary w-full"
      >
        {pending ? "Signing in…" : "Log in"}
      </button>
    </form>
  );
}
