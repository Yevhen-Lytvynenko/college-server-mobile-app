import * as FileSystem from "expo-file-system";
import { getScheduleFileLink, fetchScheduleByUrl } from "../parser";

const SCHEDULE_FILE = "schedule.json";
const META_FILE = "schedule_meta.json";

type ScheduleData = string[][];

interface ScheduleMeta {
  fileUrl: string;
  savedAt: string; // ISO
}

export type ScheduleStatus = "fresh" | "offline";

async function getStoragePath(filename: string): Promise<string> {
  const dir = FileSystem.documentDirectory;
  if (!dir) throw new Error("No document directory");
  return `${dir}${filename}`;
}

async function loadJson<T>(filename: string): Promise<T | null> {
  try {
    const path = await getStoragePath(filename);
    const content = await FileSystem.readAsStringAsync(path);
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

async function saveJson(filename: string, data: unknown): Promise<void> {
  const path = await getStoragePath(filename);
  await FileSystem.writeAsStringAsync(path, JSON.stringify(data));
}

export function getSchedulePageUrl(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `https://stud.server.odessa.ua/wp-content/uploads/${year}/${month}/`;
}

export interface ScheduleResult {
  schedule: ScheduleData;
  status: ScheduleStatus;
  savedAt: string | null;
}

/**
 * Быстро загружает сохранённое расписание с устройства (без сети).
 * Используется для немедленного отображения при запуске.
 */
export async function loadCachedSchedule(): Promise<ScheduleResult | null> {
  const [meta, cachedSchedule] = await Promise.all([
    loadJson<ScheduleMeta>(META_FILE),
    loadJson<ScheduleData>(SCHEDULE_FILE),
  ]);
  if (cachedSchedule && cachedSchedule.length > 0) {
    return {
      schedule: cachedSchedule,
      status: "offline",
      savedAt: meta?.savedAt ?? null,
    };
  }
  return null;
}

/**
 * Загружает расписание: сначала показывает кэш (если есть), потом проверяет ссылку и обновляет при необходимости.
 * - Есть кэш → сразу отображаем его
 * - Ссылка не изменилась → оставляем кэш (status: "fresh")
 * - Ссылка изменилась или нет кэша → скачиваем с сервера
 * - Нет сети → остаётся кэш (status: "offline")
 */
export async function loadSchedule(): Promise<ScheduleResult> {
  const pageUrl = getSchedulePageUrl();

  // 1. Сначала загружаем мета и кэш с устройства (быстро, без сети)
  const [meta, cachedSchedule] = await Promise.all([
    loadJson<ScheduleMeta>(META_FILE),
    loadJson<ScheduleData>(SCHEDULE_FILE),
  ]);

  // 2. Пытаемся получить текущую ссылку на файл (нужен интернет)
  const currentFileUrl = await getScheduleFileLink(pageUrl);

  // 3. Офлайн: нет сети, нет текущей ссылки → отдаём кэш
  if (!currentFileUrl) {
    if (cachedSchedule && cachedSchedule.length > 0) {
      return {
        schedule: cachedSchedule,
        status: "offline",
        savedAt: meta?.savedAt ?? null,
      };
    }
    return { schedule: [], status: "offline", savedAt: null };
  }

  // 4. Ссылка та же и кэш есть → отдаём кэш
  if (meta?.fileUrl === currentFileUrl && cachedSchedule && cachedSchedule.length > 0) {
    return {
      schedule: cachedSchedule,
      status: "fresh",
      savedAt: meta.savedAt,
    };
  }

  // 5. Ссылка изменилась или нет кэша → скачиваем с сервера
  const schedule = await fetchScheduleByUrl(currentFileUrl);
  if (schedule.length > 0) {
    const newMeta: ScheduleMeta = {
      fileUrl: currentFileUrl,
      savedAt: new Date().toISOString(),
    };
    await Promise.all([
      saveJson(SCHEDULE_FILE, schedule),
      saveJson(META_FILE, newMeta),
    ]);
    return {
      schedule,
      status: "fresh",
      savedAt: newMeta.savedAt,
    };
  }

  // 6. Не удалось скачать, но есть старый кэш
  if (cachedSchedule && cachedSchedule.length > 0) {
    return {
      schedule: cachedSchedule,
      status: "offline",
      savedAt: meta?.savedAt ?? null,
    };
  }

  return { schedule: [], status: "fresh", savedAt: null };
}

/**
 * Принудительное обновление расписания (pull-to-refresh)
 */
export async function refreshSchedule(): Promise<ScheduleResult> {
  const pageUrl = getSchedulePageUrl();
  const currentFileUrl = await getScheduleFileLink(pageUrl);

  if (!currentFileUrl) {
    const cached = await loadJson<ScheduleData>(SCHEDULE_FILE);
    const meta = await loadJson<ScheduleMeta>(META_FILE);
    return {
      schedule: cached ?? [],
      status: "offline",
      savedAt: meta?.savedAt ?? null,
    };
  }

  const schedule = await fetchScheduleByUrl(currentFileUrl);
  if (schedule.length > 0) {
    const newMeta: ScheduleMeta = {
      fileUrl: currentFileUrl,
      savedAt: new Date().toISOString(),
    };
    await Promise.all([
      saveJson(SCHEDULE_FILE, schedule),
      saveJson(META_FILE, newMeta),
    ]);
    return { schedule, status: "fresh", savedAt: newMeta.savedAt };
  }

  const cached = await loadJson<ScheduleData>(SCHEDULE_FILE);
  const meta = await loadJson<ScheduleMeta>(META_FILE);
  return {
    schedule: cached ?? [],
    status: "offline",
    savedAt: meta?.savedAt ?? null,
  };
}
