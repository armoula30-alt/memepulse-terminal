import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { fetchHistoricalOhlcv, fetchLatestMarketSnapshot, fetchRiskReport, forecastToken, getTokenHistory, type MarketToken } from "./market-data";
import { z } from "zod";

let latestTokens: MarketToken[] = [];
function latestToken(address: string) { return latestTokens.find((item) => item.address === address); }

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  market: router({
    latest: publicProcedure.query(async () => ({
      source: "Dexscreener public API",
      chain: "solana",
      observedAt: new Date().toISOString(),
      tokens: (latestTokens = await fetchLatestMarketSnapshot()),
    })),
    history: publicProcedure.input(z.object({ address: z.string().min(20).max(64) })).query(async ({ input }) => ({
      address: input.address,
      source: "server_snapshot_history",
      points: await getTokenHistory(input.address),
    })),
    ohlcv: publicProcedure.input(z.object({ address: z.string().min(20).max(64) })).query(async ({ input }) => ({
      address: input.address,
      source: "geckoterminal_public_api",
      points: await fetchHistoricalOhlcv(input.address),
    })),
    risk: publicProcedure.input(z.object({ address: z.string().min(20).max(64) })).query(({ input }) => fetchRiskReport(input.address)),
    forecast: publicProcedure.input(z.object({ address: z.string().min(20).max(64) })).query(({ input }) => {
      const token = latestToken(input.address);
      return token ? forecastToken(token) : null;
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
