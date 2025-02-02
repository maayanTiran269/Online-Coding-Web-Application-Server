import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';

export type CodeBlockDocument = CodeBlock & Document & {createdAt: Date, updatedAt: Date};

@Schema({timestamps: true})
export class CodeBlock {
    @Prop({required: true})
    title: string; //title of the block

    @Prop({required: true})
    template: string; // code block initial template

    @Prop({required: true})
    solution: string; // solution for the code block

    createdAt?: Date; // Timestamp of creation
    updatedAt?: Date; // Timestamp of the last update
}

export const CodeBlockSchema = SchemaFactory.createForClass(CodeBlock);
