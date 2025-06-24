import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import axios from 'axios';
import { Logger } from '@nestjs/common';

@Processor('job-queue', { concurrency: 20 })
export class JobProcessor extends WorkerHost {
  private readonly logger = new Logger(JobProcessor.name);


  async process(job: Job<any, any, string>): Promise<any> {

    const { id, endpoint, method } = job.data;
    try {
      this.logger.log(`▶️ [${id}] ${method} ${endpoint}`);
      const start = Date.now();
      const res = await axios({ method, url: endpoint });
      const duration = Date.now() - start;
      this.logger.log(`✅ [${id}] Status: ${res.status} | Duration: ${duration}ms`);
    } catch (err) {
      this.logger.error(`❌ [${id}] Failed: ${err.message}`);
      throw err
    }
  }
}