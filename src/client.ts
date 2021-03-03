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
  body: number,
  chat: number,
  user: number,
  id?: number,
  sent?: string,
}

// Helper to format API URLs
export const getUrl = (path: string) => `${HTTP_ENDPOINT}${path}`;

// Send a message (Websocket)
export const sendMessage = (message: Message) => socket.emit("message", message)

// Send a message (HTTP)
export const sendMessageHttp = (message: Message) => fetch(getUrl("/send-message"), {
  body: JSON.stringify(message),
  headers: {
    "Content-Type": "application/json",
  },
  method: "POST",
})

// Get messages (async/await)
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
  const messages = await response.json();
  console.log(`Retrieved ${messages.length} messages`);
  return messages;
};
