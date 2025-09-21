import React from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, Grid } from '@mui/material';
import TotalTransactionsAllTime from './components/TotalTransactionsAllTime';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ff88',
    },
    secondary: {
      main: '#00bfff',
    },
    background: {
      default: '#000000',
      paper: '#000000',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  }
});

const TestTotalTx = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        background: '#000000',
        p: 4
      }}>
        <Grid container spacing={3}>
          <Grid item xs={6} sm={3} md={3} sx={{ flexGrow: 1 }}>
            <TotalTransactionsAllTime />
          </Grid>
          <Grid item xs={6} sm={3} md={3} sx={{ flexGrow: 1 }}>
            <TotalTransactionsAllTime />
          </Grid>
          <Grid item xs={6} sm={3} md={3} sx={{ flexGrow: 1 }}>
            <TotalTransactionsAllTime />
          </Grid>
          <Grid item xs={6} sm={3} md={3} sx={{ flexGrow: 1 }}>
            <TotalTransactionsAllTime />
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
};

export default TestTotalTx;
