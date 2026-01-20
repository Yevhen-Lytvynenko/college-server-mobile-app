import React, { useMemo } from "react";
import { ScrollView, Text, StyleSheet, Dimensions } from "react-native";
import { COLORS } from "../constants/ui";
import { times, day_i } from "../constants/data";
import { LessonItem } from "../components/LessonItem";

type Schedule = string[][];
type GroupsMap = Record<string, number>;

interface DayScheduleSceneProps {
  dayKey: string;
  schedule: Schedule;
  groups: GroupsMap;
  selectedCours: string;
  mode?: "students" | "teachers";
}

export const DayScheduleScene: React.FC<DayScheduleSceneProps> = ({
  dayKey,
  schedule,
  groups,
  selectedCours,
  mode = "students",
}) => {
  const index = day_i[dayKey];

  const lessons = useMemo(() => {
    let result: string[][] = [];

    if (index === undefined || schedule.length === 0) return result;

    if (mode === "students") {
      const cours_j = selectedCours ? groups[selectedCours] : undefined;
      if (cours_j !== undefined) {
        for (let i = index; i < index + 22 && i < schedule.length; i += 3) {
          if (schedule[i] && schedule[i][cours_j]) {
            result.push([
              schedule[i][cours_j] || "",
              (schedule[i + 1] && schedule[i + 1][cours_j]) || "",
              (schedule[i + 2] && schedule[i + 2][cours_j]) || "",
            ]);
          } else {
            result.length < 7 && result.push(["", "", ""]);
          }
        }
      }
    } else {
      // Teachers mode: scan all rows in the day to find teacher
      for (let i = index; i < index + 22 && i < schedule.length; i += 3) {
        const lessonMap = new Map<string, { groups: Set<string>, classroom: string }>();

        // Scan the trio (lesson, teacher, classroom)
        if (schedule[i] && schedule[i + 1] && schedule[i + 2]) {
          schedule[i + 1].forEach((cell, colIndex) => {
            if (cell && typeof cell === "string" && cell.trim() === selectedCours) {
              // Found teacher in this column, collect lesson, group and classroom
              const lessonName = (schedule[i][colIndex] && typeof schedule[i][colIndex] === "string") ? schedule[i][colIndex] : "";
              const groupName = (schedule[3] && schedule[3][colIndex] && typeof schedule[3][colIndex] === "string") ? schedule[3][colIndex] : "";
              const classroom = (schedule[i + 2][colIndex] && typeof schedule[i + 2][colIndex] === "string") ? schedule[i + 2][colIndex] : "";
              
              if (lessonName.trim() || groupName.trim() || classroom.trim()) {
                if (!lessonMap.has(lessonName)) {
                  lessonMap.set(lessonName, { groups: new Set(), classroom });
                }
                const entry = lessonMap.get(lessonName)!;
                if (groupName.trim()) {
                  entry.groups.add(groupName);
                }
              }
            }
          });
        }

        let foundLesson: string[] = [];
        if (lessonMap.size > 0) {
          lessonMap.forEach(({ groups, classroom }) => {
            foundLesson.push(
              Array.from(lessonMap.keys())[0],
              Array.from(groups).join(", "),
              classroom
            );
          });
        }

        result.push(foundLesson.length > 0 ? foundLesson : ["", "", ""]);
      }
    }

    return result;
  }, [schedule, mode, selectedCours, index, groups]);

  return (
    <ScrollView
      contentContainerStyle={styles.lessonsContainer}
      showsVerticalScrollIndicator={false}
    >
      {schedule.length === 0 ? (
        <Text style={styles.emptyText}>Завантаження...</Text>
      ) : (
        lessons.map((lesson, idx) => (
          <LessonItem key={idx} lesson={lesson} index={idx} />
        ))
      )}
    </ScrollView>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  lessonsContainer: {
    gap: width * 0.03,
    padding: width * 0.04,
  },
  emptyText: {
    color: COLORS.BORDER_COLOR,
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});
