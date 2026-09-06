import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { AdminSubmitButton } from "@/components/admin/AdminSubmitButton";
import { getCurrentUser } from "@/lib/auth/session";
import { can, ROLE_LABELS, ROLES } from "@/lib/auth/permissions";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";
import {
  changeUserRoleAction,
  createUserAction,
  resetUserPasswordAction,
  updateAdminUsernameAction,
} from "@/lib/admin/user-actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "AJS Admin — Users & Roles" },
  robots: { index: false, follow: false },
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/ajadmin/login");
  if (!can(user.role, "users:read")) {
    return (
      <section>
        <p
          role="alert"
          className="max-w-xl rounded-lg bg-warning-soft px-4 py-3 text-sm text-warning"
        >
          Your role ({user.role}) does not include user management access.
        </p>
      </section>
    );
  }
  if (!isSupabaseConfigured) {
    return (
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Users & roles</h1>
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
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, email, full_name, phone, role, created_at")
    .order("created_at", { ascending: true });
  const { data: usernameRows } = await admin
    .from("admin_usernames")
    .select("user_id, username, is_active");
  const usernames = new Map(
    (usernameRows ?? []).map((entry: Record<string, unknown>) => [
      String(entry.user_id),
      entry.is_active ? String(entry.username) : "",
    ]),
  );
  const rows = (profiles ?? []) as unknown as Record<string, unknown>[];
  const canManage = can(user.role, "users:manage");

  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Users & roles</h1>
      <p className="mt-1 max-w-3xl text-sm text-ink-muted">
        Super admins can create confirmed client or staff accounts, assign staff usernames and set a
        new password without knowing the old one. Password values are sent only to Supabase Auth and
        are never stored in the application database or audit log.
      </p>

      {params.notice ? (
        <p role="status" className="mt-4 rounded-xl bg-success-soft px-4 py-3 text-sm text-success">
          {params.notice}
        </p>
      ) : null}
      {params.error ? (
        <p role="alert" className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          {params.error}
        </p>
      ) : null}

      {canManage ? (
        <form
          action={createUserAction}
          className="mt-5 rounded-2xl border border-line bg-surface p-5 shadow-e1"
        >
          <h2 className="text-lg font-semibold text-ink">Create a login</h2>
          <p className="mt-1 text-xs text-ink-muted">
            Staff use username + password. Clients use email + password.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input
              name="fullName"
              required
              minLength={2}
              maxLength={120}
              placeholder="Full name"
              className="h-11 rounded-xl border border-line bg-surface px-3 text-sm text-ink focus-ring"
            />
            <input
              name="email"
              required
              type="email"
              maxLength={200}
              placeholder="Email address"
              className="h-11 rounded-xl border border-line bg-surface px-3 text-sm text-ink focus-ring"
            />
            <input
              name="phone"
              required
              type="tel"
              minLength={6}
              maxLength={20}
              placeholder="Mobile number"
              className="h-11 rounded-xl border border-line bg-surface px-3 text-sm text-ink focus-ring"
            />
            <select
              name="role"
              defaultValue="client"
              className="h-11 rounded-xl border border-line bg-surface px-3 text-sm text-ink focus-ring"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
            <input
              name="username"
              minLength={3}
              maxLength={32}
              pattern="[a-z0-9][a-z0-9._-]{2,31}"
              placeholder="Staff username (not for clients)"
              className="h-11 rounded-xl border border-line bg-surface px-3 text-sm text-ink focus-ring"
            />
            <input
              name="addressLine1"
              maxLength={255}
              placeholder="Address line 1 (optional)"
              className="h-11 rounded-xl border border-line bg-surface px-3 text-sm text-ink focus-ring"
            />
            <input
              name="city"
              maxLength={100}
              placeholder="City (optional)"
              className="h-11 rounded-xl border border-line bg-surface px-3 text-sm text-ink focus-ring"
            />
            <input
              name="state"
              maxLength={100}
              placeholder="State/Province (optional)"
              className="h-11 rounded-xl border border-line bg-surface px-3 text-sm text-ink focus-ring"
            />
            <input
              name="postalCode"
              maxLength={20}
              placeholder="Postal code (optional)"
              className="h-11 rounded-xl border border-line bg-surface px-3 text-sm text-ink focus-ring"
            />
            <input
              name="password"
              required
              type="password"
              minLength={12}
              maxLength={128}
              autoComplete="new-password"
              placeholder="Strong temporary password"
              className="h-11 rounded-xl border border-line bg-surface px-3 text-sm text-ink focus-ring"
            />
          </div>
          <p className="mt-3 text-xs text-ink-muted">
            Password needs 12+ characters with uppercase, lowercase, number and symbol.
          </p>
          <div className="mt-4">
            <AdminSubmitButton idleLabel="Create user" pendingLabel="Creating user…" />
          </div>
        </form>
      ) : null}

      <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-surface shadow-e1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Staff users</caption>
            <thead>
              <tr className="border-b border-line bg-canvas text-xs uppercase tracking-wide text-ink-muted">
                <th scope="col" className="px-4 py-3 font-medium">
                  User
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Role
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Staff username
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const id = String(row.id);
                const isSelf = id === user.id;
                return (
                  <tr key={id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{String(row.full_name ?? "—")}</p>
                      <p className="text-xs text-ink-muted">{String(row.email)}</p>
                      {row.phone ? (
                        <p className="text-xs text-ink-muted">{String(row.phone)}</p>
                      ) : null}
                      {isSelf ? (
                        <p className="mt-0.5 text-[10px] font-medium text-brand-600">You</p>
                      ) : null}
                      {canManage ? (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs font-medium text-brand-700">
                            Set new password
                          </summary>
                          <form
                            action={resetUserPasswordAction}
                            className="mt-2 flex min-w-64 gap-2"
                          >
                            <input type="hidden" name="id" value={id} />
                            <input
                              name="password"
                              required
                              type="password"
                              minLength={12}
                              maxLength={128}
                              autoComplete="new-password"
                              placeholder="New strong password"
                              className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-surface px-2.5 text-xs text-ink focus-ring"
                            />
                            <AdminSubmitButton
                              idleLabel="Reset"
                              pendingLabel="Resetting…"
                              compact
                            />
                          </form>
                        </details>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      {canManage && !isSelf ? (
                        <form action={changeUserRoleAction} className="flex items-center gap-2">
                          <input type="hidden" name="id" value={id} />
                          <select
                            name="role"
                            defaultValue={String(row.role)}
                            aria-label={`Role for ${String(row.email)}`}
                            className="h-9 rounded-lg border border-line bg-surface px-2.5 text-sm text-ink focus-ring"
                          >
                            {ROLES.map((role) => (
                              <option key={role} value={role}>
                                {ROLE_LABELS[role]}
                              </option>
                            ))}
                          </select>
                          <AdminSubmitButton idleLabel="Save" pendingLabel="Saving…" compact />
                        </form>
                      ) : (
                        <Badge tone="brand">
                          {ROLE_LABELS[String(row.role) as keyof typeof ROLE_LABELS] ??
                            String(row.role)}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {canManage && String(row.role) !== "client" ? (
                        <form
                          action={updateAdminUsernameAction}
                          className="flex min-w-56 items-center gap-2"
                        >
                          <input type="hidden" name="id" value={id} />
                          <input
                            name="username"
                            defaultValue={usernames.get(id) ?? ""}
                            required
                            minLength={3}
                            maxLength={32}
                            pattern="[a-z0-9][a-z0-9._-]{2,31}"
                            aria-label={`Staff username for ${String(row.email)}`}
                            placeholder="staff.username"
                            className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-surface px-2.5 text-sm text-ink focus-ring"
                          />
                          <AdminSubmitButton idleLabel="Save" pendingLabel="Saving…" compact />
                        </form>
                      ) : (
                        <span className="text-xs text-ink-muted">{usernames.get(id) || "—"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-muted">
                      <time dateTime={String(row.created_at)}>
                        {new Date(String(row.created_at)).toLocaleDateString("en-IN", {
                          dateStyle: "medium",
                        })}
                      </time>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {!canManage ? (
        <p className="mt-3 text-xs text-ink-muted">Only super admins can change roles.</p>
      ) : null}
    </section>
  );
}
