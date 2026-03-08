import React, { createContext, useContext, useEffect, useState } from "react";
import { getTeacherEmojis } from "../services/firebaseConfig";
import remoteConfig from "@react-native-firebase/remote-config";

const REFRESH_INTERVAL_MS = 30000;

const TeacherEmojisContext = createContext<Record<string, string>>({});

export const TeacherEmojisProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [emojis, setEmojis] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchAndUpdate = async () => {
      try {
        const config = remoteConfig();
        await config.fetchAndActivate();
        setEmojis(getTeacherEmojis());
      } catch {
        // keep previous emojis on error
      }
    };

    setEmojis(getTeacherEmojis());
    const intervalId = setInterval(fetchAndUpdate, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <TeacherEmojisContext.Provider value={emojis}>
      {children}
    </TeacherEmojisContext.Provider>
  );
};

export const useTeacherEmojis = () => useContext(TeacherEmojisContext);
