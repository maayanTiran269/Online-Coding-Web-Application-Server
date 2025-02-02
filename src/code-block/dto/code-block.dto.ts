export class CodeBlockDto {
    _id: string; //MongoId of the code block
    title: string; //title of the block
    template: string; // code block initial template
    solution: string; // solution for the code block
    createdAt: Date; // created time of the code block
    updatedAt: Date; // last update time of the code block

    //set all the fields to optional for many different use cases  
    constructor(partial: Partial<CodeBlockDto>) {
        Object.assign(this, partial); // Map fields dynamically
    }
}