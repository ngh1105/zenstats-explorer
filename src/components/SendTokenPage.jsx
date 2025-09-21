import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  TextField,
  Container,
  Alert,
  CircularProgress,
  Chip,
  Avatar,
  Divider
} from '@mui/material';
import { 
  Send, 
  ArrowBack, 
  AccountBalanceWallet,
  CheckCircle,
  Warning,
  Refresh
} from '@mui/icons-material';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';
import TxHashBox from './TxHashBox';

const SendTokenPage = ({ onNavigate }) => {
  const { account, provider, isConnected } = useWallet();
  const { showTxToast, showErrorToast, showSuccessToast } = useToast();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // ZTC Token Contract Address (you may need to update this)
  const ZTC_CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890"; // Replace with actual ZTC contract address
  
  // ERC20 ABI for transfer function
  const ERC20_ABI = [
    "function transfer(address to, uint256 amount) returns (bool)",
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
  ];

  // Load ZTC balance
  const loadBalance = async () => {
    if (!isConnected || !provider || !account) return;
    
    try {
      setLoadingBalance(true);
      
      // For now, use native ETH balance as ZTC (since ZTC might be the native token)
      // If ZTC is an ERC20 token, uncomment the ERC20 contract code below
      
      const balance = await provider.getBalance(account);
      setBalance(ethers.formatEther(balance));
      
      /* If ZTC is an ERC20 token, use this instead:
      const contract = new ethers.Contract(ZTC_CONTRACT_ADDRESS, ERC20_ABI, provider);
      const balance = await contract.balanceOf(account);
      const decimals = await contract.decimals();
      setBalance(ethers.formatUnits(balance, decimals));
      */
      
    } catch (error) {
      console.error('Error loading balance:', error);
      setBalance('0');
    } finally {
      setLoadingBalance(false);
    }
  };

  // Load balance on component mount and when account changes
  useEffect(() => {
    loadBalance();
  }, [isConnected, account, provider]);

  const handleSendToken = async () => {
    if (!isConnected || !provider) {
      setError('Please connect your wallet first');
      return;
    }

    if (!recipient || !amount) {
      setError('Please fill in all fields');
      return;
    }

    if (!ethers.isAddress(recipient)) {
      setError('Invalid recipient address');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Invalid amount');
      return;
    }

    if (amountNum > parseFloat(balance)) {
      setError('Insufficient balance');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess(false);
      setTxHash('');
      
      const signer = await provider.getSigner();
      
      // For native ZTC (if ZTC is the native token like ETH)
      const amountWei = ethers.parseEther(amount);
      
      // Send native token transaction
      const tx = await signer.sendTransaction({
        to: recipient,
        value: amountWei
      });

      /* If ZTC is an ERC20 token, use this instead:
      const contract = new ethers.Contract(ZTC_CONTRACT_ADDRESS, ERC20_ABI, signer);
      const decimals = await contract.decimals();
      const amountWei = ethers.parseUnits(amount, decimals);
      const tx = await contract.transfer(recipient, amountWei);
      */

      setTxHash(tx.hash);
      
      // Wait for confirmation
      await tx.wait();
      
      setSuccess(true);
      
      // Store in transaction history
      const txHistory = JSON.parse(localStorage.getItem('zenstats:txHistory') || '[]');
      const txData = {
        type: 'send',
        hash: tx.hash,
        ts: Date.now(),
        from: account,
        to: recipient,
        amount: amount,
        status: 'completed'
      };
      
      txHistory.unshift(txData);
      localStorage.setItem('zenstats:txHistory', JSON.stringify(txHistory.slice(0, 100)));
      
      // Show success toast with transaction hash
      showTxToast('✅ Token sent!', tx.hash);
      
      // Refresh balance
      await loadBalance();
      
      // Clear form
      setRecipient('');
      setAmount('');
      
    } catch (err) {
      console.error('Send failed:', err);
      setError(err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMaxClick = () => {
    // Leave some ZTC for gas fees
    const maxAmount = Math.max(0, parseFloat(balance) - 0.01);
    setAmount(maxAmount.toString());
  };

  const goBack = () => {
    if (onNavigate) {
      onNavigate('/quest');
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={goBack}
            sx={{
              color: '#00ff88',
              mb: 3,
              '&:hover': {
                backgroundColor: 'rgba(0, 255, 136, 0.1)'
              }
            }}
          >
            Back to Quest Hub
          </Button>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ 
              bgcolor: 'rgba(0, 255, 136, 0.2)',
              border: '1px solid #00ff88',
              width: 48, 
              height: 48 
            }}>
              <Send sx={{ color: '#00ff88' }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: '#00ff88',
                textShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
              }}>
                Send Token Quest
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Transfer ZTC to another wallet address
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip 
              label="100 XP Reward"
              sx={{
                bgcolor: 'rgba(251, 191, 36, 0.2)',
                color: '#fbbf24',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                fontWeight: 600
              }}
            />
            {isConnected && (
              <Chip 
                label={loadingBalance ? 'Loading...' : `Balance: ${parseFloat(balance).toFixed(4)} ZTC`}
                icon={<Refresh 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { transform: 'rotate(180deg)' },
                    transition: 'transform 0.3s ease'
                  }} 
                  onClick={loadBalance}
                />}
                sx={{
                  bgcolor: 'rgba(0, 255, 136, 0.2)',
                  color: '#00ff88',
                  border: '1px solid rgba(0, 255, 136, 0.3)',
                  fontWeight: 600,
                  fontFamily: 'monospace'
                }}
              />
            )}
          </Box>
        </Box>

        {/* Main Content */}
        <Card sx={{
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 255, 136, 0.3)',
          borderRadius: 3
        }}>
          <CardContent sx={{ p: 4 }}>
            {!isConnected ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <AccountBalanceWallet sx={{ fontSize: 64, color: '#00ff88', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Connect Your Wallet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  You need to connect your wallet to send tokens
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Send ZTC Tokens
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ color: '#00ff88', mb: 1, fontWeight: 500 }}>
                    Recipient Address
                  </Typography>
                  <TextField
                    fullWidth
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="0x..."
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(0, 255, 136, 0.3)',
                        borderRadius: 1,
                        '&:hover': {
                          borderColor: '#00ff88'
                        },
                        '&.Mui-focused': {
                          borderColor: '#00ff88',
                          boxShadow: '0 0 10px rgba(0, 255, 136, 0.2)'
                        },
                        '& fieldset': {
                          border: 'none'
                        }
                      },
                      '& input': {
                        color: 'white',
                        fontFamily: 'monospace'
                      }
                    }}
                  />
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="body2" sx={{ color: '#00ff88', mb: 1, fontWeight: 500 }}>
                    Amount (ZTC)
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
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.0"
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
                      onClick={handleMaxClick}
                      disabled={loadingBalance || parseFloat(balance) === 0}
                      sx={{
                        minWidth: 'auto',
                        px: 2,
                        py: 0.5,
                        fontSize: '0.75rem',
                        backgroundColor: '#00ff88',
                        color: 'black',
                        fontWeight: 600,
                        borderRadius: 1,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: '#00e677',
                          transform: 'scale(1.05)'
                        },
                        '&:disabled': {
                          opacity: 0.5
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
                </Box>

                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      backgroundColor: 'rgba(244, 67, 54, 0.1)',
                      border: '1px solid rgba(244, 67, 54, 0.3)',
                      color: 'white',
                      '& .MuiAlert-icon': { color: '#ff5722' }
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <Button
                  variant="contained"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                  onClick={handleSendToken}
                  disabled={loading || !recipient || !amount}
                  fullWidth
                  sx={{
                    background: 'linear-gradient(45deg, #00ff88, #00bfff)',
                    border: '1px solid rgba(0, 255, 136, 0.5)',
                    color: 'white',
                    fontWeight: 600,
                    py: 1.5,
                    '&:hover': {
                      boxShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
                      transform: 'translateY(-2px)',
                    },
                    '&:disabled': {
                      opacity: 0.6
                    }
                  }}
                >
                  {loading ? 'Sending...' : 'Send ZTC'}
                </Button>

                {/* Transaction Hash Display */}
                {txHash && (
                  <Box sx={{ mt: 3 }}>
                    <TxHashBox 
                      hash={txHash}
                      type="success"
                      label="Transaction sent!"
                    />
                  </Box>
                )}


                <Divider sx={{ my: 3, borderColor: 'rgba(0, 255, 136, 0.2)' }} />

                <Box sx={{ p: 2, bgcolor: 'rgba(0, 191, 255, 0.1)', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ color: '#00bfff', fontWeight: 600, mb: 1 }}>
                    💡 Quest Tips:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Make sure the recipient address is correct - transactions cannot be reversed<br/>
                    • Start with a small amount for testing<br/>
                    • You'll need some ZTC for gas fees
                  </Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default SendTokenPage;
