import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  FlatList,
  StyleSheet,
  Dimensions,
  Pressable,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "../constants/ui";

const { width, height } = Dimensions.get("window");
const statusBarHeight = Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0;

type ModeType = "students" | "teachers";

interface GroupPickerProps {
  open: boolean;
  items: string[];
  selected: string;
  onSelect: (item: string) => void;
  onClose: () => void;
  onToggle: () => void;
  mode: ModeType;
  onModeChange: (mode: ModeType) => void;
}

export const GroupPicker: React.FC<GroupPickerProps> = ({
  open,
  items,
  selected,
  onSelect,
  onClose,
  onToggle,
  mode,
  onModeChange,
}) => {
  const handleSelect = (item: string) => {
    onSelect(item);
    onClose();
  };

  const label = mode === "students" ? "Оберіть групу" : "Оберіть викладача";

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <View style={styles.modeSwitcher}>
          <Pressable
            style={[styles.modeTab, mode === "students" && styles.modeTabActive]}
            onPress={() => onModeChange("students")}
          >
            <Ionicons
              name="school"
              size={18}
              color={mode === "students" ? COLORS.PRIMARY_COLOR : COLORS.DARK_BLUE}
            />
            <Text style={[styles.modeTabText, mode === "students" && styles.modeTabTextActive]}>
              Група
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modeTab, mode === "teachers" && styles.modeTabActive]}
            onPress={() => onModeChange("teachers")}
          >
            <Ionicons
              name="person"
              size={18}
              color={mode === "teachers" ? COLORS.PRIMARY_COLOR : COLORS.DARK_BLUE}
            />
            <Text style={[styles.modeTabText, mode === "teachers" && styles.modeTabTextActive]}>
              Викладач
            </Text>
          </Pressable>
        </View>

        <Pressable style={styles.selectButton} onPress={onToggle}>
          <Text
            style={styles.selectText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {selected || label}
          </Text>
          <Ionicons
            name={open ? "chevron-up" : "chevron-down"}
            size={20}
            color={COLORS.PRIMARY_COLOR}
          />
        </Pressable>
      </View>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <Pressable style={styles.overlay} onPress={onClose}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>{label}</Text>
            <FlatList
              data={items}
              keyExtractor={(item) => item}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.option,
                    selected === item && styles.optionSelected,
                    pressed && styles.optionPressed,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected === item && styles.optionTextSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {item}
                  </Text>
                  {selected === item && (
                    <Ionicons name="checkmark-circle" size={22} color={COLORS.SECONDARY_COLOR} />
                  )}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: "100%",
  },
  row: {
    flexDirection: "column",
    gap: width * 0.025,
  },
  modeSwitcher: {
    flexDirection: "row",
    backgroundColor: "rgba(2, 120, 254, 0.12)",
    borderRadius: 14,
    padding: 4,
  },
  modeTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: width * 0.028,
    borderRadius: 10,
  },
  modeTabActive: {
    backgroundColor: COLORS.SECONDARY_COLOR,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modeTabText: {
    fontFamily: FONTS.MEDIUM,
    fontSize: 14,
    color: COLORS.DARK_BLUE,
  },
  modeTabTextActive: {
    color: COLORS.PRIMARY_COLOR,
    fontFamily: FONTS.SEMIBOLD,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.SECONDARY_COLOR,
    borderRadius: 14,
    paddingVertical: width * 0.035,
    paddingHorizontal: width * 0.05,
    gap: 8,
  },
  selectText: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: 16,
    color: COLORS.PRIMARY_COLOR,
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: -statusBarHeight,
    left: 0,
    right: 0,
    bottom: 0,
    width,
    height: height + statusBarHeight,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: COLORS.PRIMARY_COLOR,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.65,
    paddingBottom: 34,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.BORDER_COLOR,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  sheetTitle: {
    fontFamily: FONTS.SEMIBOLD,
    fontSize: 16,
    color: COLORS.DARK_BLUE,
    textAlign: "center",
    marginBottom: 16,
  },
  list: {
    maxHeight: height * 0.5,
  },
  listContent: {
    paddingHorizontal: width * 0.05,
    paddingBottom: 20,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: width * 0.04,
    paddingHorizontal: width * 0.04,
    borderRadius: 12,
    marginBottom: 4,
  },
  optionSelected: {
    backgroundColor: "rgba(2, 120, 254, 0.1)",
  },
  optionPressed: {
    opacity: 0.7,
  },
  optionText: {
    fontFamily: FONTS.REGULAR,
    fontSize: 16,
    color: COLORS.DARK_BLUE,
    flex: 1,
  },
  optionTextSelected: {
    fontFamily: FONTS.MEDIUM,
  },
});
