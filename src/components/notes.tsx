'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import Link from "next/link";

import type { NewArticle as Article } from '@/db/schema-sqlite';

function Notes({param}:{param?: string}) {
  const { data: session } = useSession();
  const userId = session?.user.id;
  const [articles, setArticles] = useState<Article[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams?.get('category') ?? '';

  const fetchArticles = useCallback(async (cursor: string | undefined = undefined, category: string = '') => {
    try {
      const res = await fetch(`/api/notes?${cursor ? `startCursor=${cursor}&` : ''}pageSize=10${category ? `&category=${category}` : ''}${userId && param ? `&${param}Id=${userId}` : ''}`);
      const data: { articles: Article[]; nextCursor: string; hasMore: boolean } = await res.json();
      setArticles(prev => {
        const newArticles = data.articles?.filter(article => !prev.some(a => a.id === article.id));
        return [...prev, ...(newArticles ?? [])];
    });
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error(error);
    }
  }, [param]);

  
  const handleScroll = useCallback(() => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight && hasMore) {
      void fetchArticles(nextCursor, category);
    }
  }, [nextCursor, hasMore, fetchArticles, category]);

  useEffect(() => {
    void fetchArticles(undefined, category);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll, fetchArticles, category]);

  useEffect(() => {
    // Reset articles and cursor when category changes
    setArticles([]);
    setNextCursor(undefined);
    setHasMore(true);
  }, [category]);

  const handleArticleClick = (id: string) => {
    void router.push(`/note/${id}`);
  };

  const handleCategoryClick = (newCategory: string) => {
    void router.push(`${userId && param ? `/${param}` : ''}?category=${newCategory}`);
  };

  return (
    <>
      <div className="flex justify-center p-2 gap-2 sticky top-0 bg-background">
        {['all', 'fashion', 'food', 'digital', 'beauty', 'other'].map(cat => (
          <Button
            key={cat}
            variant={category === (cat === 'all' ? '' : cat) ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => handleCategoryClick(cat === 'all' ? '' : cat)}
          >
            {cat}
          </Button>
        ))}
      </div>
      <div className="flex flex-col justify-center items-center pt-4 gap-12 w-full ">
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 max-w-7xl mx-auto overflow-hidden relative transition-all">
        {articles.map(article => (
          <div className="mb-4 z-0 break-inside-avoid-column border border-slate/10 rounded-lg cursor-pointer h-fit"
           key={article.id}
           onClick={() => handleArticleClick(article.id?.toString() ?? '')}>
          <div className=" p-4 flex flex-col items-start gap-3" >
            <div className="flex items-start justify-between w-full">
              <div className="flex items-start gap-2">
                <div className="flex flex-col items-start">
                  <p className="font-bold">{article.userId}</p>
                  <p>
                    @{article.userId}
                  </p>
                </div>
              </div>
              <Link
                href={`/note/${article.id?.toString()}`}
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                {/* <TwitterX className="w-8 h-8" /> */}
              </Link>
            </div>
            <p className="text-[14px]">
            {article.userId}{article.title}{article.content}
            </p>
          </div>
        </div>
        ))}
      </div>
      </div>
    </>
  );
}

export default Notes;
