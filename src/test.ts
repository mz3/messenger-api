// Import API so tests re-run when code changes
import "./api";

// Use built-in node assert
import assert from "assert";

// Socket client
import { socket, getMessages, Message } from "./client";

// Start tests when socket connects
socket.on("connect", () => {
  console.log("Starting test");

  // Test variables
  const body = "Hello from client!";
  const chat = 1;
  const user = 1;

  // Join the message chat
  socket.emit("subscribe", chat);

  // Create a socket handler to test received messages
  socket.on("message", async (message: Message) => {
    console.log("Running assertions");
    socket.open();

    try {
      // Expect `chat` in the response to be the same in the test message
      assert.strictEqual(message.chat, chat);

      // Expect `user` chat be our user id
      assert.strictEqual(message.user, user);

      // Expect `body` to be the content of our test message
      assert.strictEqual(message.body, body);

      // Check that the message was sent
      assert.ok(message.sent);

      // Retrieve messages from API
      const messages = await getMessages({ chat, sort: -1 });

      // Verify that the properties of the most recent message match the test variables
      assert.strictEqual(messages[0].body, body);
      assert.strictEqual(messages[0].chat, chat);
      assert.strictEqual(messages[0].user, user);

      // Verify the message was sent
      assert.ok(typeof messages[0].sent === "string");
      assert.ok(messages[0].sent.length > 0);

      // Success
      console.log("Tests are passing");
      socket.close();
    } catch (err) {
      // Failure
      console.error(err);
    }
  });

  // Send message
  socket.emit("message", { body, chat, user });

  // Keep test process running
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Left_shift
  setInterval(() => {}, 1 << 30);
});
