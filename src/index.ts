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
  // Create express app
  const app = express();

  // Create HTTP server
  const server = createServer(app);

  // Create Socket.io server
  const io = new Server(server);

  // Create a status/health endpoint
  app.get("/status", (req, res) => {
    const status = { code: 200, status: "healthy" };
    // We could check statuses of other APIs and services here and customize the status result
    res.status(status.code).json(status);
  });

  // Define WebSocket API
  io.on("connection", (socket: Socket) => {
    console.log(`Socket ${socket.id} connected`);

    // Save user
    try {
      api.createUser({ socket });
      console.log(api.countUsers(), "users connected");
    } catch (err) {
      console.log(`Could not create user`, err);
    }

    // Handle incoming "message" events
    socket.on("message", async (message: any) => {
      try {
        await api.sendMessage(connection, message);
      } catch (err) {
        console.error(`Could not send message`, err);
      }
    });

    // Add user to a chat on "subscribe" event
    socket.on("subscribe", (chatId: number) => {
      try {
        const user = api.findUser(socket);

        if (!user) {
          console.warn(`User does not exist for socket ${socket.id}`);
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

  // Simple, functional HTTP handler
  app.post("/send-message", async (req, res, next) =>
    api.sendMessage(connection, req.body).then(res.json.bind(res)).catch(next)
  );

  // Try/catch style with Async/Await
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

  // Start the API
  server.listen(PORT, () => console.log(`API listening on port ${PORT}`));
});
