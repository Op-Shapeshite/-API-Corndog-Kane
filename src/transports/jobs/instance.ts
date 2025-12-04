import { startPayrollCron } from './payrollCron';

export default class JobsTransport {
  static boot() {
    // Start all cron jobs
    startPayrollCron();
    
    console.log('[Jobs Transport] Booted');
  }
}

// Auto-boot when imported
// JobsTransport.boot();