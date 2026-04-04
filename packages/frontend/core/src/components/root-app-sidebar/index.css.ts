import { cssVarV2 } from '@toeverything/theme/v2';
import { globalStyle, style } from '@vanilla-extract/css';

export const workspaceAndUserWrapper = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  width: 'calc(100% + 12px)',
  height: 42,
  paddingRight: 6,
  alignSelf: 'center',
});
export const quickSearchAndNewPage = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '4px 0',
  marginLeft: -8,
  marginRight: -6,
});
export const quickSearch = style({
  width: 0,
  flex: 1,
});

export const workspaceWrapper = style({
  width: 0,
  flex: 1,
});

export const bottomContainer = style({
  gap: 8,
});

export const iconSidebarContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '12px 8px',
  gap: 8,
  height: '100%',
});

export const iconButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: 8,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  color: cssVarV2('icon/primary'),
  selectors: {
    '&:hover': {
      background: cssVarV2.layer.background.hoverOverlay,
    },
    '&[data-active="true"]': {
      background: cssVarV2.layer.background.hoverOverlay,
      color: cssVarV2('icon/activated'),
    },
  },
});

export const iconButtonIcon = style({
  fontSize: 24,
});

export const avatarButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: 8,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  selectors: {
    '&:hover': {
      background: cssVarV2.layer.background.hoverOverlay,
    },
  },
});

export const workspaceButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: 8,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  selectors: {
    '&:hover': {
      background: cssVarV2.layer.background.hoverOverlay,
    },
  },
});

export const divider = style({
  width: 24,
  height: 1,
  background: cssVarV2.layer.insideBorder.border,
  margin: '4px 0',
});

export const spacer = style({
  flex: 1,
});

export const navigationMenuContent = style({
  borderRadius: 12,
  boxShadow: '0px 6px 16px 0px rgba(0, 0, 0, 0.14)',
  fontSize: '14px',
});

globalStyle(`${navigationMenuContent} [data-testid="slider-bar-import-button"]`, {
  padding: '10px 12px',
  minHeight: 40,
});

globalStyle(`${navigationMenuContent} [data-testid="slider-bar-import-button"] span`, {
  fontSize: '14px',
});

globalStyle(`${navigationMenuContent} [role="switch"]`, {
  marginTop: 8,
  marginBottom: 4,
  fontSize: '13px',
});

globalStyle(`${navigationMenuContent} [data-testid="collapsible-section-content"]`, {
  paddingTop: 8,
  paddingBottom: 4,
});

globalStyle(`${navigationMenuContent} [data-testid="collapsible-section-content"] > *`, {
  marginTop: 4,
  minHeight: 36,
});
