'use client';

import { Button } from "@/components/ui/button"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type FavorButtonsProps = {
  noteId: number;
  isFavored: boolean;
};

export default function FavorButtons({ noteId, isFavored }: FavorButtonsProps) {
  const router = useRouter();
  const [favored, setFavored] = useState(isFavored);
  const checkFavored = async () => {
    const response = await fetch('/api/favor?noteId=' + noteId, {
      method: 'GET'
    });
    if(response.ok) {
      const data = await response.json();
      setFavored(data.favored);
    }
  };
  useEffect(() => {
    checkFavored();
  })
  const handleCopy = async () => {
    const response = await fetch('/api/dup', {
      method: 'POST',
      body: JSON.stringify({ noteId }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      const newNoteId = data.newNoteId;  // Assuming the API returns the new note ID
      router.push(`/note/${newNoteId}`);
    } else {
      // Handle error
      console.error('Failed to copy the note');
    }
  };

  const handleFavorite = async () => {
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
      // Handle error
      console.error('Failed to favorite the note');
    }
  };

  return (
    <div className="mt-4 flex space-x-2">
      {!favored ? <Button variant="outline" size="icon" onClick={handleFavorite}>♡</Button>: <Button variant="outline" size="icon" onClick={handleFavorite}>🧡</Button>}
      <Button variant="outline" size="icon" onClick={handleCopy}>AI🪄</Button>
    </div>
  );
}
