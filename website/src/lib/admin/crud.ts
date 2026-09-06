import "server-only";
import { createSupabaseAdminLooseClient } from "@/lib/supabase/admin";
import { RESOURCES, type ResourceConfig, type ResourceKey } from "@/lib/admin/resources";

export type AdminRow = Record<string, unknown>;

export type ResourceListResult = {
  rows: AdminRow[];
  total: number;
  page: number;
  pageCount: number;
  /** True when the listing query failed — the UI must not render "no rows yet". */
  error?: boolean;
};

export function getResourceConfig(key: string): ResourceConfig | null {
  return (RESOURCES as Record<string, ResourceConfig>)[key] ?? null;
}

export function isResourceKey(key: string): key is ResourceKey {
  return key in RESOURCES;
}

const PER_PAGE = 20;

/**
 * Generic listing for the admin tables: search across configured fields,
 * status filter, trash view and pagination. Runs through the service-role
 * client so admins can manage drafts and trash — the route calling this is
 * gated by can() checks.
 */
export async function listResourceRows(
  config: ResourceConfig,
  options: { page?: number; q?: string; status?: string; view?: string },
): Promise<ResourceListResult> {
  const admin = createSupabaseAdminLooseClient();
  const page = Math.max(1, options.page ?? 1);
  const softDelete = config.supports.softDelete === true;

  let query = admin.from(config.table).select("*", { count: "exact" });
  if (softDelete) {
    query =
      options.view === "trash" ? query.not("deleted_at", "is", null) : query.is("deleted_at", null);
  }
  if (options.status === "published" || options.status === "draft") {
    query = query.eq("status", options.status);
  }
  const q = options.q?.trim();
  if (q) {
    const pattern = `%${q.replace(/[%_]/g, "")}%`;
    const conditions = config.searchFields.map((field) => `${field}.ilike.${pattern}`).join(",");
    query = query.or(conditions);
  }
  query = query.order(config.defaultOrder.column, {
    ascending: config.defaultOrder.asc,
    nullsFirst: false,
  });

  const from = (page - 1) * PER_PAGE;
  const { data, error, count } = await query.range(from, from + PER_PAGE - 1);
  if (error) {
    console.error(`listResourceRows(${config.key}) failed:`, error.message);
    return { rows: [], total: 0, page: 1, pageCount: 1, error: true };
  }
  const rows = (data ?? []) as unknown as AdminRow[];
  const total = count ?? rows.length;
  return { rows, total, page, pageCount: Math.max(1, Math.ceil(total / PER_PAGE)) };
}

export async function getResourceRow(config: ResourceConfig, id: string): Promise<AdminRow | null> {
  const admin = createSupabaseAdminLooseClient();
  const { data, error } = await admin.from(config.table).select("*").eq("id", id).limit(1);
  if (error) {
    console.error(`getResourceRow(${config.key}) failed:`, error.message);
    return null;
  }
  const rows = (data ?? []) as unknown as AdminRow[];
  return rows[0] ?? null;
}

export async function getAdjacentRowId(
  config: ResourceConfig,
  row: AdminRow,
  direction: "up" | "down",
): Promise<string | null> {
  const admin = createSupabaseAdminLooseClient();
  const column = config.defaultOrder.column;
  const current = typeof row[column] === "number" ? (row[column] as number) : null;
  if (current === null) return null;

  let query = admin.from(config.table).select("*");
  if (config.supports.softDelete) query = query.is("deleted_at", null);
  const { data, error } = await query.order(column, {
    ascending: config.defaultOrder.asc,
    nullsFirst: false,
  });
  if (error || !data) return null;
  const rows = (data ?? []) as unknown as AdminRow[];

  const index = rows.findIndex((item) => item.id === row.id);
  const target = direction === "up" ? rows[index - 1] : rows[index + 1];
  return target ? String(target.id) : null;
}

/** Unique slug: appends -2, -3, … when the base slug already exists. */
export async function uniqueSlug(
  config: ResourceConfig,
  base: string,
  excludeId?: string,
): Promise<string> {
  const admin = createSupabaseAdminLooseClient();
  let candidate = base;
  for (let suffix = 2; suffix < 50; suffix += 1) {
    let query = admin.from(config.table).select("id").eq("slug", candidate).limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query;
    const rows = (data ?? []) as unknown as AdminRow[];
    if (rows.length === 0) return candidate;
    candidate = `${base}-${suffix}`;
  }
  return `${base}-${Date.now()}`;
}
