"use client";

import { useEffect, useState } from "react";
import type { LocationOption } from "./ajsystemsoft_in_LocationCombobox";

const memory = new Map<string, LocationOption[]>();

/** Loads one location list from /api/geo. `query` null = nothing to load. */
export function useGeoOptions(query: string | null) {
  const [loaded, setLoaded] = useState<{ query: string | null; items: LocationOption[] }>({
    query: null,
    items: [],
  });

  useEffect(() => {
    if (query === null) return;
    let active = true;
    const cached = memory.get(query);
    const request = cached
      ? Promise.resolve(cached)
      : fetch(`/api/geo${query}`)
          .then((res) => res.json() as Promise<{ items?: LocationOption[] }>)
          .then((body) => {
            const items = body.items ?? [];
            memory.set(query, items);
            return items;
          })
          .catch(() => [] as LocationOption[]);
    request.then((items) => {
      if (active) setLoaded({ query, items });
    });
    return () => {
      active = false;
    };
  }, [query]);

  const ready = query !== null && loaded.query === query;
  return { items: ready ? loaded.items : [], loading: query !== null && !ready };
}
