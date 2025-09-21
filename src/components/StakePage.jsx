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
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Avatar
} from '@mui/material';
import { 
  AccountBalanceWallet, 
  TrendingUp, 
  TrendingDown, 
  AttachMoney,
  Refresh,
  CheckCircle,
  Warning,
  FlashOn
} from '@mui/icons-material';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';
import { shortenAddress, formatNumber } from '../utils/helpers';
import { claimRewards, canClaimRewards, checkNominations, getTxHistory } from '../utils/rewards';
import stakingABI from '../abi/stakingABI.json';
import UserStaked from './UserStaked';
// Contract configuration
const STAKING_CONTRACT = "0x0000000000000000000000000000000000000800"; // Replace with actual contract address
const CONTRACT_ABI = stakingABI;


const StakePage = () => {
  // Get wallet state from context
  const { account, provider, isConnected } = useWallet();
  const { showTxToast, showErrorToast, showSuccessToast } = useToast();
  
  // Local state
  const [balance, setBalance] = useState("0");
  const [totalStaked, setTotalStaked] = useState("0");
  const [contract, setContract] = useState(null);
  
  
  // User stats
  const [userStats, setUserStats] = useState({
    staked: "0",
    rewards: "0"
  });
  
  // Form states
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [unstakeMethod, setUnstakeMethod] = useState("batchall"); // "batchall" or "fastunstake"
  
  // Rewards states
  const [canClaim, setCanClaim] = useState(false);
  const [hasNominations, setHasNominations] = useState(false);
  const [nominatedValidators, setNominatedValidators] = useState([]);
  const [claimTxHashes, setClaimTxHashes] = useState([]);
  const [rewardsLoading, setRewardsLoading] = useState(false);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Initialize contract when provider is available
  useEffect(() => {
    if (provider && account) {
      const contract = new ethers.Contract(STAKING_CONTRACT, CONTRACT_ABI, provider);
      setContract(contract);
      
      // Load user stats
      loadUserStats(contract, account);
      
      // Get balance
      loadBalance();
      
      // Load rewards data
      loadRewardsData();
    }
  }, [provider, account]);

  // Load rewards data
  const loadRewardsData = async () => {
    if (!provider || !account) return;
    
    try {
      // Check if rewards can be claimed
      const rewardsEligibility = await canClaimRewards(provider);
      setCanClaim(rewardsEligibility.canClaim);
      
      // Check nominations
      const nominations = await checkNominations(provider, account);
      setHasNominations(nominations.hasNominations);
      setNominatedValidators(nominations.validators);
      
      // Load recent claim transaction hashes
      const txHistory = getTxHistory();
      const recentClaimTxs = txHistory
        .filter(tx => tx.type === 'claim')
        .slice(0, 5)
        .map(tx => tx.hash);
      setClaimTxHashes(recentClaimTxs);
      
    } catch (error) {
      console.error('Error loading rewards data:', error);
    }
  };

  // Load balance
  const loadBalance = async () => {
    if (provider && account) {
      try {
        const balance = await provider.getBalance(account);
        setBalance(ethers.formatEther(balance));
        } catch (err) {
        console.error('Error loading balance:', err);
        }
      }
    };


  // Load user statistics
  const loadUserStats = async (contract, userAddress) => {
    try {
      // Use the stake function to get staking info
      const [total, active] = await contract.stake(userAddress);
      const activeStaked = ethers.formatEther(active);
      const totalStakedAmount = ethers.formatEther(total);
      
      setUserStats({
        staked: activeStaked, // Use active stake amount
        rewards: "0" // Rewards calculation would need more complex logic
      });
      
      // Set total staked for unstake form
      setTotalStaked(totalStakedAmount);
    } catch (err) {
      console.error('Error loading user stats:', err);
      // Set default values if contract call fails
      setUserStats({
        staked: "0",
        rewards: "0"
      });
      setTotalStaked("0");
    }
  };

  // Stake function
  const handleStake = async () => {
    try {
      if (!contract || !account) {
        alert("Please connect your wallet first");
        return;
      }

      const amount = parseFloat(stakeAmount);
      if (isNaN(amount) || amount <= 0) {
        alert("Amount must be greater than 0");
        return;
      }

      // Convert ZTC → wei using ethers.parseUnits
      const amountWei = ethers.parseUnits(amount.toString(), 18);

      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);

      // Check current stake with error handling
      const currentStake = await contract.stake(account).catch(() => null);

      let tx;
      if (!currentStake || currentStake.total === 0n) {
        // First time staking must use bondWithRewardDestination
        // dest = 0 => Staked (restake), you can change to 2 if you want to return to account
        tx = await contractWithSigner.bondWithRewardDestination(amountWei, 0);
      } else {
        // If already staked, just use bondExtra
        tx = await contractWithSigner.bondExtra(amountWei);
      }

      setTxHash(tx.hash);
      setSuccess(`Stake transaction submitted: ${tx.hash}`);
      
      // Wait for confirmation
      await tx.wait();
      
      showTxToast('📈 Stake successful!', tx.hash);
      setSuccess('Stake successful!');
      
      // Refresh stake info
      await refreshStakeInfo();
      
      // Trigger refresh for UserStaked component
      setRefreshTrigger(prev => prev + 1);
      
      // Reset form
      setStakeAmount("");
      
    } catch (err) {
      console.error("Stake failed:", err);
      showErrorToast("Stake failed: " + (err.reason || err.message));
      setError(err.message);
    }
  };

  // Unstake function - supports both BatchAll and FastUnstake methods
  const handleUnstake = async () => {
    try {
      if (!contract || !account) {
        showErrorToast("Please connect your wallet first");
        return;
      }

      if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
        showErrorToast("Please enter a valid amount to unstake");
        return;
      }

      setLoading(true);
      setError(null);
      
      const signer = await provider.getSigner();
      
      // Convert unstakeAmount to wei
      const amountInWei = ethers.parseUnits(unstakeAmount.toString(), 18);
      
      if (unstakeMethod === "fastunstake") {
        // FastUnstake method
        console.log("Attempting FastUnstake...");
        
        const FAST_UNSTAKE_ADDRESS = "0x0000000000000000000000000000000000000801";
        const fastUnstakeABI = [
          "function registerFastUnstake()"
        ];
        
        const fastUnstakeContract = new ethers.Contract(FAST_UNSTAKE_ADDRESS, fastUnstakeABI, signer);
        
        // FastUnstake doesn't take amount parameter - it unstakes everything
        const tx = await fastUnstakeContract.registerFastUnstake();
      
      setTxHash(tx.hash);
        setSuccess(`FastUnstake transaction submitted: ${tx.hash}`);
      
      // Wait for confirmation
        const receipt = await tx.wait();
        
        if (receipt.status === 1) {
          showTxToast('⚡ FastUnstake registered!', tx.hash);
          setSuccess('FastUnstake registration successful! Check if you meet the eligibility requirements.');
        } else {
          throw new Error('FastUnstake transaction failed');
        }
        
      } else {
        // BatchAll method (default)
        try {
          console.log("Attempting BatchAll unstake...");
          
          // NativeStaking contract address and ABI
          const NATIVE_STAKING_ADDRESS = "0x0000000000000000000000000000000000000800";
          const nativeStakingABI = [
            "function unbond(uint256 value)",
            "function withdrawUnbonded(uint32 numSlashingSpans)"
          ];
          
          // BatchAll contract address and ABI
          const BATCH_ALL_ADDRESS = "0x0000000000000000000000000000000000000808";
          const batchAllABI = [
            "function batchAll(address[] calldata to, uint256[] calldata value, bytes[] calldata callData, uint64[] calldata gasLimit)"
          ];
          
          // Create contract instances
          const nativeStakingContract = new ethers.Contract(NATIVE_STAKING_ADDRESS, nativeStakingABI, signer);
          const batchAllContract = new ethers.Contract(BATCH_ALL_ADDRESS, batchAllABI, signer);
          
          // Create calldata for unbond(value)
          const unbondCalldata = nativeStakingContract.interface.encodeFunctionData("unbond", [amountInWei]);
          
          // Create calldata for withdrawUnbonded(0)
          const withdrawCalldata = nativeStakingContract.interface.encodeFunctionData("withdrawUnbonded", [0]);
          
          // Prepare batch call parameters
          const addresses = [NATIVE_STAKING_ADDRESS, NATIVE_STAKING_ADDRESS];
          const values = [0, 0]; // No ETH value needed
          const calldataArray = [unbondCalldata, withdrawCalldata];
          const gasLimits = [300000, 300000]; // Gas limits for each call
          
          // Execute batch transaction
          const tx = await batchAllContract.batchAll(addresses, values, calldataArray, gasLimits);
          
          setTxHash(tx.hash);
          setSuccess(`BatchAll unstake transaction submitted: ${tx.hash}`);
          
          // Wait for confirmation
          const receipt = await tx.wait();
          
          if (receipt.status === 1) {
            showTxToast(`📉 BatchAll unstake successful! ${unstakeAmount} ZTC processed`, tx.hash);
            setSuccess('BatchAll unstake successful! Your ZTC has been processed.');
          } else {
            throw new Error('BatchAll transaction failed');
          }
          
        } catch (batchError) {
          console.log("BatchAll failed, falling back to simple unbond:", batchError.message);
          
          // Fallback to simple unbond
      const contractWithSigner = contract.connect(signer);
      
          // Call unbond function
          const tx = await contractWithSigner.unbond(amountInWei);
      
      setTxHash(tx.hash);
          setSuccess(`Unbond transaction submitted: ${tx.hash}`);
      
      // Wait for confirmation
      await tx.wait();
          
          showTxToast(`🔓 Unbond successful! ${unstakeAmount} ZTC unbonding`, tx.hash);
          setSuccess(`Unbond successful! Please wait for the unbonding period before withdrawing.`);
        }
      }
      
      // Refresh stake info to update UI
      await refreshStakeInfo();
      await loadBalance();
      
      // Trigger refresh for UserStaked component
      setRefreshTrigger(prev => prev + 1);
      
      // Reset form
      setUnstakeAmount("");
      
    } catch (err) {
      console.error("Unstake failed:", err);
      let errorMessage = err.message || err.reason || "Unknown error";
      
      // Handle specific FastUnstake errors
      if (unstakeMethod === "fastunstake") {
        if (errorMessage.includes('NotEligible') || errorMessage.includes('not eligible')) {
          errorMessage = 'Not eligible for FastUnstake. You may have active nominations or recent staking activity.';
        } else if (errorMessage.includes('NotFullyBonded')) {
          errorMessage = 'FastUnstake failed: Your account is not fully bonded or has pending unbonding requests. Please use BatchAll unstake instead.';
        } else if (errorMessage.includes('AlreadyQueued')) {
          errorMessage = 'FastUnstake failed: You are already queued for fast unstake. Please wait for the process to complete.';
        } else if (errorMessage.includes('NotQueued')) {
          errorMessage = 'FastUnstake failed: You are not queued for fast unstake.';
        } else if (errorMessage.includes('CallNotAllowed')) {
          errorMessage = 'FastUnstake failed: This operation is not allowed at this time. Try again later.';
        }
      }
      
      showErrorToast("Unstake failed: " + errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Claim rewards function using the new rewards module
  const handleClaimRewards = async () => {
    if (!provider || !account) {
      setError('Please connect wallet first');
        return;
      }

    if (!canClaim) {
      setError('No valid era to claim rewards from');
        return;
      }

    if (!hasNominations) {
      setError('No nominations found. You need to nominate validators to earn rewards.');
        return;
      }

    try {
      setRewardsLoading(true);
      setError(null);
      setSuccess(null);
      
      // Call the rewards claiming function
      const txHashes = await claimRewards(provider, account);
      
      if (txHashes.length > 0) {
        setClaimTxHashes(txHashes);
        setSuccess(`Successfully claimed rewards! ${txHashes.length} transaction${txHashes.length > 1 ? 's' : ''} completed.`);
        
        // Refresh data
      await refreshStakeInfo();
      await loadBalance();
        await loadRewardsData();
      
      // Trigger refresh for UserStaked component
      setRefreshTrigger(prev => prev + 1);
        
      } else {
        setSuccess('No new rewards to claim. All available rewards may have been claimed already.');
      }
      
    } catch (err) {
      console.error('Error claiming rewards:', err);
      const errorMessage = err.message || 'Failed to claim rewards';
      setError(errorMessage);
    } finally {
      setRewardsLoading(false);
    }
  };


  // Refresh stake info function
  const refreshStakeInfo = async () => {
    try {
      if (!account) throw new Error("Wallet not connected");

      const stakeInfo = await contract.stake(account).catch(() => null);
      
      if (stakeInfo) {
        // Parse properly from BigNumber to number
        const active = Number(ethers.formatUnits(stakeInfo.active, 18));
        const total = Number(ethers.formatUnits(stakeInfo.total, 18));

        // Update state
        setUserStats(prev => ({
          ...prev,
          staked: active.toFixed(2), // Active stake (can be unstaked)
          rewards: "0"
        }));
        setTotalStaked(total.toFixed(2)); // Total stake

      } else {
        // No stake found
        setUserStats(prev => ({
          ...prev,
          staked: "0.00"
        }));
        setTotalStaked("0.00");
      }

    } catch (err) {
      console.error("Refresh failed:", err);
      setUserStats(prev => ({
        ...prev,
        staked: "0.00"
      }));
      setTotalStaked("0.00");
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    if (contract && account) {
      await refreshStakeInfo();
      await loadBalance();
      await loadRewardsData();
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
          ZTC Staking Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Stake your ZTC tokens and earn rewards
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
              </Box>
              
              {/* User Staked Component */}
              <UserStaked refreshTrigger={refreshTrigger} />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={handleRefresh}
                  disabled={loading}
                  sx={{
                    borderColor: '#00ff88',
                    color: '#00ff88',
                    '&:hover': {
                      borderColor: '#00ff88',
                      backgroundColor: 'rgba(0, 255, 136, 0.1)'
                    }
                  }}
                >
                  Refresh
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {account && (
        <>
          {/* User Stats */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 4 }}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(20, 20, 20, 0.8) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              boxShadow: '0 0 20px rgba(0, 255, 136, 0.1)',
              borderRadius: 3
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUp sx={{ fontSize: 40, color: '#00ff88', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#00ff88', mb: 1 }}>
                  {formatNumber(userStats.staked)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Staked (ZTC)
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(20, 20, 20, 0.8) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              boxShadow: '0 0 20px rgba(0, 255, 136, 0.1)',
              borderRadius: 3
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <AttachMoney sx={{ fontSize: 40, color: '#00ff88', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#00ff88', mb: 1 }}>
                  {formatNumber(userStats.rewards)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Rewards (ZTC)
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(20, 20, 20, 0.8) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              boxShadow: '0 0 20px rgba(0, 255, 136, 0.1)',
              borderRadius: 3
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckCircle sx={{ fontSize: 40, color: '#00ff88', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#00ff88', mb: 1 }}>
                  {formatNumber(balance)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Available Balance (ZTC)
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Stake Form */}
          <Card sx={{ 
            mb: 4,
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(20, 20, 20, 0.8) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 255, 136, 0.3)',
            boxShadow: '0 0 20px rgba(0, 255, 136, 0.1)',
            borderRadius: 3
          }}>
            <CardHeader
              avatar={<TrendingUp sx={{ color: '#00ff88' }} />}
              title="Stake ZTC"
              subheader="Stake your ZTC tokens to earn rewards"
            />
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ color: '#00ff88', mb: 1, fontWeight: 500 }}>
                  Amount to Stake (ZTC)
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
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
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
                    onClick={() => setStakeAmount(balance)}
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
                  Balance: {formatNumber(balance)} ZTC
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<TrendingUp />}
                onClick={handleStake}
                disabled={loading || !stakeAmount}
                fullWidth
                sx={{
                  background: 'linear-gradient(45deg, #00ff88, #00bfff)',
                  boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
                  border: '1px solid rgba(0, 255, 136, 0.5)',
                  color: 'white',
                  fontWeight: 600,
                  py: 1.5,
                  '&:hover': {
                    boxShadow: '0 0 40px rgba(0, 255, 136, 0.7)',
                    border: '1px solid rgba(0, 255, 136, 1)',
                    transform: 'translateY(-2px) scale(1.05)',
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Stake ZTC'}
              </Button>
            </CardContent>
          </Card>

          {/* Unstake Form */}
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
              title="Unstake ZTC"
              subheader="Choose your unstaking method and amount"
            />
            <CardContent>
              {/* Unstake Method Selector */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ color: '#00ff88', mb: 1, fontWeight: 500 }}>
                  Unstake Method
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <Select
                    value={unstakeMethod}
                    onChange={(e) => setUnstakeMethod(e.target.value)}
                    sx={{
                      color: 'white',
                      border: '1px solid rgba(0, 255, 136, 0.3)',
                      borderRadius: 1,
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      '&:hover': {
                        borderColor: '#00ff88'
                      },
                      '&.Mui-focused': {
                        borderColor: '#00ff88',
                        boxShadow: '0 0 10px rgba(0, 255, 136, 0.2)'
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none'
                      },
                      '& .MuiSelect-icon': {
                        color: '#00ff88'
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: 'rgba(0, 0, 0, 0.9)',
                          border: '1px solid rgba(0, 255, 136, 0.3)',
                          '& .MuiMenuItem-root': {
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 255, 136, 0.1)'
                            },
                            '&.Mui-selected': {
                              backgroundColor: 'rgba(0, 255, 136, 0.2)'
                            }
                          }
                        }
                      }
                    }}
                  >
                    <MenuItem value="batchall">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingDown sx={{ color: '#00ff88', fontSize: 20 }} />
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            BatchAll Unstake
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Unbond + Auto-withdraw (if possible) • ~28 days
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                    <MenuItem value="fastunstake">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FlashOn sx={{ color: '#ffc107', fontSize: 20 }} />
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            Fast Unstake
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Immediate unstake (if eligible) • Instant
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                {/* Method Description */}
                {unstakeMethod === "batchall" && (
                  <Alert 
                    severity="info" 
                    sx={{ 
                      mb: 2,
                      backgroundColor: 'rgba(33, 150, 243, 0.1)',
                      border: '1px solid rgba(33, 150, 243, 0.3)',
                      color: 'white',
                      '& .MuiAlert-icon': { color: '#2196f3' }
                    }}
                  >
                    <Typography variant="body2">
                      <strong>BatchAll:</strong> Combines unbond and withdraw in one transaction. 
                      Withdraw will succeed only if you have tokens ready to withdraw.
                    </Typography>
                  </Alert>
                )}

                {unstakeMethod === "fastunstake" && (
                  <Alert 
                    severity="warning" 
                    sx={{ 
                      mb: 2,
                      backgroundColor: 'rgba(255, 193, 7, 0.1)',
                      border: '1px solid rgba(255, 193, 7, 0.3)',
                      color: 'white',
                      '& .MuiAlert-icon': { color: '#ffc107' }
                    }}
                  >
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>FastUnstake Requirements:</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem', mb: 1 }}>
                      • Account must be fully bonded (no pending unbonding requests)
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem', mb: 1 }}>
                      • No active nominations to validators
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem', mb: 1 }}>
                      • No recent staking rewards or activity
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
                      ⚠️ If you don't meet these requirements, use BatchAll instead. Amount input is ignored for FastUnstake.
                    </Typography>
                  </Alert>
                )}
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ color: '#00ff88', mb: 1, fontWeight: 500 }}>
                  Amount to Unstake (ZTC) {unstakeMethod === "fastunstake" && "(Ignored for FastUnstake)"}
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
                    onClick={() => setUnstakeAmount(totalStaked)}
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
                  Total Staked: {formatNumber(totalStaked)} ZTC
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={unstakeMethod === "fastunstake" ? <FlashOn /> : <TrendingDown />}
                onClick={handleUnstake}
                disabled={loading || (unstakeMethod === "batchall" && !unstakeAmount)}
                fullWidth
                sx={{
                  background: unstakeMethod === "fastunstake" 
                    ? 'linear-gradient(45deg, #ffc107, #ffeb3b)'
                    : 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
                  boxShadow: unstakeMethod === "fastunstake"
                    ? '0 0 20px rgba(255, 193, 7, 0.3)'
                    : '0 0 20px rgba(255, 107, 107, 0.3)',
                  border: unstakeMethod === "fastunstake"
                    ? '1px solid rgba(255, 193, 7, 0.5)'
                    : '1px solid rgba(255, 107, 107, 0.5)',
                  color: unstakeMethod === "fastunstake" ? 'black' : 'white',
                  fontWeight: 600,
                  py: 1.5,
                  '&:hover': {
                    boxShadow: unstakeMethod === "fastunstake"
                      ? '0 0 40px rgba(255, 193, 7, 0.7)'
                      : '0 0 40px rgba(255, 107, 107, 0.7)',
                    border: unstakeMethod === "fastunstake"
                      ? '1px solid rgba(255, 193, 7, 1)'
                      : '1px solid rgba(255, 107, 107, 1)',
                    transform: 'translateY(-2px) scale(1.05)',
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  unstakeMethod === "fastunstake" ? 'Fast Unstake (All Tokens)' : 'BatchAll Unstake'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Claim Rewards */}
          <Card sx={{ 
            mb: 4,
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(20, 20, 20, 0.8) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 255, 136, 0.3)',
            boxShadow: '0 0 20px rgba(0, 255, 136, 0.1)',
            borderRadius: 3
          }}>
            <CardHeader
              avatar={<AttachMoney sx={{ color: '#00ff88' }} />}
              title="Claim Rewards"
              subheader="Claim rewards from all your nominated validators"
            />
            <CardContent>
              {/* Rewards Status */}
              <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Nominations: {hasNominations ? `${nominatedValidators.length} validators` : 'None'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Rewards Claimable: {canClaim ? '✅ Available' : '❌ Not available'}
                </Typography>
                {!hasNominations && (
                  <Typography variant="body2" sx={{ color: '#ff9800', fontWeight: 600 }}>
                    ⚠️ You need to nominate validators to earn rewards
                </Typography>
                )}
                {hasNominations && !canClaim && (
                  <Typography variant="body2" sx={{ color: '#ff9800', fontWeight: 600 }}>
                    ⏳ No valid era to claim rewards from yet
                  </Typography>
                )}
              </Box>

              {/* Recent Claim Transactions */}
              {claimTxHashes.length > 0 && (
                <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ color: '#00ff88', mb: 2, fontWeight: 600 }}>
                    Recent Claim Transactions:
                </Typography>
                  {claimTxHashes.map((hash, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Chip 
                        label={`${hash.slice(0, 10)}...${hash.slice(-8)}`}
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(0, 255, 136, 0.2)', 
                          color: '#00ff88',
                          fontFamily: 'monospace',
                          fontSize: '0.75rem'
                        }}
                        onClick={() => window.open(`https://zentrace.io/tx/${hash}`, '_blank')}
                        clickable
                      />
              </Box>
                  ))}
                </Box>
              )}

              <Button
                variant="contained"
                size="large"
                startIcon={<AttachMoney />}
                onClick={handleClaimRewards}
                disabled={rewardsLoading || !canClaim || !hasNominations}
                fullWidth
                sx={{
                  background: (canClaim && hasNominations)
                    ? 'linear-gradient(45deg, #00ff88, #00bfff)'
                    : 'linear-gradient(45deg, #666, #888)',
                  boxShadow: (canClaim && hasNominations)
                    ? '0 0 20px rgba(0, 255, 136, 0.3)'
                    : 'none',
                  border: (canClaim && hasNominations)
                    ? '1px solid rgba(0, 255, 136, 0.5)'
                    : '1px solid rgba(128, 128, 128, 0.3)',
                  color: 'white',
                  fontWeight: 600,
                  py: 1.5,
                  '&:hover': (canClaim && hasNominations) ? {
                    boxShadow: '0 0 40px rgba(0, 255, 136, 0.7)',
                    border: '1px solid rgba(0, 255, 136, 1)',
                    transform: 'translateY(-2px) scale(1.05)',
                  } : {},
                  '&:disabled': {
                    opacity: 0.6,
                    cursor: 'not-allowed'
                  }
                }}
              >
                {rewardsLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={24} color="inherit" />
                    <span>Claiming Rewards...</span>
                  </Box>
                ) : (
                  'Claim All Available Rewards'
                )}
              </Button>
            </CardContent>
          </Card>


          {/* Status Messages */}
          {error && (
            <Alert 
              severity="error" 
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

          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 2,
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                color: 'white',
                '& .MuiAlert-icon': { color: '#4caf50' }
              }}
            >
              {success}
            </Alert>
          )}

          {txHash && (
            <Alert 
              severity="info" 
              sx={{ 
                mb: 2,
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                border: '1px solid rgba(33, 150, 243, 0.3)',
                color: 'white',
                '& .MuiAlert-icon': { color: '#2196f3' }
              }}
            >
              Transaction Hash: {txHash}
            </Alert>
          )}
        </>
      )}
    </Box>
  );
};

export default StakePage;
