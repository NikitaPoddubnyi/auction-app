import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: 'http://localhost:3000' },
  namespace: '/auction',
})
export class AuctionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AuctionGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinLot')
  handleJoinLot(
    @MessageBody() lotId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`lot:${lotId}`);
    this.logger.log(`Client ${client.id} joined lot:${lotId}`);
  }

  @SubscribeMessage('leaveLot')
  handleLeaveLot(
    @MessageBody() lotId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`lot:${lotId}`);
    this.logger.log(`Client ${client.id} left lot:${lotId}`);
  }

  notifyNewBid(
    lotId: string,
    payload: {
      amount: number;
      createdAt: Date;
      bidder: { id: string; firstName: string; lastName: string };
    },
  ) {
    const room = `lot:${lotId}`;
    this.logger.log(`Emitting newBid to room ${room}, ${payload.amount}`);
    this.server.to(room).emit('newBid', payload);
  }

  notifyLotClosed(
    lotId: string,
    payload: {
      finalPrice: number;
      winner: { id: string; firstName: string; lastName: string } | null;
    },
  ) {
    this.server.to(`lot:${lotId}`).emit('lotClosed', payload);
  }
}
