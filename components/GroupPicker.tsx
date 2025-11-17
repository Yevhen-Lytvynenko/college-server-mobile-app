import React from "react";
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, Dimensions } from "react-native";
import { COLORS } from "../constants/ui";

const { width } = Dimensions.get("window");

interface GroupPickerProps {
  open: boolean;
  items: string[];
  selected: string;
  onSelect: (item: string) => void;
  onClose: () => void;
  onToggle: () => void;
}

export const GroupPicker: React.FC<GroupPickerProps> = ({
  open,
  items,
  selected,
  onSelect,
  onClose,
  onToggle,
}) => {
  return (
    <View style={styles.pickerWrapper}>
      <TouchableOpacity style={styles.dropdownButton} onPress={onToggle}>
        <Text style={{ color: COLORS.PRIMARY_COLOR }}>{selected || "Оберіть групу"}</Text>
      </TouchableOpacity>

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
  dropdownButton: {
    borderWidth: 1,
    borderColor: COLORS.BORDER_COLOR,
    borderRadius: 12,
    padding: width * 0.03,
    backgroundColor: COLORS.SECONDARY_COLOR,
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
