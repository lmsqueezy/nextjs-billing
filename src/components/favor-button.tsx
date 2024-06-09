'use client';

import { Button } from '@/components/ui/button';  // Ensure 'next/navigation' is imported first
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type FavorButtonsProps = {
  noteId: number;
  isFavored: boolean;
};

type CheckFavoredResponse = {
  favored: boolean;
};

type CopyNoteResponse = {
  newNoteId: number;
};

export default function FavorButtons({ noteId, isFavored }: FavorButtonsProps) {
  const router = useRouter();
  const [favored, setFavored] = useState(isFavored);

  const checkFavored = async () => {
    try {
      const response = await fetch(`/api/favor?noteId=${noteId}`, {
        method: 'GET',
      });
      if (response.ok) {
        const data: CheckFavoredResponse = await response.json();
        setFavored(data.favored);
      } else {
        throw new Error('Failed to check favored status');
      }
    } catch (error) {
      console.error('Error checking favored status:', error);
    }
  };

  useEffect(() => {
    void checkFavored();
  }, [noteId]);

  const handleCopy = async () => {
    try {
      const response = await fetch('/api/dup', {
        method: 'POST',
        body: JSON.stringify({ noteId }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: CopyNoteResponse = await response.json();
        const newNoteId = data.newNoteId;  // Assuming the API returns the new note ID
        router.push(`/note/${newNoteId}`);
      } else {
        throw new Error('Failed to copy the note');
      }
    } catch (error) {
      console.error('Error copying the note:', error);
    }
  };

  const handleFavorite = async () => {
    try {
      const response = await fetch('/api/favor', {
        method: 'POST',
        body: JSON.stringify({ noteId }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setFavored(true);
      } else {
        throw new Error('Failed to favorite the note');
      }
    } catch (error) {
      console.error('Error favoriting the note:', error);
    }
  };

  return (
    <div className="flex space-x-2 ml-auto">
      {!favored ? (
        <Button variant="outline" size="icon" onClick={handleFavorite}>♡</Button>
      ) : (
        <Button variant="outline" size="icon" onClick={handleFavorite}>🧡</Button>
      )}
      <Button variant="outline" size="icon" onClick={handleCopy}>AI🪄</Button>
    </div>
  );
}
