// server/src/jobs/cronJobs.js

import odooPoller from './odooPoller.js';

/**
 * Cron Jobs Manager
 * Manages all background jobs and cron tasks
 */

class CronJobsManager {
  constructor() {
    this.jobs = {
      odooPoller: odooPoller
    };
    this.isStarted = false;
  }

  /**
   * Start all cron jobs
   */
  startAll() {
    if (this.isStarted) {
      console.log('⚠️ Cron jobs already started');
      return;
    }

    console.log('🚀 Starting all cron jobs...');
    
    try {
      // Start Odoo poller
      this.jobs.odooPoller.start();
      
      this.isStarted = true;
      console.log('✅ All cron jobs started successfully');
      
    } catch (error) {
      console.error('❌ Error starting cron jobs:', error);
      throw error;
    }
  }

  /**
   * Stop all cron jobs
   */
  stopAll() {
    if (!this.isStarted) {
      console.log('⚠️ Cron jobs not started');
      return;
    }

    console.log('🛑 Stopping all cron jobs...');
    
    try {
      // Stop Odoo poller
      this.jobs.odooPoller.stop();
      
      this.isStarted = false;
      console.log('✅ All cron jobs stopped successfully');
      
    } catch (error) {
      console.error('❌ Error stopping cron jobs:', error);
      throw error;
    }
  }

  /**
   * Get status of all jobs
   * @returns {Object} Status object
   */
  getStatus() {
    return {
      isStarted: this.isStarted,
      jobs: {
        odooPoller: {
          isHealthy: this.jobs.odooPoller.isHealthy(),
          stats: this.jobs.odooPoller.getStats()
        }
      }
    };
  }

  /**
   * Run specific job manually
   * @param {string} jobName - Job name
   * @returns {Promise<Object>} Execution result
   */
  async runJobManually(jobName) {
    if (!this.jobs[jobName]) {
      throw new Error(`Job ${jobName} not found`);
    }

    console.log(`🔧 Running job ${jobName} manually...`);
    
    if (jobName === 'odooPoller') {
      return await this.jobs.odooPoller.runManually();
    }
    
    throw new Error(`Manual execution not implemented for job ${jobName}`);
  }

  /**
   * Restart specific job
   * @param {string} jobName - Job name
   */
  restartJob(jobName) {
    if (!this.jobs[jobName]) {
      throw new Error(`Job ${jobName} not found`);
    }

    console.log(`🔄 Restarting job ${jobName}...`);
    
    if (jobName === 'odooPoller') {
      this.jobs.odooPoller.stop();
      setTimeout(() => {
        this.jobs.odooPoller.start();
      }, 1000);
    }
  }

  /**
   * Get detailed health check
   * @returns {Object} Health status
   */
  getHealthCheck() {
    const status = this.getStatus();
    const health = {
      overall: 'healthy',
      timestamp: new Date().toISOString(),
      details: {}
    };

    // Check each job
    Object.entries(status.jobs).forEach(([jobName, jobStatus]) => {
      health.details[jobName] = {
        healthy: jobStatus.isHealthy,
        lastRun: jobStatus.stats.lastRunTime,
        totalRuns: jobStatus.stats.totalRuns,
        successRate: jobStatus.stats.successRate,
        isRunning: jobStatus.stats.isRunning
      };

      if (!jobStatus.isHealthy) {
        health.overall = 'unhealthy';
      }
    });

    return health;
  }

  /**
   * Handle graceful shutdown
   */
  gracefulShutdown() {
    console.log('🔄 Graceful shutdown initiated...');
    
    this.stopAll();
    
    // Wait for any running jobs to complete
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const allStopped = !this.jobs.odooPoller.isRunning;
        
        if (allStopped) {
          clearInterval(checkInterval);
          console.log('✅ Graceful shutdown completed');
          resolve();
        }
      }, 1000);
      
      // Force shutdown after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        console.log('⚠️ Forced shutdown after timeout');
        resolve();
      }, 30000);
    });
  }
}

// Create singleton instance
const cronJobsManager = new CronJobsManager();

export default cronJobsManager;
