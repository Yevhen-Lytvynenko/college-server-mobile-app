import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions 
} from "react-native";
import { fetchSchedule } from "./parser";
import { COLORS } from "./constants/ui";
import ButtonDay from "./components/ButtonDay";

type Schedule = string[][];
type GroupsMap = Record<string, number>;
const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб"] as const;

export default function App() {
  const [schedule, setSchedule] = useState<Schedule>([]);
  const [cours, setSelectedCours] = useState<string>("K25.1");
  const [day, setSelectedDay] = useState<string | "">(days[new Date().getDay()-1]);
  const [items, setItems] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await fetchSchedule(
        `https://stud.server.odessa.ua/wp-content/uploads/${new Date().getFullYear()}/${new Date().getMonth()+1<10?"0":""}${new Date().getMonth()+1}/`
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

  setItems(prevItems => {
    const isEqual =
      prevItems.length === newItems.length &&
      prevItems.every((item, idx) => item === newItems[idx]);
    return isEqual ? prevItems : newItems;
  });
}, [groups]);

  const day_i: Record<string, number> = {
    "Пн": 4,
    "Вт": 19,
    "Ср": 34,
    "Чт": 49,
    "Пт": 64,
    "Сб": 79,
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

  let times_i = 0;
  let lessons: string[][] = [];
  let lesson_i = 1;

  const cours_j = cours ? groups[cours] : undefined;
  const index = day ? day_i[day as string] : undefined;

    if (cours_j !== undefined && index !== undefined) {
      for (let i = index; i < index + 15 && i < schedule.length; i += 2) {
        if (schedule[i][cours_j] !== undefined   && schedule[i][cours_j] !== "") {
          let temp: string[] = [];
          temp.push(schedule[i][cours_j]);
          temp.push(
            schedule[i + 1][cours_j] !=="" ? schedule[i + 1][cours_j ] : schedule[i + 1][cours_j-1]!== ""?schedule[i + 1][cours_j-1 ]:schedule[i + 1][cours_j -2]!==""?schedule[i + 1][cours_j -2]:schedule[i + 1][cours_j -3]
          );
          lessons.push(temp);
        }else{
          lessons.length <7 ? lessons.push(["",""]): "";
        }
      }
    }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
     
        <View style={styles.pickerWrapper}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setOpen(!open)}
          >
            <Text style = {{color: COLORS.PRIMARY_COLOR}}>{cours || "Оберіть групу"}</Text>
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

        <View style={styles.dayBtnWarpper}>{
          days.map((curDay) => <ButtonDay key={curDay} title={curDay} isActive={day===curDay} setValue={setSelectedDay}/>)
        }
        </View>
      </View>

      <ScrollView>
        <View style={styles.lessons}>
          {lessons.map((lesson, index) => (
            <View key={index} style={styles.wrapper}>
              <View>
                <Text>{lesson_i++}</Text>
                <Text
                  style={{
                    color:
                      lesson[0] === "Кураторська година"
                        ? COLORS.SECONDARY_COLOR
                        : lesson[0].includes("Консультація")? COLORS.RED
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
              </View>
              <Text style={styles.lessonTime}>{times[times_i++]}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: width * 0.04, 
    backgroundColor: COLORS.BACKGROUND_COLOR,
    marginTop: width * 0.05,
    flexDirection: "column",
    gap: width * 0.03, 
  },
  header: {
    flexDirection: "column",
    gap: width * 0.03
  },
  pickerWrapper: {
    zIndex: 1000,
  },
  dayBtnWarpper: {
    flexDirection: "row",
    justifyContent: "center",
    gap: width * 0.04,
    flexWrap: 'wrap', 
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
    top: width * 0.15, // Подставьте свое значение для оптимального отступа
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
    justifyContent: 'space-between',
  },
  lessons: {
    gap: width * 0.03,
  },
  lessonTime: {
    flex: 1, 
    textAlign: 'right', 
  }
});
