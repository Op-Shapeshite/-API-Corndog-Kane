import cron from 'node-cron';
import PayrollService from '../../core/services/PayrollService';
import PayrollRepository from '../../adapters/postgres/repositories/PayrollRepository';
import OutletRepository from '../../adapters/postgres/repositories/OutletRepository';

const payrollRepository = new PayrollRepository();
const outletRepository = new OutletRepository();
const payrollService = new PayrollService(payrollRepository, outletRepository);

/**
 * Cron job to automatically create next period internal payrolls
 * Runs daily at midnight (00:00)
 * 
 * Logic:
 * - Checks all internal employees with base payroll
 * - Verifies latest payroll period is paid (has payment_batch_id)
 * - Creates next period with same duration as previous
 * - Does NOT create payment batches
 */
export function startPayrollCron() {
  // Schedule: Run every day at 00:00 (midnight)
  // Format: second minute hour day month weekday
  // 0 0 * * * = At 00:00 every day
  cron.schedule('0 0 * * *', async () => {
    const now = new Date();
    console.log(`[PAYROLL CRON] Starting automatic payroll creation at ${now.toISOString()}`);
    
    try {
      await payrollService.createNextPeriodInternalPayrolls();
      console.log(`[PAYROLL CRON] Completed successfully at ${new Date().toISOString()}`);
    } catch (error) {
      console.error(`[PAYROLL CRON] Fatal error during execution:`, error);
    }
  }, {
    timezone: "Asia/Jakarta" // Adjust to your timezone
  });
  
  console.log('[PAYROLL CRON] Scheduled: Daily at 00:00 for automatic internal payroll creation');
}

/**
 * Stop all cron jobs (useful for graceful shutdown)
 */
export function stopPayrollCron() {
  cron.getTasks().forEach((task) => {
    task.stop();
  });
  console.log('[PAYROLL CRON] All cron jobs stopped');
}
