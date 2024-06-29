import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import Tweet from '@/components/tweet';
import type { NewArticle as Article } from '@/db/schema-sqlite';

interface Category {
  listId: string;
  category: string;
}

function Notes({ param }: { param?: string }) {
  const { data: session } = useSession();
  const userId = session?.user.id;
  const [articles, setArticles] = useState<Article[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [categories, setCategories] = useState<string[]>([]);
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

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/cates');
      const data: string[] = await res.json();
      setCategories(data);
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

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const handleArticleClick = (id: string) => {
    void router.push(`/note/${id}`);
  };

  const handleCategoryClick = (newCategory: string) => {
    void router.push(`${userId && param ? `/${param}` : ''}?category=${newCategory}`);
  };

  return (
    <>
      <div className="flex justify-center p-2 gap-2 sticky top-0 bg-background">
        {['all', ...categories].map(cat => (
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
          {articles.map((article) => (
            <div className="mb-4 z-0 break-inside-avoid-column cursor-pointer" key={article.id}
              onClick={() => handleArticleClick(article.id?.toString() ?? '')}>
              <div className="border border-slate/10 rounded-lg p-4 flex flex-col items-start gap-3 h-fit">
                🤖:  {article.title}
                <Tweet length={210} css={article.css ?? ''} authorId={article.authorId} content={article.content} createdAt={article.createdAt?.toString() ?? ''}/>              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Notes;
