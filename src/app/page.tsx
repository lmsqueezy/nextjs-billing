'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Article {
  id: string;
  title: string;
  createdAt: string;
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
        // 检查并过滤掉重复的id
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
    <div className="flex flex-wrap gap-4 justify-center">
      {articles.map(article => (
        <div
          key={article.id}
          className="w-60 h-80 border border-gray-300 p-4 cursor-pointer rounded-lg"
          onClick={() => handleArticleClick(article.id)}
        >
          <h3 className="text-lg font-semibold">{article.title}</h3>
          <p className="text-sm text-gray-600">{new Date(article.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
