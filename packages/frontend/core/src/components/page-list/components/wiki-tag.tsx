import type { IconButtonProps } from '@affine/component';
import { IconButton, notify } from '@affine/component';
import { WikiService } from '@affine/core/modules/wiki';
import { WorkspaceService } from '@affine/core/modules/workspace';
import { useI18n } from '@affine/i18n';
import { TagsIcon } from '@blocksuite/icons/rc';
import { cssVar } from '@toeverything/theme';
import { forwardRef, useCallback, useEffect, useState } from 'react';

import { useService, useServiceOptional } from '@toeverything/infra';

export const WikiTag = forwardRef<
  HTMLButtonElement,
  {
    active?: boolean;
    docId?: string;
  } & Omit<IconButtonProps, 'children'>
>(({ active: initialActive, docId, onClick, ...props }, ref) => {
  const [isActive, setIsActive] = useState(initialActive ?? false);
  const [isLoading, setIsLoading] = useState(false);
  const t = useI18n();
  const wikiService = useService(WikiService);
  const workspaceService = useServiceOptional(WorkspaceService);

  const workspaceId = workspaceService?.workspace.id;

  useEffect(() => {
    if (docId) {
      wikiService.checkWikiStatus(docId)
        .then(response => {
          setIsActive(response.exists);
        })
        .catch(error => {
          console.error('Failed to check wiki status:', error);
        });
    }
  }, [docId, wikiService]);

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();

      if (!docId) {
        console.warn('WikiTag: docId is not provided');
        onClick?.(e);
        return;
      }

      if (!workspaceId) {
        console.warn('WikiTag: workspaceId is not available');
        onClick?.(e);
        return;
      }

      setIsLoading(true);
      try {
        if (isActive) {
          await wikiService.deleteWiki(docId);
          setIsActive(false);
          notify.success({
            title: '维基化已取消',
          });
        } else {
          await wikiService.generateWiki(workspaceId, docId);
          setIsActive(true);
          notify.success({
            title: '维基化已开启',
          });
        }
        onClick?.(e);
      } catch (error) {
        console.error('Failed to toggle wiki:', error);
        notify.error({
          title: '操作失败',
          message: error instanceof Error ? error.message : '未知错误',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [isActive, docId, workspaceId, wikiService, onClick]
  );

  return (
    <IconButton
      tooltip={t['com.affine.wiki.tag.tooltip']() || '维基化'}
      tooltipOptions={{ side: 'top' }}
      ref={ref}
      onClick={handleClick}
      size="20"
      disabled={isLoading}
      {...props}
    >
      <TagsIcon
        style={{
          color: isActive ? cssVar('successColor') : cssVar('iconColor'),
        }}
        data-testid="wiki-icon"
      />
    </IconButton>
  );
});
WikiTag.displayName = 'WikiTag';