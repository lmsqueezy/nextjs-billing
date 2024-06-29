import { NextResponse } from 'next/server';
import { sqliteDb, category } from '@/db/schema-sqlite';

export const GET = async (req: Request) => {
  // 查询数据库并获取类别名称
  const cates = await sqliteDb
    .select({ categoryName: category.category })
    .from(category);

  // 将结果转换为仅包含类别名称的数组
  const categoryNames = cates.map(cate => cate.categoryName);

  return NextResponse.json(categoryNames, { status: 200 });
};
