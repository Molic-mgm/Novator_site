import ExcelJS from "exceljs";

export function toCSV(rows) {
    const escape = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
    if (!rows.length) return "";
    const headers = Object.keys(rows[0]);
    const lines = [
        headers.map(escape).join(","),
        ...rows.map(r => headers.map(h => escape(r[h])).join(","))
    ];
    return lines.join("\n");
}

export async function toXLSX(rows, sheetName = "Bookings") {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(sheetName);

    if (rows.length) {
        ws.columns = Object.keys(rows[0]).map(k => ({ header: k, key: k, width: 22 }));
        rows.forEach(r => ws.addRow(r));
        ws.getRow(1).font = { bold: true };
    }

    return wb.xlsx.writeBuffer();
}
