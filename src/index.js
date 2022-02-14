import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDB } from 'db';
import express from 'express';
import { createServer } from 'http';
import path from 'path';
import MasterRoute from 'routes';
import { Server } from 'socket.io';

require('dotenv').config();
const app = express();
const httpServer = createServer(app);

connectDB();
app.use(compression({ level: 6 }));
app.use(cookieParser());
app.use(cors({}));
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
};

io.on('connection', onConnection);
