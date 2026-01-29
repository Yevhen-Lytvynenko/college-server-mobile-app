import React, { useEffect, useState } from "react";
import { ScheduleScreen } from "./screens/ScheduleScreen";
import { setupRemoteConfig } from "./services/firebaseConfig";
import { View, ActivityIndicator } from "react-native";

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await setupRemoteConfig();
      setIsReady(true);
    };
    init();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return <ScheduleScreen />;
}