import { Response } from 'express';
import ExcelJS from 'exceljs';

/**
 * Style Excel header row with bold text and gray background
 */
export function styleHeaderRow(row: ExcelJS.Row): void {
  row.font = { bold: true };
  row.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD3D3D3' }
  };
  row.alignment = { vertical: 'middle', horizontal: 'left' };
}

/**
 * Set HTTP headers for Excel file download
 */
export function setExcelHeaders(res: Response, filename: string): void {
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=${filename}`
  );
}

/**
 * Auto-size columns based on content
 * @param worksheet - Excel worksheet
 * @param minWidth - Minimum column width (default: 10)
 * @param maxWidth - Maximum column width (default: 50)
 */
export function autoSizeColumns(
  worksheet: ExcelJS.Worksheet,
  minWidth: number = 10,
  maxWidth: number = 50
): void {
  worksheet.columns.forEach(column => {
    let maxLength = 0;
    
    if (column && column.eachCell) {
      column.eachCell({ includeEmpty: false }, (cell) => {
        const cellValue = cell.value;
        let length = 0;
        
        if (cellValue !== null && cellValue !== undefined) {
          length = cellValue.toString().length;
        }
        
        maxLength = Math.max(maxLength, length);
      });
    }
    
    if (column) {
      column.width = Math.min(Math.max(maxLength + 2, minWidth), maxWidth);
    }
  });
}

/**
 * Add title row to worksheet
 */
export function addTitleRow(
  worksheet: ExcelJS.Worksheet,
  title: string,
  columnCount: number
): void {
  const lastColumn = String.fromCharCode(64 + columnCount); // A=65, B=66, etc.
  worksheet.mergeCells(`A1:${lastColumn}1`);
  const titleCell = worksheet.getCell('A1');
  titleCell.value = title;
  titleCell.font = { bold: true, size: 16 };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
}

/**
 * Add subtitle row (e.g., date range)
 */
export function addSubtitleRow(
  worksheet: ExcelJS.Worksheet,
  subtitle: string,
  columnCount: number
): void {
  const lastColumn = String.fromCharCode(64 + columnCount);
  worksheet.mergeCells(`A2:${lastColumn}2`);
  const subtitleCell = worksheet.getCell('A2');
  subtitleCell.value = subtitle;
  subtitleCell.font = { size: 12 };
  subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
}

/**
 * Format number as Indonesian Rupiah
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Format date to Indonesian format: DD/MM/YYYY
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Get Indonesian day name from date
 */
export function getIndonesianDayName(date: Date): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return days[date.getDay()];
}

/**
 * Get week dates from start date (7 days)
 */
export function getWeekDates(startDate: Date): Date[] {
  const dates: Date[] = [];
  const start = new Date(startDate);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}

/**
 * Format date header for weekly table: "Senin 06"
 */
export function formatWeeklyDateHeader(date: Date): string {
  const dayName = getIndonesianDayName(date);
  const dayNumber = String(date.getDate()).padStart(2, '0');
  return `${dayName} ${dayNumber}`;
}

/**
 * Check if two dates are the same day
 */
export function isSameDate(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
