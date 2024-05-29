import { type Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';
import FavorButtons from '@/components/favor-button';
import { sqliteDb, note } from '@/db/schema-sqlite';
import { eq, lt, gt, desc,asc } from 'drizzle-orm';
import Link from 'next/link';
import { auth,signIn } from '@/auth';
import { SubmitButton } from "@/components/submit-button";
import { ArrowRightIcon, ArrowLeftIcon } from 'lucide-react';

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

// Function to fetch the next note ID
async function getNextNoteId(noteId: number, authorId: string) {
  const nextNote = await sqliteDb.select({ id: note.id })
    .from(note)
    .where(eq(note.authorId, authorId) && lt(note.id, noteId))
    .orderBy(desc(note.id)) // Order by ID in descending order to get the next note in the list
    .limit(1);

  console.log(`Next note result: ${JSON.stringify(nextNote)}`);

  return nextNote.length > 0 ? nextNote[0].id : null;
}

// Function to fetch the previous note ID
async function getPreviousNoteId(noteId: number, authorId: string) {
  const previousNote = await sqliteDb.select({ id: note.id })
    .from(note)
    .where(eq(note.authorId, authorId) && gt(note.id, noteId))
    .orderBy(asc(note.id)) // Order by ID in ascending order to get the previous note in the list
    .limit(1);
  console.log(`Next note result: ${JSON.stringify(previousNote)}`);

  return previousNote.length > 0 ? previousNote[0].id : null;
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
      url: `${process.env.NEXT_PUBLIC_APP_URL}/notes/${id}`,
    },
  };
}

export default async function NotePage({ params }: Props) {
  const session = await auth();
  if (!session?.user) {
    return (
      <form
        className="flex items-center h-screen text-center w-full"
        action={async () => {
          "use server";
          await signIn("google");
        }}
      >
        <SubmitButton shape="pill" variant="outline" className="mx-auto">
          Sign in with Google
        </SubmitButton>
      </form>
    );
  }

  const { id } = params;
  const noteId = parseInt(id, 10);

  const noteContent = await getNoteContent(noteId);
  if (!noteContent) {
    notFound();
  }
  const authorId = noteContent.authorId;
  const previousNoteId = await getPreviousNoteId(noteId, authorId);
  const nextNoteId = await getNextNoteId(noteId, authorId);

  return (
    <div className="flex justify-between max-w-3xl items-center h-screen mx-auto">
      <div>
        {previousNoteId && (
          <Link href={`/note/${previousNoteId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon />
            </Button>
          </Link>
        )}
      </div>
      <article className="md:flex sm:w-full">
        <div>
          <div
            className={`w-[300px] h-[400px] sm:w-full md:w-[300px] p-4 text-2xl ${noteContent.dark ? "text-white" : ""}`}
            style={{ background: noteContent.css ?? "" }}
          >
            <div dangerouslySetInnerHTML={{ __html: noteContent.title.replace('\n', '<br>') }} />
          </div>
          {noteContent.authorId === "987654321" && (
            <div className="mt-4 flex space-x-2">
              <FavorButtons noteId={noteId} isFavored={true} />
            </div>
          )}
        </div>
        <div className="w-[300px] h-[400px] sm:w-full md:w-[300px] p-4">
          <div dangerouslySetInnerHTML={{ __html: noteContent.content.replace('\n', '<br>') }} />
        </div>
      </article>
      <div>
        {nextNoteId && (
          <Link href={`/note/${nextNoteId}`}>
            <Button variant="ghost" size="icon">
              <ArrowRightIcon />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
