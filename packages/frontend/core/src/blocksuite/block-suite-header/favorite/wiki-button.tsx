import { WikiTag } from '@affine/core/components/page-list';

export const WikiButton = ({ pageId }: { pageId?: string }) => {
  return <WikiTag data-testid="wiki-button" docId={pageId} />;
};