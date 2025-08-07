"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
exports.resolveInstance = resolveInstance;
const database_1 = require("./db/database");
const token_repository_1 = require("./repositories/token.repository");
const message_repository_1 = require("./repositories/message.repository");
const slackAuth_service_1 = require("./services/slackAuth.service");
const message_service_1 = require("./services/message.service");
const slack_controller_1 = require("./controllers/slack.controller");
const message_controller_1 = require("./controllers/message.controller");
class Container {
    constructor() {
        this.instances = new Map();
    }
    register(type, instance) {
        this.instances.set(type, instance);
    }
    resolve(type) {
        if (!this.instances.has(type)) {
            throw new Error(`No instance registered for ${type.name || 'Unknown'}`);
        }
        return this.instances.get(type);
    }
}
exports.container = new Container();
const database = new database_1.Database();
exports.container.register(database_1.Database, database);
const tokenRepository = new token_repository_1.TokenRepository(database);
exports.container.register(token_repository_1.TokenRepository, tokenRepository);
const messageRepository = new message_repository_1.MessageRepository(database);
exports.container.register(message_repository_1.MessageRepository, messageRepository);
const slackAuthService = new slackAuth_service_1.SlackAuthService(tokenRepository);
exports.container.register(slackAuth_service_1.SlackAuthService, slackAuthService);
const messageService = new message_service_1.MessageService(messageRepository, slackAuthService);
exports.container.register(message_service_1.MessageService, messageService);
const slackController = new slack_controller_1.SlackController(slackAuthService);
exports.container.register(slack_controller_1.SlackController, slackController);
const messageController = new message_controller_1.MessageController(messageService);
exports.container.register(message_controller_1.MessageController, messageController);
function resolveInstance(type) {
    return exports.container.resolve(type);
}
//# sourceMappingURL=container.js.map