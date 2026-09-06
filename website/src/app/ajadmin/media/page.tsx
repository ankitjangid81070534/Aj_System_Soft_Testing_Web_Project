import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Field, Input, Select } from "@/components/ui/Input";
import { AdminSubmitButton } from "@/components/admin/AdminSubmitButton";
import { EmptyState } from "@/components/ui/States";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";
import { uploadMediaAction, deleteMediaAction } from "@/lib/admin/media-actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "AJS Admin — Media Library" },
  robots: { index: false, follow: false },
};

const BUCKETS = [
  { value: "public-site", label: "Public site (logos, OG)" },
  { value: "project-media", label: "Project media" },
  { value: "team-media", label: "Team media" },
  { value: "client-media", label: "Client media" },
  { value: "blog-media", label: "Blog media" },
  { value: "private-media", label: "Private / confidential" },
] as const;

export default async function MediaLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const feedback = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/ajadmin/login");
  if (!can(user.role, "media:read")) {
    return (
      <section>
        <p
          role="alert"
          className="max-w-xl rounded-lg bg-warning-soft px-4 py-3 text-sm text-warning"
        >
          Your role ({user.role}) does not include media access.
        </p>
      </section>
    );
  }
  if (!isSupabaseConfigured) {
    return (
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Media library</h1>
        <p
          role="status"
          className="mt-4 max-w-xl rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          Supabase is not configured yet.
        </p>
      </section>
    );
  }

  const admin = createSupabaseAdminLooseClient();
  const { data: assets } = await admin
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(60);
  const rows = (assets ?? []) as unknown as Record<string, unknown>[];

  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Media library</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Uploads are size- and type-checked. Copy an asset&rsquo;s URL into any resource form.
      </p>
      {feedback.notice ? (
        <p
          role="status"
          className="mt-4 max-w-3xl rounded-xl bg-success-soft px-4 py-3 text-sm text-success"
        >
          {feedback.notice}
        </p>
      ) : null}
      {feedback.error ? (
        <p
          role="alert"
          className="mt-4 max-w-3xl rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
        >
          {feedback.error}
        </p>
      ) : null}

      {can(user.role, "media:write") ? (
        <form
          action={uploadMediaAction}
          className="mt-5 grid max-w-3xl gap-4 rounded-2xl border border-line bg-surface p-5 shadow-e1 sm:grid-cols-[1fr_1fr]"
        >
          <Field label="Bucket" htmlFor="m-bucket">
            <Select id="m-bucket" name="bucket" defaultValue="public-site">
              {BUCKETS.map((bucket) => (
                <option key={bucket.value} value={bucket.value}>
                  {bucket.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="File"
            htmlFor="m-file"
            hint="JPEG/PNG/WebP/AVIF (PDF & MP4 in matching buckets), max 10–50 MB by bucket."
          >
            <input
              id="m-file"
              name="file"
              type="file"
              required
              className="block w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-brand-50 file:px-4 file:py-1.5 file:text-sm file:font-medium file:text-brand-700"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field
              label="Alt text"
              htmlFor="m-alt"
              hint="Descriptive alt text is an SEO and accessibility requirement."
            >
              <Input id="m-alt" name="alt" maxLength={300} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <AdminSubmitButton idleLabel="Upload" pendingLabel="Uploading…" />
          </div>
        </form>
      ) : null}

      <div className="mt-8">
        {rows.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {rows.map((asset) => {
              const id = String(asset.id);
              const url = String(asset.url ?? "");
              const bucket = String(asset.bucket);
              const isPrivate = bucket === "private-media" || asset.is_public === false;
              return (
                <div
                  key={id}
                  className="overflow-hidden rounded-2xl border border-line bg-surface shadow-e1"
                >
                  <div className="relative aspect-[4/3] bg-canvas-raised">
                    {!isPrivate && url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- admin grid preview of arbitrary uploaded media
                      <img
                        src={url}
                        alt={String(asset.alt_text ?? "")}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-ink-muted">
                        Private asset
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-xs font-medium text-ink">
                      {String(asset.file_name ?? "asset")}
                    </p>
                    <p className="text-[10px] text-ink-muted">{bucket}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      {!isPrivate && url ? (
                        <button
                          type="button"
                          onClick={() => navigator.clipboard?.writeText(url)}
                          className="rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-ink-muted transition-colors hover:text-ink focus-ring"
                        >
                          Copy URL
                        </button>
                      ) : null}
                      {can(user.role, "media:write") ? (
                        <ConfirmButton
                          action={deleteMediaAction}
                          resource="media"
                          id={id}
                          label="Delete"
                          title="Delete this asset?"
                          description="Removes the file from storage and its library entry. This cannot be undone."
                          confirmLabel="Delete"
                          className="rounded-full px-2.5 py-1 text-[11px] font-medium text-danger transition-colors hover:bg-danger-soft focus-ring"
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No media uploaded yet"
            description="Upload logos, covers and gallery images — each gets a URL you can paste into content forms."
          />
        )}
      </div>
      <p className="mt-3 text-xs text-ink-muted">
        Need the public page instead?{" "}
        <Link href="/" className="text-brand-600 hover:text-brand-700">
          Go to site
        </Link>
      </p>
    </section>
  );
}
