import { NextResponse } from 'next/server';
import { sqliteDb, favorites } from '@/db/schema-sqlite';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/auth';

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const noteId = searchParams?.get('noteId');
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = session.user.id;

  const favored = await sqliteDb
    .select()
    .from(favorites)
    .where(and(eq(favorites.articleId, Number(noteId)), eq(favorites.userId, userId)))
    .limit(1);

  return NextResponse.json({ favored: favored.length > 0 }, { status: 200 });
};

export const POST = async (req: Request) => {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { noteId } = await req.json();
  const userId = session.user.id;

  const existingFavorite = await sqliteDb
    .select()
    .from(favorites)
    .where(and(eq(favorites.articleId, Number(noteId)), eq(favorites.userId, userId)))
    .limit(1);

  if (existingFavorite.length > 0) {
    // Remove favorite
    await sqliteDb
      .delete(favorites)
      .where(and(eq(favorites.articleId, Number(noteId)), eq(favorites.userId, userId)));
    return NextResponse.json({ message: 'Removed from favorites' }, { status: 200 });
  } else {
    // Add favorite
    await sqliteDb.insert(favorites).values({ userId, articleId: Number(noteId) });
    return NextResponse.json({ message: 'Added to favorites' }, { status: 200 });
  }
};
