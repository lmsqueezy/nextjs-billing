'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from "@/components/navbar";

interface Article {
  id: string;
  title: string;
  createdAt: number;
  css: string;
  dark: boolean;
}

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();

  const fetchArticles = useCallback(async (cursor: string | undefined = undefined) => {
    const res = await fetch(`/api/home?${cursor ? `startCursor=${cursor}&` : ''}pageSize=10`);
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
      fetchArticles(nextCursor);
    }
  }, [nextCursor, hasMore, fetchArticles]);

  useEffect(() => {
    fetchArticles();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll, fetchArticles]);

  const handleArticleClick = (id: string) => {
    router.push(`/note/${id}`);
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-wrap gap-4 justify-center">
        {articles.map(article => (
          <div
            key={article.id}
            className={`w-40 h-60 sm:w-1/2 md:w-60 p-2 cursor-pointer rounded-lg ${article.dark ? "text-white" : ""}`}
            onClick={() => handleArticleClick(article.id)}
            style={{ background: article.css }}
          >
            <h3 className="text-md">{article.title}</h3>
            <p className="text-xs">{new Date(article.createdAt*1000).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </>
  );
}
