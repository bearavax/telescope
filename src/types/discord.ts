// Discord-related types for the Telescope bot
import { z } from 'zod';

// Webhook payload schemas
export const ForumThreadPayload = z.object({
  type: z.literal('new_thread').or(z.literal('new_reply')),
  data: z.object({
    title: z.string().optional(),
    threadTitle: z.string().optional(),
    url: z.string().url(),
    boardName: z.string(),
    username: z.string().optional(),
    anonymous: z.boolean().optional(),
    preview: z.string().optional(),
    imageUrl: z.string().url().optional(),
  }),
});

export type ForumThreadPayload = z.infer<typeof ForumThreadPayload>;

// Discord event types
export interface DiscordEventBase {
  guildId: string;
  name: string;
  description?: string;
}

export interface GuildScheduledEvent extends DiscordEventBase {
  scheduledStartAt: string;
  guild: {
    name: string;
    id: string;
  };
}

export interface WebhookConfig {
  channelId: string;
  secret: string;
  port: number;
}