import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
} from "react-native";
import { TabView, TabBar } from "react-native-tab-view";
import { fetchSchedule } from "./parser";
import { COLORS } from "./constants/ui";

type Schedule = string[][];
type GroupsMap = Record<string, number>;
const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб"] as const;
const day_i: Record<string, number> = {
  "Пн": 4,
  "Вт": 26,
  "Ср": 48,
  "Чт": 70,
  "Пт": 92,
  "Сб": 112,
};
const times = [
  "08:00\n09:20",
  "09:30\n10:50",
  "10:55\n12:15",
  "12:40\n14:00",
  "14:05\n15:25",
  "15:35\n16:55",
  "17:00\n18:20",
];


const DayScheduleScene = ({
  dayKey,
  schedule,
  groups,
  selectedCours,
}: {
  dayKey: string;
  schedule: Schedule;
  groups: GroupsMap;
  selectedCours: string;
}) => {
  let times_i = 0;
  let lessons: string[][] = [];
  let lesson_i = 1;

  const cours_j = selectedCours ? groups[selectedCours] : undefined;
  const index = dayKey ? day_i[dayKey as string] : undefined;

  if (
    cours_j !== undefined &&
    index !== undefined &&
    schedule.length > 0
  ) {
    for (let i = index; i < index + 22 && i < schedule.length; i += 3) {
      if (schedule[i][cours_j] !== undefined && schedule[i][cours_j] !== "") {
        let temp: string[] = [];
        temp.push(schedule[i][cours_j]);
        temp.push(
          schedule[i + 1][cours_j] !== ""
            ? schedule[i + 1][cours_j]
            : schedule[i + 1][cours_j - 1] !== ""
              ? schedule[i + 1][cours_j - 1]
              : schedule[i + 1][cours_j - 2] !== ""
                ? schedule[i + 1][cours_j - 2]
                : schedule[i + 1][cours_j - 3]
        );
        temp.push(
          schedule[i + 2][cours_j] !== ""
            ? schedule[i + 2][cours_j]
            : schedule[i + 2][cours_j - 1] !== ""
              ? schedule[i + 2][cours_j - 1]
              : schedule[i + 2][cours_j - 2] !== ""
                ? schedule[i + 2][cours_j - 2]
                : schedule[i + 2][cours_j - 3]
        );
        lessons.push(temp);
      } else {
        lessons.length < 7 ? lessons.push(["", "",""]) : "";
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

export default function App() {
  const [schedule, setSchedule] = useState<Schedule>([]);
  const [cours, setSelectedCours] = useState<string>("K25.1");
  const [items, setItems] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const initialDayIndex = Math.max(0, new Date().getDay() - 1);
  const [index, setIndex] = useState(initialDayIndex);

  const [routes] = useState(days.map((d) => ({ key: d, title: d })));


  useEffect(() => {
    (async () => {
      const data = await fetchSchedule(
        `https://stud.server.odessa.ua/wp-content/uploads/${new Date().getFullYear()}/${new Date().getMonth() + 1 < 10 ? "0" : ""
        }${new Date().getMonth() + 1}/`
      );
      setSchedule(data);
    })();
  }, []);

  const groups: GroupsMap =
    schedule[3]?.reduce((acc: GroupsMap, cell: string, index: number) => {
      if (cell && cell.trim() !== "") {
        acc[cell.trim()] = index;
      }
      return acc;
    }, {} as GroupsMap) ?? {};

  useEffect(() => {
    const newItems = Object.keys(groups);

    setItems((prevItems) => {
      const isEqual =
        prevItems.length === newItems.length &&
        prevItems.every((item, idx) => item === newItems[idx]);
      return isEqual ? prevItems : newItems;
    });
  }, [groups]);

  const renderScene = ({ route }: { route: { key: string } }) => {
    return (
      <DayScheduleScene
        dayKey={route.key}
        schedule={schedule}
        groups={groups}
        selectedCours={cours}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.pickerWrapper}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setOpen(!open)}
          >
            <Text style={{ color: COLORS.PRIMARY_COLOR }}>
              {cours || "Оберіть групу"}
            </Text>
          </TouchableOpacity>

          <Modal transparent visible={open} animationType="fade">
            <TouchableOpacity
              style={styles.overlay}
              onPress={() => setOpen(false)}
            />
            <View style={styles.dropdown}>
              <FlatList
                data={items}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.item}
                    onPress={() => {
                      setSelectedCours(item);
                      setOpen(false);
                    }}
                  >
                    <Text>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </Modal>
        </View>
        
      </View>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get("window").width }}
        style={{ flex: 1 }}

        renderTabBar={props => (
          <TabBar
            {...props}
            
            style={{
              backgroundColor: COLORS.PRIMARY_COLOR,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomLeftRadius: 25,
              borderBottomRightRadius: 25,
            }}
            indicatorStyle={{
              backgroundColor: COLORS.SECONDARY_COLOR,
              height: 30,
              width: 30,
              borderRadius: 100,
              marginBottom: 10,
              marginLeft: (width / routes.length - 30) / 2,

            }}
            tabStyle={{
              paddingHorizontal: 10,
            }}
            pressColor="transparent"
            activeColor={COLORS.PRIMARY_COLOR}
            inactiveColor={COLORS.BORDER_COLOR}
          />
        )}
      />
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_COLOR,
    marginTop: width * 0.05,
    flexDirection: "column"
  },
  header: {
    flexDirection: "column",
    gap: width * 0.03,
    padding: width * 0.04,
    paddingBottom: 0,
    backgroundColor: COLORS.PRIMARY_COLOR
  },
  pickerWrapper: {
    zIndex: 1000,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: COLORS.BORDER_COLOR,
    borderRadius: 12,
    padding: width * 0.03,
    backgroundColor: COLORS.SECONDARY_COLOR,
  },
  overlay: {
    flex: 1,
  },
  dropdown: {
    position: "absolute",
    top: width * 0.15,
    left: width * 0.04,
    right: width * 0.04,
    backgroundColor: COLORS.PRIMARY_COLOR,
    borderWidth: 1,
    borderColor: COLORS.BORDER_COLOR,
    borderRadius: 12,
    maxHeight: width * 0.5,
    zIndex: 1000,
  },
  item: {
    padding: width * 0.03,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_COLOR,
  },
  lessonWraper: {
    flex: 3,
  },
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
  lessonTime: {
    flex: 1,
    textAlign: "right",
  },
  emptyText: {
    color: COLORS.BORDER_COLOR,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  }
});