import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfig } from './app.config';
import * as fs from 'fs';
import * as yaml from 'yaml';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => {
        const file = fs.readFileSync('config.yaml', 'utf8');
        return yaml.parse(file);
      }],
    }),
  ],
  providers: [AppConfig],
  exports: [AppConfig], // ✅ export để inject ở nơi khác
})
export class AppConfigModule {}