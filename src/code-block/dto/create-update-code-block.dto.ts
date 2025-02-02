import { IsString } from "class-validator";

export class CreateUpdateCodeBlockDto {
   
    @IsString()
    title: string; //title of the block

    @IsString()
    template: string; // code block initial template

   @IsString()
    solution: string; // solution for the code block
}