import { CodeBlock } from './schemas/code-block.schema';
import { Model, Types } from 'mongoose';
import { forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUpdateCodeBlockDto } from './dto/create-update-code-block.dto';
import { CodeBlockDto } from './dto/code-block.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CodeBlockTransformer } from 'src/common/transformers/code-block.transformer';
import { filterDtoEmptyFields } from 'src/common/utils/filter-dto-empty-fields';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';
import { CodeBlockGateway } from './code-block.gateway';

@Injectable()
export class CodeBlockService {
  constructor(
    @InjectModel(CodeBlock.name) private readonly CODE_BLOCK: Model<CodeBlock>, //inject the model of the schema
    private readonly codeBlockTransformer: CodeBlockTransformer,
    @Inject(forwardRef(() => CodeBlockGateway)) private readonly codeBlockGateWay: CodeBlockGateway
  ) { }

  async findAll(): Promise<CodeBlockDto[]> {
    try {
      const codeBlockDocuments = await this.CODE_BLOCK.find().exec(); // return all code blocks as mongo documents
      return codeBlockDocuments.map(
        (codeBlock) => new CodeBlockDto(this.codeBlockTransformer.toCodeBlockDto(codeBlock))
      ); // convert the documents into codeBlockDto type and return them to the client
    }
    catch (err) { //handle error if appear
      throw new InternalServerErrorException('An error occurred while fetching the code blocks.'); //throw error internal server error
    }
  }

  async findOne(_id: Types.ObjectId): Promise<CodeBlockDto> {
    try {
      const codeBlockDocument = await this.CODE_BLOCK.findById(_id).exec(); // mongo query to find the code block doc by his id 

      if (!codeBlockDocument) { //check if found any matches
        throw new NotFoundException(`Code block with ID ${_id} not found`);//throw error not found error
      }

      return new CodeBlockDto(this.codeBlockTransformer.toCodeBlockDto(codeBlockDocument)); // convert the doc to codeBlockDto and return it
    }
    catch (err) { //handle error if appear
      throw new InternalServerErrorException('An error occurred while fetching the code block');//throw error internal server error
    }
  }

  async getCodeBlockCodes(_id: Types.ObjectId): Promise<{ template: string, solution: string }> {
    try {
      const codeBlockDocument = await this.CODE_BLOCK.findById(_id).select('template solution').exec(); // mongo query to find the template code doc 

      if (!codeBlockDocument) {//check if found any matches
        throw new NotFoundException(`Code block with ID ${_id} not found`);//throw error not found error
      }

      return { template: codeBlockDocument?.template, solution: codeBlockDocument?.solution }; // return the template and solution of the block
    }
    catch (err) {//handle error if appear
      throw new InternalServerErrorException('An error occurred while fetching code block template');//throw error internal server error
    }
  }

  async create(createCodeBlockDto: CreateUpdateCodeBlockDto): Promise<ApiResponse<CodeBlockDto>> {
    try {
      createCodeBlockDto.title = createCodeBlockDto.title.trim();//remove extra spaces/tabs/enters
      createCodeBlockDto.template = createCodeBlockDto.template.trim(); //remove extra spaces/tabs/enters
      createCodeBlockDto.solution = createCodeBlockDto.solution.replace(/\s+/g, ' ').trim(); //remove all the enters and extra spaces to create consistent one line code
      
      const codeBlock = new this.CODE_BLOCK(createCodeBlockDto); //create new block
      await codeBlock.save(); //save the block

      const codeBlockDto = new CodeBlockDto(this.codeBlockTransformer.toCodeBlockDto(codeBlock)); // convert the from doc to dto

      this.codeBlockGateWay.handleNewCodeBlock(codeBlockDto); //send update to all the users via socket

      return {
        message: 'Code Block created successfully!',
        data: new CodeBlockDto(this.codeBlockTransformer.toCodeBlockDto(codeBlock)),
      } //return data for consistent API behavior
    }
    catch (err) {//handle error if appear
      console.error('Error creating new code block. Error', err); //log the error
      throw new InternalServerErrorException(`An error occurred while creating the new code block`);//throw error internal server error
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
      ).exec(); //find the code block by id and update only the fields with new values

      if (!updatedCodeBlock) {//check if found any matches
        throw new NotFoundException(`Code block with ID ${_id} not found`);//throw error not found error
      }

      return {
        message: `code block ${_id} updated successfully!`,
        data: new CodeBlockDto(this.codeBlockTransformer.toCodeBlockDto(updatedCodeBlock)),
      };//return data for consistent API behavior
    }
    catch (err) { //handle error if appear
      throw new InternalServerErrorException(`An error occurred while updating the code block. `);//throw error internal server error
    }
  }

  async remove(_id: Types.ObjectId): Promise<ApiResponse<string>> {
    try {
      const deletedCodeBlockDoc = await this.CODE_BLOCK.findByIdAndDelete(_id); //delete the doc that have this id

      if (!deletedCodeBlockDoc) {//check if found any matches
        throw new NotFoundException(`Code block with ID ${_id} not found`);//throw error not found error
      }

      this.codeBlockGateWay.handleDelete(_id.toString());//update all the users via socket about the block that was deleted
      
      return {
        message: `Code block ${_id} deleted successfully!`,
        data: _id.toString(),
      };//return data for consistent API behavior
    }
    catch (err) {//handle error if appear
      throw new InternalServerErrorException('An error occurred while deleting the code block.');//throw error internal server error
    }
  }
}
