import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'; 
import { ExpressAdapter } from '@bull-board/express';
import { getQueueToken } from '@nestjs/bullmq';
import { EventEmitter } from 'events';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
EventEmitter.defaultMaxListeners = 10;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Lấy queue từ DI
  const jobQueue = app.get(getQueueToken('job-queue'));
 const emailQueue = app.get(getQueueToken('email-queue'));
  // Tạo bull-board
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');
  createBullBoard({
    queues: [new BullMQAdapter(jobQueue),new BullMQAdapter(emailQueue)],
    serverAdapter,
  });
  app.use('/admin/queues', serverAdapter.getRouter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
