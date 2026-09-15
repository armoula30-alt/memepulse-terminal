import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";

const palette = {
  bg: "#07100F",
  surface: "#0D1B18",
  surface2: "#10231F",
  border: "#1C3A33",
  text: "#F2F8F5",
  muted: "#88A69A",
  mint: "#76F2B6",
  mintSoft: "#143E30",
  amber: "#F8C36A",
  red: "#FF7B80",
  blue: "#8BB8FF",
};

const radar = [
  { symbol: "$NINA", name: "Nina The Monkey", score: 82, move: "+18.4%", tone: "mint", tag: "MOMENTUM" },
  { symbol: "$MARINE", name: "LinkMarine", score: 76, move: "+11.7%", tone: "blue", tag: "VOLUME" },
  { symbol: "$ZELDA", name: "Zelda", score: 64, move: "+7.2%", tone: "amber", tag: "WATCH" },
];

export default function HomeScreen() {
  const [watching, setWatching] = useState<string[]>(["$NINA"]);
  const [scanRunning, setScanRunning] = useState(true);
  const watchedCount = watching.length;
  const marketPulse = useMemo(() => (scanRunning ? "SCANNING" : "PAUSED"), [scanRunning]);

  const toggleWatch = (symbol: string) => {
    setWatching((current) => current.includes(symbol) ? current.filter((item) => item !== symbol) : [...current, symbol]);
  };

  return (
    <ScreenContainer className="px-5" containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.topbar}>
          <View>
            <View style={styles.brandRow}>
              <View style={styles.brandMark}><MaterialIcons name="candlestick-chart" size={18} color={palette.bg} /></View>
              <Text style={styles.brand}>MEMEPULSE</Text>
            </View>
            <Text style={styles.eyebrow}>PRO TERMINAL / SOLANA INTELLIGENCE</Text>
          </View>
          <View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE DEMO</Text></View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroKicker}>MARKET PULSE</Text>
            <Text style={styles.heroTitle}>Find signal before the crowd.</Text>
            <Text style={styles.heroBody}>A disciplined command center for meme-coin discovery, risk scoring and paper execution.</Text>
          </View>
          <View style={styles.scoreOrb}>
            <Text style={styles.orbScore}>78</Text>
            <Text style={styles.orbLabel}>PULSE</Text>
          </View>
        </View>

        <View style={styles.notice}>
          <MaterialIcons name="shield" size={16} color={palette.mint} />
          <Text style={styles.noticeText}>Paper mode only. No wallet keys, signing or live orders are connected.</Text>
        </View>

        <View style={styles.metricGrid}>
          <Metric label="MARKET CAP" value="$2.41B" delta="+4.8%" icon="account-balance" />
          <Metric label="VOLUME / 24H" value="$184M" delta="+12.1%" icon="bar-chart" />
          <Metric label="WATCHLIST" value={String(watchedCount).padStart(2, "0")} delta="tracked" icon="star-border" />
          <Metric label="RISK MODE" value="GUARDED" delta="active" icon="security" />
        </View>

        <View style={styles.sectionHeader}>
          <View><Text style={styles.sectionTitle}>Signal engine</Text><Text style={styles.sectionMeta}>Composite score · demo snapshot</Text></View>
          <Pressable onPress={() => setScanRunning((value) => !value)} style={({ pressed }) => [styles.controlButton, pressed && styles.pressed]}>
            <MaterialIcons name={scanRunning ? "pause" : "play-arrow"} size={15} color={palette.mint} />
            <Text style={styles.controlText}>{marketPulse}</Text>
          </Pressable>
        </View>

        <View style={styles.engineCard}>
          <View style={styles.engineTop}><View><Text style={styles.engineLabel}>OPPORTUNITY INDEX</Text><Text style={styles.engineValue}>78 <Text style={styles.engineOutOf}>/ 100</Text></Text></View><View style={styles.engineBadge}><Text style={styles.engineBadgeText}>WATCH</Text></View></View>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: "78%" }]} /></View>
          <View style={styles.engineFooter}><Text style={styles.engineMuted}>Liquidity + momentum + holder health</Text><Text style={styles.engineMuted}>Updated 12s ago</Text></View>
        </View>

        <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Momentum radar</Text><Text style={styles.sectionMeta}>Top candidates by composite score</Text></View><MaterialIcons name="arrow-forward" size={20} color={palette.muted} /></View>
        <View style={styles.radarCard}>
          {radar.map((item, index) => (
            <View key={item.symbol} style={[styles.radarRow, index < radar.length - 1 && styles.rowDivider]}>
              <View style={[styles.tokenAvatar, { backgroundColor: item.tone === "mint" ? palette.mintSoft : item.tone === "blue" ? "#162C49" : "#3A2B16" }]}><Text style={[styles.avatarText, { color: item.tone === "mint" ? palette.mint : item.tone === "blue" ? palette.blue : palette.amber }]}>{item.symbol.replace("$", "").slice(0, 1)}</Text></View>
              <View style={styles.tokenInfo}><View style={styles.tokenLine}><Text style={styles.tokenSymbol}>{item.symbol}</Text><Text style={[styles.tokenTag, { color: item.tone === "mint" ? palette.mint : item.tone === "blue" ? palette.blue : palette.amber }]}>{item.tag}</Text></View><Text style={styles.tokenName}>{item.name}</Text></View>
              <View style={styles.tokenStats}><Text style={styles.tokenMove}>{item.move}</Text><Text style={styles.tokenScore}>score {item.score}</Text></View>
              <Pressable onPress={() => toggleWatch(item.symbol)} style={({ pressed }) => [styles.starButton, pressed && styles.pressed]}><MaterialIcons name={watching.includes(item.symbol) ? "star" : "star-border"} size={21} color={watching.includes(item.symbol) ? palette.amber : palette.muted} /></Pressable>
            </View>
          ))}
        </View>

        <View style={styles.footerCard}><MaterialIcons name="info-outline" size={16} color={palette.muted} /><Text style={styles.footerText}>Scores are research signals, not predictions. Always verify contract, liquidity and holder concentration before independent decisions.</Text></View>
      </ScrollView>
    </ScreenContainer>
  );
}

function Metric({ label, value, delta, icon }: { label: string; value: string; delta: string; icon: keyof typeof MaterialIcons.glyphMap }) {
  return <View style={styles.metric}><MaterialIcons name={icon} size={16} color={palette.mint} /><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricDelta}>{delta}</Text></View>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 16, paddingBottom: 32, gap: 16 },
  topbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandMark: { width: 28, height: 28, borderRadius: 9, backgroundColor: palette.mint, alignItems: "center", justifyContent: "center" },
  brand: { color: palette.text, fontSize: 16, fontWeight: "800", letterSpacing: 1.5 },
  eyebrow: { color: palette.muted, fontSize: 9, fontWeight: "700", letterSpacing: 1.2, marginTop: 5 },
  livePill: { flexDirection: "row", alignItems: "center", gap: 6, borderColor: palette.border, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 20 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.mint },
  liveText: { color: palette.mint, fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  hero: { backgroundColor: palette.surface, borderRadius: 22, borderWidth: 1, borderColor: palette.border, padding: 18, flexDirection: "row", alignItems: "center", minHeight: 152 },
  heroCopy: { flex: 1, paddingRight: 12 },
  heroKicker: { color: palette.mint, fontSize: 10, fontWeight: "800", letterSpacing: 1.4, marginBottom: 9 },
  heroTitle: { color: palette.text, fontSize: 25, lineHeight: 29, fontWeight: "800", letterSpacing: -0.8 },
  heroBody: { color: palette.muted, fontSize: 12, lineHeight: 18, marginTop: 9 },
  scoreOrb: { width: 90, height: 90, borderRadius: 45, borderWidth: 1, borderColor: palette.mint, backgroundColor: palette.mintSoft, alignItems: "center", justifyContent: "center" },
  orbScore: { color: palette.mint, fontSize: 30, fontWeight: "800" },
  orbLabel: { color: palette.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1.3, marginTop: -2 },
  notice: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 13, paddingVertical: 11, backgroundColor: "#0B251D", borderRadius: 12, borderWidth: 1, borderColor: "#164D3B" },
  noticeText: { color: "#A4DCC3", flex: 1, fontSize: 11, lineHeight: 16 },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  metric: { width: "48.5%", minHeight: 92, backgroundColor: palette.surface, borderRadius: 15, borderWidth: 1, borderColor: palette.border, padding: 12 },
  metricLabel: { color: palette.muted, fontSize: 9, fontWeight: "800", letterSpacing: 0.6, marginTop: 9 },
  metricValue: { color: palette.text, fontSize: 19, fontWeight: "800", marginTop: 5 },
  metricDelta: { color: palette.mint, fontSize: 10, fontWeight: "700", marginTop: 3 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  sectionTitle: { color: palette.text, fontSize: 16, fontWeight: "800" },
  sectionMeta: { color: palette.muted, fontSize: 10, marginTop: 3 },
  controlButton: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderColor: palette.border, borderRadius: 9, paddingHorizontal: 9, paddingVertical: 7 },
  controlText: { color: palette.mint, fontSize: 9, fontWeight: "800", letterSpacing: 0.6 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  engineCard: { backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1, borderRadius: 17, padding: 16 },
  engineTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  engineLabel: { color: palette.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1.2 },
  engineValue: { color: palette.text, fontSize: 31, fontWeight: "800", marginTop: 5 },
  engineOutOf: { color: palette.muted, fontSize: 15, fontWeight: "600" },
  engineBadge: { backgroundColor: "#392F17", borderRadius: 8, paddingHorizontal: 9, paddingVertical: 6 },
  engineBadgeText: { color: palette.amber, fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  progressTrack: { height: 8, backgroundColor: "#183029", borderRadius: 8, marginTop: 15, overflow: "hidden" },
  progressFill: { height: 8, backgroundColor: palette.mint, borderRadius: 8 },
  engineFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  engineMuted: { color: palette.muted, fontSize: 9 },
  radarCard: { backgroundColor: palette.surface, borderRadius: 17, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 13 },
  radarRow: { flexDirection: "row", alignItems: "center", paddingVertical: 13, gap: 10 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: palette.border },
  tokenAvatar: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontWeight: "900" },
  tokenInfo: { flex: 1 },
  tokenLine: { flexDirection: "row", alignItems: "center", gap: 7 },
  tokenSymbol: { color: palette.text, fontWeight: "800", fontSize: 13 },
  tokenTag: { fontSize: 8, fontWeight: "800", letterSpacing: 0.5 },
  tokenName: { color: palette.muted, fontSize: 10, marginTop: 4 },
  tokenStats: { alignItems: "flex-end" },
  tokenMove: { color: palette.mint, fontSize: 12, fontWeight: "800" },
  tokenScore: { color: palette.muted, fontSize: 9, marginTop: 3 },
  starButton: { padding: 4 },
  footerCard: { flexDirection: "row", gap: 8, borderTopWidth: 1, borderTopColor: palette.border, paddingTop: 14 },
  footerText: { color: palette.muted, fontSize: 10, lineHeight: 15, flex: 1 },
});
