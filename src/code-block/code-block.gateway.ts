import { Types } from 'mongoose';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CodeBlockService } from './code-block.service';
import { CodeBlockDto } from './dto/code-block.dto';
import { Inject, forwardRef } from '@nestjs/common';

interface Room { //basic template for the room
  code: string;
  solution: string;
  mentor: Socket | null;
  students: Set<Socket>;
  isSolved: boolean;
}

@WebSocketGateway({ cors: true })
export class CodeBlockGateway {
  constructor(@Inject(forwardRef(() => CodeBlockService)) private readonly codeBlockService: CodeBlockService) { }

  @WebSocketServer()
  server: Server;

  private rooms: Map<string, Room> = new Map();

  @SubscribeMessage('join-room')
  async handleJoinRoom(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
    let room = this.rooms.get(roomId); // try to get the room by his id

    if (!room) { //create room if doesn't exist already
      const codeBlockData = await this.codeBlockService.getCodeBlockCodes(new Types.ObjectId(roomId)); //req from the service to send back the codeBlock data from the db
      
      const cleanedTemplate = codeBlockData.template.replace(/\s+/g, ' ').trim(); //remove all the enters and extra spaces to make one consistent line of code for cooperation
      const isSolved = cleanedTemplate === codeBlockData.solution; //check if the code in the room is the same as the solution
      
      room = {
        code: codeBlockData.template,
        solution: codeBlockData.solution,
        mentor: null,
        students: new Set(),
        isSolved: isSolved
      }; //new default room

      this.rooms.set(roomId, room); //add room to rooms
    }

    const isAlreadyInRoom = room.mentor === client || room.students.has(client); //check the user role to see if he is in the room
    if (isAlreadyInRoom) { // Prevent the same user from joining twice
      return; // Ignore duplicate joins
    }

    if (!room.mentor) { // Assign roles
      room.mentor = client;
      client.emit('role', 'mentor'); //notify the client via socket that his role is now mentor
    } else {
      room.students.add(client);
      client.emit('role', 'student');//notify the client via socket that his role is now mentor
    }

    client.join(roomId); //connect user to room and update the client about it
    this.updateStudentCount(roomId); //update the room student count
    
    client.emit('code-update', {code: room.code, isSolved: room.isSolved}); // Send existing code and status to the new user
  }

  private updateStudentCount(roomId: string) {
    const room = this.rooms.get(roomId); //try to get the room by his id 

    if (room) {  //if room exist, broadcast to all the room members amount of participants in the room
      this.server.to(roomId).emit('student-count', room.students.size);
    }
  }

  @SubscribeMessage('code-update')
  handleCodeUpdate(@MessageBody() data: { roomId: string; code: string }, @ConnectedSocket() client: Socket) {
    const room = this.rooms.get(data.roomId); // try to get the room by his id

    if (!room) return; //check if room exist 

    const isMentor = room.mentor === client; //check if the user is the mentor
    const isStudent = room.students.has(client);//check if the user is the student

    if (!isMentor && !isStudent) {  // Ensure the client has a role (is either a mentor or a student)
      return; // Ignore actions from unauthorized users
    }

    // Only students can update the code
    if (isMentor) return; // Mentors should not edit code

    const cleanedCode = data.code.replace(/\s+/g, ' ').trim(); //remove all the enters and extra spaces to make one consistent line of code for cooperation
    const isSolved = cleanedCode === room.solution; //check if the code in the room is the same as the solution
    if (isSolved !== room.isSolved) { // Emit only if the state changes
      room.isSolved = isSolved; //change solved status in the room
      this.server.to(data.roomId).emit('new-code-status', isSolved); //notify the client via socket about when the solvation status of the block is changed
    }

    room.code = data.code; // set the new code in the room
    this.server.to(data.roomId).emit('code-update', {code: room.code, isSolved: room.isSolved}); // send to all the users in the room the new code and status
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(client: Socket, roomId: string) {
    const room = this.rooms.get(roomId); // try to get the room by his id

    if (!room) return; //check if room exist 

    if (room.mentor === client) {
      // if mentor leaves remove all students, delete room
      room.students.forEach((student) => {
        student.emit('redirect-lobby', 'mentor-left');
        student.leave(roomId);
      });

      this.rooms.delete(roomId); //delete room
    } else if (room.students.has(client)) {
      // if student leaves remove from room
      room.students.delete(client);//remove student from room
      this.updateStudentCount(roomId);// update student count in the room

      // If no students AND no mentor, delete room
      if (room.students.size === 0 && !room.mentor) {
        this.rooms.delete(roomId);// delete the room
      }
    }

    client.leave(roomId); //disconnect user from this room
  }

  handleDisconnect(client: Socket) {
    for (const [roomId, room] of this.rooms.entries()) {// loop through all active rooms, accessing each room's ID and data.
      if (room.mentor === client) {
        // if Mentor disconnects remove all students, delete room
        room.students.forEach((student) => {
          student.emit('redirect-lobby', 'mentor-left');
          student.leave(roomId);
        });

        this.rooms.delete(roomId);
      } else if (room.students.has(client)) {
        // if student disconnects remove from room
        room.students.delete(client);
        this.updateStudentCount(roomId);

        // If no students AND no mentor, delete room
        if (room.students.size === 0 && !room.mentor) {
          this.rooms.delete(roomId);
        }
      }
    }
  }

  handleNewCodeBlock(codeBlock: CodeBlockDto) {
    this.server.emit('new-code-block', codeBlock);  //update all the users the new codeblock just created and send the new code block too.
  }

  handleDelete(codeBlockId: string) {
    this.server.emit('code-deletion', codeBlockId);//update all the users in the lobby that about the deletion of codeBlockId

    //if this code block has an open room, delete the room and update all the users in it that the codeBlock and his room where been deleted
    const room = this.rooms.get(codeBlockId); //get room by id
    if (!room) return; //check if room exist 

    room.students.forEach((student) => { //loop through all the students
      student.emit('redirect-lobby', 'deletion'); //update the student in the client
      student.leave(codeBlockId);//remove student from the room
    });

    if(room.mentor) {// check if the room have a mentor
      room.mentor.emit('redirect-lobby', 'deletion'); //update the mentor in the client 
      room.mentor.leave(codeBlockId); //remove mentor from the room
    }
    
    this.rooms.delete(codeBlockId); //remove room from rooms (delete it)
    this.server.to(codeBlockId).emit('code-deletion', codeBlockId);//update all the users the codeblock just deleted and send the new code block id too.
  }
}