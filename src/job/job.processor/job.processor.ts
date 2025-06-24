import { Processor, Process } from '@nestjs/bull';
import { Job as BullJob } from 'bull';
import axios from 'axios';
import { Logger } from '@nestjs/common';

@Processor('job-queue')
export class JobProcessor {
  private readonly logger = new Logger(JobProcessor.name);

  @Process({ name: 'run-job', concurrency: 10 })
  async handle(job: BullJob) {
    const { id, endpoint, method } = job.data;
    try {
      this.logger.log(`▶️ [${id}] ${method} ${endpoint}`);
      const start = Date.now();
      const res = await axios({ method, url: endpoint });
      const duration = Date.now() - start;
      this.logger.log(`✅ [${id}] Status: ${res.status} | Duration: ${duration}ms`);
    } catch (err) {
      this.logger.error(`❌ [${id}] Failed: ${err.message}`);
    }
  }
}