import { GetStaticPaths, GetStaticProps } from 'next';
import { Note as NoteType, notesApi } from '@/lib/notion';
import { NotionBlockRenderer } from '@/components/notionrenderer';

type Props = {
  note: NoteType;
  noteContent: any[];
};



export default function Note({
  note: { title, description, createdAt, id },
  noteContent,
  previousPathname,
}: Props & { previousPathname: string }) {
  const url = `${process.env.NEXT_PUBLIC_URL}/notes/${id}`;
  const openGraphImageUrl = `${process.env.NEXT_PUBLIC_URL}/api/og?title=${title}&description=${description}`;
  console.log(noteContent)
  return (
    <>
    {noteContent.map((block) => (
            <NotionBlockRenderer key={block.id} block={block} />
          ))}
    </>
  );
}

export const getStaticProps: GetStaticProps<Props, { id: string }> = async (context) => {
  const id = context.params?.id;
  const allNotes = await notesApi.getNotes();
  const note = allNotes.find((note) => note.id === id);

  if (!note) {
    return {
      notFound: true,
    };
  }

  const noteContent = await notesApi.getNote(note.id);

  return {
    props: {
      note,
      noteContent,
    },
    revalidate: 10,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await notesApi.getNotes();

  return {
    paths: posts.map((post) => ({ params: { id: post.id } })),
    fallback: 'blocking',
  };
};
