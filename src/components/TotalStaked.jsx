import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { TrendingUp } from '@mui/icons-material';
import { useWallet } from '../contexts/WalletContext';
import { formatNumber } from '../utils/helpers';
import stakingABI from '../abi/stakingABI.json';

// Contract configuration
const STAKING_CONTRACT = "0x0000000000000000000000000000000000000800";
const CONTRACT_ABI = stakingABI;

const TotalStaked = () => {
  const { provider } = useWallet();
  const [totalStaked, setTotalStaked] = useState("0");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load total staked amount
  const loadTotalStaked = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!provider) {
        throw new Error('Wallet not connected');
      }

      const contract = new ethers.Contract(STAKING_CONTRACT, CONTRACT_ABI, provider);

      // Get current era
      const currentEra = await contract.activeEra();
      console.log('Current era:', currentEra.toString());

      // Get total stake for current era
      const totalStake = await contract.erasTotalStake(currentEra);
      console.log('Total stake (wei):', totalStake.toString());

      // Convert to ZTC (formatEther)
      const totalStakedZTC = ethers.formatEther(totalStake);
      setTotalStaked(totalStakedZTC);

    } catch (err) {
      console.error('Error loading total staked:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load data when provider is available
  useEffect(() => {
    if (provider) {
      loadTotalStaked();
    }
  }, [provider]);

  return (
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
            <TrendingUp sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Total Staked (ZTC)
          </Typography>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
            <CircularProgress sx={{ color: '#00ff88', mr: 2 }} size={24} />
            <Typography variant="body2" color="text.secondary">
              Loading...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              color: 'white',
              '& .MuiAlert-icon': { color: '#ff5722' }
            }}
          >
            Error: {error}
          </Alert>
        )}

        {!loading && !error && (
          <>
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              color: '#00ff88', 
              mb: 1,
              textShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
            }}>
              {formatNumber(totalStaked)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current Era Total
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TotalStaked;
