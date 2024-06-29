'use client';

import FavorButtons from '@/components/favor-button';
import EditButtons from '@/components/edit-button';
import { useChat, type Message } from 'ai/react';
import { toast } from 'react-hot-toast';
import { PromptForm } from './prompt-form';
import { useRouter } from 'next/navigation';
import { NewArticle } from '@/db/schema-sqlite';
import { Button } from "@/components/ui/button";
import { CopyIcon } from 'lucide-react';
import Tweet from '@/components/tweet';
import { nanoid } from 'nanoid';

interface NoteContentProps {
  noteContent: NewArticle;
  noteId: number;
}

export const NoteContent: React.FC<NoteContentProps> = ({ noteContent, noteId }) => {
  const router = useRouter();
  const { messages, append, reload, stop, isLoading, input, setInput } = useChat({
    initialMessages: [{
      id: nanoid(),
      role: 'user',
      content: `『@${noteContent.authorId}:\n`+noteContent.content+'』\n\n'+'make a short reply on the tweet above'
    },{
      id: nanoid(),
      role: 'assistant',
      content:  noteContent.title
    }],
    body: {
      id: noteId.toString(),
    },
    onResponse(response) {
      if (response.status !== 200) {
        toast.error(`${response.status} ${response.statusText}`);
      }
      if (response.status === 400) {
        router.push('/pricing');
      }
    },
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(noteContent.title).then(() => {
      toast.success('Copied to clipboard');
    }).catch((error) => {
      toast.error(`Failed to copy: ${error.message}`);
    });
  };

  const handleCopyAndJump = () => {
    navigator.clipboard.writeText(noteContent.title).then(() => {
      window.open(noteContent.link, '_blank');
    }).catch((error) => {
      toast.error(`Failed to copy: ${error.message}`);
    });
  };

  return (
    <article className="md:flex sm:w-full mx-auto max-w-3xl justify-center">
      <div className="md:w-[360px] sm:w-full">
        <Tweet length={999} css={noteContent.css ?? ''} authorId={noteContent.authorId} content={noteContent.content} createdAt={noteContent.createdAt?.toString() ?? ''} />
      </div>
      <div className="sm:w-full md:w-[420px]">
        <div className='p-4  mb-16'>
        {messages.slice(1,messages.length).map((message, index) => (
          <div className='w-full flex'  key={index}>
          <span className={` ${message.role === 'user' ? 'ml-auto bg-gray-300 rounded-md mb-2 ml-auto p-2' : ''}`}>
            {message.role === 'assistant' && '🤖: '} {message.content}
            </span>
          </div>
        ))}
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
            size='icon'
            onClick={handleCopy}
          >
            <CopyIcon />
          </Button>
          <Button
            variant={'outline'}
            color='secondary'
            onClick={handleCopyAndJump}
          >
            Copy & Jump to Reply
          </Button>
        </div>
        </div>
        {noteContent.userId != "987654321" && (
          <div className="fixed bottom-16  md:w-[420px] w-full ml-auto">
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
        </div>
        )}
      </div>


    </article>
  );
};
