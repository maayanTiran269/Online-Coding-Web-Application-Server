import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CodeBlockModule } from './code-block/code-block.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot("mongodb://localhost:27017/coding-web-app"),
    CodeBlockModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
