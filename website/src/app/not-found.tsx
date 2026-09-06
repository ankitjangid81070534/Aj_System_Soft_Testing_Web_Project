import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium text-brand-600">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Page not found</h1>
      <p className="mt-3 max-w-md text-ink-muted">
        The page you are looking for does not exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-on-brand transition-colors hover:bg-brand-700"
      >
        Back to home
      </Link>
    </main>
  );
}
