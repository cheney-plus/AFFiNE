import { style } from '@vanilla-extract/css';

export const avatarGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(6, 1fr)',
  gap: '8px',
  marginTop: '12px',
});

export const avatarItem = style({
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  cursor: 'pointer',
  border: '2px solid transparent',
  transition: 'all 0.2s ease',
  objectFit: 'cover',
  selectors: {
    '&:hover': {
      transform: 'scale(1.1)',
    },
  },
});

export const avatarItemSelected = style({
  border: '2px solid var(--affine-primary-color)',
});

export const avatarSelectorWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});
