import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bull';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from './job.schema';
import { Model } from 'mongoose';
import { CronExpressionParser } from 'cron-parser';

@Injectable()
export class JobService {
  private isRunning = false;
  private isSchedulerEnabled = true;
  private readonly logger = new Logger(JobService.name);

  constructor(
    @InjectQueue('job-queue') private readonly jobQueue: Queue,
    @InjectModel(Job.name) private readonly jobModel: Model<Job>,
  ) { }

  setSchedulerEnabled(enabled: boolean) {
    this.isSchedulerEnabled = enabled;
  }

  @Cron('*/1 * * * * *') // mỗi giây
  async dispatchJobs() {
    if (!this.isSchedulerEnabled) return;
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      const now = new Date();
      const jobs = await this.jobModel.find({ conf_inuse: true, rpt_running_status: 'waiting' });
      // this.logger.log(`Queueing jobs ${jobs.map(j => j.job_id).join(', ')}`);
      for (const job of jobs) {
        try {
          const cronExpr = job.d_fix_cron || '* * * * * *';
          const interval = CronExpressionParser.parse(cronExpr, {
            currentDate: job.rpt_last_run_ts || new Date(0),
          });
          const next = interval.next().toDate();
          if (next <= now) {
            const start = Date.now();
            await this.jobQueue.add('run-job', {
              id: String(job._id),
              endpoint: job.d_endpoint,
              method: job.d_invocation_method,
              // Có thể truyền thêm các param khác nếu cần
            }, {
              removeOnFail: false,
              attempts: 2,
              backoff: 10000,        // chờ 10 giây mỗi lần retry
              timeout: 120000,
              // removeOnComplete: true
            });
            const end = Date.now();
            const duration = end - start;
            const nowDate = new Date();
            await this.jobModel.updateOne(
              { _id: job._id },
              {
                $set: {
                  rpt_last_run_ts: nowDate,
                  rpt_next_run_ts: interval.next().toDate(),
                  rpt_last_run_duration: duration,
                  rpt_expected_timeout_ts: new Date(nowDate.getTime() + duration),
                  rpt_last_update_endpoint: nowDate,
                  rpt_running_status: 'waiting',
                },
                $inc: { rpt_running_count: 1 }
              }
            );
            this.logger.log(`Queueing job [${job.job_id}] ${job.d_invocation_method} ${job.d_endpoint}`);
          }
        } catch (err) {
          this.logger.error(`Invalid cron for job ${job.job_id}: ${err.message}`);
        }
      }
    } catch (err) {
      this.logger.error('Dispatch error: ' + err);
    } finally {
      this.isRunning = false;
    }
  }
}
