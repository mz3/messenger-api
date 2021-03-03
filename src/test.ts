// Import API so tests re-run when code changes
import "./api";

// Use built-in node assert
import assert from "assert";

// Socket client
import { socket, getMessages, Message } from "./client";

// Start tests when socket connects
socket.on("connect", () => {
  // Test values
  const body = "Hello from client!";
  const chat = 1;
  const user = 1;

  // Join the chat
  socket.emit("subscribe", chat);

  // Create a socket handler to test received messages
  socket.on("message", async (message: Message) => {
    console.log("Running tests");
    socket.open();

    try {
      // Expect `chat` in the response to be the same in the test message
      assert.strictEqual(message.chat, chat);

      // Expect `user` chat be our user id
      assert.strictEqual(message.user, user);

      // Expect `body` to be the content of our test message
      assert.strictEqual(message.body, body);

      // Get messages
      const messages = await getMessages({ chat, sort: -1 });

      // Assert the API returned 100 or fewer messages. This test isn't currently effective
      // unless there have been more than 100 test messages sent through the API. Given more
      // time, 101 messages should be inserted into the table before tests run, either in the
      // test setup or a seed script
      assert.ok(messages.length <= 100);

      // Assert the most recent message contains the test variables
      assert.strictEqual(messages[0].body, body);
      assert.strictEqual(messages[0].chat, chat);
      assert.strictEqual(messages[0].user, user);

      // Assert it has a timestamp
      assert.ok(messages[0].sent);

      // Success
      console.log("All tests passing");
      socket.close();
    } catch (err) {
      // Failure
      console.error(err);
    }
  });

  // Send message
  socket.emit("message", { body, chat, user });

  // Keep test process running under watch mode
  // https://www.npmjs.com/package/ts-node-dev
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Left_shift
  if (process.env.TS_NODE_DEV) setInterval(() => {}, 1 << 30);
});
