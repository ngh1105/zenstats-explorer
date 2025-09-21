import React, { useState, useEffect } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CardHeader, 
  Grid,
  Button,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import { AccountBalanceWallet, ShowChart, AccountBalance, LocalGasStation, Speed, TrendingUp, Refresh, EmojiEvents, History } from '@mui/icons-material';
import { ToastProvider } from './contexts/ToastContext';
import Navbar from './components/Navbar';
import DailyTransactions from './components/DailyTransactions';
import TotalTransactionsAllTime from './components/TotalTransactionsAllTime';
import TotalStaked from './components/TotalStaked';
import TopTokenHolders from './components/TopTokenHolders';
import GasFeeTrends from './components/GasFeeTrends';
import BlockProduction from './components/BlockProduction';
import ZenChainStats from './components/ZenChainStats';
import StakePage from './components/StakePage';
import QuestPage from './components/QuestPage';
import SendTokenPage from './components/SendTokenPage';
import DeployPage from './components/DeployPage';
import MyActivityPage from './components/MyActivityPage';
import MyNFT from './components/MyNFT';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ff88', // Neon green
    },
    secondary: {
      main: '#00bfff', // Neon blue
    },
    background: {
      default: '#0a0a0a',
      paper: 'rgba(16, 185, 129, 0.08)',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  }
});

const AppClean = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [questRoute, setQuestRoute] = useState('/quest'); // Quest routing state
  const [showActivityPage, setShowActivityPage] = useState(false); // Activity page state
  const [showNFTPage, setShowNFTPage] = useState(false); // NFT page state
  const { stats, loading, error, handleRetry } = ZenChainStats();

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setShowActivityPage(false); // Hide activity page when switching tabs
    setShowNFTPage(false); // Hide NFT page when switching tabs
    // Reset quest route when switching tabs
    if (newValue === 2) {
      setQuestRoute('/quest');
    }
  };

  // Quest navigation handler
  const handleQuestNavigation = (route) => {
    setQuestRoute(route);
  };

  // Activity navigation handler
  const handleNavigateToActivity = () => {
    console.log('handleNavigateToActivity called!');
    setCurrentTab(-1); // Set to special tab for activity
    setShowActivityPage(true); // Show activity page
    setShowNFTPage(false); // Hide NFT page
    console.log('Navigated to activity page');
  };

  // NFT navigation handler
  const handleNavigateToNFT = () => {
    console.log('handleNavigateToNFT called!');
    setCurrentTab(-2); // Set to special tab for NFT
    setShowNFTPage(true); // Show NFT page
    setShowActivityPage(false); // Hide activity page
    console.log('Navigated to NFT page');
  };

  return (
    <ToastProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #0f0f0f 50%, #000000 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(0, 255, 136, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0, 191, 255, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
          zIndex: 0
        }
      }}>
        {/* Navbar */}
        <Navbar 
          onNavigateToActivity={handleNavigateToActivity}
          onNavigateToNFT={handleNavigateToNFT}
        />
        
        {/* Navigation Tabs */}
        <Box sx={{ 
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 255, 136, 0.3)',
          boxShadow: '0 0 20px rgba(0, 255, 136, 0.1)',
        }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                '&.Mui-selected': {
                  color: '#00ff88',
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#00ff88',
                height: 3,
              }
            }}
          >
            <Tab 
              icon={<ShowChart />} 
              label="Analytics Dashboard" 
              iconPosition="start"
            />
            <Tab 
              icon={<TrendingUp />} 
              label="Staking" 
              iconPosition="start"
            />
            <Tab 
              icon={<EmojiEvents />} 
              label="Quest" 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Main Content */}
        <Box sx={{ p: 4, position: 'relative', zIndex: 1 }}>
          {showActivityPage ? (
            <MyActivityPage onClose={() => {
              console.log('Closing activity page...');
              setShowActivityPage(false);
              setCurrentTab(0); // Return to dashboard
            }} />
          ) : showNFTPage ? (
            <MyNFT onClose={() => {
              console.log('Closing NFT page...');
              setShowNFTPage(false);
              setCurrentTab(0); // Return to dashboard
            }} />
          ) : (
            <>
              {currentTab === 0 && (
                <>
              {/* Network Health Overview */}
              <Grid container spacing={1} sx={{ mb: 4, width: '100%' }}>
                <Grid item xs={6} sm={3} md={3} sx={{ flexGrow: 1 }}>
                  <TotalTransactionsAllTime />
                </Grid>
                
                <Grid item xs={6} sm={3} md={3} sx={{ flexGrow: 1 }}>
                  <TotalStaked />
                </Grid>
                
                <Grid item xs={6} sm={3} md={3} sx={{ flexGrow: 1 }}>
                  <Card sx={{ 
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    boxShadow: '0 0 20px rgba(0, 255, 136, 0.1)',
                    height: '100%',
                    width: '100%',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      border: '1px solid #00ff88',
                      boxShadow: '0 0 25px rgba(0, 255, 136, 0.6), 0 4px 20px rgba(0, 255, 136, 0.3)',
                    }
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: 2, 
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2
                        }}>
                          <Typography sx={{ color: 'white', fontWeight: 'bold' }}>⏱️</Typography>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Avg Block Time
                        </Typography>
                      </Box>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 700, 
                        color: '#00ff88', 
                        mb: 1,
                        textShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
                      }}>
                        {loading ? '...' : stats.avgBlockTime}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Current Average
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Second Row - Gas Price and Active Addresses */}
              <Grid container spacing={1} sx={{ mb: 4, width: '100%' }}>
                <Grid item xs={6} sm={6} md={6} sx={{ flexGrow: 1 }}>
                  <Card sx={{ 
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    boxShadow: '0 0 20px rgba(0, 255, 136, 0.1)',
                    height: '100%',
                    width: '100%',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      border: '1px solid #00ff88',
                      boxShadow: '0 0 25px rgba(0, 255, 136, 0.6), 0 4px 20px rgba(0, 255, 136, 0.3)',
                    }
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: 2, 
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2
                        }}>
                          <Typography sx={{ color: 'white', fontWeight: 'bold' }}>⛽</Typography>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Avg Gas Price
                        </Typography>
                      </Box>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 700, 
                        color: '#00ff88', 
                        mb: 1,
                        textShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
                      }}>
                        {loading ? '...' : stats.avgGasPrice}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Gwei
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={6} sm={6} md={6} sx={{ flexGrow: 1 }}>
                  <Card sx={{ 
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    boxShadow: '0 0 20px rgba(0, 255, 136, 0.1)',
                    height: '100%',
                    width: '100%',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      border: '1px solid #00ff88',
                      boxShadow: '0 0 25px rgba(0, 255, 136, 0.6), 0 4px 20px rgba(0, 255, 136, 0.3)',
                    }
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: 2, 
                          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2
                        }}>
                          <Typography sx={{ color: 'white', fontWeight: 'bold' }}>👤</Typography>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Active Addresses
                        </Typography>
                      </Box>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 700, 
                        color: '#00ff88', 
                        mb: 1,
                        textShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
                      }}>
                        {loading ? '...' : stats.activeAddresses}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ZenChain All-Time Active
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Daily Transactions Chart - Full Width */}
              <Box sx={{ mb: 4 }}>
                <DailyTransactions />
              </Box>

              {/* Other Charts Section */}
              <Grid container spacing={1} sx={{ width: '100%' }}>
                {/* Top Holders */}
                <Grid item xs={12} sm={4} lg={4} sx={{ flexGrow: 1 }}>
                  <TopTokenHolders tokenAddress="0xf8108130dC9eFbB50AE95E9c1b107265CD9f" />
                </Grid>

                {/* Gas Fee Trends */}
                <Grid item xs={12} sm={4} lg={4} sx={{ flexGrow: 1 }}>
                  <GasFeeTrends />
                </Grid>

                {/* Block Production */}
                <Grid item xs={12} sm={4} lg={4} sx={{ flexGrow: 1 }}>
                  <BlockProduction />
                </Grid>
              </Grid>
                </>
              )}

              {currentTab === 1 && (
                <StakePage />
              )}

              {currentTab === 2 && (
                <>
                  {questRoute === '/quest' && (
                    <QuestPage onNavigate={handleQuestNavigation} />
                  )}
                  {questRoute === '/quest/send-token' && (
                    <SendTokenPage onNavigate={handleQuestNavigation} />
                  )}
                  {questRoute === '/quest/deploy' && (
                    <DeployPage onNavigate={handleQuestNavigation} />
                  )}
                </>
              )}
            </>
          )}
          
          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ 
              position: 'fixed', 
              bottom: 10, 
              left: 10, 
              p: 1, 
              bgcolor: 'rgba(0,0,0,0.8)', 
              color: 'white',
              fontSize: '0.75rem',
              borderRadius: 1,
              zIndex: 9999
            }}>
              Activity: {showActivityPage.toString()} | NFT: {showNFTPage.toString()} | Tab: {currentTab}
            </Box>
          )}
        </Box>
      </Box>
      </ThemeProvider>
    </ToastProvider>
  );
};

export default AppClean;
