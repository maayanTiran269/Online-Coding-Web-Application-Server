import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CodeBlockModule } from './code-block/code-block.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config'; // Add this line

@Module({
  imports: [
    ConfigModule.forRoot(), //load environment variable
    // MongooseModule.forRoot(process.env.MONGODB_URI), //connect to mongo Atlas
    MongooseModule.forRoot("mongodb://localhost:27017/coding-web-app"), //connect to mongo compass (locally) 

    CodeBlockModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
