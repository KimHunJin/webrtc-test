const express = require('express')
const socket = require('socket.io')
const cors = require('cors')
const http = require('http');

const app = express()
const port = 3001

app.use(cors())

const server = http.createServer(app)

const io = socket(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

io.on('connection', (socket) => {
  console.log('socket user connection', socket.id)

  socket.on("join", (roomName) => {
    const rooms = io.sockets.adapter.rooms;
    const room = rooms.get(roomName);

    if (!room) {
      socket.join(roomName);
      socket.emit("created");
    } else if (room.size === 1) {
      socket.join(roomName);
      socket.emit("joined");
    } else {
      socket.emit("full");
    }
    console.log(rooms);
  })

  socket.on("ready", (roomName) => {
    socket.broadcast.to(roomName).emit('ready'); //Informs the other peer in the room.
  });

  socket.on("candidate", (candidate, roomName) => {
    socket.broadcast.to(roomName).emit("candidate", candidate); //Sends Candidate to the other peer in the room.
  });

  socket.on("offer", (offer, roomName) => {
    socket.broadcast.to(roomName).emit("offer", offer); //Sends Offer to the other peer in the room.
  });

  socket.on("answer", (answer, roomName) => {
    socket.broadcast.to(roomName).emit("answer", answer); //Sends Answer to the other peer in the room.
  });
})

server.listen(port, () => console.log(`Listening on port ${port}`));