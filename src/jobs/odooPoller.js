// server/src/jobs/odooPoller.js

import cron from 'node-cron';
import odooClient from '../services/external/odoo/odooClient.js';
import trackingService from '../services/business/trackingService.js';

/**
 * Odoo Poller Cron Job
 * Runs every 5 minutes to check for stage changes in Odoo CRM
 */

class OdooPoller {
  constructor() {
    this.isRunning = false;
    this.lastRunTime = null;
    this.stats = {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      lastError: null,
      processingTimes: []
    };
  }

  /**
   * Start the cron job
   */
  start() {
    console.log('🚀 Starting Odoo Poller Cron Job (every 5 minutes)');
    
    // Run every 5 minutes: 0 */5 * * * *
    this.cronJob = cron.schedule('*/2 * * * *', async () => {
      await this.executePoll();
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });

    console.log('✅ Odoo Poller Cron Job started successfully');
  }

  /**
   * Stop the cron job
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.destroy();
      console.log('🛑 Odoo Poller Cron Job stopped');
    }
  }

  /**
   * Execute polling operation
   */
  async executePoll() {
    // Prevent overlapping executions
    if (this.isRunning) {
      console.log('⚠️ Previous poll still running, skipping this execution');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();
    
    try {
      console.log('🔍 Starting Odoo polling at:', new Date().toISOString());
      
      this.stats.totalRuns++;
      
      // Fetch leads from Odoo
      const leads = await odooClient.fetchVisibleLeads();
      
      console.log(`📊 Lead details from Odoo:`);
      leads.forEach((lead, index) => {
        console.log(`   ${index + 1}. Lead ${lead.id}: "${lead.name}" - Stage ${lead.stage_id[0]} (Phone: ${lead.phone || 'N/A'})`);
      });
      console.log('─'.repeat(80));

      
      if (!leads || leads.length === 0) {
        console.log('📊 No visible leads found in Odoo');
        this.completeRun(startTime, true, 0, 0, 0);
        return;
      }

      console.log(`📊 Processing ${leads.length} leads from Odoo`);

      // Process each lead
      const results = {
        processed: 0,
        updated: 0,
        created: 0,
        skipped: 0,
        errors: 0,
        notificationsSent: 0
      };

      for (const lead of leads) {
        try {
          const result = await trackingService.processLead(lead);
          
          results.processed++;
          
          if (result.skipped) {
            results.skipped++;
          } else if (result.created) {
            results.created++;
            results.notificationsSent += result.notifications_sent || 0;
          } else if (result.updated) {
            results.updated++;
            results.notificationsSent += result.notifications_sent || 0;
          }
          
        } catch (error) {
          console.error(`❌ Error processing lead ${lead.id}:`, error.message);
          results.errors++;
        }
      }

      // Log results
      this.logResults(results);
      this.completeRun(startTime, true, results.processed, results.notificationsSent, results.errors);
      
    } catch (error) {
      console.error('❌ Odoo polling failed:', error.message);
      this.stats.lastError = error.message;
      this.stats.failedRuns++;
      this.completeRun(startTime, false, 0, 0, 1);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Complete polling run and update statistics
   * @param {number} startTime - Start timestamp
   * @param {boolean} success - Was run successful
   * @param {number} processed - Number of leads processed
   * @param {number} notifications - Number of notifications sent
   * @param {number} errors - Number of errors
   */
  completeRun(startTime, success, processed, notifications, errors) {
    const duration = Date.now() - startTime;
    this.lastRunTime = new Date();
    
    // Update stats
    if (success) {
      this.stats.successfulRuns++;
    } else {
      this.stats.failedRuns++;
    }
    
    this.stats.processingTimes.push(duration);
    
    // Keep only last 100 processing times
    if (this.stats.processingTimes.length > 100) {
      this.stats.processingTimes = this.stats.processingTimes.slice(-100);
    }

    console.log('✅ Odoo polling completed');
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`📊 Processed: ${processed} leads`);
    console.log(`📱 Notifications: ${notifications} sent`);
    console.log(`❌ Errors: ${errors}`);
    console.log('─'.repeat(50));
  }

  /**
   * Log processing results
   * @param {Object} results - Processing results
   */
  logResults(results) {
    console.log('📈 Processing Results:');
    console.log(`   • Total Processed: ${results.processed}`);
    console.log(`   • Created: ${results.created}`);
    console.log(`   • Updated: ${results.updated}`);
    console.log(`   • Skipped: ${results.skipped}`);
    console.log(`   • Errors: ${results.errors}`);
    console.log(`   • Notifications Sent: ${results.notificationsSent}`);
  }

  /**
   * Get poller statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    const avgProcessingTime = this.stats.processingTimes.length > 0
      ? Math.round(this.stats.processingTimes.reduce((a, b) => a + b, 0) / this.stats.processingTimes.length)
      : 0;

    return {
      ...this.stats,
      isRunning: this.isRunning,
      lastRunTime: this.lastRunTime,
      averageProcessingTime: avgProcessingTime,
      successRate: this.stats.totalRuns > 0 
        ? Math.round((this.stats.successfulRuns / this.stats.totalRuns) * 100) 
        : 0
    };
  }

  /**
   * Run poll manually (for testing)
   * @returns {Promise<Object>} Execution result
   */
  async runManually() {
    console.log('🔧 Running Odoo poll manually...');
    await this.executePoll();
    return this.getStats();
  }

  /**
   * Check if poller is healthy
   * @returns {boolean} Health status
   */
  isHealthy() {
    // Consider healthy if:
    // 1. Not stuck running for more than 10 minutes
    // 2. Last run was within 10 minutes (if any runs have occurred)
    // 3. Success rate > 50% (if more than 5 runs)
    
    const now = Date.now();
    
    // Check if stuck
    if (this.isRunning && this.lastRunTime) {
      const timeSinceLastRun = now - this.lastRunTime.getTime();
      if (timeSinceLastRun > 10 * 60 * 1000) { // 10 minutes
        return false;
      }
    }
    
    // Check recency
    if (this.lastRunTime) {
      const timeSinceLastRun = now - this.lastRunTime.getTime();
      if (timeSinceLastRun > 10 * 60 * 1000) { // 10 minutes
        return false;
      }
    }
    
    // Check success rate
    if (this.stats.totalRuns > 5) {
      const successRate = this.stats.successfulRuns / this.stats.totalRuns;
      if (successRate < 0.5) { // Less than 50% success rate
        return false;
      }
    }
    
    return true;
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      lastError: null,
      processingTimes: []
    };
    console.log('📊 Poller statistics reset');
  }
}

// Create singleton instance
const odooPoller = new OdooPoller();

export default odooPoller;
