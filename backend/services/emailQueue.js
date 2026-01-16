const logger = require('../logs/logger');
const { sendSurgeryNotification } = require('./emailService');

class EmailQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  /**
   * Add an email job to the queue
   * @param {string} email 
   * @param {object} details 
   * @param {string} type 
   */
  add(email, details, type) {
    this.queue.push({ email, details, type, attempts: 0 });
    logger.info(`Email added to queue. Queue size: ${this.queue.length}`);
    this.process();
  }

  async process() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const job = this.queue.shift();

    try {
      logger.info(`Processing email for ${job.email} (${job.type})...`);
      // Simulating slight delay to prove background nature if needed, but not required
      await sendSurgeryNotification(job.email, job.details, job.type);
      logger.info(`Email processed successfully. Remaining: ${this.queue.length}`);
    } catch (error) {
      logger.error(`Failed to send email: ${error.message}`);
      // Simple Retry Logic (Max 3 attempts)
      if (job.attempts < 3) {
        job.attempts++;
        this.queue.push(job); // Re-queue at the end
        logger.warn(`Email re-queued (Attempt ${job.attempts}).`);
      } else {
        logger.error(`Email permanently failed after 3 attempts.`);
      }
    } finally {
      this.isProcessing = false;
      // Continue processing if jobs remain
      if (this.queue.length > 0) {
        this.process();
      }
    }
  }
}

module.exports = new EmailQueue();
