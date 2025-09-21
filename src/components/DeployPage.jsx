import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Container,
  Alert,
  CircularProgress,
  Chip,
  Avatar,
  Divider,
  Paper
} from '@mui/material';
import { 
  Code, 
  ArrowBack, 
  AccountBalanceWallet,
  CheckCircle,
  Rocket
} from '@mui/icons-material';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';
import { deploySimpleStorage } from '../hooks/useDeploySimpleStorage';
import TxHashBox from './TxHashBox';

const DeployPage = ({ onNavigate }) => {
  const { account, provider, isConnected } = useWallet();
  const { showTxToast, showErrorToast, showSuccessToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);


  const handleDeployContract = async () => {
    if (!isConnected || !provider) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess(false);
      setTxHash('');
      setContractAddress('');
      
      console.log("Starting deployment with new hook...");
      
      // Use the proper deployment hook
      const result = await deploySimpleStorage(provider);
      
      setTxHash(result.txHash);
      setContractAddress(result.address);
      setSuccess(true);
      
      // Show success toast with transaction hash
      showTxToast('🚀 Contract deployed!', result.txHash);
      
      console.log("Deployment successful:", result);
      
    } catch (err) {
      console.error('Deploy failed:', err);
      setError(err.message || 'Contract deployment failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
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
              color: '#00bfff',
              mb: 3,
              '&:hover': {
                backgroundColor: 'rgba(0, 191, 255, 0.1)'
              }
            }}
          >
            Back to Quest Hub
          </Button>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ 
              bgcolor: 'rgba(0, 191, 255, 0.2)',
              border: '1px solid #00bfff',
              width: 48, 
              height: 48 
            }}>
              <Code sx={{ color: '#00bfff' }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: '#00bfff',
                textShadow: '0 0 10px rgba(0, 191, 255, 0.5)'
              }}>
                Deploy Contract Quest
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Deploy your first smart contract to ZenChain
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              label="500 XP Reward"
              sx={{
                bgcolor: 'rgba(251, 191, 36, 0.2)',
                color: '#fbbf24',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                fontWeight: 600
              }}
            />
            <Chip 
              label="Advanced"
              sx={{
                bgcolor: 'rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                fontWeight: 600
              }}
            />
          </Box>
        </Box>

        {/* Contract Code Preview */}
        <Card sx={{
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 191, 255, 0.3)',
          borderRadius: 3,
          mb: 3
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#00bfff', fontWeight: 600 }}>
              📜 Simple Storage Contract
            </Typography>
            <Paper sx={{ 
              p: 2, 
              bgcolor: 'rgba(0, 0, 0, 0.5)', 
              border: '1px solid rgba(0, 191, 255, 0.2)',
              borderRadius: 1
            }}>
              <Typography variant="body2" sx={{ 
                fontFamily: 'monospace', 
                color: '#e5e7eb',
                fontSize: '0.85rem',
                lineHeight: 1.6
              }}>
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 private storedData;
    
    function set(uint256 _value) public {
        storedData = _value;
    }
    
    function get() public view returns (uint256) {
        return storedData;
    }
}`}
              </Typography>
            </Paper>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              This contract allows you to store and retrieve a number on the blockchain.
            </Typography>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card sx={{
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 191, 255, 0.3)',
          borderRadius: 3
        }}>
          <CardContent sx={{ p: 4 }}>
            {!isConnected ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <AccountBalanceWallet sx={{ fontSize: 64, color: '#00bfff', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Connect Your Wallet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  You need to connect your wallet to deploy contracts
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" sx={{ mb: 4, fontWeight: 600 }}>
                  Deploy Simple Storage Contract
                </Typography>
                
                <Button
                  variant="contained"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Rocket />}
                  onClick={handleDeployContract}
                  disabled={loading}
                  fullWidth
                  sx={{
                    background: 'linear-gradient(45deg, #00bfff, #8b5cf6)',
                    border: '1px solid rgba(0, 191, 255, 0.5)',
                    color: 'white',
                    fontWeight: 600,
                    py: 2,
                    fontSize: '1.1rem',
                    borderRadius: 2,
                    textTransform: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 0 20px rgba(0, 191, 255, 0.5)',
                      transform: 'translateY(-2px) scale(1.02)',
                    },
                    '&:disabled': {
                      opacity: 0.6
                    }
                  }}
                >
                  {loading ? 'Deploying Smart Contract...' : 'Deploy Smart Contract'}
                </Button>

                {/* Error Display */}
                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mt: 3,
                      backgroundColor: 'rgba(244, 67, 54, 0.1)',
                      border: '1px solid rgba(244, 67, 54, 0.3)',
                      color: 'white',
                      '& .MuiAlert-icon': { color: '#ff5722' }
                    }}
                  >
                    {error}
                  </Alert>
                )}

                {/* Transaction Hash Display */}
                {txHash && (
                  <Box sx={{ mt: 3 }}>
                    <TxHashBox 
                      hash={txHash}
                      type="success"
                      label="Contract deployed!"
                    />
                  </Box>
                )}

                {/* Contract Address Display */}
                {contractAddress && (
                  <Alert 
                    severity="success" 
                    sx={{ 
                      mt: 2,
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      color: 'white',
                      '& .MuiAlert-icon': { color: '#22c55e' }
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      ✅ Contract deployed at:
                    </Typography>
                    <Chip 
                      label={contractAddress}
                      sx={{ 
                        bgcolor: 'rgba(0, 191, 255, 0.2)', 
                        color: '#00bfff',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                      onClick={() => navigator.clipboard.writeText(contractAddress)}
                    />
                  </Alert>
                )}


                <Divider sx={{ my: 3, borderColor: 'rgba(0, 191, 255, 0.2)' }} />

                <Box sx={{ p: 2, bgcolor: 'rgba(138, 92, 246, 0.1)', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ color: '#8b5cf6', fontWeight: 600, mb: 1 }}>
                    💡 Quest Tips:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Make sure you have enough ZTC for gas fees<br/>
                    • Contract deployment costs more gas than regular transactions<br/>
                    • Once deployed, your contract will have a unique address on ZenChain<br/>
                    • You can interact with your contract using the address and ABI
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

export default DeployPage;
