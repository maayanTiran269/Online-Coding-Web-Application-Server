import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, Types.ObjectId> {
  transform(value: string): Types.ObjectId { //pipe to validate if the string we have is a real mongo id or not. if it is one return the string as a mongoId
    if (!Types.ObjectId.isValid(value)) { //check if the id is real mongo id
      throw new BadRequestException(`Invalid ObjectId: ${value}`);//throw error if not
    }
    return new Types.ObjectId(value); // return converted string as MongoDB ObjectId
  }
}
