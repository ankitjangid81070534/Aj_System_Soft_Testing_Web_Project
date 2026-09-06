import Link from "next/link";
import { ArrowDown, ArrowUp, Pencil, Plus, Search, Trash2, Undo2 } from "lucide-react";
import { StatusPill } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { Input } from "@/components/ui/Input";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import {
  deleteResourceAction,
  reorderResourceAction,
  restoreResourceAction,
  toggleResourceActiveAction,
} from "@/lib/admin/actions";
import type { ResourceConfig } from "@/lib/admin/resources";
import type { ResourceListResult } from "@/lib/admin/crud";

function cellValue(row: Record<string, unknown>, name: string, render: string | undefined) {
  const value = row[name];
  if (render === "boolean") {
    return value ? "Yes" : "No";
  }
  if (render === "datetime" && typeof value === "string" && value) {
    return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  }
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

/**
 * Generic admin list: search, status/trash filters, pagination and row
 * actions (edit, reorder, activate, publish state, delete/restore).
 */
export function ResourceList({
  config,
  result,
  q,
  status,
  view,
}: {
  config: ResourceConfig;
  result: ResourceListResult;
  q: string;
  status: string;
  view: string;
}) {
  const inTrash = view === "trash";

  function listHref(next: { page?: number; q?: string; status?: string; view?: string }): string {
    const params = new URLSearchParams();
    const pageNum = next.page ?? 1;
    if (pageNum > 1) params.set("page", String(pageNum));
    const nextQ = next.q ?? q;
    if (nextQ) params.set("q", nextQ);
    const nextStatus = next.status ?? status;
    if (nextStatus) params.set("status", nextStatus);
    const nextView = next.view ?? view;
    if (nextView) params.set("view", nextView);
    const query = params.toString();
    return `/ajadmin/c/${config.section}${query ? `?${query}` : ""}`;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <form
          action={`/ajadmin/c/${config.section}`}
          method="get"
          className="flex max-w-md flex-1 gap-2"
        >
          {view ? <input type="hidden" name="view" value={view} /> : null}
          {status ? <input type="hidden" name="status" value={status} /> : null}
          <Input
            name="q"
            defaultValue={q}
            placeholder={`Search ${config.label.toLowerCase()}…`}
            aria-label={`Search ${config.label}`}
          />
          <button
            type="submit"
            className="icon-control h-11 shrink-0 rounded-xl border border-line bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-canvas focus-ring"
          >
            <Search aria-hidden="true" className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </button>
        </form>
        <div className="flex items-center gap-2">
          {config.supports.publish ? (
            <>
              <Link
                href={listHref({ status: "", page: 1 })}
                aria-pressed={status === ""}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium focus-ring ${status === "" ? "border-brand-600 bg-brand-50 text-brand-700" : "border-line bg-surface text-ink-muted hover:text-ink"}`}
              >
                All
              </Link>
              <Link
                href={listHref({ status: "published", page: 1 })}
                aria-pressed={status === "published"}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium focus-ring ${status === "published" ? "border-brand-600 bg-brand-50 text-brand-700" : "border-line bg-surface text-ink-muted hover:text-ink"}`}
              >
                Published
              </Link>
              <Link
                href={listHref({ status: "draft", page: 1 })}
                aria-pressed={status === "draft"}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium focus-ring ${status === "draft" ? "border-brand-600 bg-brand-50 text-brand-700" : "border-line bg-surface text-ink-muted hover:text-ink"}`}
              >
                Drafts
              </Link>
            </>
          ) : null}
          {config.supports.softDelete ? (
            <Link
              href={listHref({ view: inTrash ? "" : "trash", page: 1 })}
              aria-pressed={inTrash}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium focus-ring ${inTrash ? "border-danger/40 bg-danger-soft text-danger" : "border-line bg-surface text-ink-muted hover:text-ink"}`}
            >
              Trash
            </Link>
          ) : null}
          <Link
            href={`/ajadmin/c/${config.section}/new`}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-on-brand shadow-e2 transition-colors hover:bg-brand-700 focus-ring"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            New
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-e1">
        {result.rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">{config.label} list</caption>
              <thead>
                <tr className="border-b border-line bg-canvas text-xs uppercase tracking-wide text-ink-muted">
                  {config.listColumns.map((column) => (
                    <th key={column.name} scope="col" className="px-4 py-3 font-medium">
                      {column.label}
                    </th>
                  ))}
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => {
                  const rowId = String(row.id);
                  const editHref = `/ajadmin/c/${config.section}/${rowId}`;
                  return (
                    <tr
                      key={rowId}
                      className="border-b border-line last:border-b-0 hover:bg-canvas/50"
                    >
                      {config.listColumns.map((column) => (
                        <td key={column.name} className="max-w-[16rem] truncate px-4 py-3">
                          {column.render === "status" ? (
                            <StatusPill status={String(row[column.name] ?? "draft")} />
                          ) : (
                            <span className="text-ink-soft">
                              {cellValue(row, column.name, column.render)}
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {config.supports.reorder && !inTrash ? (
                            <>
                              <form action={reorderResourceAction}>
                                <input type="hidden" name="__resource" value={config.key} />
                                <input type="hidden" name="__id" value={rowId} />
                                <input type="hidden" name="direction" value="up" />
                                <button
                                  type="submit"
                                  aria-label={`Move ${String(row[config.listColumns[0].name])} up`}
                                  className="icon-control inline-flex h-8 w-8 items-center justify-center rounded-full p-1.5 text-ink-muted transition-colors hover:bg-canvas-raised hover:text-ink focus-ring"
                                >
                                  <ArrowUp aria-hidden="true" className="h-4 w-4" />
                                </button>
                              </form>
                              <form action={reorderResourceAction}>
                                <input type="hidden" name="__resource" value={config.key} />
                                <input type="hidden" name="__id" value={rowId} />
                                <input type="hidden" name="direction" value="down" />
                                <button
                                  type="submit"
                                  aria-label={`Move ${String(row[config.listColumns[0].name])} down`}
                                  className="icon-control inline-flex h-8 w-8 items-center justify-center rounded-full p-1.5 text-ink-muted transition-colors hover:bg-canvas-raised hover:text-ink focus-ring"
                                >
                                  <ArrowDown aria-hidden="true" className="h-4 w-4" />
                                </button>
                              </form>
                            </>
                          ) : null}
                          {config.supports.activate && !inTrash ? (
                            <form action={toggleResourceActiveAction}>
                              <input type="hidden" name="__resource" value={config.key} />
                              <input type="hidden" name="__id" value={rowId} />
                              <button
                                type="submit"
                                className="action-control action-secondary action-xs rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink-muted transition-colors hover:text-ink focus-ring"
                              >
                                {row.is_active ? "Deactivate" : "Activate"}
                              </button>
                            </form>
                          ) : null}
                          {inTrash && config.supports.softDelete ? (
                            <ConfirmButton
                              action={restoreResourceAction}
                              resource={config.key}
                              id={rowId}
                              label={
                                <span className="inline-flex items-center gap-1">
                                  <Undo2 aria-hidden="true" className="h-3.5 w-3.5" />
                                  Restore
                                </span>
                              }
                              title="Restore this record?"
                              description="It will reappear in the active list."
                              confirmLabel="Restore"
                              className="action-control action-secondary action-xs rounded-full border border-line px-2.5 py-1 text-xs font-medium text-success transition-colors hover:bg-success-soft focus-ring"
                            />
                          ) : (
                            <Link
                              href={editHref}
                              aria-label={`Edit ${String(row[config.listColumns[0].name] ?? "item")}`}
                              className="rounded-full border border-line p-1.5 text-ink-muted transition-colors hover:text-ink focus-ring"
                            >
                              <Pencil aria-hidden="true" className="h-4 w-4" />
                            </Link>
                          )}
                          {!inTrash ? (
                            <ConfirmButton
                              action={deleteResourceAction}
                              resource={config.key}
                              id={rowId}
                              label={<Trash2 aria-hidden="true" className="h-4 w-4" />}
                              title={`Delete this ${config.singular.toLowerCase()}?`}
                              description={
                                config.supports.softDelete
                                  ? "It moves to the trash and can be restored later."
                                  : "This permanently removes the record. This cannot be undone."
                              }
                              confirmLabel={
                                config.supports.softDelete ? "Move to trash" : "Delete permanently"
                              }
                              className="icon-control inline-flex h-8 w-8 items-center justify-center rounded-full p-1.5 text-ink-muted transition-colors hover:bg-danger-soft hover:text-danger focus-ring"
                            />
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : result.error ? (
          <div className="p-4">
            <EmptyState
              title="Could not load records"
              description="The database request failed, so the list may be out of date. This is not the same as an empty module — please retry."
            />
          </div>
        ) : (
          <div className="p-4">
            <EmptyState
              title={
                inTrash
                  ? "Trash is empty"
                  : q || status
                    ? "Nothing matches"
                    : `No ${config.label.toLowerCase()} yet`
              }
              description={
                !inTrash && !q && !status
                  ? `Create your first ${config.singular.toLowerCase()} with the New button.`
                  : undefined
              }
              action={
                !inTrash && !q && !status ? (
                  <Link
                    href={`/ajadmin/c/${config.section}/new`}
                    className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-on-brand hover:bg-brand-700 focus-ring"
                  >
                    Create {config.singular.toLowerCase()}
                  </Link>
                ) : undefined
              }
            />
          </div>
        )}
      </div>

      {result.pageCount > 1 ? (
        <div className="flex items-center justify-between text-sm text-ink-muted">
          <p>
            Page {result.page} of {result.pageCount} · {result.total} total
          </p>
          <div className="flex gap-2">
            {result.page > 1 ? (
              <Link
                href={listHref({ page: result.page - 1 })}
                className="rounded-full border border-line bg-surface px-3 py-1.5 font-medium text-ink hover:bg-canvas focus-ring"
              >
                Previous
              </Link>
            ) : null}
            {result.page < result.pageCount ? (
              <Link
                href={listHref({ page: result.page + 1 })}
                className="rounded-full border border-line bg-surface px-3 py-1.5 font-medium text-ink hover:bg-canvas focus-ring"
              >
                Next
              </Link>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="text-xs text-ink-muted" role="status">
          {result.total} {result.total === 1 ? "record" : "records"}
        </p>
      )}
    </div>
  );
}
