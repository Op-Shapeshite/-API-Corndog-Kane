import { Request, Response } from 'express';
import { TMetadataResponse } from "../../../core/entities/base/response";
import { 
  TTransactionGetResponse, 
  TTransactionCreateRequest, 
  TTransactionUpdateRequest,
  TTransactionWithID,
  TransactionType,
  TFinanceReport
} from "../../../core/entities/finance/transaction";
import { TFinancialStatements } from "../../../core/entities/finance/report";
import TransactionService from '../../../core/services/TransactionService';
import { FinancialStatementService } from '../../../core/services/FinancialStatementService';
import { TransactionRepository } from "../../../adapters/postgres/repositories/TransactionRepository";
import { AccountRepository } from "../../../adapters/postgres/repositories/AccountRepository";
import Controller from "./Controller";
import { TransactionResponseMapper } from "../../../mappers/response-mappers/TransactionResponseMapper";
import ExcelJS from 'exceljs';
import { styleHeaderRow, setExcelHeaders, autoSizeColumns, formatDate, formatCurrency } from '../../../utils/excelHelpers';

export class TransactionController extends Controller<TTransactionGetResponse | TFinanceReport | TFinancialStatements, TMetadataResponse> {
  private transactionService: TransactionService;
  private financialStatementService: FinancialStatementService;

  constructor() {
    super();
    const transactionRepo = new TransactionRepository();
    const accountRepo = new AccountRepository();
    
    this.transactionService = new TransactionService(
      transactionRepo,
      accountRepo
    );
    
    this.financialStatementService = new FinancialStatementService(
      transactionRepo,
      accountRepo
    );
  }

  getAll = () => {
    return async (req: Request, res: Response) => {
      try {
        const { page, limit, search_key, search_value, type, ...filters } = req.query;
        const pageNum = page ? parseInt(page as string, 10) : 1;
        const limitNum = limit ? parseInt(limit as string, 10) : 10;
        const { SearchHelper } = await import('../../../utils/search/searchHelper');
        const validation = SearchHelper.validateSearchParams(
          'transaction', 
          search_key as string, 
          search_value as string
        );

        if (!validation.valid) {
          return this.handleError(
            res,
            new Error(validation.error),
            validation.error || "Invalid search parameters",
            400,
            [] as any,
            {
              page: pageNum,
              limit: limitNum,
              total_records: 0,
              total_pages: 0,
              searchable_fields: validation.searchable_fields
            } as any
          );
        }
        const search = SearchHelper.buildSearchConfig(
          'transaction',
          search_key as string,
          search_value as string
        );
        const result = await this.transactionService.getAllTransactions(
          pageNum,
          limitNum,
          search,
          filters as Record<string, any>
        );
        const mappedData = TransactionResponseMapper.toListResponse(result.data);
        if (type === 'xlsx') {
          try {
            await this.generateTransactionsExcel(res, mappedData);
            return; // Important: return here to prevent JSON response
          } catch (excelError) {
            console.error('Error generating Excel:', excelError);
            return res.status(500).json({
              status: 'error',
              message: 'Gagal membuat file Excel. Silakan coba lagi.',
              data: [],
              metadata: {
                page: 1,
                limit: 10,
                total_records: 0,
                total_pages: 0,
              }
            });
          }
        }
        
        const metadata: TMetadataResponse = {
          page: result.page,
          limit: result.limit,
          total_records: result.total,
          total_pages: result.totalPages,
        };
        
        return this.getSuccessResponse(
          res,
          {
            data: mappedData,
            metadata,
          },
          "Transaksi berhasil diambil"
        );
      } catch (error) {
        return this.handleError(
          res,
          error,
          "Gagal mengambil transaksi",
          500,
          [] as TTransactionGetResponse[],
          {
            page: 1,
            limit: 10,
            total_records: 0,
            total_pages: 0,
          } as TMetadataResponse
        );
      }
    };
  }

  getById = () => {
    return async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const transaction = await this.transactionService.findById(id);
        
        if (!transaction) {
          return this.handleError(
            res,
            new Error('Transaksi tidak ditemukan'),
            "Transaksi tidak ditemukan",
            404,
            {} as TTransactionGetResponse,
            {} as TMetadataResponse
          );
        }
        
        const mappedResult = TransactionResponseMapper.toResponse(transaction as TTransactionWithID);
        
        return this.getSuccessResponse(
          res,
          {
            data: mappedResult,
            metadata: {} as TMetadataResponse,
          },
          "Transaksi berhasil diambil"
        );
      } catch (error) {
        return this.handleError(
          res,
          error,
          "Gagal mengambil transaksi",
          500,
          {} as TTransactionGetResponse,
          {} as TMetadataResponse
        );
      }
    };
  }

  create = () => {
    return async (req: Request, res: Response) => {
      try {
        const data: TTransactionCreateRequest = req.body;
        
        const transaction = await this.transactionService.createTransaction({
          accountId: data.account_id,
          amount: data.amount,
          transactionType: data.transaction_type as TransactionType,
          description: data.description,
          transactionDate: new Date(data.transaction_date),
          referenceNumber: data.reference_number,
        });
        
        const mappedResult = TransactionResponseMapper.toResponse(transaction);
        
        return this.getSuccessResponse(
          res,
          {
            data: mappedResult,
            metadata: {} as TMetadataResponse,
          },
          "Transaksi berhasil dibuat"
        );
      } catch (error) {
        return this.handleError(
          res,
          error,
          "Gagal membuat transaksi",
          500,
          {} as TTransactionGetResponse,
          {} as TMetadataResponse
        );
      }
    };
  }

  update = () => {
    return async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const data: TTransactionUpdateRequest = req.body;
        
        const transaction = await this.transactionService.updateTransaction(id, {
          ...(data.account_id !== undefined && { accountId: data.account_id }),
          ...(data.amount !== undefined && { amount: data.amount }),
          ...(data.transaction_type !== undefined && { transactionType: data.transaction_type as TransactionType }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.transaction_date !== undefined && { transactionDate: new Date(data.transaction_date) }),
          ...(data.reference_number !== undefined && { referenceNumber: data.reference_number }),
        });
        
        const mappedResult = TransactionResponseMapper.toResponse(transaction);
        
        return this.getSuccessResponse(
          res,
          {
            data: mappedResult,
            metadata: {} as TMetadataResponse,
          },
          "Transaksi berhasil diperbarui"
        );
      } catch (error) {
        return this.handleError(
          res,
          error,
          "Gagal memperbarui transaksi",
          500,
          {} as TTransactionGetResponse,
          {} as TMetadataResponse
        );
      }
    };
  }

  delete = () => {
    return async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        
        await this.transactionService.deleteTransaction(id);
        
        return this.getSuccessResponse(
          res,
          {
            data: {} as TTransactionGetResponse,
            metadata: {} as TMetadataResponse,
          },
          "Transaksi berhasil dihapus"
        );
      } catch (error) {
        return this.handleError(
          res,
          error,
          "Gagal menghapus transaksi",
          500,
          {} as TTransactionGetResponse,
          {} as TMetadataResponse
        );
      }
    };
  }

  generateReport = () => {
    return async (req: Request, res: Response) => {
      try {
        const type = (req.query.type as string) || 'table';
        const startDate = new Date(req.query.start_date as string);
        const endDate = new Date(req.query.end_date as string);
        const reportCategory = (req.query.report_category as string) || 'all';
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return this.handleError(
            res,
            new Error('Invalid date format'),
            "Invalid start_date or end_date format. Use YYYY-MM-DD",
            400,
            {} as TFinancialStatements,
            {} as TMetadataResponse
          );
        }
        if (endDate < startDate) {
          return this.handleError(
            res,
            new Error('Invalid date range'),
            "end_date must be greater than or equal to start_date",
            400,
            {} as TFinancialStatements,
            {} as TMetadataResponse
          );
        }
        if (!['laba_rugi', 'neraca', 'cashflow', 'all'].includes(reportCategory)) {
          return this.handleError(
            res,
            new Error('Invalid report category'),
            "report_category must be: laba_rugi, neraca, cashflow, or all",
            400,
            {} as TFinancialStatements,
            {} as TMetadataResponse
          );
        }

        // Generate dynamic financial statements with monthly arrays
        if (type === 'json' || type === 'xlsx') {
          const statements = await this.financialStatementService.generateStatements(
            startDate,
            endDate,
            reportCategory as 'laba_rugi' | 'neraca' | 'cashflow' | 'all'
          );
          if (type === 'xlsx') {
            return this.generateFinancialStatementsExcel(res, statements);
          }

          return this.getSuccessResponse(
            res,
            {
              data: statements,
              metadata: {} as TMetadataResponse,
            },
            "Financial statements generated successfully"
          );
        }

        // PDF type returns JSON with dynamic financial statements (no longer generates Excel)
        if (type === 'pdf') {
          const statements = await this.financialStatementService.generateStatements(
            startDate,
            endDate,
            reportCategory as 'laba_rugi' | 'neraca' | 'cashflow' | 'all'
          );

          return this.getSuccessResponse(
            res,
            {
              data: statements,
              metadata: {} as TMetadataResponse,
            },
            "Financial statements generated successfully"
          );
        }

        // Legacy report formats - generate old-style table report
        const accountCategoryIds = req.query.account_category_ids
          ? (req.query.account_category_ids as string).split(',').map(Number)
          : undefined;

        const report = await this.transactionService.generateReport(
          startDate,
          endDate,
          accountCategoryIds
        );

        // Legacy table format
        if (type === 'table') {
          return this.getSuccessResponse(
            res,
            {
              data: report,
              metadata: {} as TMetadataResponse,
            },
            "Finance report generated successfully"
          );
        }

        // Legacy xlsx format (will be deprecated - use type=xlsx with json format instead)
        if (type === 'xlsx-legacy') {
          return this.generateExcelReport(res, report);
        }

        return this.handleError(
          res,
          new Error('Invalid report type'),
          "Report type must be: table, xlsx, pdf, or json",
          400,
          {} as TFinanceReport,
          {} as TMetadataResponse
        );
      } catch (error) {
        return this.handleError(
          res,
          error,
          "Failed to generate report",
          500,
          {} as TFinanceReport,
          {} as TMetadataResponse
        );
      }
    };
  }

  private async generateExcelReport(res: Response, report: TFinanceReport) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Finance Report');
    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').value = 'Finance Report';
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:F2');
    worksheet.getCell('A2').value = `Period: ${report.period.start_date} to ${report.period.end_date}`;
    worksheet.getCell('A2').alignment = { horizontal: 'center' };
    worksheet.addRow([]);
    worksheet.addRow(['Summary']);
    worksheet.addRow(['Total Income', report.summary.total_income]);
    worksheet.addRow(['Total Expense', report.summary.total_expense]);
    worksheet.addRow(['Balance', report.summary.balance]);
    worksheet.addRow([]);
    const headerRow = worksheet.addRow([
      'Date',
      'Account Name',
      'Account Number',
      'Description',
      'Income',
      'Expense'
    ]);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };
    report.data.forEach(day => {
      day.transactions.forEach(t => {
        worksheet.addRow([
          day.date,
          t.account_name,
          t.account_number,
          t.description || '',
          t.income_amount,
          t.expense_amount
        ]);
      });
      const totalRow = worksheet.addRow([
        `${day.date} Total`,
        '',
        '',
        '',
        day.total_income,
        day.total_expense
      ]);
      totalRow.font = { bold: true };
    });
    worksheet.columns = [
      { width: 15 },
      { width: 25 },
      { width: 15 },
      { width: 30 },
      { width: 15 },
      { width: 15 }
    ];

    // Send file
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=finance-report-${report.period.start_date}-${report.period.end_date}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  /**
   * Generate Excel file for transactions
   */
  private async generateTransactionsExcel(res: Response, transactions: TTransactionGetResponse[]): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transactions');
    const headerRow = worksheet.addRow([
      'ID Transaksi',
      'Tanggal',
      'Nama Akun',
      'Nomor Akun',
      'Jenis',
      'Jumlah',
      'Deskripsi',
      'Referensi'
    ]);
    styleHeaderRow(headerRow);
    transactions.forEach(transaction => {
      const txn = transaction as any; // Runtime has more fields than type definition
      worksheet.addRow([
        txn.id || '-',
        txn.date ? formatDate(txn.date) : '-',
        txn.account_name || '-',
        txn.account_number || '-',
        txn.credit > 0 ? 'PEMASUKAN' : 'PENGELUARAN',
        (txn.credit || txn.debit || 0),
        txn.description || '-',
        txn.reference_number || '-'
      ]);
    });

    // Auto-size columns
    autoSizeColumns(worksheet);
    const filename = `transactions-${new Date().toISOString().split('T')[0]}.xlsx`;
    setExcelHeaders(res, filename);

    await workbook.xlsx.write(res);
    res.end();
  }

  /**
   * Generate multi-sheet Excel for Financial Statements
   * Creates 3 sheets: Laba Rugi, Neraca, and Cashflow
   */
  private async generateFinancialStatementsExcel(res: Response, statements: TFinancialStatements) {
    try {
      const workbook = new ExcelJS.Workbook();
      const { period, laba_rugi, neraca, cashflow } = statements;
      if (!period || !period.months || !Array.isArray(period.months) || period.months.length === 0) {
        throw new Error('Invalid period data: months array is missing or empty');
      }
      
      const months = period.months;

      // Helper function to add section to worksheet
      const addSections = (worksheet: ExcelJS.Worksheet, sections: any[], indentLevel: number = 0) => {
        sections.forEach(section => {
          const indent = '  '.repeat(indentLevel);
          const amounts = Array.isArray(section.amount) ? section.amount : [];
          
          const row = worksheet.addRow([
            indent + section.label,
            ...amounts
          ]);

          // Bold for top-level sections (indentLevel === 0)
          if (indentLevel === 0) {
            row.font = { bold: true };
          }

          // Recursively add subsections
          if (section.subsections && section.subsections.length > 0) {
            addSections(worksheet, section.subsections, indentLevel + 1);
          }
        });
      };

      // ===== SHEET 1: Laba Rugi (Income Statement) =====
      if (laba_rugi && laba_rugi.length > 0) {
        const sheet = workbook.addWorksheet('Laba Rugi');

        // Title
        sheet.mergeCells(1, 1, 1, months.length + 1);
        const titleCell = sheet.getCell(1, 1);
        titleCell.value = 'Laporan Laba Rugi';
        titleCell.font = { bold: true, size: 14 };
        titleCell.alignment = { horizontal: 'center' };

        // Period
        sheet.mergeCells(2, 1, 2, months.length + 1);
        const periodCell = sheet.getCell(2, 1);
        periodCell.value = `Periode: ${period.start_date} - ${period.end_date}`;
        periodCell.alignment = { horizontal: 'center' };

        // Empty row
        sheet.addRow([]);

        // Headers
        const headerRow = sheet.addRow(['Keterangan', ...months]);
        styleHeaderRow(headerRow);

        // Data
        addSections(sheet, laba_rugi);

        autoSizeColumns(sheet);
      }

      // ===== SHEET 2: Neraca (Balance Sheet) =====
      if (neraca && neraca.length > 0) {
        const sheet = workbook.addWorksheet('Neraca');

        // Title
        sheet.mergeCells(1, 1, 1, months.length + 1);
        const titleCell = sheet.getCell(1, 1);
        titleCell.value = 'Laporan Neraca';
        titleCell.font = { bold: true, size: 14 };
        titleCell.alignment = { horizontal: 'center' };

        // Period
        sheet.mergeCells(2, 1, 2, months.length + 1);
        const periodCell = sheet.getCell(2, 1);
        periodCell.value = `Periode: ${period.start_date} - ${period.end_date}`;
        periodCell.alignment = { horizontal: 'center' };

        // Empty row
        sheet.addRow([]);

        // Headers
        const headerRow = sheet.addRow(['Keterangan', ...months]);
        styleHeaderRow(headerRow);

        // Data
        addSections(sheet, neraca);

        autoSizeColumns(sheet);
      }

      // ===== SHEET 3: Cashflow =====
      if (cashflow && cashflow.length > 0) {
        const sheet = workbook.addWorksheet('Cashflow');

        // Title
        sheet.mergeCells(1, 1, 1, months.length + 1);
        const titleCell = sheet.getCell(1, 1);
        titleCell.value = 'Laporan Arus Kas';
        titleCell.font = { bold: true, size: 14 };
        titleCell.alignment = { horizontal: 'center' };

        // Period
        sheet.mergeCells(2, 1, 2, months.length + 1);
        const periodCell = sheet.getCell(2, 1);
        periodCell.value = `Periode: ${period.start_date} - ${period.end_date}`;
        periodCell.alignment = { horizontal: 'center' };

        // Empty row
        sheet.addRow([]);

        // Headers
        const headerRow = sheet.addRow(['Keterangan', ...months]);
        styleHeaderRow(headerRow);

        // Data
        addSections(sheet, cashflow);

        autoSizeColumns(sheet);
      }
      if (workbook.worksheets.length === 0) {
        const sheet = workbook.addWorksheet('No Data');
        sheet.addRow(['No financial data available for the selected period']);
      }
      const filename = `financial-statements-${period.start_date}-${period.end_date}.xlsx`;
      setExcelHeaders(res, filename);

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Error generating financial statements Excel:', error);
      throw error;
    }
  }
}
