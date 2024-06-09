'use client';

import FavorButtons from '@/components/favor-button';
import EditButtons from '@/components/edit-button';
import { useChat, type Message } from 'ai/react';
import { toast } from 'react-hot-toast';
import { PromptForm } from './prompt-form';
import { useRouter } from 'next/navigation';
import { NewArticle } from '@/db/schema-sqlite';

interface NoteContentProps {
  noteContent: NewArticle;
  noteId: number;
}

export const NoteContent: React.FC<NoteContentProps> = ({ noteContent, noteId }) => {
  const router = useRouter();
  const { messages, append, reload, stop, isLoading, input, setInput } = useChat({
    initialMessages: [{
      id: `${new Date().toISOString().split('.')[0]}`,
      role: 'assistant',
      content: noteContent.content
    }],
    body: {
      id: noteId.toString(),
      locale: navigator.language,
    },
    onResponse(response) {
      if (response.status !== 200) {
        toast.error(`${response.status} ${response.statusText}`);
      }
      if (response.status === 400) {
        router.push('/pricing');
      }
    },
    // onFinish(response) {
    //   console.log(response)
    // }
  });

  return (
    <article className="md:flex sm:w-full mx-auto max-w-3xl h-screen justify-center mt-10">
      <div>
        <div
          className={`h-[400px] sm:w-full md:w-[300px] p-4 text-2xl ${noteContent.dark ? "text-white" : ""}`}
          style={{ background: noteContent.css ?? "" }}
        >
          <div dangerouslySetInnerHTML={{ __html: noteContent.title.replace('\n', '<br>') }} />
        </div>
        {noteContent.authorId === "987654321" ? (
          <div className="mt-4 flex space-x-2">
            <FavorButtons noteId={noteId} isFavored={true} />
          </div>
        ) : (
          <div className="mt-4 flex space-x-2">
            <EditButtons noteId={noteId} noteContent={noteContent} />
          </div>
        )}
      </div>
      <div className="sm:w-full md:w-[420px] p-4">
        <div>{messages.slice(-1)[0]?.role === 'user' && messages.slice(-1)[0].content}</div>
        <div className="h-3/4 overflow-y-auto" dangerouslySetInnerHTML={{ __html: messages.length > 0 ? messages.slice(-1)[0].content.replace('\n', '<br>') : noteContent.content.replace('\n', '<br>') }} />
        {noteContent.authorId != "987654321" && (
          <PromptForm
            onSubmit={async (inputValue) => {
              append({
                role: 'user',
                content: inputValue
              });
              setInput('');
              await reload().catch((error) => {
                toast.error(`Reload failed: ${error.message}`);
              });
            }}
            input={input}
            isLoading={isLoading}
            setInput={setInput}
          />
        )}
      </div>
    </article>
  );
};
