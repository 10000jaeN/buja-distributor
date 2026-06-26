"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseAdminFetchResult<T> = {
  data: T | null;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useAdminFetch<T>(
  fetchFn: () => Promise<T>,
  errorMessage = "데이터를 불러오는 데 실패했습니다.",
): UseAdminFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // fetchFn을 ref로 유지해 매 렌더마다 새 함수를 참조해도 useEffect가 재실행되지 않도록 함
  const fetchFnRef = useRef(fetchFn);
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  });

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFnRef.current();
      setData(result);
    } catch {
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [errorMessage]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, setData, isLoading, error, refetch };
}
