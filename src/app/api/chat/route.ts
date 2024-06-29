import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { auth } from '@/auth';
import { sqliteDb, note } from '@/db/schema-sqlite';
import { eq } from 'drizzle-orm';
import { type Subscription } from "@lemonsqueezy/lemonsqueezy.js";
import {
  db,
  plans,
  subscriptions,
  type NewSubscription,
} from "@/db/schema";
export const runtime = 'edge';

const openai = new OpenAI({
  baseURL: process.env.API_BASE_URL,
  apiKey: process.env.LLM_API_KEY
});

export async function POST(req: Request) {
  const json = await req.json();
  const { messages, id } = json; // id is the noteId
  console.log('Chat request:', json);
  const userId = (await auth())?.user.id;

  if (!userId) {
    return new Response('Unauthorized', {
      status: 401
    });
  }
  const userSubscriptions: NewSubscription[] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId));

  if (!userSubscriptions.length) {
    return new Response('No subscriptions', {
      status: 400
    });
  }else{
      // Check if the user has an active subscription
      const hasValidSubscription = userSubscriptions.some((subscription) => {
        const status =
          subscription.status as Subscription["data"]["attributes"]["status"];
        return new Response('Subscriptions cancelled/expired/unpaid', {
          status: 400
        });
      });
  }

  const msg = [...messages.slice(0, -1), { role: 'user', content: messages[messages.length - 1].content+'\n\n the final output must be a short reply tweet.' }];

  const res = await openai.chat.completions.create({
    model: process.env.LLM_BAK_MODEL ?? 'gpt-3.5-turbo',
    messages,
    temperature: 0.7,
    stream: true
  });

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      console.log(completion);
      const updatedNoteData = {
        title: completion,
        updatedAt: Date.now()
      };
      // Update the existing note in the database
      await sqliteDb
        .update(note)
        .set(updatedNoteData)
        .where(eq(note.id, Number(id)));
      // Optionally, return some response or perform further actions
    }
  });

  return new StreamingTextResponse(stream);
}
