import cron from 'node-cron';
import { MessageService } from './message.service';
import { resolveInstance } from '../container';

let scheduler: cron.ScheduledTask | null = null;

export function startScheduler(): void {
  if (scheduler) {
    console.log('Scheduler already running');
    return;
  }

  // Run the task every minute to check for messages that need to be sent
  scheduler = cron.schedule('* * * * *', async () => {
    console.log('Checking for scheduled messages to send...');
    try {
      const messageService = resolveInstance(MessageService);
      await messageService.processScheduledMessages();
    } catch (error: any) {
      console.error('Error processing scheduled messages:', error);
    }
  });

  console.log('Message scheduler started');
}

export function stopScheduler(): void {
  if (scheduler) {
    scheduler.stop();
    scheduler = null;
    console.log('Message scheduler stopped');
  }
}
