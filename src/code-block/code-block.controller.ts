import { Types } from 'mongoose';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUpdateCodeBlockDto } from './dto/create-update-code-block.dto';
import { CodeBlockDto } from './dto/code-block.dto';
import { CodeBlockService } from './code-block.service';
import { ParseObjectIdPipe } from 'src/common/shared dtos/parse-object-id.pipe';

@Controller('code-blocks')
export class CodeBlockController {
  constructor(private readonly codeBlockService: CodeBlockService) {}

  @Post()
  create(@Body(new ValidationPipe({ whitelist: true })) codeBlockDto: CreateUpdateCodeBlockDto) {
    return this.codeBlockService.create(codeBlockDto);
  }

  @Get()
  findAll() {
    return this.codeBlockService.findAll();
  }

  @Get(':id')
  findOne(@Param('id',  new ParseObjectIdPipe()) id: Types.ObjectId) { //ParseObjectIdPipe Converts string to MongoDB ObjectId
    return this.codeBlockService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', new ParseObjectIdPipe()) id: Types.ObjectId, @Body() codeBlockDto: CreateUpdateCodeBlockDto) { //ParseObjectIdPipe Converts string to MongoDB ObjectId
    return this.codeBlockService.update(id, codeBlockDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseObjectIdPipe()) id: Types.ObjectId) { //ParseObjectIdPipe Converts string to MongoDB ObjectId
    return this.codeBlockService.remove(id);
  }
}
