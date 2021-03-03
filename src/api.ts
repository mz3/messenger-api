// This point of abstraction creates modularity for architecture. Databases, service queues,
// logging endpoints can be collected into services, running locally, or on AWS Lambda/RDS/S3/EC2
// and other cloud infrastructure. When Combined with Docker, Terraform/Cloudformation, AWSCLI,
// this allows for adaptable and flexible architecture that enables rapid deployment
// of new features and simple/abstract management of resources.

// Configuration
export const DAYS_LIMIT = 30;
export const MESSAGE_LIMIT = 100;

// Dependencies
import * as _ from "./util";
import { Socket } from "socket.io";
import { Connection } from "typeorm";

// Typescript is used to document the API, speed development and reduce bugs by
// increasing the amount of debugging possible in the editor, standardizing schemas,
// and exporting types
export interface GetMessagesOpts {
  chat?: ChatId;
  user?: ChatId;
  sort?: -1 | 1;
}

// Since we don't have authorization/authentication, Socket will be the primary
// key for User
export interface User {
  socket: Socket;
}

// ChatId will be the primary key for Chat
export type ChatId = number;

// Chat models a conversation or room
export interface Chat {
  id: ChatId;
  users: User[];
}

// ChatMap models the stores of conversations
export interface ChatMap {
  [key: string]: Chat;
}

// Types can also come from ORMs and other type libraries
// TypeORM Entities are classes used to model rows in the database
import { Message } from "./entities/Message";

// Message validation
export const validateMessage = ({ body, user, chat }: any): Message => {
  // Properties can be validated using utility functions
  if (!_.isInteger(user)) throw new Error("`user` must be an integer");
  if (!_.isInteger(chat)) throw new Error("`chat` must be an integer");
  if (!_.isString(body)) throw new Error("`body` must be a string");
  if (_.isEmpty(body)) throw new Error("`body` must not be empty");
  const message = Object.assign(new Message(), { body, user, chat });
  return message;
};

// In-memory stores
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
  { chat, sort = -1, user }: GetMessagesOpts
) => {
  // Prepare database query based on request parameters and app configuration
  // select only messages sent in the last 30 days
  const date = new Date(); // i used const because it only immutes the reference
  date.setDate(date.getDate() - DAYS_LIMIT);

  // TypeORM `take` maps to SQL LIMIT
  const opts = { take: MESSAGE_LIMIT, order: { sent: sort }, where: {} };
  if (user) Object.assign(opts, { where: { user } });
  if (chat) Object.assign(opts, { where: { chat } });

  // retrieve and sort messages, most recent first
  console.log(`Getting messages from database`, opts);
  const messages = await connection.manager.find(Message, opts);
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

    // Save message to database
    console.log(`Saving message to database`, message);
    await connection.manager.save(Message, message);

    // Find or create chat
    const chat = findOrCreateChat(message.chat);

    // Send message to users in chat
    chat.users.forEach((user) => user.socket.emit("message", message));

    // Finished
    return message;
  } catch (err) {
    console.error(err);
  }
};
