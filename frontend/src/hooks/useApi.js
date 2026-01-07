/**
 * Custom hook for API calls with loading and error handling
 */

"use client";

import { useState, useCallback } from "react";

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args);
      setLoading(false);
      return { success: true, data: result.data || result };
    } catch (err) {
      setLoading(false);
      const errorMessage = err.message || "An error occurred";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return { loading, error, execute, reset };
}
