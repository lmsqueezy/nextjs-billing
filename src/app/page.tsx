'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from 'react'

import type { NewArticle as Article } from '@/db/schema-sqlite';

function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams?.get('category') ?? '';

  const fetchArticles = useCallback(async (cursor: string | undefined = undefined, category: string = '') => {
    try {
      const res = await fetch(`/api/home?${cursor ? `startCursor=${cursor}&` : ''}pageSize=10${category ? `&category=${category}` : ''}`);
 
      const data: { articles: Article[]; nextCursor: string; hasMore: boolean } = await res.json();
      setArticles(prev => {
        const newArticles = data.articles.filter(article => !prev.some(a => a.id === article.id));
        return [...prev, ...newArticles];
      });
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error(error);
    }
  }, []);

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
    void router.push(`/?category=${newCategory}`);
  };

  return (
    <>
      <h1 className='h-[320px] background-image pt-20 text-slate-900 font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-center dark:text-white mx-auto'>
        Daily Post Inspiration<br /> A Helpful Social Media Copilot
      </h1>
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
      <div className="flex flex-wrap gap-4 justify-center">
        {articles.map(article => (
          <div
            key={article.id}
            className={`w-40 h-60 sm:w-1/2 md:w-60 p-2 cursor-pointer rounded-lg ${article.dark ? 'text-white' : 'text-black'}`}
            onClick={() => handleArticleClick(article.id?.toString() ?? '')}
            style={{ background: article.css?.toString() ?? '', display: "flex", flexDirection: "column", justifyContent: "space-between" }}
          >
            <h3 className="text-md">{article.title?.toString() ?? ''}</h3>
            <div style={{ marginTop: "auto" }}>
              <span className='text-xs opacity-90'>{article.createdAt ? new Date(article.createdAt * 1000).toLocaleDateString() : ''}</span>
              <Link className='ml-10' href={`/note/${article.id}`}>
                <Button className={`${article.dark ? 'text-white' : 'text-black'}`} variant="link">✨ AI Reply</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}


export default async  function Home() {
  return (
    <Suspense>
      <Articles />
    </Suspense>
  )
}