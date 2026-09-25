import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import superjson from "superjson";
import type { AppRouter } from "@/server/routers";
import { getApiBaseUrl } from "@/constants/oauth";
import * as Auth from "@/lib/_core/auth";
import {
  localForecast,
  localLatest,
  localNewTokens,
  localOhlcv,
  localRisk,
  localSafety,
  localStrategy,
  LOCAL_TOKENS,
} from "@/lib/local-demo-data";

/**
 * Local-only is the default for the first phone/Windows test build.
 * Set EXPO_PUBLIC_LOCAL_ONLY=false when a real API server is available.
 */
export const LOCAL_ONLY = process.env.EXPO_PUBLIC_LOCAL_ONLY !== "false";
export const PUMPPORTAL_LIVE = process.env.EXPO_PUBLIC_PUMPPORTAL_LIVE === "true";

export const remoteTrpc = createTRPCReact<AppRouter>();

export function createTRPCClient() {
  return remoteTrpc.createClient({
    links: [
      httpBatchLink({
        url: `${getApiBaseUrl()}/api/trpc`,
        transformer: superjson,
        async headers() {
          const token = await Auth.getSessionToken();
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
        fetch(url, options) {
          return fetch(url, { ...options, credentials: "include" });
        },
      }),
    ],
  });
}

function localQuery<T>(key: string, fn: () => T | Promise<T>, options?: unknown) {
  return useQuery({
    queryKey: ["local", key],
    queryFn: fn,
    staleTime: 1_000,
    ...(options as Record<string, unknown> | undefined),
  });
}

function LocalProvider({ children }: { children: ReactNode }) {
  return children;
}

const localTrpc = {
  Provider: LocalProvider,
  market: {
    latest: {
      useQuery: (_input?: unknown, options?: unknown) => localQuery("market.latest", localLatest, options),
    },
    newTokens: {
      useQuery: (_input?: unknown, options?: unknown) => localQuery("market.newTokens", localNewTokens, options),
    },
    quality: {
      useQuery: (input?: { addresses?: string[] }, options?: unknown) => localQuery(
        `market.quality:${(input?.addresses ?? []).join(",")}`,
        () => Object.fromEntries((input?.addresses ?? []).map((address) => [address, localSafety(address)])),
        options,
      ),
    },
    risk: {
      useQuery: (input?: { address?: string }, options?: unknown) => localQuery(`market.risk:${input?.address ?? ""}`, () => localRisk(input?.address ?? ""), options),
    },
    forecast: {
      useQuery: (input?: { address?: string }, options?: unknown) => localQuery(`market.forecast:${input?.address ?? ""}`, () => localForecast(input?.address ?? ""), options),
    },
    safety: {
      useQuery: (input?: { address?: string }, options?: unknown) => localQuery(`market.safety:${input?.address ?? ""}`, () => localSafety(input?.address ?? ""), options),
    },
    strategy: {
      useQuery: (input?: { address?: string }, options?: unknown) => localQuery(`market.strategy:${input?.address ?? ""}`, () => localStrategy(input?.address ?? ""), options),
    },
    ohlcv: {
      useQuery: (input?: { address?: string }, options?: unknown) => localQuery(`market.ohlcv:${input?.address ?? ""}`, () => localOhlcv(input?.address ?? ""), options),
    },
  },
};

// Keep the same screen-facing API. Local mode needs no network or server.
export const trpc = (LOCAL_ONLY ? localTrpc : remoteTrpc) as typeof remoteTrpc;

export function getLocalDemoSummary() {
  return { enabled: LOCAL_ONLY, tokenCount: LOCAL_TOKENS.length };
}
