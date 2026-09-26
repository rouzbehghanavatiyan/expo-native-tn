import { io } from "socket.io-client";
import { logger } from "./logger";
const socketIp = process.env.EXPO_PUBLIC_SOCKET;
logger.info("socketIp socketIp socketIp", socketIp);
export const socketClient = io(socketIp, {
  autoConnect: false,
  reconnection: true,
  forceNew: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  timeout: 20000,
  transports: ["polling"],
});
