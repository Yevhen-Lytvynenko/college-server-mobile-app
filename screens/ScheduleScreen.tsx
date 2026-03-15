import React, { useEffect, useState, useMemo, useCallback } from "react";
import { View, StyleSheet, Dimensions, RefreshControl } from "react-native";
import { TabView, TabBar } from "react-native-tab-view";
import { GroupPicker } from "../components/GroupPicker";
import { DayScheduleScene } from "../components/DayScheduleScene";
import { ScheduleStatusBadge } from "../components/ScheduleStatusBadge";
import { OnboardingScreen } from "./OnboardingScreen";
import { loadSchedule, loadCachedSchedule, refreshSchedule, ScheduleStatus } from "../services/scheduleService";
import { getFavorites, saveFavorite, type ModeType } from "../services/favoritesService";
import { COLORS, FONTS } from "../constants/ui";
import { days, day_i } from "../constants/data";

const { width } = Dimensions.get("window");

export const ScheduleScreen = () => {
  const [schedule, setSchedule] = useState<string[][]>([]);
  const [cours, setCours] = useState("K25.1");
  const [items, setItems] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"students" | "teachers">("students");
  const [status, setStatus] = useState<ScheduleStatus>("fresh");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const initialDayIndex = Math.max(0, new Date().getDay() - 1);
  const [index, setIndex] = useState(initialDayIndex);
  const [routes] = useState(days.map((d) => ({ key: d, title: d })));

  const load = useCallback(async () => {
    // 1. Сначала показываем сохранённый вариант с устройства (если есть)
    const cached = await loadCachedSchedule();
    if (cached && cached.schedule.length > 0) {
      setSchedule(cached.schedule);
      setStatus(cached.status);
      setSavedAt(cached.savedAt);
    }
    setLoading(false);

    // 2. Проверяем ссылку, при необходимости загружаем с сервера
    const result = await loadSchedule();
    setSchedule(result.schedule);
    setStatus(result.status);
    setSavedAt(result.savedAt);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const result = await refreshSchedule();
    setSchedule(result.schedule);
    setStatus(result.status);
    setSavedAt(result.savedAt);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const groupsStudents = useMemo(() => {
    if (schedule.length === 0) return {};
    return (
      schedule[3]?.reduce((acc: Record<string, number>, cell: string, i: number) => {
        if (cell && cell.trim() !== "") acc[cell.trim()] = i;
        return acc;
      }, {}) ?? {}
    );
  }, [schedule]);

  const groupsTeachers = useMemo(() => {
    if (schedule.length === 0) return {};
    const teachers = new Set<string>();
    Object.values(day_i).forEach((dayStartIndex) => {
      for (let i = dayStartIndex + 1; i < dayStartIndex + 22 && i < schedule.length; i += 3) {
        if (schedule[i] && Array.isArray(schedule[i])) {
          schedule[i].forEach((cell) => {
            if (cell && cell.trim() !== "") teachers.add(cell.trim());
          });
        }
      }
    });
    return Array.from(teachers).reduce((acc: Record<string, number>, t: string, i: number) => {
      acc[t] = i;
      return acc;
    }, {});
  }, [schedule]);

  const groups = mode === "students" ? groupsStudents : groupsTeachers;
  const itemsForStudents = useMemo(() => Object.keys(groupsStudents), [groupsStudents]);
  const itemsForTeachers = useMemo(() => Object.keys(groupsTeachers), [groupsTeachers]);

  useEffect(() => {
    setItems(Object.keys(groups));
  }, [groups]);

  useEffect(() => {
    const applyFavorites = async () => {
      const fav = await getFavorites();
      const targetGroups = fav.registrationMode === "students" ? groupsStudents : groupsTeachers;
      const targetItems = Object.keys(targetGroups);
      if (fav.onboardingComplete) {
        setMode(fav.registrationMode);
        if (fav.registrationFavorite && targetItems.includes(fav.registrationFavorite)) {
          setCours(fav.registrationFavorite);
        } else if (targetItems.length > 0) {
          setCours(targetItems[0]);
        }
      } else if (targetItems.length > 0) {
        setShowOnboarding(true);
      }
    };
    applyFavorites();
  }, [groupsStudents, groupsTeachers]);

  const handleOnboardingComplete = useCallback((newMode: ModeType, favorite: string) => {
    saveFavorite(newMode, favorite);
    setMode(newMode);
    setCours(favorite);
    setShowOnboarding(false);
  }, []);

  const handleCoursChange = useCallback((newCours: string) => {
    setCours(newCours);
  }, []);

  const handleModeChange = useCallback((newMode: ModeType) => {
    setMode(newMode);
    const targetItems = newMode === "students" ? Object.keys(groupsStudents) : Object.keys(groupsTeachers);
    const firstItem = targetItems[0] || "";
    if (firstItem) {
      setCours(firstItem);
    }
  }, [groupsStudents, groupsTeachers]);

  const renderScene = ({ route }: any) => (
    <DayScheduleScene
      dayKey={route.key}
      schedule={schedule}
      groups={groups}
      selectedCours={cours}
      mode={mode}
      onRefresh={onRefresh}
      refreshing={refreshing}
      loading={loading}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ScheduleStatusBadge status={status} savedAt={savedAt} />
        <View style={styles.headerTop}>
          <GroupPicker
            open={open}
            items={items}
            selected={cours}
            onSelect={handleCoursChange}
            onClose={() => setOpen(false)}
            onToggle={() => setOpen(!open)}
            mode={mode}
            onModeChange={handleModeChange}
          />
        </View>
      </View>

      {showOnboarding && (
        <OnboardingScreen
          itemsForStudents={itemsForStudents}
          itemsForTeachers={itemsForTeachers}
          onComplete={handleOnboardingComplete}
        />
      )}

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
            options={Object.fromEntries(days.map((d) => [d, { labelStyle: styles.tabLabel }]))}
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
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: width * 0.025,
  },
  tabBar: {
    backgroundColor: COLORS.PRIMARY_COLOR,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  tabLabel: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: 11,
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
