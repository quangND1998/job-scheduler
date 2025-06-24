import { Controller, Patch, Body, Get, Query } from '@nestjs/common';
import { JobService } from './job.service';

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

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
} 