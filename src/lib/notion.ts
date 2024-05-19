// lib/notion.ts
import { Client } from '@notionhq/client';
import { QueryDatabaseResponse, PageObjectResponse, PartialPageObjectResponse, ListBlockChildrenResponse } from '@notionhq/client/build/src/api-endpoints';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export const getDatabaseItems = async (): Promise<QueryDatabaseResponse['results']> => {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
  });
  return response.results;
};

export const getPage = async (pageId: string): Promise<PageObjectResponse | PartialPageObjectResponse> => {
  const response = await notion.pages.retrieve({ page_id: pageId });
  return response;
};

export const getPageContent = async (pageId: string): Promise<ListBlockChildrenResponse['results']> => {
  const response = await notion.blocks.children.list({ block_id: pageId });
  return response.results;
};
