import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EmailJobData } from './interfaces';
import { Logger } from '@nestjs/common';

@Processor('charges')
export class ChargeProcessor extends WorkerHost {
  private readonly logger = new Logger(ChargeProcessor.name);

  constructor() {
    super();
    this.logger.log('Charge Worker initialized');
  }

  async process(job: Job<EmailJobData, any, string>): Promise<any> {
    this.logger.log(
      `Processing job: ${job.name} | ID: ${job.id} | Attempt: ${job.attemptsMade + 1}`,
    );

    if (job.name === 'send-charge-email') {
      const data = job.data;
      this.logger.log(
        `Sending email to: ${data.customerEmail} | Invoice: ${data.chargeId}`,
      );

      try {
        this.logger.log('Building email template...');
        this.logger.log('Sending email via SMTP...');
        this.logger.log('Registering send in database...');
        this.logger.log(`Job ${job.id} processed successfully!`);
        return { success: true, emailSent: true };
      } catch (error: any) {
        this.logger.error(`Error processing job ${job.id}:`, error.message);
        throw error;
      }
    } else {
      this.logger.warn(`Unknown job: ${job.name}`);
    }
  }
}
