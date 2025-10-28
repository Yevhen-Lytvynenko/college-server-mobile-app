import * as XLSX from "xlsx";

/**
 * Загружает расписание с сайта колледжа
 * @param pageUrl - страница, где лежит ссылка на Excel
 * @returns Promise<string[][]> - массив строк из Excel
 */
export async function fetchSchedule(pageUrl: string): Promise<string[][]> {
  try {
    const res = await fetch(pageUrl);
    const html = await res.text();

    const match = (html.match(/href="([^"]*Sajt-[^"]*\.xlsx)"/ig) || [])
    .map(m => m.replace(/href="|"/g, "")); 
  
    console.log(match);
    if (!match) {
      throw new Error("Schedule not found");
    }
    
    const fileRes = await fetch(`https://www.dropbox.com/scl/fi/pcpd9wn6e8ap8f1ezusox/_27.10.xlsx?rlkey=5froeot1ka3i7kawr3y3uizd5&e=1&st=ypc94blc&dl=1`);
    const arrayBuffer = await fileRes.arrayBuffer();

    const workbook: XLSX.WorkBook = XLSX.read(arrayBuffer, { type: "array" });
    const sheetName: string = workbook.SheetNames[0];
    const sheet: XLSX.WorkSheet = workbook.Sheets[sheetName];

    const data: string[][] = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
    return data;
  } catch (err) {

    return [];
  }
}
