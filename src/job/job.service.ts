import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Cron } from '@nestjs/schedule';

import { InjectModel } from '@nestjs/mongoose';
import { Job } from './job.schema';
import { Model } from 'mongoose';
import { CronExpressionParser } from 'cron-parser';
import { readFileSync } from 'fs';
import { join } from 'path';
import { JobFilterDto } from './job-filter.dto';

@Injectable()
export class JobService {
  private isRunning = false;
  private isSchedulerEnabled = true;
  private readonly logger = new Logger(JobService.name);

  constructor(
    @InjectQueue('job-queue') private readonly jobQueue: Queue,
    @InjectQueue('email-queue') private readonly emailQueue: Queue,
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
      // await this.emailQueue.add('run-job', {
      //   test: Math.random()
      // }, {
      //   attempts: 2,
      //   removeOnFail: false,
      //   backoff: { type: 'fixed', delay: 10000 },
      //   removeOnComplete: true
      // });
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

            await this.jobModel.updateOne(
              { _id: job._id },
              {
                $set: {
                  rpt_running_status: 'running',
                },
                $inc: { rpt_running_count: 1 }
              }
            );
            this.logger.log(`Queueing job [${job.job_id}] ${job.d_invocation_method} ${job.d_endpoint}`);
            this.logger.log(`job [${job._id}] `);
            await this.jobQueue.add('run-job', {
              id: job._id,
              endpoint: job.d_endpoint,
              method: job.d_invocation_method,
              timeout: job.d_timeout_in_sec ? job.d_timeout_in_sec * 1000 : undefined, // ms
              cronExpr: cronExpr,
              // Có thể truyền thêm các param khác nếu cần
            }, {
              removeOnFail: false,
              removeOnComplete: true,
            });
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

  async pause(enabled: boolean) {

    if (enabled) {
      console.log('true');
      await this.jobQueue.pause();
    } else {
      console.log('false');
      await this.jobQueue.resume();
    }
  }

  // Method để reload config động
  private getQueueConfig() {
    try {
      const configPath = join(process.cwd(), 'queue.config.ts');
      const configContent = readFileSync(configPath, 'utf8');
      const configText = configContent.replace('export default', '').trim();
      const config = Function(`return ${configText}`)();
      return config;
    } catch (error) {
      console.error('Error loading config:', error);
      // Fallback: return config mặc định
      return {
        jobQueue: {
          name: 'job-queue',
          path: '/job.processor/job-queue.processor.js',
          concurrency: 30,
          limiter: {
            max: 300,
            duration: 1000,
          },
        },
        emailQueue: {
          name: 'email-queue',
          path: '/job.processor/email-queue.processor.js',
          concurrency: 10,
        },
      };
    }
  }

  // Method để lấy config hiện tại
  getCurrentConfig() {
    return this.getQueueConfig();
  }


  async restartQueuesWithNewConfig() {
    try {
      this.logger.log('🔄 Restarting queues with new configuration...');

      // Lấy config mới
      const newConfig = this.getQueueConfig();

      // Pause tất cả queues
      await this.jobQueue.pause();
      await this.emailQueue.pause();
      this.logger.log('⏸️ Queues paused');

      // Đợi một chút để jobs hiện tại hoàn thành
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Resume queues (sẽ áp dụng config mới từ module)
      await this.jobQueue.resume();
      await this.emailQueue.resume();
      this.logger.log('▶️ Queues resumed with new config');

      return {
        success: true,
        message: 'Queues restarted with new configuration',
        config: newConfig
      };
    } catch (error) {
      this.logger.error(`❌ Failed to restart queues: ${error.message}`);
      throw error;
    }
  }



  // Method để reload và áp dụng config mới
  // Method để reload và áp dụng config mới
  async reloadQueueConfig() {
    try {
      this.logger.log('🔄 Reloading queue configuration...');

      // Lấy config mới từ file
      const newConfig = this.getQueueConfig();

      // Log config mới cho jobQueue
      if (newConfig.jobQueue) {
        const jobQueueConfig = newConfig.jobQueue;
        this.logger.log(`📋 New jobQueue config: concurrency=${jobQueueConfig.concurrency}, limiter=${JSON.stringify(jobQueueConfig.limiter || 'none')}`);
      }

      // Log config mới cho emailQueue
      if (newConfig.emailQueue) {
        const emailQueueConfig = newConfig.emailQueue;
        this.logger.log(`📋 New emailQueue config: concurrency=${emailQueueConfig.concurrency}, limiter=${JSON.stringify(emailQueueConfig.limiter || 'none')}`);
      }

      this.logger.log('✅ Queue configuration reloaded successfully');
      this.logger.log('⚠️ Note: To apply concurrency/limiter changes, restart the application');

      return {
        success: true,
        message: 'Queue configuration reloaded successfully. Restart app to apply concurrency/limiter changes.',
        config: newConfig
      };
    } catch (error) {
      this.logger.error(`❌ Failed to reload queue config: ${error.message}`);
      throw error;
    }
  }

  async getJobs(): Promise<Job[]> {
    return await this.jobModel.find({ conf_inuse: true, rpt_running_status: 'waiting' });
  }

  async healthCheck() {
    try {
      // BullMQ Queue.connection là instance của ioredis.Redis
      const redis = await this.jobQueue.waitUntilReady();
      await redis.ping();
      return { status: 'ok' };
    } catch (err) {
      return { status: 'error', message: err.message };
    }
  }

  private buildQueryString(params: Record<string, any>) {
    return Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
  }

  async paginateJobs(query: JobFilterDto, req: any) {
    const { page, per_page, jobId, status, method, endpoint, bean } = query;
    const skip = (page - 1) * per_page;
    const filter: any = {};
    if (jobId) filter.job_id = { $regex: jobId, $options: 'i' };
    if (status) filter.rpt_running_status = status;
    if (method) filter.d_invocation_method = method;
    if (endpoint) filter.d_endpoint = endpoint;
    if (bean) filter.job_bean = bean;
    const [data, total] = await Promise.all([
      this.jobModel.find(filter).skip(skip).limit(per_page),
      this.jobModel.countDocuments(filter),
    ]);
    const lastPage = Math.ceil(total / per_page);
    const baseUrl = req.protocol + '://' + req.get('host') + req.path;
    const filterParams = { ...query, page: undefined, per_page: undefined };
    const makeUrl = (pageNum: number) => {
      const params = { ...filterParams, page: pageNum, per_page };
      return `${baseUrl}?${this.buildQueryString(params)}`;
    };
    const links: Array<{ url: string | null; label: string; active: boolean }> = [];
    for (let i = 1; i <= lastPage; i++) {
      links.push({
        url: i === page ? null : makeUrl(i),
        label: `${i}`,
        active: i === page,
      });
    }
    links.unshift({
      url: page > 1 ? makeUrl(page - 1) : null,
      label: "&laquo; Previous",
      active: false,
    });
    links.push({
      url: page < lastPage ? makeUrl(page + 1) : null,
      label: "Next &raquo;",
      active: false,
    });
    return {
      current_page: page,
      data,
      per_page,
      total,
      from: skip + 1,
      to: skip + data.length,
      last_page: lastPage,
      next_page_url: page < lastPage ? makeUrl(page + 1) : null,
      prev_page_url: page > 1 ? makeUrl(page - 1) : null,
      links,
    };
  }
}
