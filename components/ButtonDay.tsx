import React from "react";
import { StyleSheet, TouchableOpacity, Text } from "react-native";
import { COLORS } from "../constants/ui";

interface ButtonDayProps {
  title: string;
  isActive: boolean;
  setValue: (value: string) => void;
}

const ButtonDay: React.FC<ButtonDayProps> = ({ title, setValue, isActive }) => {

  return (
    <TouchableOpacity
      style={isActive? styles.customButtonPressed : styles.customButton}
      onPress={() => setValue(title) }
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

let styles = StyleSheet.create({
  customButton: {
    backgroundColor: COLORS.SECONDARY_COLOR,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40
  },
  customButtonPressed:{
    backgroundColor: COLORS.DARK_BLUE,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,

  },
  buttonText: {
    color: COLORS.PRIMARY_COLOR,
    fontWeight: "bold"
  }
});

export default ButtonDay;
