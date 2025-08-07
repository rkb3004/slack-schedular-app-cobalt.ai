"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
let ScheduledMessageEntity = class ScheduledMessageEntity {
};
exports.ScheduledMessageEntity = ScheduledMessageEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ScheduledMessageEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ScheduledMessageEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ScheduledMessageEntity.prototype, "teamId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ScheduledMessageEntity.prototype, "channelId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ScheduledMessageEntity.prototype, "channelName", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], ScheduledMessageEntity.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], ScheduledMessageEntity.prototype, "scheduledTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'simple-enum',
        enum: MessageStatus,
        default: MessageStatus.SCHEDULED
    }),
    __metadata("design:type", String)
], ScheduledMessageEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ScheduledMessageEntity.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ScheduledMessageEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ScheduledMessageEntity.prototype, "updatedAt", void 0);
exports.ScheduledMessageEntity = ScheduledMessageEntity = __decorate([
    (0, typeorm_1.Entity)('scheduled_messages')
], ScheduledMessageEntity);
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
//# sourceMappingURL=ScheduledMessage.js.map