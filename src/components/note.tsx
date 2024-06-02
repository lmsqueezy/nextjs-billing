'use client';

import React, { useEffect } from 'react';
import FavorButtons from '@/components/favor-button';

import { useChat, type Message } from 'ai/react'
import { toast } from 'react-hot-toast'
import { PromptForm } from './prompt-form';
interface NoteContentProps {
  noteContent: any;
  noteId: number;
}

export const NoteContent: React.FC<NoteContentProps> = ({ noteContent, noteId }) => {
    const { messages, append, reload, stop, isLoading, input, setInput } =
    useChat({
      initialMessages:[{
        id: `${new Date().toISOString().split('.')[0]}`,
        role: 'assistant',
        content: noteContent.content}],
      body: {
        id: noteId.toString(),
        locale: navigator.language,
      },
      onResponse(response) {
        if (response.status !== 200) {
          toast.error(`${response.status} ${response.statusText}`)
        }
      }
    //   ,onFinish(response) {
    //     console.log(response)
    //   }
    })
  return (
    <article className="md:flex sm:w-full mx-auto max-w-3xl h-screen justify-center mt-10">
      <div>
        <div
          className={`w-[300px] h-[400px] w-full md:w-[300px] p-4 text-2xl ${noteContent.dark ? "text-white" : ""}`}
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
      <div className="w-[300px] w-full md:w-[420px] p-4">
        <div className="h-3/4 overflow-y-auto" dangerouslySetInnerHTML={{ __html: messages.length>0 ? messages.slice(-1)[0].content.replace('\n', '<br>') : noteContent.content.replace('\n', '<br>') }} />
        {noteContent.authorId != "987654321" && (
             <PromptForm
          onSubmit={async (input) => {
            append({
              role: 'user',
              content: input
            })
            setInput('')
            await reload()
          }}
          input={input}
          isLoading={isLoading}
          setInput={setInput} />
        )}
      </div>
    </article>
  );
};