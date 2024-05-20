import { GetStaticPaths, GetStaticProps } from 'next';
import { Note as NoteType, notesApi } from '@/lib/notion';

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

  return (
    <>
      <div className="pb-32">
        <hr />
        <a
          className="group block text-xl font-semibold md:text-3xl no-underline"
          href={`http://x.com/share?text=${title}&url=${url}`}
        >
          <h4 className="max-w-lg flex cursor-pointer flex-col duration-200 ease-in-out group-hover:text-primary group-hover:fill-primary fill-white text-wrap">
            Click here to share this article with your friends on X if you liked it.
          </h4>
        </a>
      </div>
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
