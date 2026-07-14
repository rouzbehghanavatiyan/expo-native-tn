// export const socketClient = io("http://192.168.133.157:4005", {
import { io } from "socket.io-client";
const socketIp = process.env.EXPO_PUBLIC_SOCKET;

export const socketClient = io(socketIp, {
  autoConnect: false,
  reconnection: true,
  forceNew: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  timeout: 20000,
  transports: ["websocket"],
});
