import Link from "next/link";
import { NavLink } from "@/components/nav-link";
import { ThemeToggle } from "@/components/theme-toggle";
import { requireUser } from "@/server/auth";
import { logout } from "../login/actions";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:shadow"
      >
        Skip to content
      </a>

      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <Link href="/dashboard" className="font-semibold">
            Store Panel
          </Link>

          <nav
            aria-label="Main"
            className="order-last flex w-full gap-1 sm:order-none sm:w-auto"
          >
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/products">Products</NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="text-right text-sm leading-tight">
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-gray-500">
                {user.role === "ADMIN" ? "Admin" : "Manager"}
              </p>
            </div>
            <ThemeToggle />
            <form action={logout}>
              <button type="submit" className="btn btn-secondary py-1.5">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
