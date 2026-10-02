import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <p className="text-sm font-medium text-gray-500">404</p>
        <h1 className="mt-1 text-2xl font-semibold">Page not found</h1>
        <Link href="/dashboard" className="btn btn-secondary mt-4">
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
