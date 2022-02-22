import memberService from 'modules/Member/service';
import jwt from 'jsonwebtoken';
import app from 'index';
const mediasoup = require('mediasoup');
import { createWebRtcTransport, mediaCodecs } from './mediasoupUtil';

let worker;
let rooms = {}; // { roomName1: { Router, rooms: [ sicketId1, ... ] }, ...}
let peers = {}; // { socketId1: { roomName1, joinCode, socket, transports = [id1, id2,] }, producers = [id1, id2,] }, consumers = [id1, id2,], other }, ...}
let transports = []; // [ { socketId1, roomName1, transport, consumer }, ... ]
let producers = []; // [ { socketId1, roomName1, producer, }, ... ]
let consumers = []; // [ { socketId1, roomName1, consumer, }, ... ]

const createWorker = async () => {
  try {
    worker = await mediasoup.createWorker({
      rtcMinPort: 2000,
      rtcMaxPort: 3000,
    });

    worker.on('died', (error) => {});

    return worker;
  } catch (error) {
    console.log(error);
  }
};

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

    rooms[roomName] = {
      router: router1,
      peers: [...peers, socketId],
    };
    console.log(`Router: ${router1.id}`);
    return router1;
  } catch (error) {}
};

const addTransport = (transport, roomName, consumer, socket) => {
  transports = transports.filter((transportData) => transportData.id !== transport.id);
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
};
const getConnectionApp = (io) => (socket) => {
  app.io = io;
  app.socket = socket;
  socket.on('auth', async (data) => {
    const decode = await jwt.verify(data.token, process.env.SECRET);
    socket.data.userInfor = decode;
  });
  socket.on('meet:join', async (data, callback) => {
    try {
      // console.log(socket.data.userInfor);
      socket.data.joinCode = data.joinCode;
      if (data.roomId == undefined) throw new Error('invalid room');
      socket.join(`room/${data.roomId}`);
      let roomName = data.roomId;
      const router1 = await createRoom(roomName, socket.id);

      peers[socket.id] = {
        socket,
        roomName,
        joinCode: data.joinCode,
        transports: [],
        producers: [],
        consumers: [],
      };

      const rtpCapabilities = router1.rtpCapabilities;

      callback({ rtpCapabilities });
    } catch (error) {
      console.log(error);
      callback({ error });
    }
  });
  socket.on('createWebRtcTransport', async ({ consumer }, callback) => {
    try {
      const roomName = peers[socket.id].roomName;

      const router = rooms[roomName].router;

      createWebRtcTransport(router, socket).then(
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
        (error) => {}
      );
    } catch (error) {
      callback({ error });
    }
  });
  socket.on('transport-connect', ({ dtlsParameters }) => {
    getTransport(socket.id).connect({ dtlsParameters });
  });
  socket.on('transport-produce', async ({ kind, rtpParameters, appData }, callback) => {
    const producer = await getTransport(socket.id).produce({
      kind,
      rtpParameters,
    });
    console.log(`producer ${producer.id} is created`);

    // add producer to the producers array
    const { roomName } = peers[socket.id];

    addProducer(producer, roomName, socket);

    informConsumers(roomName, socket.id, producer.id, socket.data.joinCode);

    producer.on('transportclose', () => {
      console.log(`transport for this producer ${producer.id} closed`);
      producer.close();
    });

    // Send back to the client the Producer's id
    callback({
      id: producer.id,
      producersExist: producers.length > 1 ? true : false,
      type: appData.type,
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
    consumers = [...consumers, { socketId: socket.id, consumer, roomName }];

    peers[socket.id] = {
      ...peers[socket.id],
      consumers: [...peers[socket.id].consumers, consumer.id],
    };
  };
  socket.on('producer-closing', ({ producerId }) => {
    console.log(producerId + ' is closing...');
    const producerData = producers.filter((i) => i.producer.id === producerId)[0];
    producerData?.producer?.close();
  });
  socket.on('consume', async ({ rtpCapabilities, remoteProducerId, serverConsumerTransportId }, callback) => {
    try {
      const { roomName } = peers[socket.id];
      const router = rooms[roomName].router;
      let consumerTransport = transports.filter((i) => i.consumer && i.transport.id == serverConsumerTransportId)[0]
        .transport;

      if (
        router.canConsume({
          producerId: remoteProducerId,
          rtpCapabilities,
        })
      ) {
        const consumer = await consumerTransport.consume({
          producerId: remoteProducerId,
          rtpCapabilities,
          paused: true,
        });

        consumer.on('transportclose', () => {
          console.log('transport close from consumer');
        });

        consumer.on('producerclose', () => {
          console.log(`producer ${remoteProducerId} closed`);

          let temp = producers.find((i) => i.producer.id === remoteProducerId);

          let producerPeer = peers[temp.socketId];
          socket.emit('producer-closed', { remoteProducerId, spec: producerPeer.socket.data.joinCode });

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
      console.log(error);
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

      await consumer.resume();

      callback({ msg: 'success' });
    } catch (error) {
      console.log(error);
    }
  });
  socket.on('getProducers', (callback) => {
    const { roomName } = peers[socket.id];

    let producerList = [];
    producers.forEach((producerData) => {
      if (producerData.socketId !== socket.id && producerData.roomName === roomName) {
        let temp = peers[producerData.socketId].socket.data.joinCode;
        producerList = [...producerList, { producerId: producerData.producer.id, spec: temp }];
      }
    });

    // return the producer list back to the client
    callback(producerList);
  });
  socket.on('meet:exit', (data) => {
    socket.leave(`room/${data.roomId}`);
  });
  socket.on('disconnect', async () => {
    try {
      let joins = socket.data.joinCode;
      const { roomId, userId } = await jwt.verify(joins, process.env.SECRET);
      let rs = await memberService.deleteByInfor({ roomId, userId, joinSession: joins });
      io.sockets.in(`room/${roomId}`).emit('room:member-quit', rs);
    } catch (error) {}
  });
};
export default getConnectionApp;
