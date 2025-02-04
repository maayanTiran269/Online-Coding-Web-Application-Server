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

interface Room {
  code: string;
  mentor: Socket | null;
  students: Set<Socket>;
}

@WebSocketGateway({ cors: true })
export class CodeBlockGateway {
  constructor (private readonly codeBlockService: CodeBlockService) {}

  @WebSocketServer()
  server: Server;

  private rooms: Map<string, Room> = new Map();

  @SubscribeMessage('join-room')
  async handleJoinRoom(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
    let room = this.rooms.get(roomId); // try to get the room by his id

    //create room if doesn't exist already
    if (!room) { 
      room = { 
        code: await this.codeBlockService.getCodeBlockTemplate(new Types.ObjectId(roomId)), 
        mentor: null, 
        students: new Set() }; //new default room
      this.rooms.set(roomId, room); //add room to rooms
    }

    // Prevent the same user from joining twice
    const isAlreadyInRoom = room.mentor === client || room.students.has(client);
    if (isAlreadyInRoom) {
      return; // Ignore duplicate joins
    }

    // Assign roles correctly
    if (!room.mentor) {
      room.mentor = client;
      client.emit('role', 'mentor');
    } else {
      room.students.add(client);
      client.emit('role', 'student');
    }

    client.join(roomId); //connect user to room and update the client about it
    this.updateStudentCount(roomId);

    // Send existing code to new user
    client.emit('code-update', room.code);
  }

  
  private updateStudentCount(roomId: string) {
    const room = this.rooms.get(roomId); //try to get the room by his id 
    
    //if room exist, broadcast to all the room members amount of participants in the room
    if (room) { 
      this.server.to(roomId).emit('student-count', room.students.size);
    }
  }

  @SubscribeMessage('code-update')
  handleCodeUpdate(@MessageBody() data: { roomId: string; code: string }, @ConnectedSocket() client: Socket) {
    const room = this.rooms.get(data.roomId);

    if (!room) return;

    // Ensure the client has a role (is either a mentor or a student)
    const isMentor = room.mentor === client;
    const isStudent = room.students.has(client);

    if (!isMentor && !isStudent) {
      return; // Ignore actions from unauthorized users
    }

    // Only students can update the code
    if (isMentor) return; // Mentors should not edit code

    room.code = data.code;
    this.server.to(data.roomId).emit('code-update', data.code);
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(client: Socket, roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    if (room.mentor === client) {
      // Mentor leaves → Remove all students, delete room
      room.students.forEach((student) => {
        student.emit('redirect-lobby');
        student.leave(roomId);
      });
      this.rooms.delete(roomId);
    } else if (room.students.has(client)) {
      // Student leaves → Remove from room
      room.students.delete(client);
      this.updateStudentCount(roomId);

      // If no students AND no mentor, delete room
      if (room.students.size === 0 && !room.mentor) {
        this.rooms.delete(roomId);
      }
    }

    client.leave(roomId);
  }

  handleDisconnect(client: Socket) {
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.mentor === client) {
        // Mentor disconnects → Remove all students, delete room
        room.students.forEach((student) => {
          student.emit('redirect-lobby');
          student.leave(roomId);
        });
        this.rooms.delete(roomId);
      } else if (room.students.has(client)) {
        // Student disconnects → Remove from room
        room.students.delete(client);
        this.updateStudentCount(roomId);

        // If no students AND no mentor, delete room
        if (room.students.size === 0 && !room.mentor) {
          this.rooms.delete(roomId);
        }
      }
    }
  }

}