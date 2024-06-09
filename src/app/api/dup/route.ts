import { NextResponse } from 'next/server';
import { sqliteDb, note,NewArticle } from '@/db/schema-sqlite';
import { eq } from "drizzle-orm";
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
    .where(eq(note.id, Number(noteId)))
    .limit(1);

  if (existingNote.length === 0) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  }

  const newNoteData = {
    ...existingNote[0],
    authorId: userId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  delete (newNoteData as NewArticle).id; // Ensure TypeScript knows that id can be deleted

  const [newNoteId] = await sqliteDb.insert(note).values(newNoteData).returning({id:note.id});

  return NextResponse.json({ message: 'Note duplicated', newNoteId: newNoteId.id }, { status: 201 });
};
