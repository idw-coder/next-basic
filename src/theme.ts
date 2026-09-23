'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  cssVariables: true,

  palette: {
    primary: {
      main: '#0967c9',
      dark: '#075ab0',
    },
    secondary: {
      main: '#ff624d',
      dark: '#e65345',
    },
    background: {
      default: '#fffaf4',
      paper: '#ffffff',
    },
    text: {
      primary: '#232323',
      secondary: '#6d6760',
    },
    divider: '#eee3d6',
  },

  typography: {
    fontFamily: [
      'var(--font-zen-maru)',
      '"Hiragino Maru Gothic ProN"',
      '"Hiragino Sans"',
      'sans-serif',
    ].join(','),
  },

  shape: {
    borderRadius: 10,
  },
});

export default theme;
