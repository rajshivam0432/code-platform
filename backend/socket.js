// socket.js
const roomCode = {};
const roomNotes = {};
const roomMembers = {}; // { roomId: Set<socketId> }
const roomHost = {}; // { roomId: hostSocketId }
const socketUser = {}; // { socketId: { name } }

const setupSocket = (io) => {
  io.on("connection", (socket) => {
    /* JOIN ---------------------------------------------------------------- */
    socket.on("join-room", ({ roomId, isHost, user }) => {
      if (!roomMembers[roomId]) roomMembers[roomId] = new Set();
      if (roomMembers[roomId].size >= 2) {
        socket.emit("room-full");
        socket.disconnect();
        return;
      }

      socket.join(roomId);
      roomMembers[roomId].add(socket.id);
      socketUser[socket.id] = user?.name
        ? { name: user.name }
        : { name: `Guest-${socket.id.slice(0, 4)}` };

      if (isHost) roomHost[roomId] = socket.id;

      if (roomCode[roomId]) socket.emit("code-update", roomCode[roomId]);
      emitRoomInfo(roomId);
    });

    /* CODE / NOTES -------------------------------------------------------- */
    socket.on("code-change", ({ roomId, code }) => {
      roomCode[roomId] = code;
      socket.to(roomId).emit("code-update", code);
    });
    socket.on("notes-change", ({ roomId, notes }) => {
      roomNotes[roomId] = notes;
      socket.to(roomId).emit("notes-update", notes);
    });

    /* CURSOR -------------------------------------------------------------- */
    socket.on("cursor-move", ({ roomId, position, user }) => {
      socket.to(roomId).emit("cursor-update", {
        socketId: socket.id,
        position,
        user,
      });
    });

    socket.on("cursor-move", ({ roomId, user, position }) => {
      socket.to(roomId).emit("cursor-update", { user, position });
    });

    /* END SESSION --------------------------------------------------------- */
    socket.on("end-session", (roomId) => {
      if (!roomMembers[roomId]?.has(socket.id)) return;
      io.to(roomId).emit("session-ended");
      io.in(roomId).disconnectSockets(true);
      cleanupRoom(roomId);
    });

    /* DISCONNECT ---------------------------------------------------------- */
    socket.on("disconnect", () => {
      const roomId = findRoom(socket.id);
      if (!roomId) return;

      roomMembers[roomId].delete(socket.id);
      delete socketUser[socket.id];

      if (roomHost[roomId] === socket.id) {
        io.to(roomId).emit("host-left");
        delete roomHost[roomId];
      }

      roomMembers[roomId].size === 0
        ? cleanupRoom(roomId)
        : emitRoomInfo(roomId);
    });

    /* helpers ------------------------------------------------------------- */
    const findRoom = (sid) =>
      Object.keys(roomMembers).find((rid) => roomMembers[rid].has(sid));

    const emitRoomInfo = (roomId) => {
      const users = Array.from(roomMembers[roomId] || []).map(
        (sid) => socketUser[sid]?.name || "Unknown"
      );
      io.to(roomId).emit("room-info", { users });
    };

    const cleanupRoom = (roomId) => {
      roomMembers[roomId]?.forEach((sid) => delete socketUser[sid]);
      delete roomMembers[roomId];
      delete roomCode[roomId];
      delete roomNotes[roomId];
      delete roomHost[roomId];
    };
  });
};

export default setupSocket;
