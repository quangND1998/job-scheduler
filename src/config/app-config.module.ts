import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfig } from './app.config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [AppConfig],
  exports: [AppConfig], // ✅ export để inject ở nơi khác
})
export class AppConfigModule {}