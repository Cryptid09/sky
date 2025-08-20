import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

interface UseApiOptions {
  showErrorToast?: boolean;
  errorMessage?: string;
  retryCount?: number;
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(
  apiCall: (...args: any[]) => Promise<T>,
  options: UseApiOptions = {}
) {
  const {
    showErrorToast = true,
    errorMessage = "Operation failed",
    retryCount = 3,
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= retryCount; attempt++) {
        try {
          const result = await apiCall(...args);
          setState({
            data: result,
            loading: false,
            error: null,
          });
          return result;
        } catch (error) {
          lastError = error as Error;
          console.error(`API call failed (attempt ${attempt}/${retryCount}):`, error);

          if (attempt === retryCount) {
            // Final attempt failed
            const errorMsg = errorMessage || lastError?.message || "Unknown error occurred";
            setState({
              data: null,
              loading: false,
              error: errorMsg,
            });

            if (showErrorToast) {
              toast({
                title: "Error",
                description: errorMsg,
                variant: "destructive",
              });
            }

            throw lastError;
          }

          // Wait before retrying (exponential backoff)
          if (attempt < retryCount) {
            await new Promise((resolve) =>
              setTimeout(resolve, Math.min(1000 * 2 ** (attempt - 1), 5000))
            );
          }
        }
      }
    },
    [apiCall, retryCount, errorMessage, showErrorToast]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

export default useApi; 