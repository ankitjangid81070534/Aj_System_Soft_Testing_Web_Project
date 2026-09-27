export default function Loading() {
  return (
    <div className="flex min-h-[60svh] items-center justify-center" role="status" aria-label="Loading your account">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-line border-t-brand-600" />
    </div>
  );
}
