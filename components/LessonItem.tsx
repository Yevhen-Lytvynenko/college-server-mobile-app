import React, {useMemo} from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { COLORS } from "../constants/ui";
import { times } from "../constants/data";
import { getTeacherEmojis } from "../services/firebaseConfig";

interface LessonItemProps {
  lesson: string[];
  index: number;
}

export const LessonItem: React.FC<LessonItemProps> = ({ lesson, index }) => {
  const number = index + 1;
  const emojis = useMemo(() => getTeacherEmojis(), []);
  const teacherName = lesson[1]?.trim(); 
  const emoji = teacherName ? emojis[teacherName] : null;
  const dotColor = 
    lesson[0] === "Кураторська година"
      ? COLORS.SECONDARY_COLOR
      : lesson[0].includes("Консультація")
      ? COLORS.RED
      : lesson[0].toLowerCase().includes("пересдача")
      ? COLORS.YELLOW
      : lesson[0]
      ? COLORS.GREEN
      : COLORS.BORDER_COLOR;
  return (
    <View style={styles.wrapper}>
      <View>
        <Text>{number}</Text>
          {emoji ? (
      <Text style={{ fontSize: 16 }}>{emoji}</Text>
    ) : (
      <Text style={{ color: dotColor }}>●</Text>
    )}
      </View>
      <View style={styles.lessonWraper}>
        <Text>{lesson[0]}</Text>
        <Text>{lesson[1]}</Text>
        <Text>{lesson[2]}</Text>
      </View>
      <Text style={styles.lessonTime}>{times[index]}</Text>
    </View>
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
    height: width * 0.25,
    alignItems: "center",
    justifyContent: "space-between",
  },
  lessonWraper: {
    flex: 3,
  },
  lessonTime: {
    flex: 1,
    textAlign: "right",
  },
  emojiText: {
    fontSize: 16,
  }
});
 