import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfig {
    constructor(private readonly configService: ConfigService) { }
    private readonly logger = new Logger(AppConfig.name);
    getMongoUri(): string {
        const host = this.configService.get<string>('MONGO_HOST', 'localhost');
        const port = this.configService.get<string>('MONGO_PORT', '27017');
        const db = this.configService.get<string>('MONGO_DB', 'test');
        const user = this.configService.get<string>('MONGO_USER');
        const pass = this.configService.get<string>('MONGO_PASS');
        let connectionString = '';
        if (user && pass) {
            connectionString= `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/${db}?authSource=admin`;
        }
        else {
            connectionString = `mongodb://${host}:${port}/${db}`;
        }
        this.logger.log(`connectionString:  ${connectionString}`);
        return connectionString;
    }

    getRedisHost(): string {
        return this.configService.get<string>('REDIS_HOST', 'localhost');
    }

    getRedisPort(): number {
        return this.configService.get<number>('REDIS_PORT', 6379);
    }

}
