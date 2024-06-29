import { NextResponse } from 'next/server';
import { sqliteDb, category } from '@/db/schema-sqlite';

export const GET = async (req: Request) => {
  const cates = await sqliteDb
    .select({ categoryName: category.category })
    .from(category);

  const categoryNames = cates.map(cate => cate.categoryName);

  return NextResponse.json(categoryNames, { status: 200 });
};
