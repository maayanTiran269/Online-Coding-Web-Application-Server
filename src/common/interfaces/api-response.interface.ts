import { CodeBlockDto } from "src/code-block/dto/code-block.dto";

export interface ApiResponse <T> {
    message: string, // feedback message to the client 
    data?: T // the returned data from the server
} 