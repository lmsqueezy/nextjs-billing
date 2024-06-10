'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { NewArticle } from '@/db/schema-sqlite';

type EditButtonsProps = {
  noteContent: NewArticle;
  noteId: number;
};

export default function EditButtons({ noteContent, noteId }: EditButtonsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState(noteContent.title);
  const [content, setContent] = useState(noteContent.content);

  const handleDelete = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/del', {
        method: 'POST',
        body: JSON.stringify({ noteId }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: { nextNoteId: string | null } = await response.json();
        const nextNoteId = data.nextNoteId;

        if (nextNoteId) {
          router.push(`/note/${nextNoteId}`);
        } else {
          router.push('/notes'); // Redirect to the notes list if there is no next note
        }
      } else {
        // Handle error
        console.error('Failed to delete the note');
      }
    } catch (error) {
      console.error('An error occurred while deleting the note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/update', {
        method: 'POST',
        body: JSON.stringify({ noteId, title, content }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Close the dialog and refresh the page or update state as needed
        setIsDialogOpen(false);
        router.refresh(); // Refresh the page to reflect the updated note
      } else {
        // Handle error
        console.error('Failed to update the note');
      }
    } catch (error) {
      console.error('An error occurred while updating the note:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="icon" onClick={() => { handleDelete(); }} disabled={loading}>
        🗑️
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" onClick={() => { setIsDialogOpen(true); }}>
            ✏️
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>Edit the title and content of your note.</DialogDescription>
          </DialogHeader>
          <div className="flex min-w-xs gap-2">
            <Textarea
              className="w-[300px] h-[300px]"
              placeholder="Title"
              defaultValue={noteContent.title}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              className="w-full h-[320px]"
              placeholder="Content"
              defaultValue={noteContent.content}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={() => { handleEdit(); }} disabled={loading}>Submit</Button>
            <Button variant="outline" onClick={() => { setIsDialogOpen(false); }} disabled={loading}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
