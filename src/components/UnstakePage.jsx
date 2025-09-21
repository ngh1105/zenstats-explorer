import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  Typography, 
  Box, 
  Button, 
  TextField, 
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Avatar,
  Grid,
  Paper
} from '@mui/material';
import { 
  AccountBalanceWallet, 
  TrendingDown, 
  FlashOn,
  Cancel,
  Refresh,
  CheckCircle,
  Warning,
  Speed
} from '@mui/icons-material';
import { useWallet } from '../contexts/WalletContext';
import { shortenAddress, formatNumber } from '../utils/helpers';
import { useUnstake } from '../hooks/useUnstake';

const UnstakePage = () => {
  // Get wallet state from context
  const { account, provider, isConnected } = useWallet();
  
  // Use the unstake hook
  const {
    unbond,
    withdraw,
    fastUnstake,
    cancelFastUnstake,
    getStakeInfo,
    canWithdraw,
    clearError,
    reset,
    loading,
    error,
    lastTx,
    isConnected: hookConnected
  } = useUnstake(provider, account);

  // Local state
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [stakeInfo, setStakeInfo] = useState({
    total: "0",
    active: "0",
    pending: "0"
  });
  const [withdrawAvailable, setWithdrawAvailable] = useState(false);
  const [balance, setBalance] = useState("0");
  const [refreshing, setRefreshing] = useState(false);

  // Load data when connected
  useEffect(() => {
    if (isConnected && account) {
      loadData();
    }
  }, [isConnected, account]);

  // Refresh data after successful transactions
  useEffect(() => {
    if (lastTx) {
      setTimeout(() => {
        loadData();
      }, 2000); // Wait 2 seconds for chain to update
    }
  }, [lastTx]);

  // Load all data
  const loadData = async () => {
    if (!isConnected || !account) return;
    
    try {
      setRefreshing(true);
      
      // Load stake info
      const info = await getStakeInfo();
      setStakeInfo(info);
      
      // Check if withdraw is available
      const canWithdrawNow = await canWithdraw();
      setWithdrawAvailable(canWithdrawNow);
      
      // Load balance
      const balance = await provider.getBalance(account);
      setBalance(ethers.formatEther(balance));
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle unbond
  const handleUnbond = async () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      alert("Please enter a valid amount to unstake");
      return;
    }

    try {
      const amountWei = ethers.parseUnits(unstakeAmount.toString(), 18);
      await unbond(amountWei);
      
      alert(`Successfully unbonded ${unstakeAmount} ZTC! Wait for the unbonding period to withdraw.`);
      setUnstakeAmount("");
      
    } catch (error) {
      alert(`Unbond failed: ${error.message}`);
    }
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    try {
      await withdraw();
      alert("Successfully withdrew unbonded tokens!");
      
    } catch (error) {
      alert(`Withdraw failed: ${error.message}`);
    }
  };

  // Handle fast unstake
  const handleFastUnstake = async () => {
    try {
      await fastUnstake();
      alert("Successfully registered for fast unstake!");
      
    } catch (error) {
      alert(`Fast unstake failed: ${error.message}`);
    }
  };

  // Handle cancel fast unstake
  const handleCancelFastUnstake = async () => {
    try {
      await cancelFastUnstake();
      alert("Successfully canceled fast unstake registration!");
      
    } catch (error) {
      alert(`Cancel fast unstake failed: ${error.message}`);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: '1200px', mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ 
          fontWeight: 700, 
          color: '#00ff88',
          textShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
          mb: 2
        }}>
          Advanced Unstaking
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Normal unstake with unbonding period or fast unstake for immediate withdrawal
        </Typography>
      </Box>

      {/* Wallet Connection */}
      <Card sx={{ 
        mb: 4,
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(20, 20, 20, 0.8) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 255, 136, 0.3)',
        boxShadow: '0 0 20px rgba(0, 255, 136, 0.1)',
        borderRadius: 3
      }}>
        <CardContent>
          {!isConnected ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <AccountBalanceWallet sx={{ fontSize: 64, color: '#00ff88', mb: 2 }} />
              <Typography variant="h5" sx={{ mb: 2, color: 'white' }}>
                Connect Your Wallet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Use the "CONNECT WALLET" button in the navbar to connect your MetaMask wallet
              </Typography>
            </Box>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#00ff88', color: 'black' }}>
                    <AccountBalanceWallet />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ color: 'white' }}>
                      {shortenAddress(account)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Balance: {formatNumber(balance)} ZTC
                    </Typography>
                  </Box>
                </Box>
                
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={loadData}
                  disabled={loading || refreshing}
                  sx={{
                    borderColor: '#00ff88',
                    color: '#00ff88',
                    '&:hover': {
                      borderColor: '#00ff88',
                      backgroundColor: 'rgba(0, 255, 136, 0.1)'
                    }
                  }}
                >
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {account && (
        <>
          {/* Stake Information */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ 
                p: 3, 
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(20, 20, 20, 0.8) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                borderRadius: 3
              }}>
                <CheckCircle sx={{ fontSize: 40, color: '#00ff88', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#00ff88', mb: 1 }}>
                  {formatNumber(stakeInfo.active)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Staked (ZTC)
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ 
                p: 3, 
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(20, 20, 20, 0.8) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 193, 7, 0.3)',
                borderRadius: 3
              }}>
                <Warning sx={{ fontSize: 40, color: '#ffc107', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffc107', mb: 1 }}>
                  {formatNumber(stakeInfo.pending)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Unbond (ZTC)
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ 
                p: 3, 
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(20, 20, 20, 0.8) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(33, 150, 243, 0.3)',
                borderRadius: 3
              }}>
                <TrendingDown sx={{ fontSize: 40, color: '#2196f3', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3', mb: 1 }}>
                  {formatNumber(stakeInfo.total)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Staked (ZTC)
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Normal Unstake Section */}
          <Card sx={{ 
            mb: 4,
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(20, 20, 20, 0.8) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 255, 136, 0.3)',
            boxShadow: '0 0 20px rgba(0, 255, 136, 0.1)',
            borderRadius: 3
          }}>
            <CardHeader
              avatar={<TrendingDown sx={{ color: '#00ff88' }} />}
              title="Normal Unstake"
              subheader="Unbond tokens with standard unbonding period"
            />
            <CardContent>
              {/* Unbond Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ color: '#00ff88', mb: 2 }}>
                  Step 1: Unbond Tokens
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ color: '#00ff88', mb: 1, fontWeight: 500 }}>
                    Amount to Unbond (ZTC)
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    borderRadius: 1,
                    px: 2,
                    py: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    '&:hover': {
                      borderColor: '#00ff88'
                    },
                    '&:focus-within': {
                      borderColor: '#00ff88',
                      boxShadow: '0 0 10px rgba(0, 255, 136, 0.2)'
                    }
                  }}>
                    <TextField
                      type="number"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      placeholder="0"
                      variant="standard"
                      InputProps={{
                        disableUnderline: true,
                        sx: {
                          color: 'white',
                          '& input': {
                            textAlign: 'left',
                            fontSize: '1rem'
                          }
                        }
                      }}
                      sx={{ 
                        flex: 1,
                        '& .MuiInput-root': {
                          '&:before': { display: 'none' },
                          '&:after': { display: 'none' }
                        }
                      }}
                    />
                    <Button
                      size="small"
                      onClick={() => setUnstakeAmount(stakeInfo.active)}
                      sx={{
                        minWidth: 'auto',
                        px: 2,
                        py: 0.5,
                        fontSize: '0.75rem',
                        backgroundColor: '#00ff88',
                        color: 'black',
                        fontWeight: 600,
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: '#00e677',
                          transform: 'scale(1.05)'
                        }
                      }}
                    >
                      MAX
                    </Button>
                    <Chip 
                      label="ZTC" 
                      size="small" 
                      sx={{ 
                        bgcolor: '#00ff88', 
                        color: 'black',
                        ml: 1,
                        fontWeight: 600
                      }} 
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                    Available to unbond: {formatNumber(stakeInfo.active)} ZTC
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<TrendingDown />}
                  onClick={handleUnbond}
                  disabled={loading || !unstakeAmount || parseFloat(unstakeAmount) <= 0}
                  fullWidth
                  sx={{
                    background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
                    boxShadow: '0 0 20px rgba(255, 107, 107, 0.3)',
                    border: '1px solid rgba(255, 107, 107, 0.5)',
                    color: 'white',
                    fontWeight: 600,
                    py: 1.5,
                    '&:hover': {
                      boxShadow: '0 0 40px rgba(255, 107, 107, 0.7)',
                      border: '1px solid rgba(255, 107, 107, 1)',
                      transform: 'translateY(-2px) scale(1.05)',
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Unbond Tokens'}
                </Button>
              </Box>

              <Divider sx={{ my: 3, borderColor: 'rgba(0, 255, 136, 0.3)' }} />

              {/* Withdraw Section */}
              <Box>
                <Typography variant="h6" sx={{ color: '#00ff88', mb: 2 }}>
                  Step 2: Withdraw Unbonded Tokens
                </Typography>
                <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Pending to withdraw: {formatNumber(stakeInfo.pending)} ZTC
                  </Typography>
                  <Typography variant="body2" sx={{ color: withdrawAvailable ? '#00ff88' : '#ff9800', fontWeight: 600 }}>
                    {parseFloat(stakeInfo.pending) === 0 
                      ? "No unbonded tokens pending"
                      : withdrawAvailable 
                        ? "✅ Withdraw available now!" 
                        : "⏳ Withdraw available after unbonding period"
                    }
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CheckCircle />}
                  onClick={handleWithdraw}
                  disabled={loading || !withdrawAvailable || parseFloat(stakeInfo.pending) === 0}
                  fullWidth
                  sx={{
                    background: (withdrawAvailable && parseFloat(stakeInfo.pending) > 0)
                      ? 'linear-gradient(45deg, #4caf50, #66bb6a)'
                      : 'linear-gradient(45deg, #666, #888)',
                    boxShadow: (withdrawAvailable && parseFloat(stakeInfo.pending) > 0)
                      ? '0 0 20px rgba(76, 175, 80, 0.3)'
                      : 'none',
                    border: (withdrawAvailable && parseFloat(stakeInfo.pending) > 0)
                      ? '1px solid rgba(76, 175, 80, 0.5)'
                      : '1px solid rgba(128, 128, 128, 0.3)',
                    color: 'white',
                    fontWeight: 600,
                    py: 1.5,
                    '&:hover': (withdrawAvailable && parseFloat(stakeInfo.pending) > 0) ? {
                      boxShadow: '0 0 40px rgba(76, 175, 80, 0.7)',
                      border: '1px solid rgba(76, 175, 80, 1)',
                      transform: 'translateY(-2px) scale(1.05)',
                    } : {},
                    '&:disabled': {
                      opacity: 0.6,
                      cursor: 'not-allowed'
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Withdraw Tokens'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Fast Unstake Section */}
          <Card sx={{ 
            mb: 4,
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(20, 20, 20, 0.8) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            boxShadow: '0 0 20px rgba(255, 193, 7, 0.1)',
            borderRadius: 3
          }}>
            <CardHeader
              avatar={<Speed sx={{ color: '#ffc107' }} />}
              title="Fast Unstake"
              subheader="Immediate unstake without unbonding period (if eligible)"
            />
            <CardContent>
              <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(255, 193, 7, 0.1)', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ color: '#ffc107', mb: 1, fontWeight: 600 }}>
                  ⚡ Fast Unstake Requirements:
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  • No active nominations in recent eras
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  • No recent staking rewards received
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  • Account must be inactive for sufficient time
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<FlashOn />}
                  onClick={handleFastUnstake}
                  disabled={loading}
                  fullWidth
                  sx={{
                    background: 'linear-gradient(45deg, #ffc107, #ffeb3b)',
                    boxShadow: '0 0 20px rgba(255, 193, 7, 0.3)',
                    border: '1px solid rgba(255, 193, 7, 0.5)',
                    color: 'black',
                    fontWeight: 600,
                    py: 1.5,
                    '&:hover': {
                      boxShadow: '0 0 40px rgba(255, 193, 7, 0.7)',
                      border: '1px solid rgba(255, 193, 7, 1)',
                      transform: 'translateY(-2px) scale(1.05)',
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Register Fast Unstake'}
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Cancel />}
                  onClick={handleCancelFastUnstake}
                  disabled={loading}
                  fullWidth
                  sx={{
                    borderColor: '#ffc107',
                    color: '#ffc107',
                    fontWeight: 600,
                    py: 1.5,
                    '&:hover': {
                      borderColor: '#ffc107',
                      backgroundColor: 'rgba(255, 193, 7, 0.1)',
                      transform: 'translateY(-2px) scale(1.05)',
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Cancel Fast Unstake'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Last Transaction */}
          {lastTx && (
            <Card sx={{ 
              mb: 4,
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(20, 20, 20, 0.8) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(33, 150, 243, 0.3)',
              borderRadius: 3
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#2196f3', mb: 2 }}>
                  Last Transaction
                </Typography>
                <Chip 
                  label={`${lastTx.slice(0, 10)}...${lastTx.slice(-8)}`}
                  sx={{ 
                    bgcolor: 'rgba(33, 150, 243, 0.2)', 
                    color: '#2196f3',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => window.open(`https://zentrace.io/tx/${lastTx}`, '_blank')}
                  clickable
                />
              </CardContent>
            </Card>
          )}

          {/* Status Messages */}
          {error && (
            <Alert 
              severity="error" 
              onClose={clearError}
              sx={{ 
                mb: 2,
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                border: '1px solid rgba(244, 67, 54, 0.3)',
                color: 'white',
                '& .MuiAlert-icon': { color: '#ff5722' }
              }}
            >
              {error}
            </Alert>
          )}
        </>
      )}
    </Box>
  );
};

export default UnstakePage;
