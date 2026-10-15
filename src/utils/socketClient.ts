import { io } from "socket.io-client";
import { logger } from "./logger";
const socketIp = process.env.EXPO_PUBLIC_SOCKET;
logger.info("socketIp socketIp socketIp", socketIp);
export const socketClient = io(socketIp, {
  autoConnect: false,
  reconnection: true,
  forceNew: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 2000,
  timeout: 60000,
  transports: ["websocket", "polling"],
});
