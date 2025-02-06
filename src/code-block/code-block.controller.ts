import { Types } from 'mongoose';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateUpdateCodeBlockDto } from './dto/create-update-code-block.dto';
import { CodeBlockService } from './code-block.service';
import { ParseObjectIdPipe } from 'src/common/shared dtos/parse-object-id.pipe';

@Controller('api/code-blocks')
export class CodeBlockController {
  constructor(private readonly codeBlockService: CodeBlockService) { }

  @Post()
  create(@Body() codeBlockDto: CreateUpdateCodeBlockDto) { //handel post req to create new block
    return this.codeBlockService.create(codeBlockDto);
  }

  @Get()
  findAll() { //handel get req to fetch all the blocks
    return this.codeBlockService.findAll();
  }

  //handel get req to fetch specific block
  @Get(':id')
  findOne(@Param('id', new ParseObjectIdPipe()) id: Types.ObjectId) { //ParseObjectIdPipe Converts string to MongoDB ObjectId
    return this.codeBlockService.findOne(id);
  }

  //handel Patch req to update details for specific block
  @Patch(':id')
  update(@Param('id', new ParseObjectIdPipe()) id: Types.ObjectId, @Body() codeBlockDto: CreateUpdateCodeBlockDto) { //ParseObjectIdPipe Converts string to MongoDB ObjectId
    return this.codeBlockService.update(id, codeBlockDto);
  }

  //handel delete req to delete specific block
  @Delete(':id')
  remove(@Param('id', new ParseObjectIdPipe()) id: Types.ObjectId) { //ParseObjectIdPipe Converts string to MongoDB ObjectId
    return this.codeBlockService.remove(id);
  }
}