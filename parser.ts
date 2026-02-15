import * as XLSX from "xlsx";

const LINK_REGEX = /href="([^"]*Sajt[_-][^"]*prep[^"]*\.xlsx)"/gi;

/**
 * Получает ссылку на файл Excel из страницы (лёгкая проверка, только HTML)
 * @param pageUrl - базовая страница
 * @returns полный URL файла или null
 */
export async function getScheduleFileLink(pageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(pageUrl);
    const html = await res.text();
    const matches = [...html.matchAll(LINK_REGEX)].map((m) => m[1]);
    const lastMatch = matches.at(-1);
    return lastMatch ? pageUrl + lastMatch : null;
  } catch {
    return null;
  }
}

const isRealSubject = (val: unknown): boolean => {
  const s = val != null ? String(val).trim() : "";
  if (!s) return false;
  if (/^\d{1,2}$/.test(s)) return false;
  return true;
};

/**
 * Заполняет кабінет і викладача з попередньої колонки ЛИШЕ коли в поточній колонці є предмет.
 * Якщо колонка пуста (немає предмету) — не заповнювати, щоб не показувати чужі заняття.
 */
function fillForwardSchedule(schedule: string[][]): void {
  for (let i = 4; i + 2 < schedule.length; i += 3) {
    const subjRow = schedule[i];
    const teachRow = schedule[i + 1];
    const roomRow = schedule[i + 2];
    if (!subjRow || !teachRow || !roomRow) continue;

    const maxCol = Math.max(
      subjRow.length || 0,
      teachRow.length || 0,
      roomRow.length || 0
    );
    let lastTeacher = "";
    let lastRoom = "";
    for (let j = 0; j < maxCol; j++) {
      if (isRealSubject(subjRow[j])) {
        const t = teachRow[j];
        const r = roomRow[j];
        const tStr = t != null ? String(t).trim() : "";
        const rStr = r != null ? String(r).trim() : "";
        if (tStr) lastTeacher = tStr;
        else if (lastTeacher) {
          teachRow[j] = lastTeacher;
        } else if (j > 0) {
          const prevT = teachRow[j - 1];
          const prevTStr = prevT != null ? String(prevT).trim() : "";
          if (prevTStr) {
            teachRow[j] = prevTStr;
            lastTeacher = prevTStr;
          }
        }
        if (rStr) lastRoom = rStr;
        else if (lastRoom) {
          roomRow[j] = lastRoom;
        } else if (j > 0) {
          let prevRStr = roomRow[j - 1] != null ? String(roomRow[j - 1]).trim() : "";
          if (!prevRStr) {
            const fromTeacher = teachRow[j - 1];
            const teacherStr = fromTeacher != null ? String(fromTeacher).trim() : "";
            if (teacherStr) {
              const roomMatch = teacherStr.match(/(\d+[а-яіїєґ]?\s+[\wА-Яа-яіїєґІЇЄҐ]+)$/);
              if (roomMatch) prevRStr = roomMatch[1].trim();
              else if (/^\d+[а-яіїєґ]/.test(teacherStr)) prevRStr = teacherStr;
            }
          }
          if (prevRStr) {
            roomRow[j] = prevRStr;
            lastRoom = prevRStr;
          }
        }
      } else {
        lastTeacher = "";
        lastRoom = "";
      }
    }
  }
}

/**
 * Загружает и парсит расписание по полной ссылке на Excel
 */
export async function fetchScheduleByUrl(fileUrl: string): Promise<string[][]> {
  try {
    const fileRes = await fetch(fileUrl);
    const arrayBuffer = await fileRes.arrayBuffer();
    const workbook: XLSX.WorkBook = XLSX.read(arrayBuffer, { type: "array" });
    const sheet: XLSX.WorkSheet = workbook.Sheets[workbook.SheetNames[0]];
    const schedule = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
    fillForwardSchedule(schedule);
    return schedule;
  } catch {
    return [];
  }
}

/**
 * Загружает расписание с сайта колледжа (обратная совместимость)
 * @param pageUrl - страница, где лежит ссылка на Excel
 */
export async function fetchSchedule(pageUrl: string): Promise<string[][]> {
  const fileLink = await getScheduleFileLink(pageUrl);
  if (!fileLink) return [];
  return fetchScheduleByUrl(fileLink);
}
