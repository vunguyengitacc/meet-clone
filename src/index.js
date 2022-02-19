import compression from 'compression';
import { morganConfig } from 'configs/morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDB } from 'db';
const mediasoup = require('mediasoup');
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

let worker;
let rooms = {}; // { roomName1: { Router, rooms: [ sicketId1, ... ] }, ...}
let peers = {}; // { socketId1: { roomName1, joinCode, socket, transports = [id1, id2,] }, producers = [id1, id2,] }, consumers = [id1, id2,], peerDetails }, ...}
let transports = []; // [ { socketId1, roomName1, transport, consumer }, ... ]
let producers = []; // [ { socketId1, roomName1, producer, }, ... ]
let consumers = []; // [ { socketId1, roomName1, consumer, }, ... ]

const createWorker = async () => {
  try {
    worker = await mediasoup.createWorker({
      rtcMinPort: 9000,
      rtcMaxPort: 9020,
    });
    console.log(`worker pid ${worker.pid}`);

    worker.on('died', (error) => {});

    return worker;
  } catch (error) {
    console.log(error);
  }
};
const mediaCodecs = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate: 90000,
    parameters: {
      'x-google-start-bitrate': 1000,
    },
  },
];
worker = createWorker();

const createRoom = async (roomName, socketId) => {
  try {
    let router1;
    let peers = [];
    if (rooms[roomName]) {
      router1 = rooms[roomName].router;
      peers = rooms[roomName].peers || [];
    } else {
      router1 = await worker.createRouter({ mediaCodecs });
    }

    console.log(`Router ID: ${router1.id}`, peers.length);

    rooms[roomName] = {
      router: router1,
      peers: [...peers, socketId],
    };

    return router1;
  } catch (error) {}
};
const createWebRtcTransport = async (router) => {
  return new Promise(async (resolve, reject) => {
    try {
      const webRtcTransport_options = {
        listenIps: [
          {
            ip: '127.0.0.1',
            announcedIp: '10.0.0.115',
          },
        ],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
      };

      let transport = await router.createWebRtcTransport(webRtcTransport_options);
      console.log(`transport id: ${transport.id}`);

      transport.on('dtlsstatechange', (dtlsState) => {
        if (dtlsState === 'closed') {
          transport.close();
        }
      });

      transport.on('close', () => {
        console.log('transport closed');
      });

      resolve(transport);
    } catch (error) {
      reject(error);
    }
  });
};
const addTransport = (transport, roomName, consumer, socket) => {
  transports = [...transports, { socketId: socket.id, transport, roomName, consumer }];

  peers[socket.id] = {
    ...peers[socket.id],
    transports: [...peers[socket.id].transports, transport.id],
  };
};
const getTransport = (socketId) => {
  const [producerTransport] = transports.filter((transport) => transport.socketId === socketId && !transport.consumer);
  return producerTransport.transport;
};

const addProducer = (producer, roomName, socket) => {
  producers = [...producers, { socketId: socket.id, producer, roomName }];

  peers[socket.id] = {
    ...peers[socket.id],
    producers: [...peers[socket.id].producers, producer.id],
  };
};

const informConsumers = (roomName, socketId, id, joinCode) => {
  let temp = Object.values(peers);
  temp
    .filter((i) => i.roomName === roomName && i.socket.id !== socketId)
    .forEach((i) => {
      const { socket } = i;

      socket.emit('new-producer', { producerId: id, spec: joinCode });
    });
  // producers.forEach((producerData) => {
  //   if (producerData.socketId !== socketId && producerData.roomName === roomName) {
  //     const producerSocket = peers[producerData.socketId].socket;

  //     const { socket } = peers[socket.id];
  //     producerSocket.emit('new-producer', { producerId: id, member: socket.data });
  //   }
  // });
};

const onConnection = (socket) => {
  app.io = io;
  app.socket = socket;
  socket.on('auth', async (data) => {
    const decode = await jwt.verify(data.token, process.env.SECRET);
    socket.data.userInfor = decode;
  });
  socket.on('meet:join', async (data, callback) => {
    try {
      if (socket.data.joinCode === undefined) socket.data.joinCode = [];
      socket.data.joinCode = data.joinCode;
      if (data.roomId == undefined) throw new Error('invalid room');
      socket.join(`room/${data.roomId}`);
      let roomName = data.roomId;
      const router1 = await createRoom(roomName, socket.id);

      peers[socket.id] = {
        socket,
        roomName, // Name for the Router this Peer joined
        joinCode: data.joinCode,
        transports: [],
        producers: [],
        consumers: [],
        peerDetails: {
          name: '',
          isAdmin: false, // Is this Peer the Admin?
        },
      };

      const rtpCapabilities = router1.rtpCapabilities;

      callback({ rtpCapabilities });
    } catch (error) {
      callback({ error });
    }
  });
  socket.on('createWebRtcTransport', async ({ consumer }, callback) => {
    try {
      const roomName = peers[socket.id].roomName;

      const router = rooms[roomName].router;

      createWebRtcTransport(router).then(
        (transport) => {
          callback({
            transportParams: {
              id: transport.id,
              iceParameters: transport.iceParameters,
              iceCandidates: transport.iceCandidates,
              dtlsParameters: transport.dtlsParameters,
            },
          });

          addTransport(transport, roomName, consumer, socket);
        },
        (error) => {
          console.log(error);
        }
      );
    } catch (error) {
      callback({ error });
    }
  });
  socket.on('transport-connect', ({ dtlsParameters }) => {
    console.log('DTLS PARAMS... ', { dtlsParameters });

    getTransport(socket.id).connect({ dtlsParameters });
  });
  socket.on('transport-produce', async ({ kind, rtpParameters, appData }, callback) => {
    const producer = await getTransport(socket.id).produce({
      kind,
      rtpParameters,
    });

    // add producer to the producers array
    const { roomName } = peers[socket.id];

    addProducer(producer, roomName, socket);

    informConsumers(roomName, socket.id, producer.id, socket.data.joinCode);

    producer.on('transportclose', () => {
      console.log('transport for this producer closed ');
      producer.close();
    });

    // Send back to the client the Producer's id
    callback({
      id: producer.id,
      producersExist: producers.length > 1 ? true : false,
    });
  });
  socket.on('transport-recv-connect', async ({ dtlsParameters, serverConsumerTransportId }) => {
    try {
      const consumerTransport = transports.find(
        (transportData) => transportData.consumer && transportData.transport.id == serverConsumerTransportId
      ).transport;
      await consumerTransport.connect({ dtlsParameters });
    } catch (error) {
      console.log(error);
    }
  });
  const addConsumer = (consumer, roomName) => {
    // add the consumer to the consumers list
    consumers = [...consumers, { socketId: socket.id, consumer, roomName }];

    // add the consumer id to the peers list
    peers[socket.id] = {
      ...peers[socket.id],
      consumers: [...peers[socket.id].consumers, consumer.id],
    };
  };
  socket.on('consume', async ({ rtpCapabilities, remoteProducerId, serverConsumerTransportId }, callback) => {
    try {
      const { roomName } = peers[socket.id];
      const router = rooms[roomName].router;
      let consumerTransport = transports.filter(
        (i) => i.consumer && i.transport.internal.transportId == serverConsumerTransportId
      )[0].transport;

      if (
        router.canConsume({
          producerId: remoteProducerId,
          rtpCapabilities,
        })
      ) {
        // transport can now consume and return a consumer
        const consumer = await consumerTransport.consume({
          producerId: remoteProducerId,
          rtpCapabilities,
          paused: true,
        });

        consumer.on('transportclose', () => {
          console.log('transport close from consumer');
        });

        consumer.on('producerclose', () => {
          console.log('producer of consumer closed');
          socket.emit('producer-closed', { remoteProducerId, spec: socket.data.joinCode });

          consumerTransport.close([]);
          transports = transports.filter((transportData) => transportData.transport.id !== consumerTransport.id);
          consumer.close();
          consumers = consumers.filter((consumerData) => consumerData.consumer.id !== consumer.id);
        });

        addConsumer(consumer, roomName);

        const params = {
          id: consumer.id,
          producerId: remoteProducerId,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
          serverConsumerId: consumer.id,
        };

        callback({ params });
      }
    } catch (error) {
      console.log(error.message);
      callback({
        params: {
          error: error,
        },
      });
    }
  });
  socket.on('consumer-resume', async ({ serverConsumerId }, callback) => {
    try {
      const { consumer } = consumers.find((consumerData) => consumerData.consumer.id === serverConsumerId);
      console.log(consumer.paused);
      await consumer.resume();
      console.log(consumers.find((consumerData) => consumerData.consumer.id === serverConsumerId).consumer.paused);
      callback({ msg: 'success' });
    } catch (error) {
      console.log(error);
    }
  });
  socket.on('meet:exit', (data) => {
    socket.leave(`room/${data.roomId}`);
  });
  socket.on('disconnect', async () => {
    let joins = socket.data.joinCode;
    const { roomId, userId } = await jwt.verify(joins, process.env.SECRET);
    let rs = await memberService.deleteByInfor({ roomId, userId, joinSession: joins });
    io.sockets.in(`room/${roomId}`).emit('room:member-quit', rs);
  });
};

io.on('connection', onConnection);
