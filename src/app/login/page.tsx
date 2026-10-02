import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold tracking-wide text-gray-500 uppercase">Store Panel</p>
          <h1 className="mt-1 text-2xl font-semibold">Log in to your account</h1>
        </div>
        <div className="card p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
