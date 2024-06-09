import { NextResponse } from 'next/server';
import { sqliteDb, note } from '@/db/schema-sqlite';
import { eq, and, lt, desc } from "drizzle-orm";
import { auth } from '@/auth';

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { noteId } = await req.json();
  const userId = session.user.id;

  const existingNote = await sqliteDb
    .select()
    .from(note)
    .where(and(eq(note.id, Number(noteId)), eq(note.authorId, userId)))
    .limit(1);
  const nextNoteId = await getNextNoteId(Number(noteId), userId);

  if (existingNote.length === 0) {
    return NextResponse.json({ error: 'Note not found or you do not have permission to delete this note' }, { status: 404 });
  }

  await sqliteDb
    .delete(note)
    .where(eq(note.id, Number(noteId)));

  return NextResponse.json({ message: 'Note deleted', nextNoteId }, { status: 200 });
};

async function getNextNoteId(noteId: number, authorId: string) {
  const nextNote = await sqliteDb
    .select({ id: note.id })
    .from(note)
    .where(and(eq(note.authorId, authorId), lt(note.id, noteId)))
    .orderBy(desc(note.id)) // Order by ID in descending order to get the next note in the list
    .limit(1);

  console.log(`Next note result: ${JSON.stringify(nextNote)}`);

  return nextNote.length > 0 ? nextNote[0].id : null;
}
