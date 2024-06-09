'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {Button} from "@/components/ui/button";
import type { NewArticle as Article } from '@/db/schema-sqlite';
import { Suspense } from 'react'


function Articles() {
  const { data: session } = useSession();
  const userId = session?.user.id;

  const [articles, setArticles] = useState<Article[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams?.get('category') || '';

  const fetchArticles = useCallback(async (cursor: string | undefined = undefined, category: string = '', favorById: string | undefined = undefined) => {
    const res = await fetch(`/api/home?${cursor ? `startCursor=${cursor}&` : ''}pageSize=10${category ? `&category=${category}` : ''}${favorById ? `&favorById=${favorById}` : ''}`);
    const data = await res.json();
    if (res.ok) {
      setArticles(prev => {
        const newArticles = data.articles.filter((article: Article) => !prev.some(a => a.id === article.id));
        return [...prev, ...newArticles];
      });
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } else {
      console.error(data.error);
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight && hasMore) {
      fetchArticles(nextCursor, category, userId);
    }
  }, [nextCursor, hasMore, fetchArticles, category, userId]);

  useEffect(() => {
    fetchArticles(undefined, category, userId);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll, fetchArticles, category, userId]);

  useEffect(() => {
    // Reset articles and cursor when category changes
    setArticles([]);
    setNextCursor(undefined);
    setHasMore(true);
  }, [category]);

  const handleArticleClick = (id: string) => {
    router.push(`/note/${id}`);
  };

  const handleCategoryClick = (category: string) => {
    router.push(`/favor?category=${category}`);
  };

  return (
    <>
      <div className="flex justify-center p-2 gap-2 sticky top-0 bg-background">
        {['all', 'fashion', 'food', 'digital', 'beauty', 'other'].map(cat => (
          <Button
            key={cat}
            variant={`${category === cat ? 'secondary' : 'outline'}`}
            onClick={() => handleCategoryClick(cat === 'all' ? '' : cat)}
          >
            {cat}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 justify-center">
        {articles.map(article => (
          <div
            key={article.id}
            className={`w-40 h-60 sm:w-1/2 md:w-60 p-2 cursor-pointer rounded-lg ${article.dark ? "text-white" : "text-black"}`}
            onClick={() => handleArticleClick(article.id?.toString() ?? '')}
            style={{ background: article.css?.toString() ?? '' }}
          >
            <h3 className="text-md">{article.title}</h3>
            <p className="text-xs">{article.createdAt ? new Date(article.createdAt * 1000).toLocaleDateString() : ''}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default async  function Favor() {
  return (
    <Suspense>
      <Articles />
    </Suspense>
  )
}