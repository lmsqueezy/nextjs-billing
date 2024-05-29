'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || '';

  const fetchArticles = useCallback(async (cursor: string | undefined = undefined, category: string = '') => {
    const res = await fetch(`/api/home?${cursor ? `startCursor=${cursor}&` : ''}pageSize=10${category ? `&category=${category}` : ''}`);
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
      fetchArticles(nextCursor, category);
    }
  }, [nextCursor, hasMore, fetchArticles, category]);

  useEffect(() => {
    fetchArticles(undefined, category);
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
    router.push(`/note/${id}`);
  };

  const handleCategoryClick = (category: string) => {
    router.push(`/?category=${category}`);
  };

  return (
    <>
      <Navbar />
      <div className="flex justify-center p-2 gap-2 sticky top-0 bg-background">
        {['all', 'fashion', 'food', 'digital', 'beauty', 'other'].map(cat => (
          <button
            key={cat}
            className={`px-2 py-1 rounded ${category === cat ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => handleCategoryClick(cat === 'all' ? '' : cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 justify-center">
        {articles.map(article => (
          <div
            key={article.id}
            className={`w-40 h-60 sm:w-1/2 md:w-60 p-2 cursor-pointer rounded-lg ${article.dark ? "text-white" : ""}`}
            onClick={() => handleArticleClick(article.id)}
            style={{ background: article.css }}
          >
            <h3 className="text-md">{article.title}</h3>
            <p className="text-xs">{new Date(article.createdAt * 1000).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </>
  );
}
