"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiResult } from "./types";

export function useResource<T>(loader: () => Promise<ApiResult<T>>, initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const reload = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const result = await loader();
      setData(result.data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => { void reload(); }, [reload]);
  return { data, setData, loading, source: "api" as const, warning: undefined, error, reload };
}
