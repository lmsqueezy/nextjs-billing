import { type Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { notFound, redirect } from 'next/navigation';
import { sqliteDb, note } from '@/db/schema-sqlite';
import { eq, lt, gt, sql } from 'drizzle-orm';
import Link from 'next/link';

type Props = {
  params: {
    id: string;
  };
};

// Function to fetch the content of a specific note by ID
async function getNoteContent(noteId: number) {
  const noteContent = await sqliteDb.select()
    .from(note)
    .where(eq(note.id, noteId))
    .limit(1);

  return noteContent.length > 0 ? noteContent[0] : null;
}

// Function to fetch the previous note ID
async function getPreviousNoteId(noteId: number) {
  const previousNote = await sqliteDb.select({ id: note.id })
    .from(note)
    .where(lt(note.id, noteId))
    .orderBy(sql`id DESC`)
    .limit(1);

  return previousNote.length > 0 ? previousNote[0].id : null;
}

// Function to fetch the next note ID
async function getNextNoteId(noteId: number) {
  const nextNote = await sqliteDb.select({ id: note.id })
    .from(note)
    .where(gt(note.id, noteId))
    .orderBy(note.id)
    .limit(1);

  return nextNote.length > 0 ? nextNote[0].id : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params;
  const noteId = parseInt(id, 10);
  const noteContent = await getNoteContent(noteId);

  if (!noteContent) {
    return {
      title: 'Not Found',
    };
  }

  const { title, content } = noteContent;
  return {
    title: title,
    description: content.substring(0, 150), // Generate a short description from content
    openGraph: {
      title,
      description: content.substring(0, 150),
      url: `${process.env.NEXT_PUBLIC_URL}/notes/${id}`,
      images: [`${process.env.NEXT_PUBLIC_URL}/api/og?title=${title}&description=${content.substring(0, 150)}`],
    },
  };
}

export default async function NotePage({ params }: Props) {
  const { id } = params;
  const noteId = parseInt(id, 10);
  const noteContent = await getNoteContent(noteId);

  if (!noteContent) {
    notFound();
  }

  const previousNoteId = await getPreviousNoteId(noteId);
  const nextNoteId = await getNextNoteId(noteId);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100vh' }}>
      <div>
        {previousNoteId && (
          <Link href={`/note/${previousNoteId}`}>
            <Button>⬅</Button>
          </Link>
        )}
      </div>
      <article style={{ flex: 1, padding: '0 2rem' }}>
        <h1>{noteContent.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: noteContent.content }} />
      </article>
      <div>
        {nextNoteId && (
          <Link href={`/note/${nextNoteId}`}>
            <Button>⮕</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
