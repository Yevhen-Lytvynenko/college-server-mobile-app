import React, { useEffect, useState } from "react";
import { ScheduleScreen } from "./screens/ScheduleScreen";
import { setupRemoteConfig } from "./services/firebaseConfig";
import { View, Image } from "react-native";
import { TeacherEmojisProvider } from "./contexts/TeacherEmojisContext";
import { useFonts } from "expo-font";

export default function App() {
  const [isReady, setIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    "e-Ukraine-Light": require("./assets/fonts/e-Ukraine-Light.otf"),
    "e-Ukraine-Regular": require("./assets/fonts/e-Ukraine-Regular.otf"),
    "e-Ukraine-Medium": require("./assets/fonts/e-Ukraine-Medium.otf"),
    "e-Ukraine-Bold": require("./assets/fonts/e-Ukraine-Bold.otf"),
  });

  useEffect(() => {
    const init = async () => {
      await setupRemoteConfig();
      setIsReady(true);
    };
    init();
  }, []);

  if (!isReady || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <Image source={require("./assets/icon.png")} style={{ width: 120, height: 120 }} resizeMode="contain" />
      </View>
    );
  }

  return (
    <TeacherEmojisProvider>
      <ScheduleScreen />
    </TeacherEmojisProvider>
  );
}