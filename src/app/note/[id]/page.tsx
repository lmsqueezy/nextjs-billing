// app/notes/[id]/page.tsx
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { notesApi } from '@/lib/notion';
import { NotionBlockRenderer } from '@/components/notionrenderer';

type Props = {
  params: {
    id: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params;
  const allNotes = await notesApi.getNotes();
  const note = allNotes.find((onenote) => onenote.id === id);

  if (!note) {
    return {
      title: 'Not Found',
    };
  }

  const { title, description } = note;
  return {
    title: title,
    description: description,
    openGraph: {
      title,
      description,
      url: `${process.env.NEXT_PUBLIC_URL}/notes/${id}`,
      images: [`${process.env.NEXT_PUBLIC_URL}/api/og?title=${title}&description=${description}`],
    },
  };
}

export default async function NotePage({ params }: Props) {
  const { id } = params;
  const allNotes = await notesApi.getNotes();
  const note = allNotes.find((note) => note.id === id);

  if (!note) {
    notFound();
  }

  const noteContent: BlockObjectResponse[] = await notesApi.getNote(note.id);

  return (
    <>
      {noteContent.map((block:BlockObjectResponse) => (
        <NotionBlockRenderer key={block.id} block={block} />
      ))}
    </>
  );
}