import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { auth } from '@/auth';
import { sqliteDb, note } from '@/db/schema-sqlite';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

const openai = new OpenAI({
  baseURL: process.env.OPENAI_API_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY
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

  const res = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages,
    temperature: 0.7,
    stream: true
  });

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      console.log(completion);
      const updatedNoteData = {
        content: completion,
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
