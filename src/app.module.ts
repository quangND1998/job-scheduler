import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule  } from '@nestjs/bullmq';
import { JobModule } from './job/job.module';
import { AppConfig } from './config/app.config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './shared/logging.interceptor';
import { HttpErrorFillter } from './shared/http-error.fillter';
import { AppConfigModule } from './config/app-config.module';
@Module({
  //import 
  imports: [
    // AppConfigModule,
    ConfigModule.forRoot({
      isGlobal: true, // để dùng ở bất kỳ đâu không cần import lại
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfig],
      useFactory: async (appConfig: AppConfig) => ({
        uri: appConfig.getMongoUri(),
      }),

    }),
    BullModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfig],
      useFactory: async (config: AppConfig) => ({
        connection: {
          host: config.getRedisHost(),
          port: config.getRedisPort(),
        },
      }),
    }),
    JobModule],
  controllers: [AppController],
  providers: [AppService, AppConfig,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpErrorFillter,
    }


  ],
  exports: [AppConfig],
})
export class AppModule { }
