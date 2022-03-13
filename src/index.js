import compression from 'compression';
import { morganConfig } from 'configs/morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDB } from 'db';
import express from 'express';
import { createServer } from 'http';
import path from 'path';
import MasterRoute from 'routes';
import { Server } from 'socket.io';
import { getAccessCode } from 'utilities/accessCodeUtil';
import getConnectionApp from 'utilities/appUtil';

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

io.on('connection', getConnectionApp(io));

export default app;
