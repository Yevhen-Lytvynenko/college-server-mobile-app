import React from "react";
import { ScrollView, View, Text, StyleSheet, Dimensions } from "react-native";
import { COLORS } from "../constants/ui";
import { times, day_i } from "../constants/data";

type Schedule = string[][];
type GroupsMap = Record<string, number>;

interface DayScheduleSceneProps {
  dayKey: string;
  schedule: Schedule;
  groups: GroupsMap;
  selectedCours: string;
}

export const DayScheduleScene: React.FC<DayScheduleSceneProps> = ({
  dayKey,
  schedule,
  groups,
  selectedCours,
}) => {
  const cours_j = selectedCours ? groups[selectedCours] : undefined;
  const index = day_i[dayKey as string];
  let lessons: string[][] = [];
  let lesson_i = 1;
  let times_i = 0;

  if (cours_j !== undefined && index !== undefined && schedule.length > 0) {
    for (let i = index; i < index + 22 && i < schedule.length; i += 3) {
      if (schedule[i][cours_j] !== undefined && schedule[i][cours_j] !== "") {
        const temp = [
          schedule[i][cours_j],
          schedule[i + 1][cours_j] || "",
          schedule[i + 2][cours_j] || "",
        ];
        lessons.push(temp);
      } else {
        lessons.length < 7 && lessons.push(["", "", ""]);
      }
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.lessonsContainer} showsVerticalScrollIndicator={false}>
      {schedule.length === 0 ? (
        <Text style={styles.emptyText}>Завантаження...</Text>
      ) : (
        lessons.map((lesson, index) => (
          <View key={index} style={styles.wrapper}>
            <View>
              <Text>{lesson_i++}</Text>
              <Text
                style={{
                  color:
                    lesson[0] === "Кураторська година"
                      ? COLORS.SECONDARY_COLOR
                      : lesson[0].includes("Консультація")
                      ? COLORS.RED
                      : lesson[0]
                      ? COLORS.GREEN
                      : COLORS.BORDER_COLOR,
                }}
              >
                ●
              </Text>
            </View>
            <View style={styles.lessonWraper}>
              <Text>{lesson[0]}</Text>
              <Text>{lesson[1]}</Text>
              <Text>{lesson[2]}</Text>
            </View>
            <Text style={styles.lessonTime}>{times[times_i++]}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.PRIMARY_COLOR,
    borderRadius: 15,
    padding: width * 0.04,
    flexDirection: "row",
    gap: 10,
    height: width * 0.2,
    alignItems: "center",
    justifyContent: "space-between",
  },
  lessonsContainer: {
    gap: width * 0.03,
    padding: width * 0.04,
  },
  lessonWraper: {
    flex: 3,
  },
  lessonTime: {
    flex: 1,
    textAlign: "right",
  },
  emptyText: {
    color: COLORS.BORDER_COLOR,
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});
