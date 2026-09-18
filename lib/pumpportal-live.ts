import * as Notifications from "expo-notifications";
import { loadPumpPortalKey } from "./local-secrets";

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let running = false;
let lastKey = "";

function notify(item: any) {
  const mint = typeof item?.mint === "string" ? item.mint : "";
  if (!mint || item.txType !== "create") return;
  const initialBuy = Number(item.initialBuy ?? 0);
  const marketCapSol = Number(item.marketCapSol ?? 0);
  void Notifications.scheduleNotificationAsync({ content: { title: `New launch: $${String(item.symbol ?? "TOKEN")}`, body: `Early flow detected · initial buy ${initialBuy || "—"} · market cap ${marketCapSol ? `${marketCapSol.toFixed(2)} SOL` : "—"}`, data: { address: mint }, sound: "meme_cashier_v2.wav" }, trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1, repeats: false, channelId: "meme-catch-v2" } });
}

async function connect() {
  if (!running || socket) return;
  const key = await loadPumpPortalKey();
  if (!key) return;
  lastKey = key;
  const NativeWebSocket = WebSocket;
  socket = new NativeWebSocket(`wss://pumpportal.fun/api/data?api-key=${encodeURIComponent(key)}`);
  socket.onopen = () => socket?.send(JSON.stringify({ method: "subscribeNewToken" }));
  socket.onmessage = (event) => { try { notify(JSON.parse(String(event.data))); } catch {} };
  const reconnect = () => { socket = null; if (running && !reconnectTimer) { reconnectTimer = setTimeout(() => { reconnectTimer = null; void connect(); }, 3_000); } };
  socket.onerror = reconnect;
  socket.onclose = reconnect;
}

export async function startPumpPortalLiveStream() { running = true; await connect(); return Boolean(lastKey); }
export function stopPumpPortalLiveStream() { running = false; if (reconnectTimer) clearTimeout(reconnectTimer); reconnectTimer = null; socket?.close(); socket = null; }
