// HTTP configuration
const PORT = process.env.PORT || 3000;

// Node.js
import { createServer } from "http";

// Helper/Utility functions
import * as _ from "./util";

// Express.js is used to define the API
import express from "express";
import bodyParser from "body-parser";

// Socket.io is a WebSocket framework used to receive chat messages in real-time
import { Server, Socket } from "socket.io";

// TypeORM is an ORM that simplifies querying the database, and
// handles table management
import { createConnection } from "typeorm";

// Import API service functions
import * as api from "./api";

// Application logic
createConnection().then((connection) => {
  // create http and websocket server
  const app = express();
  const server = createServer(app);
  const io = new Server(server);

  // Create a status/health endpoint
  app.get("/status", (req, res) => {
    const status = { code: 200, status: "healthy" }
    // We could check statuses of other APIs and services here and customize the status result
    res.status(status.code).json(status);
  });
  // Socket.io handlers
  io.on("connection", (socket: Socket) => {
    // Create user when a socket connects
    try {
      api.createUser({ socket });
      console.log(api.countUsers(), "users connected");
    } catch (err) {
      console.log(`Could not create user`, err);
    }

    // Handle incoming messages
    socket.on("message", async (message: any) => {
      try {
        await api.sendMessage(connection, message);
      } catch (err) {
        console.error(`Failed handling message`, err);
      }
    });

    // Add user to a chat on "subscribe" event
    socket.on("subscribe", (chatId: number) => {
      try {
        const user = api.findUser(socket);

        if (!user) {
          console.warn(`user does not exist`);
          return;
        }

        // Subscribe socket to chat
        api.addUserToChat(user, chatId);
      } catch (err) {
        console.error(`Could not add user to chat ${chatId}`, err);
      }
    });

    // Cleanup user on disconnect
    socket.on("disconnect", () => {
      try {
        const user = api.findUser(socket);

        if (!user) {
          throw new Error(`User not found for socket ${socket.id}`);
        }

        api.disconnectUser(user);
      } catch (err) {
        console.error(`Could not disconnect user`, err);
      }
    });
  });

  // JSON Express middleware
  app.use(bodyParser.json());

  // Functional approach for sendMessage Express handler
  app.post("/send-message", async (req, res, next) => {
    // Request parameters
    const { body, chat, user } = req.body;

    // Send message using API function
    await api
      .sendMessage(connection, { body, chat, user })
      .then((message) => res.json(message))
      .catch(next);
  });

  // Try/catch approach for getMessages Express handler
  app.post("/get-messages", async (req, res, next) => {
    try {
      // Request parameters
      const { chat, user, sort = -1 } = req.body;

      // Validate `user` is an integer, if the user specifies it
      if (user && !_.isInteger(user))
        return next(new Error("message.user must be an integer"));
      if (chat && !_.isInteger(chat))
        return next(new Error("message.chat must be an integer"));

      const messages = await api.getMessages(connection, { chat, sort, user });
      res.json(messages);
    } catch (err) {
      next(err);
    }
  });

  server.listen(PORT, () => console.log(`API listening on port ${PORT}`));
});
