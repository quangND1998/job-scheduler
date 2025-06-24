import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';
import { JobService } from './job.service';
import { JobProcessor } from './job.processor/job.processor';
import { Job, JobSchema } from './job.schema';
import { JobController } from './job.controller';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'job-queue' }),
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
  ],
  providers: [JobService, JobProcessor],
  controllers: [JobController],
})
export class JobModule {}
