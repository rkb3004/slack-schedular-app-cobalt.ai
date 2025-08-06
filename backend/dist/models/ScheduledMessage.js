"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduledMessageEntity = exports.MessageStatus = void 0;
exports.toScheduledMessage = toScheduledMessage;
exports.toScheduledMessageEntity = toScheduledMessageEntity;
const typeorm_1 = require("typeorm");
var MessageStatus;
(function (MessageStatus) {
    MessageStatus["SCHEDULED"] = "scheduled";
    MessageStatus["SENT"] = "sent";
    MessageStatus["FAILED"] = "failed";
    MessageStatus["CANCELED"] = "canceled";
})(MessageStatus || (exports.MessageStatus = MessageStatus = {}));
// TypeORM entity for potential future use with TypeORM
let ScheduledMessageEntity = (() => {
    let _classDecorators = [(0, typeorm_1.Entity)('scheduled_messages')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _userId_decorators;
    let _userId_initializers = [];
    let _userId_extraInitializers = [];
    let _teamId_decorators;
    let _teamId_initializers = [];
    let _teamId_extraInitializers = [];
    let _channelId_decorators;
    let _channelId_initializers = [];
    let _channelId_extraInitializers = [];
    let _channelName_decorators;
    let _channelName_initializers = [];
    let _channelName_extraInitializers = [];
    let _message_decorators;
    let _message_initializers = [];
    let _message_extraInitializers = [];
    let _scheduledTime_decorators;
    let _scheduledTime_initializers = [];
    let _scheduledTime_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let _errorMessage_decorators;
    let _errorMessage_initializers = [];
    let _errorMessage_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _updatedAt_extraInitializers = [];
    var ScheduledMessageEntity = _classThis = class {
        constructor() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.userId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _userId_initializers, void 0));
            this.teamId = (__runInitializers(this, _userId_extraInitializers), __runInitializers(this, _teamId_initializers, void 0));
            this.channelId = (__runInitializers(this, _teamId_extraInitializers), __runInitializers(this, _channelId_initializers, void 0));
            this.channelName = (__runInitializers(this, _channelId_extraInitializers), __runInitializers(this, _channelName_initializers, void 0));
            this.message = (__runInitializers(this, _channelName_extraInitializers), __runInitializers(this, _message_initializers, void 0));
            this.scheduledTime = (__runInitializers(this, _message_extraInitializers), __runInitializers(this, _scheduledTime_initializers, void 0));
            this.status = (__runInitializers(this, _scheduledTime_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            this.errorMessage = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _errorMessage_initializers, void 0));
            this.createdAt = (__runInitializers(this, _errorMessage_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            __runInitializers(this, _updatedAt_extraInitializers);
        }
    };
    __setFunctionName(_classThis, "ScheduledMessageEntity");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _userId_decorators = [(0, typeorm_1.Column)()];
        _teamId_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _channelId_decorators = [(0, typeorm_1.Column)()];
        _channelName_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _message_decorators = [(0, typeorm_1.Column)('text')];
        _scheduledTime_decorators = [(0, typeorm_1.Column)()];
        _status_decorators = [(0, typeorm_1.Column)({
                type: 'simple-enum',
                enum: MessageStatus,
                default: MessageStatus.SCHEDULED
            })];
        _errorMessage_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)()];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)()];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _userId_decorators, { kind: "field", name: "userId", static: false, private: false, access: { has: obj => "userId" in obj, get: obj => obj.userId, set: (obj, value) => { obj.userId = value; } }, metadata: _metadata }, _userId_initializers, _userId_extraInitializers);
        __esDecorate(null, null, _teamId_decorators, { kind: "field", name: "teamId", static: false, private: false, access: { has: obj => "teamId" in obj, get: obj => obj.teamId, set: (obj, value) => { obj.teamId = value; } }, metadata: _metadata }, _teamId_initializers, _teamId_extraInitializers);
        __esDecorate(null, null, _channelId_decorators, { kind: "field", name: "channelId", static: false, private: false, access: { has: obj => "channelId" in obj, get: obj => obj.channelId, set: (obj, value) => { obj.channelId = value; } }, metadata: _metadata }, _channelId_initializers, _channelId_extraInitializers);
        __esDecorate(null, null, _channelName_decorators, { kind: "field", name: "channelName", static: false, private: false, access: { has: obj => "channelName" in obj, get: obj => obj.channelName, set: (obj, value) => { obj.channelName = value; } }, metadata: _metadata }, _channelName_initializers, _channelName_extraInitializers);
        __esDecorate(null, null, _message_decorators, { kind: "field", name: "message", static: false, private: false, access: { has: obj => "message" in obj, get: obj => obj.message, set: (obj, value) => { obj.message = value; } }, metadata: _metadata }, _message_initializers, _message_extraInitializers);
        __esDecorate(null, null, _scheduledTime_decorators, { kind: "field", name: "scheduledTime", static: false, private: false, access: { has: obj => "scheduledTime" in obj, get: obj => obj.scheduledTime, set: (obj, value) => { obj.scheduledTime = value; } }, metadata: _metadata }, _scheduledTime_initializers, _scheduledTime_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _errorMessage_decorators, { kind: "field", name: "errorMessage", static: false, private: false, access: { has: obj => "errorMessage" in obj, get: obj => obj.errorMessage, set: (obj, value) => { obj.errorMessage = value; } }, metadata: _metadata }, _errorMessage_initializers, _errorMessage_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ScheduledMessageEntity = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ScheduledMessageEntity = _classThis;
})();
exports.ScheduledMessageEntity = ScheduledMessageEntity;
// Mapping function to convert between Entity and Interface
function toScheduledMessage(entity) {
    return {
        id: entity.id,
        userId: entity.userId,
        channel: entity.channelId,
        text: entity.message,
        scheduledTime: entity.scheduledTime,
        status: entity.status,
        errorMessage: entity.errorMessage
    };
}
// Mapping function to convert from Interface to Entity
function toScheduledMessageEntity(message) {
    const entity = new ScheduledMessageEntity();
    entity.id = message.id;
    entity.userId = message.userId;
    entity.channelId = message.channel;
    entity.message = message.text;
    entity.scheduledTime = message.scheduledTime;
    entity.status = message.status || MessageStatus.SCHEDULED;
    entity.errorMessage = message.errorMessage;
    return entity;
}
