import { NextResponse } from 'next/server';
import { sqliteDb, note } from '@/db/schema-sqlite';
import { eq,and } from "drizzle-orm";
import { auth } from '@/auth';

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { noteId, title, content } = await req.json();
  const userId = session.user.id;

  // Validate input
  if (!noteId || !title || !content) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  // Check if the note exists and belongs to the user
  const existingNote = await sqliteDb
    .select()
    .from(note)
    .where(and(eq(note.id, Number(noteId)), eq(note.authorId, userId)))
    .limit(1);

  if (existingNote.length === 0) {
    return NextResponse.json({ error: 'Note not found or you do not have permission to edit this note' }, { status: 404 });
  }

  // Update the note
  await sqliteDb
    .update(note)
    .set({ title, content, updatedAt: Date.now() })
    .where(eq(note.id, Number(noteId)));

  return NextResponse.json({ message: 'Note updated successfully' }, { status: 200 });
};
