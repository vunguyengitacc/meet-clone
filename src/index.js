import compression from 'compression';
import { morganConfig } from 'configs/morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDB } from 'db';
import Member from 'db/models/member';
import express from 'express';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import memberService from 'modules/Member/service';
import path from 'path';
import MasterRoute from 'routes';
import { Server } from 'socket.io';

require('dotenv').config();
const app = express();
const httpServer = createServer(app);

connectDB();
app.use(morganConfig);
app.use(compression({ level: 6 }));
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
MasterRoute(app);

const port = process.env.PORT || 8000;
const io = new Server(httpServer, { cors: { origin: process.env.CLIENT_URL } });
httpServer.listen(port);

const onConnection = (socket) => {
  app.io = io;
  app.socket = socket;
  socket.on('auth', async (data) => {
    const decode = await jwt.verify(data.token, process.env.SECRET);
    socket.data.userInfor = decode;
  });
  socket.on('meet:join', (data, callback) => {
    if (socket.data.joinCode === undefined) socket.data.joinCode = [];
    socket.data.joinCode.push(data.joinCode);
    socket.join(`room/${data.roomId}`);
    callback({ msg: 'success' });
  });
  socket.on('meet:exit', (data) => {
    socket.leave(`room/${data.roomId}`);
  });
  socket.on('disconnect', () => {
    let joins = socket.data.joinCode ?? [];
    joins.forEach(async (i) => {
      const { roomId, userId } = await jwt.verify(i, process.env.SECRET);
      let rs = await memberService.deleteByInfor({ roomId, userId, joinSession: i });
      io.sockets.in(`room/${roomId}`).emit('room:member-quit', rs);
    });
  });
};

io.on('connection', onConnection);
