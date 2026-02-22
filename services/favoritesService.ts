import * as FileSystem from "expo-file-system";

const FAVORITES_FILE = "favorites.json";

export type ModeType = "students" | "teachers";

export interface FavoritesData {
  onboardingComplete: boolean;
  /** Режим і група/викладач з реєстрації; не перезаписуються при перемиканні в сесії */
  registrationMode: ModeType;
  registrationFavorite: string;
}

async function getStoragePath(filename: string): Promise<string> {
  const dir = FileSystem.documentDirectory;
  if (!dir) throw new Error("No document directory");
  return `${dir}${filename}`;
}

function normalizeFavorites(raw: unknown): FavoritesData {
  const r = raw as Partial<FavoritesData> & { mode?: ModeType; favorite?: string };
  return {
    onboardingComplete: Boolean(r.onboardingComplete),
    registrationMode: r.registrationMode ?? r.mode ?? "students",
    registrationFavorite: r.registrationFavorite ?? r.favorite ?? "",
  };
}

export async function getFavorites(): Promise<FavoritesData> {
  try {
    const path = await getStoragePath(FAVORITES_FILE);
    const content = await FileSystem.readAsStringAsync(path);
    return normalizeFavorites(JSON.parse(content));
  } catch {
    return {
      onboardingComplete: false,
      registrationMode: "students",
      registrationFavorite: "",
    };
  }
}

/** Викликати лише після вибору на онбордингу — зберігає «домашній» курс для кожного запуску */
export async function saveFavorite(mode: ModeType, favorite: string): Promise<void> {
  const data: FavoritesData = {
    onboardingComplete: true,
    registrationMode: mode,
    registrationFavorite: favorite,
  };
  const path = await getStoragePath(FAVORITES_FILE);
  await FileSystem.writeAsStringAsync(path, JSON.stringify(data));
}
