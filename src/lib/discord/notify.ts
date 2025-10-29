/**
 * Discord notification helper for forum activity
 */

const BOT_WEBHOOK_URL = process.env.BOT_WEBHOOK_URL || 'http://localhost:3001';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const SITE_URL = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

interface NewThreadData {
  title: string;
  boardName: string;
  username?: string;
  anonymous: boolean;
  preview?: string;
  threadId: string;
  imageUrl?: string | null;
}

interface NewReplyData {
  threadTitle: string;
  threadId: string;
  boardName: string;
  username?: string;
  anonymous: boolean;
  preview?: string;
  imageUrl?: string | null;
}

export async function notifyNewThread(data: NewThreadData): Promise<void> {
  if (!WEBHOOK_SECRET) {
    console.log('Webhook secret not configured, skipping Discord notification');
    return;
  }

  try {
    const url = \`\${SITE_URL}/forum/thread/\${data.threadId}\`;
    
    await fetch(\`\${BOT_WEBHOOK_URL}/webhook/forum-activity\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${WEBHOOK_SECRET}\`,
      },
      body: JSON.stringify({
        type: 'new_thread',
        data: {
          ...data,
          url,
        },
      }),
    });
  } catch (error) {
    console.error('Failed to send Discord notification for new thread:', error);
    // Don't throw - we don't want to fail the forum post if Discord notification fails
  }
}

export async function notifyNewReply(data: NewReplyData): Promise<void> {
  if (!WEBHOOK_SECRET) {
    console.log('Webhook secret not configured, skipping Discord notification');
    return;
  }

  try {
    const url = \`\${SITE_URL}/forum/thread/\${data.threadId}\`;
    
    await fetch(\`\${BOT_WEBHOOK_URL}/webhook/forum-activity\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${WEBHOOK_SECRET}\`,
      },
      body: JSON.stringify({
        type: 'new_reply',
        data: {
          ...data,
          url,
        },
      }),
    });
  } catch (error) {
    console.error('Failed to send Discord notification for new reply:', error);
    // Don't throw - we don't want to fail the forum post if Discord notification fails
  }
}
