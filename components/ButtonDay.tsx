import React from "react";
import { StyleSheet, TouchableOpacity, Text } from "react-native";
import { COLORS } from "../constants/ui";

interface ButtonDayProps {
  title: string;
  setValue: (value: string) => void;
}

const ButtonDay: React.FC<ButtonDayProps> = ({ title, setValue }) => {
  return (
    <TouchableOpacity
      style={styles.customButton}
      onPress={() => setValue(title)}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  customButton: {
    backgroundColor: COLORS.SECONDARY_COLOR,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40
  },
  buttonText: {
    color: COLORS.PRIMARY_COLOR,
    fontWeight: "bold"
  }
});

export default ButtonDay;
