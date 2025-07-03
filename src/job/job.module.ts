import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';
import { JobService } from './job.service';
import { Job, JobSchema } from './job.schema';
import { JobController } from './job.controller';
import { pathToFileURL } from 'url';
import queueConfig from 'queue.config';


const jobQueueConfig = queueConfig.jobQueue;
const emailQueueConfig = queueConfig.emailQueue;

@Module({
  imports: [
    BullModule.registerQueue({
      name: jobQueueConfig.name,
      processors: [
        {
          concurrency: jobQueueConfig.concurrency, // Các bạn có thể cấu hình processor chạy đồng thời
          path: pathToFileURL(__dirname + jobQueueConfig.path),
          ...((jobQueueConfig as any).limiter ? { limiter: (jobQueueConfig as any).limiter } : {}),
        }
      ],
    }, {
      name: emailQueueConfig.name,
      processors: [
        {
          concurrency: emailQueueConfig.concurrency, // Các bạn có thể cấu hình processor chạy đồng thời
          path: pathToFileURL(__dirname + emailQueueConfig.path),
          ...((emailQueueConfig as any).limiter ? { limiter: (emailQueueConfig as any).limiter } : {}),
        }
      ],
    }),
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
  ],
  providers: [JobService],
  controllers: [JobController],
})
export class JobModule { }
