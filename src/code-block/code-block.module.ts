import { CodeBlock, CodeBlockSchema } from './schemas/code-block.schema';
import { Module } from '@nestjs/common';
import { CodeBlockController } from './code-block.controller';
import { CodeBlockService } from './code-block.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CodeBlockTransformer } from 'src/common/transformers/code-block.transformer';
import { CodeBlockGateway } from './code-block.gateway';

@Module({
  imports: [MongooseModule.forFeature([{ name: CodeBlock.name, schema: CodeBlockSchema }])],
  controllers: [CodeBlockController,],
  providers: [CodeBlockService, CodeBlockTransformer, CodeBlockGateway],
  exports: [CodeBlockService]
})
export class CodeBlockModule { }
