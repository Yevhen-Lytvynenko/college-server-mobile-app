import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS } from "../constants/ui";
import { ScheduleStatus } from "../services/scheduleService";

interface ScheduleStatusBadgeProps {
  status: ScheduleStatus;
  savedAt: string | null;
}

function formatSavedAt(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "щойно";
  if (diffMins < 60) return `${diffMins} хв тому`;
  if (diffHours < 24) return `${diffHours} год тому`;
  if (diffDays < 7) return `${diffDays} дн тому`;
  return d.toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit" });
}

export const ScheduleStatusBadge: React.FC<ScheduleStatusBadgeProps> = ({ status, savedAt }) => {
  const isOffline = status === "offline";
  const timeStr = formatSavedAt(savedAt);

  return (
    <View style={[styles.badge, isOffline && styles.badgeOffline]}>
      <View style={[styles.dot, isOffline ? styles.dotOffline : styles.dotFresh]} />
      <Text style={styles.text}>
        {isOffline ? "Офлайн режим" : "Актуальне"}
        {timeStr && ` • ${timeStr}`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(2, 120, 254, 0.15)",
    gap: 6,
  },
  badgeOffline: {
    backgroundColor: "rgba(150, 150, 150, 0.2)",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotFresh: {
    backgroundColor: COLORS.GREEN,
  },
  dotOffline: {
    backgroundColor: COLORS.BORDER_COLOR,
  },
  text: {
    fontSize: 12,
    color: COLORS.DARK_BLUE,
    fontFamily: FONTS.REGULAR,
  },
});
