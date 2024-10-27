import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    var cookieParser = require('cookie-parser');
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({
        transform: true, // 자동 형변환 활성화
    }));
    await app.listen(3000);
}
bootstrap();
