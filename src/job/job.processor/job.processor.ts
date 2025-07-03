import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import axios from 'axios';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job as JobSchema } from '../job.schema';

@Processor('job-queue', { concurrency: 1 , limiter:{ max: 30, duration: 1000 } })
export class JobProcessor extends WorkerHost {
  private readonly logger = new Logger(JobProcessor.name);

  constructor(
    @InjectModel(JobSchema.name) private readonly jobModel: Model<JobSchema>,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { id, endpoint, method } = job.data;
    let start = Date.now();
    let duration = 0;
    try {
      this.logger.log(`▶️ [${id}] ${method} ${endpoint}`);
      start = Date.now();
      const res = await axios({ method, url: endpoint });
      duration = Date.now() - start;
      this.logger.log(`✅ [${id}] Status: ${res.status} | Duration: ${duration}ms`);
      // Update job status to success
      await this.jobModel.updateOne(
        { _id: id },
        {
          $set: {
            rpt_last_run_ts: new Date(),
            rpt_last_run_duration: duration,
            rpt_running_status: 'success',
            rpt_last_update_endpoint: new Date(),
          },
          $inc: { rpt_running_count: 1 }
        }
      );
    } catch (err) {
      this.logger.error(`❌ [${id}] Failed: ${err.message}`);
      // Update job status to failed
      await this.jobModel.updateOne(
        { _id: id },
        {
          $set: {
            rpt_last_run_ts: new Date(),
            rpt_running_status: 'failed',
            rpt_last_update_endpoint: new Date(),
          },
          $inc: { rpt_running_count: 1 }
        }
      );
      throw err;
    }
  }
}