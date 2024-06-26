import { NextResponse } from 'next/server';
import { sqliteDb, note, favorites, NewArticle as Article } from '@/db/schema-sqlite';
import { desc, sql, eq, and, inArray } from 'drizzle-orm';


export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const startCursor = parseInt(searchParams.get('startCursor') ?? '0', 10);
  const pageSize = parseInt(searchParams.get('pageSize') ?? '10', 10);
  const category = searchParams.get('category');
  const favorId = searchParams.get('favorId');
  const userId = searchParams.get('userId') ?? '987654321';
  
  try {
    // Base conditions
    let conditions = [eq(note.userId, userId)];

    // Add category condition if category parameter is present
    if (category) {
      conditions.push(eq(note.category, category));
    }

    let articleIds: number[] = [];
    if (favorId) {
      // Query favorite articles by favorId
      const favoritesQuery = await sqliteDb
        .select({
          articleId: favorites.articleId,
        })
        .from(favorites)
        .where(eq(favorites.userId, favorId));

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
        userId: note.userId,
        title: note.title,
        css: note.css,
        createdAt: note.createdAt,
        useCount: note.usedcount,
        content: note.content,
        authorId: note.authorId
      })
      .from(note)
      .where(and(...conditions))
      .orderBy(desc(note.id))
      .limit(pageSize)
      .offset(startCursor);

      const articles: Article[] = articlesQuery.map((article) => ({
        id: article.id,
        title: article.title,
        content: article.content,
        authorId: article.authorId,
        css: article.css,
        createdAt: article.createdAt,
        useCount: article.useCount ?? 0,
        link: '', // Add the link property with appropriate value
        userId: article.userId, // Add the userId property with appropriate value
        category: category ?? '', // Add the category property with appropriate value
        tags: '',
        dark: 0,
        textalign: 0,//0:left,1:middle,2:right
        inspiration: '',
        updatedAt: null,
    }));

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
      articles,
      nextCursor: hasMore ? startCursor + pageSize : null,
      hasMore,
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
};
