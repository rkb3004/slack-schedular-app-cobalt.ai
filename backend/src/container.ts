import path from 'path';
import { Database } from './db/database';
import { TokenRepository } from './repositories/token.repository';
import { MessageRepository } from './repositories/message.repository';
import { SlackAuthService } from './services/slackAuth.service';
import { MessageService } from './services/message.service';
import { SlackController } from './controllers/slack.controller';
import { MessageController } from './controllers/message.controller';

// Create a container class to manage dependencies
class Container {
  private instances: Map<any, any> = new Map();

  register<T>(type: any, instance: T): void {
    this.instances.set(type, instance);
  }

  resolve<T>(type: any): T {
    if (!this.instances.has(type)) {
      throw new Error(`No instance registered for ${type.name || 'Unknown'}`);
    }
    return this.instances.get(type);
  }
}

// Create container instance
export const container = new Container();

// Database - creates a new Database instance which triggers initialization
const database = new Database();
container.register(Database, database);

// Repositories
const tokenRepository = new TokenRepository(database);
container.register(TokenRepository, tokenRepository);

const messageRepository = new MessageRepository(database);
container.register(MessageRepository, messageRepository);

// Services
const slackAuthService = new SlackAuthService(tokenRepository);
container.register(SlackAuthService, slackAuthService);

const messageService = new MessageService(messageRepository, slackAuthService);
container.register(MessageService, messageService);

// Controllers
const slackController = new SlackController(slackAuthService);
container.register(SlackController, slackController);

const messageController = new MessageController(messageService);
container.register(MessageController, messageController);

// Export a helper to type-cast the container resolution
export function resolveInstance<T>(type: new (...args: any[]) => T): T {
  return container.resolve(type) as T;
}
