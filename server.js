import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

//GET
app.get('/api/blueprints/:author/:name', async (req, res) => {
  try {
    const { author, name } = req.params;

    const response = await fetch(
      `http://localhost:8080/api/v1/blueprints/${author}/${name}`
    );

    const data = await response.json();

    console.log(data);

    if (response.ok) {
      return res.json(data);
    } else {
      return res.status(response.status).json({ error: data.error });
    }

  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch blueprint' });
  }
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log(`[connect] socket=${socket.id}`);
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`[join-room] socket=${socket.id} room=${room}`);
  });
  socket.on('draw-event', ({ room, point, author, name }) => {
    console.log(`[draw-event] socket=${socket.id} room=${room} point=`, point);
    socket.to(room).emit('blueprint-update', { author, name, points: [point] });
  });
  socket.on('disconnect', (reason) => {
    console.log(`[disconnect] socket=${socket.id} reason=${reason}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Socket.IO up on :${PORT}`));
