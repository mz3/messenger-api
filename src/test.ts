// Import API so tests re-run when code changes
import "./api";

// Use built-in node assert
import assert from "assert";

// Socket client
import { socket, getMessages } from "./client";

// Start tests on connection event
socket.on("connect", () => {
  console.log("Starting test");

  // Create a test message
  const message = { body: "Hello from client!", chat: 1, user: 1 };

  // Join the message chat
  socket.emit("subscribe", message.chat);

  // Create a socket handler to test received messages
  socket.on("message", async (response) => {
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

      // Retrieve messages from API
      const actual = await getMessages({ chat, sort: -1 }).then(
        (messages) => messages[0]
      );
      const expected = message;

      // Verify that the most recent message in the chat is the one we just sent
      assert.strictEqual(actual.body, expected.body);
      assert.strictEqual(actual.chat, expected.chat);
      assert.strictEqual(actual.user, expected.user);

      // Verify the message was sent
      assert.ok(typeof actual.sent === "string");
      assert.ok(actual.sent.length > 0);

      // Success
      console.log("Tests are passing");
    } catch (err) {
      // Failure
      console.error(err);
    }
  });

  // Send message
  socket.emit("message", message);
});

// Close socket connection when process exits
process.on("SIGINT", () => {
  socket.close();
  process.exit();
});
