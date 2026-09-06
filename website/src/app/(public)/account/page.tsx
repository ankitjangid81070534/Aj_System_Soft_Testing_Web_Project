import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  FolderKanban,
  LockKeyhole,
  MessageSquareText,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";
import {
  AvatarForm,
  CompleteProfileForm,
  ProfileForm,
  ReviewForm,
} from "@/components/portal/AccountForms";
import { AgreementsHistory } from "@/components/portal/AgreementsHistory";
import { getCurrentServiceAgreement } from "@/lib/agreements/data";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";
import { Badge, StatusPill } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";
import { clientSignOutAction } from "@/lib/portal/actions";
import { getCurrentUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Client Account",
  description: "Private AJ System Soft Technology client workspace.",
  robots: { index: false, follow: false },
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

function safeAvatar(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const allowedHost =
      parsed.hostname.endsWith(".supabase.co") || parsed.hostname === "lh3.googleusercontent.com";
    return parsed.protocol === "https:" && allowedHost ? url : null;
  } catch {
    return null;
  }
}

export default async function ClientAccountPage() {
  if (!isSupabaseConfigured) {
    return (
      <section className="mx-auto w-full max-w-content px-4 py-20 sm:px-6">
        <div className="rounded-[2rem] border border-line bg-surface p-8 text-center shadow-e3 sm:p-12">
          <LockKeyhole aria-hidden="true" className="mx-auto h-10 w-10 text-brand-600" />
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
            Client portal setup in progress
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-ink-muted">
            The public website is available, but secure account access needs the production Supabase
            configuration.
          </p>
          <Button href="/contact" className="mt-6">
            Contact AJS
          </Button>
        </div>
      </section>
    );
  }

  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const supabase = await createSupabaseServerClient();
  const [{ data: client }, { data: contacts }, { data: quotes }, { data: reviews }] =
    await Promise.all([
    supabase
      .from("clients")
      .select("id, name, industry, location, portal_enabled")
      .eq("auth_user_id", user.id)
      .maybeSingle(),
    supabase
      .from("contact_submissions")
      .select("id, message, status, created_at")
      .eq("auth_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("quote_requests")
      .select("id, project_type, requirements, status, created_at")
      .eq("auth_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("testimonials")
      .select("id, title, quote, rating, status, is_public, created_at")
      .eq("submitted_by", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
    ]);

  // Extended profile (0016): username + primary address + agreement history.
  // Queried through the loose admin client scoped to this user because the
  // typed Database schema predates the migration; failures degrade to "not
  // yet collected" instead of breaking the account page.
  const loose = createSupabaseAdminLooseClient();
  const [extendedProfile, primaryAddress, acceptances, currentAgreement] = await Promise.all([
    loose
      .from("profiles")
      .select("username, profile_completed, auth_provider")
      .eq("id", user.id)
      .limit(1)
      .then(({ data, error }) => (error ? null : (data?.[0] ?? null))),
    loose
      .from("user_addresses")
      .select("address_line_1, address_line_2, city, state, postal_code, country")
      .eq("user_id", user.id)
      .eq("is_primary", true)
      .limit(1)
      .then(({ data, error }) => (error ? null : (data?.[0] ?? null))),
    loose
      .from("agreement_acceptances")
      .select(
        "id, accepted_at, context, evidence_pdf_path, agreement_versions(version_number, title, effective_from), agreements(title, slug)",
      )
      .eq("user_id", user.id)
      .order("accepted_at", { ascending: false })
      .limit(50)
      .then(({ data, error }) => (error ? [] : (data ?? []))),
    getCurrentServiceAgreement(),
  ]);

  const acceptedCurrent = currentAgreement
    ? (acceptances as Record<string, unknown>[]).some((row) => {
        const version = row.agreement_versions as { version_number?: number } | null;
        return version?.version_number === currentAgreement.versionNumber;
      })
    : true;
  const extendedReady = extendedProfile !== null;
  const profileIncomplete =
    extendedReady &&
    (!extendedProfile?.username || !user.phone || !primaryAddress || !acceptedCurrent);

  const [{ data: projects }, { data: documents }] = client?.id
    ? await Promise.all([
        supabase
          .from("projects")
          .select("id, name, short_summary, project_status, status")
          .eq("client_id", client.id)
          .is("deleted_at", null)
          .order("created_at", { ascending: false }),
        supabase
          .from("client_portal_documents")
          .select("id, title, description, file_url, category, created_at")
          .eq("client_id", client.id)
          .eq("is_visible_to_client", true)
          .order("created_at", { ascending: false }),
      ])
    : [{ data: [] }, { data: [] }];

  const requests = [
    ...(contacts ?? []).map((item) => ({
      id: item.id,
      kind: "Contact message",
      summary: item.message,
      status: item.status,
      createdAt: item.created_at,
    })),
    ...(quotes ?? []).map((item) => ({
      id: item.id,
      kind: item.project_type || "Quote request",
      summary: item.requirements,
      status: item.status,
      createdAt: item.created_at,
    })),
  ].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  const avatar = safeAvatar(user.avatarUrl);
  const displayName = user.fullName || user.email.split("@")[0];
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const verified = Boolean(client?.id && client.portal_enabled);

  return (
    <div className="relative overflow-hidden pb-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_18%_10%,rgba(22,135,248,0.15),transparent_34%),radial-gradient(circle_at_82%_16%,rgba(31,157,109,0.08),transparent_30%)]"
      />
      <div className="mx-auto w-full max-w-content px-4 pt-12 sm:px-6 sm:pt-16">
        <section className="relative overflow-hidden rounded-[2rem] border border-line bg-surface/90 p-6 shadow-e4 backdrop-blur-xl sm:p-8">
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-100/60 blur-3xl dark:bg-brand-100/5"
          />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {avatar ? (
                <Image
                  src={avatar}
                  alt=""
                  width={72}
                  height={72}
                  className="h-16 w-16 rounded-2xl object-cover shadow-e2 sm:h-[4.5rem] sm:w-[4.5rem]"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-on-brand shadow-e2 sm:h-[4.5rem] sm:w-[4.5rem]"
                >
                  {initials || "AJ"}
                </span>
              )}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">
                    Client workspace
                  </p>
                  {verified ? (
                    <Badge tone="success">
                      <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />
                      Verified client
                    </Badge>
                  ) : (
                    <Badge>Account registered</Badge>
                  )}
                </div>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-ink sm:text-4xl">
                  Welcome, {displayName}
                </h1>
                <p className="mt-1 text-sm text-ink-muted">{user.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button href="/request-quote" size="sm">
                New project request
              </Button>
              <form action={clientSignOutAction}>
                <Button type="submit" size="sm" variant="secondary">
                  Sign out
                </Button>
              </form>
            </div>
          </div>

          <div className="relative mt-7 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Requests", value: requests.length, Icon: MessageSquareText },
              { label: "Linked projects", value: projects?.length ?? 0, Icon: FolderKanban },
              { label: "Reviews", value: reviews?.length ?? 0, Icon: Star },
            ].map(({ label, value, Icon }) => (
              <div key={label} className="rounded-2xl border border-line bg-canvas/80 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                    {label}
                  </p>
                  <Icon aria-hidden="true" className="h-4 w-4 text-brand-600" />
                </div>
                <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {!verified ? (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-5 py-4 text-sm text-brand-800 dark:border-brand-800 dark:bg-brand-950/50 dark:text-brand-300">
            <Clock3 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              Your account is active. Project documents and verified reviews appear after our team
              links this login to a real client record.
            </p>
          </div>
        ) : null}

        {profileIncomplete ? (
          <section
            id="complete-profile"
            className="mt-6 rounded-3xl border border-brand-200 bg-surface p-6 shadow-e2 sm:p-7 dark:border-brand-800"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <UserRound aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-ink">Complete your profile</h2>
                <p className="text-xs text-ink-muted">
                  A username, mobile number, address and the current Service Agreement acceptance
                  are required before we can link projects and documents to this account.
                </p>
              </div>
            </div>
            <div className="mt-6">
              <CompleteProfileForm
                defaults={{
                  fullName: user.fullName ?? "",
                  username:
                    (extendedProfile?.username as string | null) ??
                    user.email.split("@")[0].replace(/[^a-z0-9._-]/gi, "").toLowerCase(),
                  phone: user.phone ?? "",
                  addressLine1: (primaryAddress?.address_line_1 as string | null) ?? "",
                  addressLine2: (primaryAddress?.address_line_2 as string | null) ?? "",
                  city: (primaryAddress?.city as string | null) ?? "",
                  state: (primaryAddress?.state as string | null) ?? "",
                  postalCode: (primaryAddress?.postal_code as string | null) ?? "",
                  country: (primaryAddress?.country as string | null) ?? "India",
                }}
              />
            </div>
          </section>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-3xl border border-line bg-surface p-6 shadow-e2">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <UserRound aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-ink">Profile</h2>
                <p className="text-xs text-ink-muted">Keep your contact details current.</p>
              </div>
            </div>
            <div className="mt-6">
              <ProfileForm
                fullName={user.fullName ?? ""}
                phone={user.phone ?? ""}
                company={user.company ?? ""}
              />
            </div>
            <div className="mt-6 border-t border-line pt-5">
              <AvatarForm />
            </div>
          </section>

          <section className="rounded-3xl border border-line bg-surface p-6 shadow-e2">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-success-soft text-success">
                <Building2 aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-ink">Projects & access</h2>
                <p className="text-xs text-ink-muted">
                  Private records linked to your client profile.
                </p>
              </div>
            </div>
            {projects && projects.length > 0 ? (
              <ul className="mt-5 space-y-3">
                {projects.map((project) => (
                  <li key={project.id} className="rounded-2xl border border-line bg-canvas p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold text-ink">{project.name}</h3>
                      <StatusPill status={project.project_status || project.status} />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-ink-muted">{project.short_summary}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                className="mt-5"
                title="No linked projects yet"
                description="When a project is linked to this account, its status and documents will appear here."
                icon={<FolderKanban className="h-5 w-5" />}
                action={
                  <Button href="/request-quote" size="sm" variant="secondary">
                    Start a project
                  </Button>
                }
              />
            )}
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-line bg-surface p-6 shadow-e2 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-700">
                Activity
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
                Request history
              </h2>
            </div>
            <Button href="/contact" size="sm" variant="secondary">
              Send a message
            </Button>
          </div>
          {requests.length > 0 ? (
            <div className="mt-5 overflow-hidden rounded-2xl border border-line">
              <ul className="divide-y divide-line">
                {requests.map((request) => (
                  <li
                    key={`${request.kind}-${request.id}`}
                    className="grid gap-3 bg-surface px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-ink">{request.kind}</p>
                        <StatusPill status={request.status} />
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{request.summary}</p>
                    </div>
                    <time dateTime={request.createdAt} className="text-xs text-ink-muted">
                      {formatDate(request.createdAt)}
                    </time>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <EmptyState
              className="mt-5"
              title="No requests yet"
              description="Contact and quote requests submitted while signed in will appear here."
              icon={<MessageSquareText className="h-5 w-5" />}
            />
          )}
        </section>

        <AgreementsHistory
          acceptances={(acceptances as Record<string, unknown>[]).map((row) => {
            const version = row.agreement_versions as {
              version_number?: number;
              title?: string;
              effective_from?: string | null;
            } | null;
            const agreement = row.agreements as { title?: string; slug?: string } | null;
            return {
              id: String(row.id),
              acceptedAt: String(row.accepted_at),
              context: String(row.context),
              versionNumber: version?.version_number ?? 0,
              title: version?.title ?? agreement?.title ?? "Service Agreement",
              slug: agreement?.slug ?? "service-agreement",
              hasEvidence: Boolean(row.evidence_pdf_path),
            };
          })}
          currentVersion={currentAgreement?.versionNumber ?? null}
        />

        {documents && documents.length > 0 ? (
          <section className="mt-6 rounded-3xl border border-line bg-surface p-6 shadow-e2 sm:p-7">
            <div className="flex items-center gap-3">
              <FileText aria-hidden="true" className="h-5 w-5 text-brand-600" />
              <h2 className="text-xl font-semibold text-ink">Shared documents</h2>
            </div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {documents.map((document) => (
                <li key={document.id}>
                  <a
                    href={document.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-2xl border border-line bg-canvas p-4 transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-e2 focus-ring"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge>{document.category}</Badge>
                        <h3 className="mt-2 font-semibold text-ink">{document.title}</h3>
                      </div>
                      <ArrowUpRight
                        aria-hidden="true"
                        className="h-4 w-4 text-ink-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </div>
                    {document.description ? (
                      <p className="mt-2 text-sm text-ink-muted">{document.description}</p>
                    ) : null}
                    <p className="mt-3 text-xs text-ink-muted">
                      Shared {formatDate(document.created_at)}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-line bg-surface p-6 shadow-e2 sm:p-7">
            <div className="flex items-center gap-3">
              <Star aria-hidden="true" className="h-5 w-5 text-warning" />
              <div>
                <h2 className="text-xl font-semibold text-ink">Verified review</h2>
                <p className="text-xs text-ink-muted">
                  Real client feedback, moderated before publication.
                </p>
              </div>
            </div>
            {verified ? (
              <div className="mt-5">
                <ReviewForm
                  projects={(projects ?? []).map((project) => ({
                    id: project.id,
                    name: project.name,
                  }))}
                />
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-line-strong bg-canvas p-6 text-center">
                <ShieldCheck aria-hidden="true" className="mx-auto h-7 w-7 text-ink-muted" />
                <p className="mt-3 font-medium text-ink">Client verification required</p>
                <p className="mt-1 text-sm text-ink-muted">
                  A registered account alone cannot submit a public review.
                </p>
              </div>
            )}
          </div>
          <div className="rounded-3xl border border-line bg-surface p-6 shadow-e2 sm:p-7">
            <h2 className="text-xl font-semibold text-ink">Your review submissions</h2>
            {reviews && reviews.length > 0 ? (
              <ul className="mt-5 space-y-3">
                {reviews.map((review) => (
                  <li key={review.id} className="rounded-2xl border border-line bg-canvas p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-ink">{review.title || "Client review"}</p>
                      {review.is_public ? (
                        <Badge tone="success">
                          <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
                          Published
                        </Badge>
                      ) : (
                        <Badge tone="warning">In moderation</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-warning">{"★".repeat(review.rating ?? 5)}</p>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink-muted">
                      {review.quote}
                    </p>
                    <p className="mt-3 text-xs text-ink-muted">
                      Submitted {formatDate(review.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                className="mt-5"
                title="No reviews submitted"
                description="Verified clients can submit genuine feedback for moderation."
                icon={<Star className="h-5 w-5" />}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
