/**
 * useAQI Hook
 *
 * Custom React hook that fetches and manages the current live AQI reading
 * for a given geographic coordinate pair by calling /api/aqi/current.
 *
 * Returns a standard { data, loading, error } tuple with full TypeScript
 * typing via the AQIReading interface.
 *
 * Usage:
 * ```tsx
 * const { data, loading, error } = useAQI(28.6139, 77.2090);
 *
 * if (loading) return <Spinner />;
 * if (error)   return <ErrorBanner message={error} />;
 * return <AQICard reading={data!} />;
 * ```
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import type { AQIReading } from "@/types";

/** Shape of the API response from /api/aqi/current */
interface AQIApiResponse {
  success: boolean;
  data?: AQIReading;
  error?: string;
}

/** Return type of the useAQI hook */
interface UseAQIReturn {
  /** The fetched AQI reading, or null while loading / on error */
  data: AQIReading | null;
  /** Whether the request is currently in-flight */
  loading: boolean;
  /** Human-readable error message, or null on success */
  error: string | null;
  /** Manually re-fetch the AQI data (e.g. on pull-to-refresh) */
  refetch: () => void;
}

/**
 * Fetches live AQI data for the given coordinates.
 *
 * @param lat  Latitude of the location
 * @param lng  Longitude of the location
 * @returns    { data, loading, error, refetch }
 */
export function useAQI(lat: number | null, lng: number | null): UseAQIReturn {
  const [data, setData] = useState<AQIReading | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAQI = useCallback(async () => {
    // Don't fetch if coordinates are missing
    if (lat === null || lng === null) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/aqi/current?lat=${lat}&lng=${lng}`);
      const json: AQIApiResponse = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? `Request failed with status ${res.status}`);
      }

      setData(json.data ?? null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch AQI data";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [lat, lng]);

  // Fetch on mount and whenever coordinates change
  useEffect(() => {
    fetchAQI();
  }, [fetchAQI]);

  return { data, loading, error, refetch: fetchAQI };
}
