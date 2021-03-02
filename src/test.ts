// HTTP configuration
const PORT = process.env.PORT || 3000;

// Import API so tests re-run when code changes
import "./api";

// Use built-in node assert
import assert from "assert";

// Socket.io
import { io } from "socket.io-client";

// Connect to WebSocket API
const socket = io(`ws://localhost:${PORT}`);

// Start tests on connection event
socket.on("connect", () => {
  console.log("Starting test");

  // Create a test message
  const message = { body: "Hello from client!", chat: 1, user: 1 };

  // Join the message chat
  socket.emit("subscribe", message.chat);

  // Create a socket handler to test received messages
  socket.on("message", (response) => {
    console.log("Running assertions");

    try {
      // Parse the response
      const { body, chat, sent, user } = response;

      // Expect `chat` in the response to be the same in the test message
      assert.strictEqual(chat, message.chat);

      // Expect `user` chat be our user id
      assert.strictEqual(user, message.user);

      // Expect `body` to be the content of our test message
      assert.strictEqual(body, message.body);

      // Check that the message was sent
      assert.ok(sent);

      // Success
      console.log("Tests are passing");
    } catch (err) {
      // Failure
      console.error("Tests are failing");
      console.error(err);
    }
  });

  // Send message
  socket.emit("message", message);
});
