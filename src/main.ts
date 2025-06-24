import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { getQueueToken } from '@nestjs/bull';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Lấy queue từ DI
  const jobQueue = app.get(getQueueToken('job-queue'));
 const emailQueue = app.get(getQueueToken('email-queue'));
  // Tạo bull-board
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');
  createBullBoard({
    queues: [new BullAdapter(jobQueue),new BullAdapter(emailQueue)],
    serverAdapter,
  });
  app.use('/admin/queues', serverAdapter.getRouter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
