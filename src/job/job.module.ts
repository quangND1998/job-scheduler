import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';
import { JobService } from './job.service';
import { JobProcessor } from './job.processor/job.processor';
import { Job, JobSchema } from './job.schema';
import { JobController } from './job.controller';
import { join, resolve } from 'path';
import path from 'path';
import { pathToFileURL } from 'url';
import { existsSync } from 'fs';
const jsPath = resolve(__dirname, 'job.processor', 'job-queue.processor.js');
const processorPath = pathToFileURL(jsPath).href;

console.log('🧭 __dirname:', __dirname);
console.log('📎 Full path:', jsPath);
console.log('🔗 File URL:', processorPath);
console.log('✅ File exists:', existsSync(jsPath));
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'job-queue',
      processors: [
        {
          concurrency: 30, // Các bạn có thể cấu hình processor chạy đồng thời
          path: pathToFileURL(__dirname + '/job.processor/job-queue.processor.js')
        }
      ],
    },  { name: 'email-queue' }),
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
  ],
  providers: [JobService],
  controllers: [JobController],
})
export class JobModule {}
