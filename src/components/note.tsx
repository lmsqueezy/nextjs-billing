'use client';

import FavorButtons from '@/components/favor-button';
import EditButtons from '@/components/edit-button';
import { useChat, type Message } from 'ai/react';
import { toast } from 'react-hot-toast';
import { PromptForm } from './prompt-form';
import { useRouter } from 'next/navigation';
import { NewArticle } from '@/db/schema-sqlite';
import { Button } from "@/components/ui/button";
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

  const handleCopyAndJump = () => {
    navigator.clipboard.writeText(noteContent.content).then(() => {
      window.open(noteContent.link, '_blank');
    }).catch((error) => {
      toast.error(`Failed to copy: ${error.message}`);
    });
  };

  return (
    <article className="md:flex sm:w-full mx-auto max-w-3xl h-screen justify-center md:mt-10">
      <div>
        <div
          className={`h-[400px] sm:w-full md:w-[300px] p-4 text-2xl ${noteContent.dark ? "text-white" : ""}`}
          style={{ background: noteContent.css ?? "" }}
        >
          <div dangerouslySetInnerHTML={{ __html: noteContent.title.replace('\n', '<br>') }} />
        </div>
      </div>
      <div className="sm:w-full md:w-[420px] h-[400px] sm:h-1/2 p-4">
      {messages.slice(-2)[0]?.role === 'user' && <div className='w-full flex'>
          <span className='text-right bg-gray-300 rounded-md mb-2 ml-auto p-2'>
            {messages.slice(-2)[0].content}
          </span>
        </div>
        }
       
        <div className="overflow-y-auto md:h-[400px] sm:h-1/2" dangerouslySetInnerHTML={{ __html: messages.length > 0 ? messages.slice(-1)[0].content.replace('\n', '<br>') : noteContent.content.replace('\n', '<br>') }} />
        <div className='w-full my-1 flex justify-center'>
        {noteContent.userId === "987654321" ? (
            <FavorButtons noteId={noteId} isFavored={true} />
        ) : (
            <EditButtons noteId={noteId} noteContent={noteContent} />
        )}
          <Button
            className="mx-auto"
            variant={'outline'}
            color='secondary'
            onClick={handleCopyAndJump}
          >
            Copy and Jump to Reply
          </Button>
        </div>

        {noteContent.userId != "987654321" && (
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
