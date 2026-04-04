import { cssVar } from '@toeverything/theme';
import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

const SIDEBAR_WIDTH = 80;

export const navWrapperStyle = style({
  position: 'relative',
  height: '100%',
  transition: 'width 0.2s ease, margin-left 0.2s ease',
  '@media': {
    print: {
      display: 'none',
      zIndex: -1,
    },
  },
  paddingBottom: 8,
  selectors: {
    '&[data-has-border=true]': {
      borderRight: `0.5px solid ${cssVarV2('layer/insideBorder/border')}`,
    },
    '&[data-is-floating="true"], &[data-is-electron="false"]': {
      backgroundColor: cssVarV2('layer/background/primary'),
    },
    '&[data-open="false"]': {
      width: 0,
      minWidth: 0,
      marginLeft: `-${SIDEBAR_WIDTH}px`,
      overflow: 'hidden',
    },
  },
});
export const hoverNavWrapperStyle = style({
  selectors: {
    '&[data-is-floating="true"]': {
      backgroundColor: cssVarV2('layer/background/primary'),
      height: 'calc(100% - 60px)',
      marginTop: '52px',
      marginLeft: '4px',
      boxShadow: cssVar('--affine-popover-shadow'),
      borderRadius: '6px',
    },
    '&[data-is-floating="true"][data-is-electron="true"]': {
      height: '100%',
      marginTop: '-4px',
    },
    '&[data-is-floating="true"][data-client-border="true"]': {
      backgroundColor: cssVarV2('layer/background/overlayPanel'),
    },
    '&[data-is-floating="true"][data-client-border="true"]::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      opacity: `var(--affine-noise-opacity, 0)`,
      backgroundRepeat: 'repeat',
      backgroundSize: '50px',
      // TODO(@Peng): figure out how to use vanilla-extract webpack plugin to inject img url
      backgroundImage: `var(--noise-background)`,
    },
  },
});
export const navHeaderButton = style({
  width: '32px',
  height: '32px',
  flexShrink: 0,
});
export const navHeaderNavigationButtons = style({
  display: 'flex',
  alignItems: 'center',
  columnGap: '32px',
});
export const navStyle = style({
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
});
export const navHeaderStyle = style({
  flex: '0 0 auto',
  height: '52px',
  padding: '0px 8px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const navBodyStyle = style({
  flex: '1 1 auto',
  height: 'calc(100% - 52px)',
  display: 'flex',
  flexDirection: 'column',
  rowGap: '4px',
});
export const sidebarFloatMaskStyle = style({
  transition: 'opacity .15s',
  opacity: 0,
  pointerEvents: 'none',
  position: 'fixed',
  top: 0,
  left: 0,
  right: '100%',
  bottom: 0,
  background: cssVarV2('layer/background/modal'),
  selectors: {
    '&[data-open="true"][data-is-floating="true"]': {
      opacity: 1,
      pointerEvents: 'auto',
      right: '0',
      zIndex: 3,
    },
  },
  '@media': {
    print: {
      display: 'none',
    },
  },
});

export const resizeHandleShortcutStyle = style({
  alignItems: 'flex-end',
  marginBottom: '2px',
});

export const sidebarToggleHandleStyle = style({
  position: 'fixed',
  top: 0,
  bottom: 0,
  width: 4,
  cursor: 'pointer',
  zIndex: 5,
  opacity: 0,
  transition: 'opacity 0.15s ease, left 0.2s ease',
  selectors: {
    '&:hover': {
      opacity: 1,
      background: 'rgba(0, 0, 0, 0.05)',
    },
    '&[data-open="true"]': {
      left: SIDEBAR_WIDTH,
    },
    '&[data-open="false"]': {
      left: 0,
    },
  },
});
