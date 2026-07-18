import { io } from "socket.io-client";

const socketIp = process.env.EXPO_PUBLIC_SOCKET || "http://172.16.30.22:4005";

console.log("socket", socketIp);
console.log("EXPO_PUBLIC_SOCKET =", process.env.EXPO_PUBLIC_SOCKET);

export const socketClient = io(socketIp, {
  autoConnect: false,
  reconnection: true,
  forceNew: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  timeout: 20000,
  // transports: ["websocket"],
});
