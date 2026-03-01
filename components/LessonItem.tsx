import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  type NativeSyntheticEvent,
  type TextLayoutEventData,
} from "react-native";
import { COLORS, FONTS } from "../constants/ui";
import { times } from "../constants/data";
import { useTeacherEmojis } from "../contexts/TeacherEmojisContext";

interface LessonItemProps {
  lesson: string[];
  index: number;
}

export const LessonItem: React.FC<LessonItemProps> = ({ lesson, index }) => {
  const [expanded, setExpanded] = useState(false);
  const [subjectTruncates, setSubjectTruncates] = useState(false);

  const number = index + 1;
  const emojis = useTeacherEmojis();
  const teacherName = lesson[1]?.trim();
  const emoji = teacherName ? emojis[teacherName] : null;
  const subjectTitle = lesson[0] ?? "";
  const hasSubject = Boolean(subjectTitle.trim());

  useEffect(() => {
    setExpanded(false);
  }, [subjectTitle]);

  const dotColor =
    lesson[0] === "Кураторська година"
      ? COLORS.SECONDARY_COLOR
      : lesson[0]?.includes("Консультація")
        ? COLORS.RED
        : lesson[0]?.toLowerCase().includes("пересдача")
          ? COLORS.YELLOW
          : lesson[0]
            ? COLORS.GREEN
            : COLORS.BORDER_COLOR;

  const canToggleExpand = hasSubject && subjectTruncates;

  const onPressLesson = useCallback(() => {
    if (canToggleExpand) setExpanded((v) => !v);
  }, [canToggleExpand]);

  const onMeasureSubjectLayout = useCallback(
    (e: NativeSyntheticEvent<TextLayoutEventData>) => {
      if (!hasSubject) {
        setSubjectTruncates(false);
        return;
      }
      setSubjectTruncates(e.nativeEvent.lines.length > 1);
    },
    [hasSubject, subjectTitle],
  );

  return (
    <Pressable
      onPress={onPressLesson}
      disabled={!canToggleExpand}
      android_ripple={canToggleExpand ? { color: "rgba(2, 120, 254, 0.12)" } : undefined}
      style={({ pressed }) => [
        styles.wrapper,
        expanded ? styles.wrapperExpanded : styles.wrapperCollapsed,
        canToggleExpand && pressed && styles.wrapperPressed,
      ]}
    >
      <View style={styles.numberAndEmoji}>
        <Text style={styles.numberText}>{number}</Text>
        {emoji ? (
          <Text style={styles.emojiText}>{emoji}</Text>
        ) : (
          <Text style={[styles.dot, { color: dotColor }]}>●</Text>
        )}
      </View>
      <View style={styles.lessonWraper}>
        {hasSubject ? (
          <Text
            style={[styles.subjectText, styles.measureSubject]}
            onTextLayout={onMeasureSubjectLayout}
            pointerEvents="none"
          >
            {subjectTitle}
          </Text>
        ) : null}
        <Text
          style={styles.subjectText}
          numberOfLines={expanded ? undefined : 1}
          ellipsizeMode="tail"
        >
          {lesson[0]}
        </Text>
        {!expanded && (
          <>
            <Text style={styles.teacherText} numberOfLines={1} ellipsizeMode="tail">
              {lesson[1]}
            </Text>
            <Text style={styles.cabinetText} numberOfLines={1} ellipsizeMode="tail">
              {lesson[2]}
            </Text>
          </>
        )}
      </View>
      <View style={styles.timeColumn}>
        {times[index].split("\n").map((t, i) => (
          <Text key={i} style={styles.lessonTime}>
            {t}
          </Text>
        ))}
      </View>
    </Pressable>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.PRIMARY_COLOR,
    borderRadius: 15,
    padding: width * 0.05,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  wrapperCollapsed: {
    height: width * 0.25,
  },
  wrapperExpanded: {
    minHeight: width * 0.25,
    paddingVertical: width * 0.045,
  },
  wrapperPressed: {
    opacity: 0.92,
  },
  numberAndEmoji: {
    alignItems: "center",
    minWidth: 36,
  },
  numberText: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: 18,
  },
  dot: {
    fontFamily: FONTS.REGULAR,
    fontSize: 20,
  },
  lessonWraper: {
    flex: 3,
    flexShrink: 1,
    minWidth: 0,
    position: "relative",
  },
  measureSubject: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    opacity: 0,
    zIndex: -1,
  },
  subjectText: {
    fontFamily: FONTS.REGULAR,
  },
  teacherText: {
    fontFamily: FONTS.LIGHT,
  },
  cabinetText: {
    fontFamily: FONTS.LIGHT,
  },
  timeColumn: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: 52,
  },
  lessonTime: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 12,
    fontVariant: ["tabular-nums"],
    lineHeight: 16,
  },
  emojiText: {
    fontSize: 20,
    fontFamily: FONTS.REGULAR,
  },
});
 