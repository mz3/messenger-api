// Socket.io
import { io } from "socket.io-client";

// Browser fetch
import fetch from "node-fetch";

// Client configuration
export const HTTP_ENDPOINT =
  process.env.HTTP_ENDPOINT || "http://localhost:3000";

// Connect to Socket API
export const socket = io(HTTP_ENDPOINT.replace("http://", "ws://"));

// Types
export interface Message {
  body: number;
  chat: number;
  user: number;
  id?: number;
  sent?: string;
}

// Helper to format API URLs
export const getUrl = (path: string) => `${HTTP_ENDPOINT}${path}`;

// Get service status
export const getStatus = () =>
  fetch(getUrl("/status"), {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
  });

// Send a WebSocket message
export const sendMessageSocket = (message: Message) =>
  socket.emit("message", message);

// Send an HTTP message
export const sendMessageHttp = (message: Message) =>
  fetch(getUrl("/send-message"), {
    body: JSON.stringify(message),
    method: "POST",
  });

// Send a message (default=Socket)
// export const sendMessage = sendMessageHttp;
export const sendMessage = sendMessageSocket;

// Get messages
export const getMessages = async ({
  chat = null,
  sort = -1,
  user = null,
}): Promise<Message[]> => {
  const opts = { chat, sort, user };
  const response = await fetch(getUrl("/get-messages"), {
    body: JSON.stringify(opts),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  return response.json();
};
