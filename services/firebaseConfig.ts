import { getApp, getApps } from '@react-native-firebase/app';
import remoteConfig from '@react-native-firebase/remote-config';

export const TR_EMOJIS_KEY = 'teacher_emojis_map';

export const setupRemoteConfig = async () => {
  try {
    const apps = getApps();
    if (apps.length === 0) {
      console.log("Ожидание инициализации Firebase...");
      return; 
    }

    const config = remoteConfig();
    await config.setConfigSettings({
      minimumFetchIntervalMillis: 3600000,
    });
    await config.fetchAndActivate();
    console.log("Firebase Remote Config: Успешно активировано");
  } catch (e) {
    console.error("Firebase Remote Config Error:", e);
  }
};

export const getTeacherEmojis = (): Record<string, string> => {
  try {
    const jsonString = remoteConfig().getValue(TR_EMOJIS_KEY).asString();
    console.log(jsonString);
    return jsonString ? JSON.parse(jsonString) : {};
  } catch {
    return {};
  }
};