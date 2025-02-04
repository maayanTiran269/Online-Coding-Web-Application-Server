import { CodeBlock } from './schemas/code-block.schema';
import { Model, Types } from 'mongoose';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUpdateCodeBlockDto } from './dto/create-update-code-block.dto';
import { CodeBlockDto } from './dto/code-block.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CodeBlockTransformer } from 'src/common/transformers/code-block.transformer';
import { filterDtoEmptyFields } from 'src/common/utils/filter-dto-empty-fields';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';

@Injectable()
export class CodeBlockService {
  constructor(@InjectModel(CodeBlock.name) private readonly CODE_BLOCK: Model<CodeBlock>,
    private readonly codeBlockTransformer: CodeBlockTransformer) { }

  async findAll(): Promise<CodeBlockDto[]> {
    try {
      const codeBlockDocuments = await this.CODE_BLOCK.find().exec(); // return all code blocks as mongo documents
      return codeBlockDocuments.map(
        (codeBlock) => new CodeBlockDto(
          this.codeBlockTransformer.toCodeBlockDto(codeBlock)
        )
      ); // convert the documents into codeBlockDto type and return them to the client
    }
    catch (err) {
      throw new InternalServerErrorException('An error occurred while fetching the code blocks.');
    }
  }

  async findOne(_id: Types.ObjectId): Promise<CodeBlockDto> {
    try {
      const codeBlockDocument = await this.CODE_BLOCK.findById(_id).exec(); // mongo query to find the code block doc by his id 

      if (!codeBlockDocument) {
        throw new NotFoundException(`Code block with ID ${_id} not found`);
      }

      return new CodeBlockDto(this.codeBlockTransformer.toCodeBlockDto(codeBlockDocument)); // convert the doc to codeBlockDto and return it
    }
    catch (err) {
      throw new InternalServerErrorException('An error occurred while fetching the code block');
    }
  }

  async getCodeBlockTemplate(_id: Types.ObjectId): Promise<string> {
    try {
      const codeBlockDocument = await this.CODE_BLOCK.findById(_id).select('template').exec(); // mongo query to find the template code doc 

      if (!codeBlockDocument) {
        throw new NotFoundException(`Code block with ID ${_id} not found`);
      }

      return codeBlockDocument?.template; // convert the doc to codeBlockDto and return it
    }
    catch (err) {
      throw new InternalServerErrorException('An error occurred while fetching the code block');
    }
  }

  async create(createCodeBlockDto: CreateUpdateCodeBlockDto): Promise<ApiResponse<CodeBlockDto>> {
    try {
      const codeBlock = new this.CODE_BLOCK(createCodeBlockDto)
      await codeBlock.save();

      return {
        message: 'Code Block created successfully!',
        data: new CodeBlockDto(this.codeBlockTransformer.toCodeBlockDto(codeBlock)),
      }
    }
    catch (err) {
      console.error('Error creating new code block. Error', err);
      throw new InternalServerErrorException(`An error occurred while creating the new code block`);
    }
  }

  async update(_id: Types.ObjectId, codeBlockDto: CreateUpdateCodeBlockDto): Promise<ApiResponse<CodeBlockDto>> {
    try {
      const cleanedDto = filterDtoEmptyFields(codeBlockDto); // calls a func that clean the dto from empty fields so it wont restart values in the db
      const updatedCodeBlock = await this.CODE_BLOCK.findByIdAndUpdate(
        _id,
        cleanedDto,
        {
          new: true,
          runValidators: true
        }
      ).exec();

      if (!updatedCodeBlock) {
        throw new NotFoundException(`Code block with ID ${_id} not found`);
      }

      return {
        message: `code block ${_id} updated successfully!`,
        data: new CodeBlockDto(this.codeBlockTransformer.toCodeBlockDto(updatedCodeBlock)),
      };
    }
    catch (err) {
      throw new InternalServerErrorException(`An error occurred while updating the code block. `)
    }
  }

  async remove(_id: Types.ObjectId): Promise<ApiResponse<string>> {
    try {
      const deletedCodeBlock = await this.CODE_BLOCK.findByIdAndDelete(_id);

      if (!deletedCodeBlock) {
        throw new NotFoundException(`Code block with ID ${_id} not found`);
      }

      return {
        message: `Code block ${_id} deleted successfully!`,
        data: _id.toString(),
      };
    }
    catch (err) {
      throw new InternalServerErrorException('An error occurred while deleting the code block.');
    }
  }
}
