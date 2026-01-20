import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, Dimensions, Image } from "react-native";
import { COLORS } from "../constants/ui";

const { width } = Dimensions.get("window");

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
  const toggleMode = () => {
    onModeChange(mode === "students" ? "teachers" : "students");
  };

  const getIcon = () => {
    return mode === "students"
      ? require("../assets/graduated.png")
      : require("../assets/teacher.png");
  };
  return (
    <View style={styles.pickerWrapper}>
      <View style={styles.rowContainer}>
        <View style={styles.dropdownButtonWrapper}>
          <TouchableOpacity style={styles.dropdownButton} onPress={onToggle}>
            <Text style={{ color: COLORS.PRIMARY_COLOR }}>{selected || "Оберіть групу"}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.roundToggleButton}
          onPress={toggleMode}
        >
          <Image source={getIcon()} style={styles.roundIcon} />
        </TouchableOpacity>
      </View>

      <Modal transparent visible={open} animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={onClose} />
        <View style={styles.dropdown}>
          <FlatList
            data={items}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  pickerWrapper: { zIndex: 1000 },
  rowContainer: {
    flexDirection: "row",
    gap: width * 0.03,
    alignItems: "center",
  },
  dropdownButtonWrapper: {
    flex: 1,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: COLORS.BORDER_COLOR,
    borderRadius: 12,
    padding: width * 0.03,
    backgroundColor: COLORS.SECONDARY_COLOR,
  },
  roundToggleButton: {
    width: width * 0.13,
    height: width * 0.13,
    borderRadius: width * 0.03,
    backgroundColor: COLORS.SECONDARY_COLOR,
    borderWidth: 1,
    borderColor: COLORS.BORDER_COLOR,
    alignItems: "center",
    justifyContent: "center",
  },
  roundIcon: {
    width: width * 0.08,
    height: width * 0.08,
  },
  overlay: { flex: 1 },
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
});
