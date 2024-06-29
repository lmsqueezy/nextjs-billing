// components/ArticleCard.tsx
import React from 'react';
import Image from 'next/image';
import { TwitterX } from '@/components/icons/social';

interface ArticleCardProps {
  css: string;
  authorId: string;
  createdAt: string;
  content: string;
  length: number;
}

const Tweet: React.FC<ArticleCardProps> = ({ css, authorId, createdAt, content,length }) => {
  return (
        <div className='opacity-88 p-4 bg-gray-400 bg-opacity-10 rounded-sm opacity-88'>
          <div className="flex items-start justify-between w-full">
            <div className="flex items-start gap-2">
              <Image
                src={'https://pbs.twimg.com/profile_images/' + css}
                alt="maker"
                height={40}
                width={40}
                className="w-8 h-8 rounded-full object-cover object-top"
              />
              <div className="flex flex-col items-start">
                <p>@{authorId}</p>
                <p className="text-muted-foreground text-xs">
                  {createdAt ? `${(new Date(+createdAt * 1000)).toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })}` : ''}
                </p>
              </div>
            </div>
            <TwitterX className="w-6 h-6 opacity-50" />
          </div>
            {content.substring(0,length)} {content.length > length ? '...' : ''}
        </div>
  );
}

export default Tweet;
