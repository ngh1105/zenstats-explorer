import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Card, CardContent, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';
import { useWallet } from '../contexts/WalletContext';
import stakingABI from '../abi/stakingABI.json';

const STAKING_CONTRACT = "0x0000000000000000000000000000000000000800";

const UserStaked = ({ refreshTrigger }) => {
  const { account, provider } = useWallet();
  const [stake, setStake] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hàm getUserStake để lấy thông tin stake của user
  const getUserStake = async (address) => {
    if (!provider) {
      throw new Error("Provider not available");
    }

    try {
      const contract = new ethers.Contract(STAKING_CONTRACT, stakingABI, provider);
      
      // Gọi hàm stake(address) từ contract
      const stakeInfo = await contract.stake(address);
      
      // stakeInfo trả về [total, active] theo ABI
      const [total, active] = stakeInfo;
      
      // Convert từ wei sang ZTC
      const activeZTC = ethers.formatUnits(active, 18);
      const totalZTC = ethers.formatUnits(total, 18);
      
      return {
        active: activeZTC,
        total: totalZTC
      };
    } catch (err) {
      // Nếu lỗi "No stake found", trả về 0 thay vì throw error
      if (err.message && err.message.includes("No stake found")) {
        console.log('No stake found for user, returning zero values');
        return {
          active: "0",
          total: "0"
        };
      }
      
      console.error('Error fetching user stake:', err);
      throw err;
    }
  };

  // Load user stake data
  const loadUserStake = async () => {
    if (!account || !provider) {
      setStake("0");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const stakeData = await getUserStake(account);
      setStake(stakeData.total); // Sử dụng total stake amount
      
    } catch (err) {
      console.error('Error loading user stake:', err);
      setError(err.message);
      setStake("0");
    } finally {
      setLoading(false);
    }
  };

  // Load data khi account hoặc provider thay đổi
  useEffect(() => {
    loadUserStake();
  }, [account, provider]);

  // Load data khi có refreshTrigger (từ parent component)
  useEffect(() => {
    if (refreshTrigger) {
      loadUserStake();
    }
  }, [refreshTrigger]);

  // Format số với dấu phẩy
  const formatNumber = (num) => {
    return parseFloat(num).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
  };

  return (
    <Card 
      sx={{ 
        background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 191, 255, 0.1) 100%)',
        border: '1px solid rgba(0, 255, 136, 0.3)',
        borderRadius: 3,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 255, 136, 0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 40px rgba(0, 255, 136, 0.2)',
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TrendingUp 
            sx={{ 
              color: '#00ff88', 
              fontSize: 28, 
              mr: 2,
              filter: 'drop-shadow(0 0 8px rgba(0, 255, 136, 0.5))'
            }} 
          />
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'white', 
              fontWeight: 600,
              textShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
            }}
            >
              Total Staked (ZTC)
            </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
            <CircularProgress 
              size={24} 
              sx={{ 
                color: '#00ff88',
                mr: 2
              }} 
            />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Loading...
            </Typography>
          </Box>
        ) : error ? (
          <Alert 
            severity="error" 
            sx={{ 
              backgroundColor: 'rgba(255, 107, 107, 0.1)',
              border: '1px solid rgba(255, 107, 107, 0.3)',
              color: '#ff6b6b'
            }}
          >
            {error}
          </Alert>
        ) : (
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                color: '#00ff88',
                fontWeight: 700,
                textShadow: '0 0 20px rgba(0, 255, 136, 0.6)',
                mb: 1
              }}
            >
              {formatNumber(stake)}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.9rem',
                opacity: 0.8
              }}
              >
                Total Staked Amount
              </Typography>
          </Box>
        )}

        {!account && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              mt: 2,
              fontStyle: 'italic'
            }}
          >
            Connect wallet to view your staked amount
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default UserStaked;
