import React, { useEffect, useState, useMemo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { TabView, TabBar } from "react-native-tab-view";
import { GroupPicker } from "../components/GroupPicker";
import { DayScheduleScene } from "../components/DayScheduleScene";
import { fetchSchedule } from "../parser";
import { COLORS } from "../constants/ui";
import { days, day_i } from "../constants/data";

const { width } = Dimensions.get("window");

export const ScheduleScreen = () => {
  const [schedule, setSchedule] = useState<string[][]>([]);
  const [cours, setCours] = useState("K25.1");
  const [items, setItems] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"students" | "teachers">("students");

  const initialDayIndex = Math.max(0, new Date().getDay() - 1);
  const [index, setIndex] = useState(initialDayIndex);
  const [routes] = useState(days.map((d) => ({ key: d, title: d })));

  useEffect(() => {
    (async () => {
      const data = await fetchSchedule(`https://stud.server.odessa.ua/wp-content/uploads/${new Date().getFullYear()}/${String(new Date().getMonth()+1).padStart(2, "0")}/`);
      setSchedule(data);
    })();
  }, []);

  const groups = useMemo(() => {
    if (schedule.length === 0) return {};

    if (mode === "students") {
      return (
        schedule[3]?.reduce((acc: Record<string, number>, cell: string, i: number) => {
          if (cell && cell.trim() !== "") acc[cell.trim()] = i;
          return acc;
        }, {}) ?? {}
      );
    } else {
      const teachers = new Set<string>();
      Object.values(day_i).forEach((dayStartIndex) => {
        for (let i = dayStartIndex + 1; i < dayStartIndex + 22 && i < schedule.length; i += 3) {
          if (schedule[i] && Array.isArray(schedule[i])) {
            schedule[i].forEach((cell) => {
              if (cell && cell.trim() !== "") {
                teachers.add(cell.trim());
              }
            });
          }
        }
      });
      return Array.from(teachers).reduce((acc: Record<string, number>, teacher: string, i: number) => {
        acc[teacher] = i;
        return acc;
      }, {});
    }
  }, [schedule, mode]);

  useEffect(() => {
    setItems(Object.keys(groups));
  }, [groups]);

  useEffect(() => {
    if (items.length > 0) {
      setCours(items[0]);
    }
  }, [items]);

  const renderScene = ({ route }: any) => (
    <DayScheduleScene
      dayKey={route.key}
      schedule={schedule}
      groups={groups}
      selectedCours={cours}
      mode={mode}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <GroupPicker
          open={open}
          items={items}
          selected={cours}
          onSelect={setCours}
          onClose={() => setOpen(false)}
          onToggle={() => setOpen(!open)}
          mode={mode}
          onModeChange={setMode}
        />
      </View>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            style={styles.tabBar}
            indicatorStyle={styles.indicator}
            tabStyle={{ paddingHorizontal: 10 }}
            pressColor="transparent"
            activeColor={COLORS.PRIMARY_COLOR}
            inactiveColor={COLORS.BORDER_COLOR}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_COLOR,
    marginTop: width * 0.05,
  },
  header: {
    padding: width * 0.04,
    paddingBottom: 0,
    backgroundColor: COLORS.PRIMARY_COLOR,
  },
  tabBar: {
    backgroundColor: COLORS.PRIMARY_COLOR,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  indicator: {
    backgroundColor: COLORS.SECONDARY_COLOR,
    height: 30,
    width: 30,
    borderRadius: 100,
    marginBottom: 10,
    marginLeft: (width / days.length - 30) / 2,
  },
});
