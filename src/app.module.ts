import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CodeBlockModule } from './code-block/code-block.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config'; // Add this line

@Module({
  imports: [
    ConfigModule.forRoot(), // Load environment variable
    MongooseModule.forRoot(process.env.MONGODB_URI),
    // MongooseModule.forRoot("mongodb://localhost:27017/coding-web-app"),

    CodeBlockModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
// mongodb+srv://maayan_tiran:<db_password>@online-coding-web-app.lotev.mongodb.net/?retryWrites=true&w=majority&appName=Online-Coding-Web-App"