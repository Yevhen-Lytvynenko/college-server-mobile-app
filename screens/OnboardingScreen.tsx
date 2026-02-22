import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "../constants/ui";
import type { ModeType } from "../services/favoritesService";

interface OnboardingScreenProps {
  itemsForStudents: string[];
  itemsForTeachers: string[];
  onComplete: (mode: ModeType, favorite: string) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  itemsForStudents,
  itemsForTeachers,
  onComplete,
}) => {
  const { width, height } = useWindowDimensions();
  const [step, setStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<ModeType | null>(null);

  const items = mode === "students" ? itemsForStudents : itemsForTeachers;

  /** Відступи від країв екрана — картка не «липне» до країв на широких телефонах */
  const horizontalInset = Math.max(16, Math.min(28, width * 0.055));
  /** Максимальна ширина картки: адаптивно, але не розтягується на всю ширину планшета */
  const cardMaxWidth = Math.min(400, width - horizontalInset * 2);
  /** Висота списку: частка екрана, з верхньою межою щоб на малих екранах залишалось місце під заголовок */
  const listMaxHeight = Math.min(height * 0.42, Math.max(220, height - 280));

  const pad = Math.min(width * 0.06, 24);
  const fontSize = Math.min(20, 14 + width * 0.02);

  const handleModeSelect = (m: ModeType) => {
    setMode(m);
    setStep(2);
  };

  const handleFavoriteSelect = (favorite: string) => {
    if (mode) onComplete(mode, favorite);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setMode(null);
    }
  };

  const iconSize = Math.min(40, width * 0.1);
  const itemFontSize = Math.min(16, 13 + width * 0.015);

  const s = {
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center" as const, alignItems: "center" as const },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      paddingVertical: pad,
      paddingHorizontal: horizontalInset,
      width: "100%" as const,
    },
    /** Крок 2: без ScrollView — інакше FlatList всередині дає warning VirtualizedLists */
    outerStep2: {
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      paddingVertical: pad,
      paddingHorizontal: horizontalInset,
      width: "100%" as const,
    },
    content: {
      backgroundColor: COLORS.PRIMARY_COLOR,
      borderRadius: 20,
      padding: pad,
      width: cardMaxWidth,
      alignSelf: "center" as const,
      maxHeight: height * 0.78,
      overflow: "hidden" as const,
    },
    title: {
      fontFamily: FONTS.SEMIBOLD,
      fontSize,
      textAlign: "center" as const,
      marginBottom: pad,
      color: COLORS.DARK_BLUE,
      paddingHorizontal: pad * 0.5,
    },
    buttons: { gap: pad * 0.7, width: "100%" as const },
    modeButton: {
      flexDirection: "column" as const,
      alignItems: "center" as const,
      padding: pad,
      backgroundColor: COLORS.BACKGROUND_COLOR,
      borderRadius: 16,
      gap: pad * 0.5,
      width: "100%" as const,
    },
    modeButtonText: { fontFamily: FONTS.SEMIBOLD, fontSize: fontSize * 0.9, color: COLORS.DARK_BLUE },
    modeButtonHint: { fontFamily: FONTS.LIGHT, fontSize: fontSize * 0.7, color: COLORS.BORDER_COLOR },
    backButton: { position: "absolute" as const, left: pad * 0.5, top: pad * 0.5, zIndex: 1 },
    listWrap: { width: "100%" as const, flexGrow: 0 },
    list: { maxHeight: listMaxHeight, width: "100%" as const },
    item: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "space-between" as const,
      paddingVertical: Math.max(10, pad * 0.65),
      paddingHorizontal: pad * 0.5,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.BACKGROUND_COLOR,
      maxWidth: "100%" as const,
    },
    itemText: {
      fontFamily: FONTS.REGULAR,
      fontSize: itemFontSize,
      color: COLORS.DARK_BLUE,
      flex: 1,
      flexShrink: 1,
      marginRight: 8,
    },
  };

  return (
    <Modal visible transparent animationType="fade">
      <View style={s.overlay}>
        {step === 1 ? (
          <ScrollView
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={s.content}>
              <Text style={s.title} numberOfLines={3}>
                Ви студент чи викладач?
              </Text>
              <View style={s.buttons}>
                <TouchableOpacity style={s.modeButton} onPress={() => handleModeSelect("students")}>
                  <Ionicons name="school" size={iconSize} color={COLORS.SECONDARY_COLOR} />
                  <Text style={s.modeButtonText}>Студент</Text>
                  <Text style={s.modeButtonHint}>Оберіть групу</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.modeButton} onPress={() => handleModeSelect("teachers")}>
                  <Ionicons name="person" size={iconSize} color={COLORS.SECONDARY_COLOR} />
                  <Text style={s.modeButtonText}>Викладач</Text>
                  <Text style={s.modeButtonHint}>Оберіть викладача</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        ) : (
          <View style={s.outerStep2}>
            <View style={s.content}>
              <TouchableOpacity style={s.backButton} onPress={handleBack}>
                <Ionicons name="arrow-back" size={24} color={COLORS.SECONDARY_COLOR} />
              </TouchableOpacity>
              <Text style={[s.title, { marginTop: Math.min(28, pad * 1.5) }]} numberOfLines={3}>
                Оберіть {mode === "students" ? "групу" : "викладача"} для збереження
              </Text>
              <View style={s.listWrap}>
                <FlatList
                  data={items}
                  keyExtractor={(item) => item}
                  style={s.list}
                  keyboardShouldPersistTaps="handled"
                  scrollIndicatorInsets={{ right: 1 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={s.item} onPress={() => handleFavoriteSelect(item)}>
                      <Text style={s.itemText} numberOfLines={2}>
                        {item}
                      </Text>
                      <Ionicons name="chevron-forward" size={20} color={COLORS.BORDER_COLOR} />
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};
