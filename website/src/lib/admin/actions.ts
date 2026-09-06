"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { can, type Capability } from "@/lib/auth/permissions";
import { SLUG_PATTERN } from "@/lib/admin/resources";
import {
  getResourceConfig,
  getResourceRow,
  getAdjacentRowId,
  uniqueSlug,
  type AdminRow,
} from "@/lib/admin/crud";
import type { ResourceConfig } from "@/lib/admin/resources";
import {
  authFailure,
  databaseFailureForCode,
  validationFailure,
  type AdminMutationFailure,
  type AdminMutationState,
} from "@/lib/admin/mutation-result";

export type ResourceActionState = AdminMutationState<{ id: string }>;

function formString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

type AuthResult =
  | { ok: false; result: AdminMutationFailure }
  | { ok: true; user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>> };

async function authorize(capability: Capability): Promise<AuthResult> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      result: authFailure("UNAUTHORIZED", "Session expired — sign in again."),
    };
  }
  if (!can(user.role, capability)) {
    return {
      ok: false,
      result: authFailure("FORBIDDEN", `Your role (${user.role}) is not allowed to do this.`),
    };
  }
  return { ok: true, user };
}

function refreshResource(config: ResourceConfig, ...slugs: (string | undefined)[]): void {
  try {
    revalidatePath(`/ajadmin/c/${config.section}`);
    revalidatePath("/");

    if (config.key === "services") revalidatePath("/services");
    if (config.key === "projects") revalidatePath("/projects");
    if (config.key === "team") {
      revalidatePath("/team");
      revalidatePath("/about");
    }
    if (config.key === "testimonials") revalidatePath("/reviews");
    if (config.key === "posts" || config.key === "categories" || config.key === "tags") {
      revalidatePath("/blog");
    }
    // Client names render on /projects; SEO overrides feed buildRouteMetadata
    // on every main public route, so a metadata save refreshes all of them.
    if (config.key === "clients") revalidatePath("/projects");
    if (config.key === "seo") {
      for (const route of [
        "/about",
        "/contact",
        "/services",
        "/projects",
        "/reviews",
        "/blog",
        "/team",
        "/request-quote",
      ]) {
        revalidatePath(route);
      }
    }
    if (config.key === "navigation") {
      updateTag("navigation");
      revalidatePath("/", "layout");
    }
    // Growth surfaces: the public readers cache by tag, so admin saves must
    // drop those cache entries alongside the path refreshes.
    if (config.key === "offers") {
      updateTag("offers");
      revalidatePath("/offers");
      revalidatePath("/");
    }
    if (config.key === "announcements") {
      updateTag("announcements");
      revalidatePath("/updates");
      // The top bar lives in the public layout, so refresh every public page.
      revalidatePath("/", "layout");
    }
    if (config.key === "benefits") {
      updateTag("launch-benefits");
      revalidatePath("/");
    }
    if (config.key === "ai-methods") {
      updateTag("ai-methods");
      revalidatePath("/ai-methods");
    }
    if (config.key === "socials") {
      updateTag("social-links");
      // Footer settings also cache the composed social list.
      updateTag("site-settings");
      revalidatePath("/", "layout");
    }
    if (config.publicBase) {
      for (const slug of new Set(slugs.filter((value): value is string => Boolean(value)))) {
        revalidatePath(`${config.publicBase}/${slug}`);
      }
    }
  } catch (error) {
    // A successful database write must never be reported as a failed save
    // because a cache refresh had a transient problem.
    console.error(`[admin] refresh ${config.key} failed`, {
      message: error instanceof Error ? error.message : "Unknown cache refresh failure",
    });
  }
}

function actorPayload(
  config: ResourceConfig,
  actorId: string,
  isCreate = false,
): Record<string, string> {
  if (!config.actorColumns) return {};
  return isCreate ? { created_by: actorId, updated_by: actorId } : { updated_by: actorId };
}

function valueKind(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return `array(${value.length})`;
  return typeof value;
}

function databaseFailure(
  operation: string,
  error: { code?: string; message: string; details?: string | null } | null,
  context: {
    resource: string;
    table: string;
    rowId?: string;
    actorId: string;
    payload?: Record<string, unknown>;
  },
): AdminMutationFailure {
  // Values are intentionally omitted: logs capture shape and identity needed
  // for diagnosis without leaking content, contact data, tokens or secrets.
  console.error(`[admin] ${operation} failed`, {
    code: error?.code ?? "unknown",
    message: error?.message ?? "No row returned",
    resource: context.resource,
    table: context.table,
    rowId: context.rowId ?? "create",
    actorId: context.actorId,
    fields: context.payload
      ? Object.entries(context.payload).map(([name, value]) => ({ name, kind: valueKind(value) }))
      : [],
  });
  if (error?.code === "PGRST204") {
    return {
      ok: false,
      code: "DATABASE_ERROR",
      message: "The database schema is not aligned with this form. Apply the latest migration.",
    };
  }
  return databaseFailureForCode(error?.code);
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

/** Convert parsed field values into a safe DB payload (lines → arrays, "" → null). */
function buildPayload(
  config: ResourceConfig,
  values: Record<string, unknown>,
  actorId: string,
  isCreate: boolean,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const field of config.fields) {
    const value = values[field.name];
    if (field.type === "lines") {
      const lines =
        typeof value === "string"
          ? value
              .split("\n")
              .map((line) => line.trim())
              .filter((line) => line !== "")
          : [];
      payload[field.name] = lines;
      continue;
    }
    if (field.type === "number" || field.type === "datetime") {
      let val = value ?? null;
      if (val === null && (field.name === "sort_order" || field.name === "priority" || field.name === "popup_priority")) {
        val = 0;
      }
      payload[field.name] = val;
      continue;
    }
    if (field.type === "boolean") {
      payload[field.name] = value === true;
      continue;
    }
    if (
      field.type === "text" ||
      field.type === "textarea" ||
      field.type === "markdown" ||
      field.type === "select" ||
      field.type === "image" ||
      field.type === "slug"
    ) {
      if (field.name.endsWith("_id")) {
        payload[field.name] = value === "" || value === undefined ? null : value;
      } else {
        payload[field.name] = value === undefined || value === null ? "" : value;
      }
      continue;
    }
    payload[field.name] = value ?? null;
  }
  Object.assign(payload, actorPayload(config, actorId, isCreate));
  return payload;
}

export async function upsertResourceAction(
  _prev: ResourceActionState,
  formData: FormData,
): Promise<ResourceActionState> {
  const resourceKey = formString(formData, "__resource");
  const id = formString(formData, "__id");
  if (!resourceKey) return validationFailure("Missing resource.");
  const config = getResourceConfig(resourceKey);
  if (!config) return validationFailure("Unknown resource.");

  const auth = await authorize(`${config.capability}:write` as Capability);
  if (!auth.ok) return auth.result;

  // Collect raw values for validation (checkboxes: absent = false).
  const raw: Record<string, unknown> = {};
  for (const field of config.fields) {
    const value = formData.get(field.name);
    raw[field.name] =
      field.type === "boolean" ? value === "on" : typeof value === "string" ? value : undefined;
  }

  // Lazy import avoids a server-action cycle at module load.
  const { buildResourceSchema } = await import("@/lib/admin/resources");
  const parsed = buildResourceSchema(config).safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      Object.entries(parsed.error.flatten().fieldErrors).filter(
        (entry): entry is [string, string[]] => Array.isArray(entry[1]),
      ),
    );
    return validationFailure(
      parsed.error.issues[0]?.message ?? "Please check the form for errors.",
      fieldErrors,
    );
  }
  const values = parsed.data as Record<string, unknown>;

  // Slug generation on create/update.
  if (config.slugSource) {
    const slugField = config.fields.find((field) => field.name === "slug");
    let slug = typeof values.slug === "string" ? values.slug : "";
    if (slugField && (!slug || !SLUG_PATTERN.test(slug))) {
      const source = values[config.slugSource];
      slug = slugify(typeof source === "string" && source !== "" ? source : "item");
      if (!SLUG_PATTERN.test(slug)) slug = `item-${Date.now()}`;
      values.slug = slug;
    } else if (slug && !SLUG_PATTERN.test(slug)) {
      values.slug = slugify(slug);
    }
  }

  const admin = createSupabaseAdminLooseClient();
  const isCreate = !id;
  if (config.slugSource && isCreate) {
    const slug = typeof values.slug === "string" && values.slug !== "" ? values.slug : "item";
    values.slug = await uniqueSlug(config, slug);
  }

  const payload = buildPayload(config, values, auth.user.id, isCreate);

  if (isCreate) {
    const { data, error } = await admin.from(config.table).insert(payload).select("id").limit(1);
    if (error || !data || data.length === 0) {
      return databaseFailure(`create ${config.key}`, error, {
        resource: config.key,
        table: config.table,
        actorId: auth.user.id,
        payload,
      });
    }
    refreshResource(config, typeof values.slug === "string" ? values.slug : undefined);
    return {
      ok: true,
      message: `${config.singular} created.`,
      data: { id: String(data[0].id) },
    };
  }

  const existing = await getResourceRow(config, id);
  if (!existing) {
    return {
      ok: false,
      code: "CONFLICT",
      message: "This record no longer exists.",
    };
  }
  if (config.supports.softDelete && existing.deleted_at) {
    return {
      ok: false,
      code: "CONFLICT",
      message: "This record is in the trash — restore it before editing.",
    };
  }

  const { data, error } = await admin
    .from(config.table)
    .update(payload)
    .eq("id", id)
    .select("id")
    .limit(1);
  if (error || !data || data.length === 0) {
    return databaseFailure(`update ${config.key}`, error, {
      resource: config.key,
      table: config.table,
      rowId: id,
      actorId: auth.user.id,
      payload,
    });
  }
  refreshResource(
    config,
    typeof existing.slug === "string" ? existing.slug : undefined,
    typeof values.slug === "string" ? values.slug : undefined,
  );
  return { ok: true, message: `${config.singular} saved.`, data: { id } };
}

export async function setResourceStatusAction(formData: FormData): Promise<void> {
  const resourceKey = formString(formData, "__resource");
  const id = formString(formData, "__id");
  const status = formString(formData, "status");
  if (!resourceKey || !id || (status !== "draft" && status !== "published")) return;
  const config = getResourceConfig(resourceKey);
  if (!config || !config.supports.publish) return;

  const auth = await authorize(`${config.capability}:publish` as Capability);
  if (!auth.ok) return;

  const row = await getResourceRow(config, id);
  if (!row) return;

  const admin = createSupabaseAdminLooseClient();
  const payload = { status, ...actorPayload(config, auth.user.id) };
  const { data, error } = await admin
    .from(config.table)
    .update(payload)
    .eq("id", id)
    .select("id")
    .limit(1);
  if (error || !data || data.length === 0) {
    databaseFailure(`publish ${config.key}`, error, {
      resource: config.key,
      table: config.table,
      rowId: id,
      actorId: auth.user.id,
      payload,
    });
    return;
  }
  refreshResource(config, typeof row.slug === "string" ? row.slug : undefined);
}

export async function toggleResourceActiveAction(formData: FormData): Promise<void> {
  const resourceKey = formString(formData, "__resource");
  const id = formString(formData, "__id");
  if (!resourceKey || !id) return;
  const config = getResourceConfig(resourceKey);
  if (!config || !config.supports.activate) return;

  const auth = await authorize(`${config.capability}:write` as Capability);
  if (!auth.ok) return;

  const row = await getResourceRow(config, id);
  if (!row) return;
  const admin = createSupabaseAdminLooseClient();
  const payload = { is_active: !row.is_active, ...actorPayload(config, auth.user.id) };
  const { data, error } = await admin
    .from(config.table)
    .update(payload)
    .eq("id", id)
    .select("id")
    .limit(1);
  if (error || !data || data.length === 0) {
    databaseFailure(`toggle ${config.key}`, error, {
      resource: config.key,
      table: config.table,
      rowId: id,
      actorId: auth.user.id,
      payload,
    });
    return;
  }
  refreshResource(config, typeof row.slug === "string" ? row.slug : undefined);
}

export async function deleteResourceAction(formData: FormData): Promise<void> {
  const resourceKey = formString(formData, "__resource");
  const id = formString(formData, "__id");
  if (!resourceKey || !id) return;
  const config = getResourceConfig(resourceKey);
  if (!config) return;

  const auth = await authorize(`${config.capability}:write` as Capability);
  if (!auth.ok) return;

  const row = await getResourceRow(config, id);
  if (!row) return;

  const admin = createSupabaseAdminLooseClient();
  let data: unknown[] | null = null;
  let error: { code?: string; message: string; details?: string | null } | null = null;
  let payload: Record<string, unknown> | undefined;
  if (config.supports.softDelete) {
    payload = { deleted_at: new Date().toISOString(), ...actorPayload(config, auth.user.id) };
    ({ data, error } = await admin
      .from(config.table)
      .update(payload)
      .eq("id", id)
      .select("id")
      .limit(1));
  } else {
    ({ data, error } = await admin.from(config.table).delete().eq("id", id).select("id").limit(1));
  }
  if (error || !data || data.length === 0) {
    databaseFailure(`delete ${config.key}`, error, {
      resource: config.key,
      table: config.table,
      rowId: id,
      actorId: auth.user.id,
      payload,
    });
    return;
  }
  refreshResource(config, typeof row.slug === "string" ? row.slug : undefined);
}

export async function restoreResourceAction(formData: FormData): Promise<void> {
  const resourceKey = formString(formData, "__resource");
  const id = formString(formData, "__id");
  if (!resourceKey || !id) return;
  const config = getResourceConfig(resourceKey);
  if (!config || !config.supports.softDelete) return;

  const auth = await authorize(`${config.capability}:write` as Capability);
  if (!auth.ok) return;

  const row = await getResourceRow(config, id);
  if (!row) return;

  const admin = createSupabaseAdminLooseClient();
  const payload = { deleted_at: null, ...actorPayload(config, auth.user.id) };
  const { data, error } = await admin
    .from(config.table)
    .update(payload)
    .eq("id", id)
    .select("id")
    .limit(1);
  if (error || !data || data.length === 0) {
    databaseFailure(`restore ${config.key}`, error, {
      resource: config.key,
      table: config.table,
      rowId: id,
      actorId: auth.user.id,
      payload,
    });
    return;
  }
  refreshResource(config, typeof row.slug === "string" ? row.slug : undefined);
}

export async function reorderResourceAction(formData: FormData): Promise<void> {
  const resourceKey = formString(formData, "__resource");
  const id = formString(formData, "__id");
  const direction = formString(formData, "direction");
  if (!resourceKey || !id || (direction !== "up" && direction !== "down")) return;
  const config = getResourceConfig(resourceKey);
  if (!config || !config.supports.reorder) return;

  const auth = await authorize(`${config.capability}:write` as Capability);
  if (!auth.ok) return;

  const row = await getResourceRow(config, id);
  if (!row) return;
  const neighborId = await getAdjacentRowId(config, row, direction);
  if (!neighborId) return;

  const admin = createSupabaseAdminLooseClient();
  const column = config.defaultOrder.column;
  const current = row[column];
  const { data: neighborData } = await admin
    .from(config.table)
    .select(column)
    .eq("id", neighborId)
    .limit(1);
  const neighbor = (neighborData ?? []) as unknown as AdminRow[];
  if (neighbor.length === 0) return;
  const neighborValue = neighbor[0][column];
  // Swap the ordering values.
  const firstPayload = { [column]: neighborValue, ...actorPayload(config, auth.user.id) };
  const { data: firstData, error: firstError } = await admin
    .from(config.table)
    .update(firstPayload)
    .eq("id", id)
    .select("id")
    .limit(1);
  if (firstError || !firstData || firstData.length === 0) {
    databaseFailure(`reorder ${config.key}`, firstError, {
      resource: config.key,
      table: config.table,
      rowId: id,
      actorId: auth.user.id,
      payload: firstPayload,
    });
    return;
  }
  const secondPayload = { [column]: current, ...actorPayload(config, auth.user.id) };
  const { data: secondData, error: secondError } = await admin
    .from(config.table)
    .update(secondPayload)
    .eq("id", neighborId)
    .select("id")
    .limit(1);
  if (secondError || !secondData || secondData.length === 0) {
    // Best-effort compensation keeps the first row at its original order if
    // the second write fails; both failures are logged with row identity.
    const { error: rollbackError } = await admin
      .from(config.table)
      .update({ [column]: current, ...actorPayload(config, auth.user.id) })
      .eq("id", id);
    if (rollbackError) {
      console.error(`[admin] reorder rollback ${config.key} failed`, {
        code: rollbackError.code,
        message: rollbackError.message,
        rowId: id,
      });
    }
    databaseFailure(`reorder neighbor ${config.key}`, secondError, {
      resource: config.key,
      table: config.table,
      rowId: neighborId,
      actorId: auth.user.id,
      payload: secondPayload,
    });
    return;
  }
  refreshResource(config, typeof row.slug === "string" ? row.slug : undefined);
}
