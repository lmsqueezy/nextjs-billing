import { NextResponse } from 'next/server';
import { sqliteDb, note, favorites,NewArticle as Article } from '@/db/schema-sqlite';
import { desc, sql, eq, and, inArray } from 'drizzle-orm';


export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const startCursor = parseInt(searchParams.get('startCursor') ?? '0', 10);
  const pageSize = parseInt(searchParams.get('pageSize') ?? '10', 10);
  const category = searchParams.get('category');
  const favorById = searchParams.get('favorById');
  const authorId = searchParams.get('authorId') ?? '987654321';
  console.log(authorId)
  try {
    // Base conditions
    let conditions = [eq(note.authorId, authorId)];

    // Add category condition if category parameter is present
    if (category) {
      conditions.push(eq(note.category, category));
    }

    let articleIds: number[] = [];
    if (favorById) {
      // Query favorite articles by favorById
      const favoritesQuery = await sqliteDb
        .select({
          articleId: favorites.articleId,
        })
        .from(favorites)
        .where(eq(favorites.userId, favorById));

      articleIds = favoritesQuery.map(fav => fav.articleId);

      // Add condition to filter articles by the favorite article IDs
      if (articleIds.length > 0) {
        conditions.push(inArray(note.id, articleIds));
      } else {
        // If no favorite articles found, return empty result
        return NextResponse.json({
          articles: [],
          nextCursor: null,
          hasMore: false,
        }, { status: 200 });
      }
    }

    // Construct the query with conditions
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
      .where(and(...conditions))
      .orderBy(desc(note.id))
      .limit(pageSize)
      .offset(startCursor);


    // Query to get the total number of articles
    const totalArticlesQuery = await sqliteDb
      .select({
        count: sql<number>`COUNT(*)`.as('count'),
      })
      .from(note)
      .where(and(...conditions));

    const totalArticles = totalArticlesQuery[0].count;
    const hasMore = startCursor + pageSize < totalArticles;

    return NextResponse.json({
      articlesQuery,
      nextCursor: hasMore ? startCursor + pageSize : null,
      hasMore,
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
};
