import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

interface Article {
  id: string;
  title: string;
  createdAt: string;
}

export const GET = async (req: Request) => {
  const databaseId = process.env.NOTION_DATABASE_ID;
  const { searchParams } = new URL(req.url);
  const startCursor = searchParams.get('startCursor') ?? undefined;
  const pageSize = parseInt(searchParams.get('pageSize') ?? '10', 10);

  if (!databaseId) {
    return NextResponse.json({ error: 'Database ID is not defined' }, { status: 500 });
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: startCursor,
      page_size: pageSize,
    });

    const articles: Article[] = response.results.map((page: any) => {
      const title = page.properties.Name.title[0]?.text.content || 'Untitled';
      return {
        id: page.id,
        title,
        createdAt: page.created_time,
      };
    });

    return NextResponse.json({
      articles,
      nextCursor: response.next_cursor,
      hasMore: response.has_more,
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
};
