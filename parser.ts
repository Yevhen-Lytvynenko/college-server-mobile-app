import * as XLSX from "xlsx";

/**
 * Загружает расписание с сайта колледжа
 * @param pageUrl - страница, где лежит ссылка на Excel
 * @returns Promise<string[][]> - массив строк из Excel
 */
export async function fetchSchedule(pageUrl: string): Promise<string[][]> {
  try {
    // 1. Скачиваем HTML страницы
    const res = await fetch(pageUrl);
    const html = await res.text();

    // 2. Находим первую ссылку на Excel через regex
    const match = html.match(/href="([^"]*Sajt-[^"]*\.xlsx)"/i);
    if (!match) {
      throw new Error("Ссылка на Excel не найдена");
    }
    const excelUrl = match[1].startsWith("http")
      ? match[1]
      : new URL(match[1], pageUrl).href;

    console.log("Нашли Excel:", excelUrl);

    // 3. Скачиваем Excel
    const fileRes = await fetch(excelUrl);
    const arrayBuffer = await fileRes.arrayBuffer();

    // 4. Парсим через SheetJS
    const workbook: XLSX.WorkBook = XLSX.read(arrayBuffer, { type: "array" });
    const sheetName: string = workbook.SheetNames[0];
    const sheet: XLSX.WorkSheet = workbook.Sheets[sheetName];

    // 5. В JSON (массив массивов)
    const data: string[][] = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
    return data;
  } catch (err) {
    console.error("Ошибка:", err);
    return [];
  }
}
