import * as _ from "./util";
import { Socket } from "socket.io";
import { Connection } from "typeorm";

// Configuration
const DAYS_LIMIT = 30;
const MESSAGE_LIMIT = 100;

// Typescript is used to document the API, speed development and reduce bugs by
// increasing the amount of debugging possible in the editor, standardizing schemas,
// and exporting types
export interface GetMessagesOpts {
  chat?: ChatId;
  user?: ChatId;
  sort?: -1 | 1;
}

export interface User {
  socket: Socket; // Primary key for users
}

export type ChatId = number;

export interface Chat {
  id: ChatId; // Primary key for chats
  users: User[];
}

export interface ChatMap {
  [key: string]: Chat;
}

// Types can also come from ORMs and other type libraries
import { Message } from "./entities/Message";

// Validation
export const validateMessage = ({ body, user, chat }: any): Message => {
  // Properties can be validated using utility functions
  if (!_.isInteger(user)) throw new Error("`user` must be an integer");
  if (!_.isInteger(chat)) throw new Error("`chat` must be an integer");
  if (!_.isString(body)) throw new Error("`body` must be a string");
  if (_.isEmpty(body)) throw new Error("`body` must not be empty");
  const message = Object.assign(new Message(), { body, user, chat });
  return message;
};

// In-memory objects
export const chats: ChatMap = {};
export const users: User[] = [];

// Save a user
export const createUser = ({ socket }: User): User => {
  const index = users.findIndex((user) => user.socket.id === socket.id);
  if (index > -1) return users[index];
  users.push({ socket });
};

// Return number of connected users
export const countUsers = (): number => users.length;

// Find or create a chat
export const findOrCreateChat = (chatId: ChatId): Chat => {
  if (!chats[chatId]) chats[chatId] = { id: chatId, users: [] };
  return chats[chatId];
};

// Get a chat by id
export const findChat = (chatId: ChatId): null | Chat => {
  const index = _.keys(chats).findIndex((key) => key === chatId);
  if (index === -1) return null;
  return chats[index];
};

// Find a user by websocket object
export const findUser = (socket: Socket) => {
  const index = users.findIndex((user) => user.socket.id === socket.id);
  if (index === -1) return null;
  return users[index];
};

// Check if a chat contains a given user
export const chatContainsUser = (chat: Chat, user: User): boolean =>
  !_.isEmpty(chat.users.filter((_user) => _user.socket.id === user.socket.id));

// Add user to a chat
export const addUserToChat = (user: User, chatId: ChatId): void => {
  const chat = findOrCreateChat(chatId);
  if (chatContainsUser(chat, user)) {
    throw new Error(`User already in chat ${chatId}`);
  }
  chat.users.push(user);
  console.log(`Added user to chat ${chat.id}`);
};

// Disconnect a user
export const disconnectUser = ({ socket: { id } }: User): void => {
  const index = users.findIndex((user) => user.socket.id === id);
  users.splice(index, 1);
  console.log(`Socket ${id} disconnected`);
};

export const getMessages = async (
  connection: Connection,
  { chat = null, sort = -1, user = null }: GetMessagesOpts
) => {
  // Prepare database query based on request parameters and app configuration
  // select only messages sent in the last 30 days
  const date = new Date(); // i used const because it only immutes the reference
  date.setDate(date.getDate() - DAYS_LIMIT);

  // TypeORM `take` maps to SQL LIMIT
  const opts = { take: MESSAGE_LIMIT, order: {}, where: {} };
  if (user) Object.assign(opts, { where: { user } });
  if (chat) Object.assign(opts, { where: { chat } });

  // retrieve and sort messages, most recent first
  console.log(`Searching messages`, opts);
  const messages = await connection.manager.find(Message, {
    order: {
      sent: sort,
    },
  });
  console.debug(`Found ${messages.length} messages`, opts);

  return messages;
};

export const sendMessage = async (
  connection: Connection,
  { body, ...opts }: any
): Promise<Message> => {
  try {
    // Create message
    const message = validateMessage({
      body,
      chat: parseInt(opts.chat),
      user: parseInt(opts.user),
    });

    // Print message
    console.log(message);

    // Find or create chat
    const chat = findOrCreateChat(message.chat);

    // Save message to database
    await connection.manager.save(Message, message);

    // Send message to users in chat
    chat.users.forEach((user) => user.socket.emit("message", message));

    // Return message object
    return message;

    // Finished
    return message;
  } catch (err) {
    console.error(err);
  }
};
