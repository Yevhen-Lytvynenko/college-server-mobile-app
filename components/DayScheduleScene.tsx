import React, { useMemo } from "react";
import { ScrollView, Text, StyleSheet, Dimensions, RefreshControl } from "react-native";
import { COLORS, FONTS } from "../constants/ui";
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
  onRefresh?: () => void;
  refreshing?: boolean;
  loading?: boolean;
}

export const DayScheduleScene: React.FC<DayScheduleSceneProps> = ({
  dayKey,
  schedule,
  groups,
  selectedCours,
  mode = "students",
  onRefresh,
  refreshing = false,
  loading = false,
}) => {
  const index = day_i[dayKey];

  const lessons = useMemo(() => {
    let result: string[][] = [];

    if (index === undefined || schedule.length === 0) return result;

    const isEmptySubject = (val: unknown): boolean => {
      const s = val != null ? String(val).trim() : "";
      if (!s) return true;
      if (/^\d{1,2}$/.test(s)) return true; // номер пари (1–7) — не предмет
      return false;
    };

    const getClassroom = (rowIdx: number, col: number): string => {
      let room = (schedule[rowIdx + 2] && schedule[rowIdx + 2][col]) ?? "";
      room = String(room).trim();
      if (room) return room;
      for (let c = col - 1; c >= 0; c--) {
        const prev = (schedule[rowIdx + 2] && schedule[rowIdx + 2][c]) ?? "";
        const prevStr = String(prev).trim();
        if (prevStr) return prevStr;
      }
      return "";
    };

    if (mode === "students") {
      const cours_j = selectedCours ? groups[selectedCours] : undefined;
      if (cours_j !== undefined) {
        for (let i = index; i < index + 21 && i < schedule.length; i += 3) {
          const subject = schedule[i] && schedule[i][cours_j];
          const teacher = (schedule[i + 1] && schedule[i + 1][cours_j]) || "";
          const classroom = getClassroom(i, cours_j);
          if (subject && !isEmptySubject(subject)) {
            result.push([
              String(subject).trim(),
              String(teacher).trim(),
              classroom,
            ]);
          } else {
            result.length < 7 && result.push(["", "", ""]);
          }
        }
      }
    } else {
      for (let i = index; i < index + 21 && i < schedule.length; i += 3) {
        const lessonMap = new Map<string, { groups: Set<string>, classroom: string }>();
        
        if (schedule[i] && schedule[i + 1] && schedule[i + 2]) {
          schedule[i + 1].forEach((cell, colIndex) => {
            if (cell && typeof cell === "string" && cell.trim() === selectedCours) {
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
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
    >
      {loading ? (
        <Text style={styles.emptyText}>Завантаження...</Text>
      ) : schedule.length === 0 ? (
        <Text style={styles.emptyText}>Немає даних. Потягніть для оновлення.</Text>
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
    fontFamily: FONTS.REGULAR,
  },
});
