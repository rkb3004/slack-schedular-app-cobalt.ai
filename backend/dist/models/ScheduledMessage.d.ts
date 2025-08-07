export declare enum MessageStatus {
    SCHEDULED = "scheduled",
    SENT = "sent",
    FAILED = "failed",
    CANCELED = "canceled"
}
export declare class ScheduledMessageEntity {
    id: string;
    userId: string;
    teamId?: string;
    channelId: string;
    channelName?: string;
    message: string;
    scheduledTime: Date;
    status: MessageStatus;
    errorMessage?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ScheduledMessage {
    id: string;
    userId: string;
    channel: string;
    text: string;
    scheduledTime: Date;
    status?: MessageStatus;
    errorMessage?: string;
}
export declare function toScheduledMessage(entity: ScheduledMessageEntity): ScheduledMessage;
export declare function toScheduledMessageEntity(message: ScheduledMessage): ScheduledMessageEntity;
