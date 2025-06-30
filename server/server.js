const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const DocumentSchema = new mongoose.Schema({
  content: String,
});
const Document = mongoose.model('Document', DocumentSchema);

const defaultContent = "Start editing this document in real-time!";

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('get-document', async () => {
    let doc = await Document.findOne();
    if (!doc) {
      doc = new Document({ content: defaultContent });
      await doc.save();
    }
    socket.emit('load-document', doc.content);

    socket.on('send-changes', (delta) => {
      socket.broadcast.emit('receive-changes', delta);
    });

    socket.on('save-document', async (data) => {
      await Document.findOneAndUpdate({}, { content: data });
    });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
