import { Controller, Patch, Body, Get, Query, Post, Param, Delete, Put, Req } from '@nestjs/common';
import { JobService } from './job.service';
import CronExpressionParser from 'cron-parser';
import { JobFilterDto } from './job-filter.dto';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { Request } from 'express';

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) { }

  @Patch('scheduler')
  toggleScheduler(@Body('enabled') enabled: boolean) {
    this.jobService.setSchedulerEnabled(enabled);
    return { enabled };
  }

  @Get('scheduler')
  toggleSchedulerByGet(@Query('enabled') enabled: string) {
    // enabled là string, nên cần chuyển sang boolean
    const isEnabled = enabled === 'true';
    this.jobService.setSchedulerEnabled(isEnabled);
    return { enabled: isEnabled };
  }

  @Get('pause')
  getStatus(@Query('pause') pause: string) {
    const isPaused = pause === 'true';
    return this.jobService.pause(isPaused);
  }

  // API để reload config
  @Get('reload-config')
  async reloadConfig() {
    try {
      const result = await this.jobService.reloadQueueConfig();
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to reload config',
        error: error.message
      };
    }
  }
  // API để restart app bằng PM2
  @Get('restart-queues')
  async restartQueues() {
    try {
      const result = await this.jobService.restartQueuesWithNewConfig();
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to restart queues',
        error: error.message
      };
    }
  }
  // API để xem config hiện tại
  @Get('config')
  getConfig() {
    const cronExpr = '0 0 * * * *';

    const interval = CronExpressionParser.parse(cronExpr, {
      currentDate: new Date(),
    });
    const next = interval.next().toDate();
    return next;
    return this.jobService.getCurrentConfig();
  }

  @Get()
  @UsePipes(new ValidationPipe({
    transform: true, whitelist: true,
    stopAtFirstError: true
  }))
  async getJobs(@Query() query: JobFilterDto, @Req() req: Request) {
    return this.jobService.paginateJobs(query, req);
  }

  @Get('healthcheck')
  async healthCheck() {
    return await this.jobService.healthCheck();
  }
} 