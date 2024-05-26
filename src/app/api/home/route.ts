import { NextResponse } from 'next/server';
import { sqliteDb, note } from '@/db/schema-sqlite';
import { desc, sql } from 'drizzle-orm';

interface Article {
  id: number;
  title: string;
  dark: boolean,
  css: string,
  createdAt: number;
}

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const startCursor = parseInt(searchParams.get('startCursor') ?? '0', 10);
  const pageSize = parseInt(searchParams.get('pageSize') ?? '10', 10);

  try {
    const articlesQuery = await sqliteDb
      .select({
        id: note.id,
        title: note.title,
        dark: note.dark,
        css: note.css,
        createdAt: note.createdAt,
        useCount: note.usedcount,
      })
      .from(note)
      .orderBy(desc(note.id))
      .limit(pageSize)
      .offset(startCursor);

    const articles: Article[] = articlesQuery.map((article: any) => ({
      id: article.id,
      title: article.title,
      dark: article.dark,
      css: article.css,
      createdAt: article.createdAt,
    }));

    const totalArticlesQuery = await sqliteDb.select({
      count: sql<number>`COUNT(*)`.as('count'),
    }).from(note);

    const totalArticles = totalArticlesQuery[0].count;
    const hasMore = startCursor + pageSize < totalArticles;

    return NextResponse.json({
      articles,
      nextCursor: hasMore ? startCursor + pageSize : null,
      hasMore,
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
};
