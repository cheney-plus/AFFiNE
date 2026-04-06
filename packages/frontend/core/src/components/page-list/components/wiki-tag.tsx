import type { IconButtonProps } from '@affine/component';
import { IconButton } from '@affine/component';
import { useI18n } from '@affine/i18n';
import { TagsIcon } from '@blocksuite/icons/rc';
import { cssVar } from '@toeverything/theme';
import { forwardRef, useCallback } from 'react';

export const WikiTag = forwardRef<
  HTMLButtonElement,
  {
    active: boolean;
  } & Omit<IconButtonProps, 'children'>
>(({ active, onClick, ...props }, ref) => {
  const t = useI18n();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();
      onClick?.(e);
    },
    [onClick]
  );

  return (
    <IconButton
      tooltip={t['com.affine.wiki.tag.tooltip']() || '维基化'}
      tooltipOptions={{ side: 'top' }}
      ref={ref}
      onClick={handleClick}
      size="20"
      {...props}
    >
      <TagsIcon
        style={{
          color: active ? cssVar('successColor') : cssVar('iconColor'),
        }}
        data-testid="wiki-icon"
      />
    </IconButton>
  );
});
WikiTag.displayName = 'WikiTag';
