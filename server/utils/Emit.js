import { userSocketIds } from "../app.js";
const emitEvent = (req, event, users, data) => {
    const io = req.app.get("io");
    if (!io) {
      console.error("Socket.io instance not found");
      return;
    }
    const usersSocket = getSockets(users);
    io.to(usersSocket).emit(event, data);
  };
export default emitEvent;

export const getSockets = (users = []) => {
    const sockets = users.map((user) => userSocketIds.get(user.toString()));
  
    return sockets;
  };