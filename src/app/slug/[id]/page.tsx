// pages/article/[id].tsx
import { GetServerSideProps } from 'next';
import { getPage, getPageContent } from '@/lib/notion';
import { PageObjectResponse, PartialPageObjectResponse, ListBlockChildrenResponse, BlockObjectResponse, ParagraphBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

interface Props {
  page: PageObjectResponse | PartialPageObjectResponse;
  content: ListBlockChildrenResponse['results'];
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };
  const page = await getPage(id);
  const content = await getPageContent(id);

  return {
    props: {
      page,
      content,
    },
  };
};

const isFullPage = (page: PageObjectResponse | PartialPageObjectResponse): page is PageObjectResponse => {
  return 'properties' in page;
};

const isParagraphBlock = (block: BlockObjectResponse): block is ParagraphBlockObjectResponse => {
  return block.type === 'paragraph';
};

const Article: React.FC<Props> = ({ page, content }) => {
  if (!isFullPage(page)) {
    return <div>Invalid page data</div>;
  }

  return (
    <div>
      {/* <h1>{page.properties.Name?.title?.[0]?.text?.content || 'Untitled'}</h1> */}
      <div>
        {content.map((block) => {
          // if (block.type === 'paragraph' && isParagraphBlock(block)) {
          //   return <p key={block.id}>{block.paragraph.text.map((text) => text.plain_text).join('')}</p>;
          // }
          // 处理更多块类型...
          return null;
        })}
      </div>
    </div>
  );
};

export default Article;
