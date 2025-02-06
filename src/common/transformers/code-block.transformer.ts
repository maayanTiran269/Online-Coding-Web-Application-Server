import { Injectable } from '@nestjs/common';
import { CodeBlockDto } from 'src/code-block/dto/code-block.dto';
import { CodeBlockDocument } from 'src/code-block/schemas/code-block.schema';

@Injectable()
export class CodeBlockTransformer {
  toCodeBlockDto(codeBlockDocument: CodeBlockDocument | any): CodeBlockDto { //gets a codeBlock mongo document and convert it to be codeBlockDto object
    return new CodeBlockDto({ //create and return the new codeBlockDto object from the document fields
        _id: codeBlockDocument._id.toString(), //MongoId of the code block
        title: codeBlockDocument.title, //title of the block
        template: codeBlockDocument.template, // code block initial template
        solution: codeBlockDocument.solution, // solution for the code block
        createdAt: codeBlockDocument.createdAt, // created time of the code block
        updatedAt: codeBlockDocument.updatedAt // last update time of the code block
    });
  }
}
