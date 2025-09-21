import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import stakingABI from '../abi/stakingABI.json';

// Contract addresses
const NATIVE_STAKING_ADDRESS = "0x0000000000000000000000000000000000000800";
const FAST_UNSTAKE_ADDRESS = "0x0000000000000000000000000000000000000801";

// FastUnstake ABI
const FAST_UNSTAKE_ABI = [
  { "inputs": [], "name": "deregister", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "populateBytecode", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "registerFastUnstake", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];

/**
 * Custom hook for unstaking operations on ZenChain
 * Combines normal unstake (unbond/withdraw) and fast-unstake functionality
 * 
 * @param {ethers.BrowserProvider} provider - Ethers provider (MetaMask)
 * @param {string} account - Connected wallet address
 * @returns {Object} Hook functions and state
 */
export const useUnstake = (provider, account) => {
  // Hook state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastTx, setLastTx] = useState(null);

  /**
   * Store transaction in localStorage history
   * @param {string} type - Transaction type
   * @param {string} hash - Transaction hash
   */
  const storeTxHistory = useCallback((type, hash) => {
    try {
      const historyKey = 'zenstats:txHistory';
      let history = [];
      
      // Get existing history
      const existingHistory = localStorage.getItem(historyKey);
      if (existingHistory) {
        history = JSON.parse(existingHistory);
      }
      
      // Add new transaction
      const txData = {
        type,
        hash,
        ts: Date.now()
      };
      
      history.unshift(txData); // Add to beginning
      
      // Keep only last 100 transactions
      if (history.length > 100) {
        history = history.slice(0, 100);
      }
      
      // Save back to localStorage
      localStorage.setItem(historyKey, JSON.stringify(history));
      
    } catch (error) {
      console.error('Error storing transaction history:', error);
    }
  }, []);

  /**
   * Validate provider and account
   */
  const validateInputs = useCallback(() => {
    if (!provider || !account) {
      throw new Error('Provider and account are required');
    }
  }, [provider, account]);

  /**
   * Get stake information for an account
   * @param {string} targetAccount - Account to query (defaults to connected account)
   * @returns {Promise<{total: string, active: string, pending: string}>}
   */
  const getStakeInfo = useCallback(async (targetAccount = account) => {
    try {
      validateInputs();
      
      const contract = new ethers.Contract(NATIVE_STAKING_ADDRESS, stakingABI, provider);
      const stakeInfo = await contract.stake(targetAccount);
      
      // Convert BigInt to string for safe handling
      const total = ethers.formatUnits(stakeInfo.total, 18);
      const active = ethers.formatUnits(stakeInfo.active, 18);
      const pending = (Number(total) - Number(active)).toFixed(18);
      
      return {
        total,
        active,
        pending
      };
      
    } catch (error) {
      console.error('Error getting stake info:', error);
      throw new Error(`Failed to get stake info: ${error.message}`);
    }
  }, [provider, account, validateInputs]);

  /**
   * Unbond tokens (normal unstake - step 1)
   * @param {string|BigInt} valueWei - Amount to unbond in wei
   * @returns {Promise<string>} Transaction hash
   */
  const unbond = useCallback(async (valueWei) => {
    try {
      validateInputs();
      setLoading(true);
      setError(null);
      
      // Validate amount
      const amount = typeof valueWei === 'string' ? BigInt(valueWei) : valueWei;
      if (amount <= 0n) {
        throw new Error('Amount must be greater than 0');
      }
      
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(NATIVE_STAKING_ADDRESS, stakingABI, signer);
      
      console.log(`Unbonding ${ethers.formatUnits(amount, 18)} ZTC...`);
      
      // Call unbond function
      const tx = await contract.unbond(amount);
      console.log(`Unbond transaction sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        console.log('✅ Unbond successful');
        setLastTx(tx.hash);
        storeTxHistory('unbond', tx.hash);
        return tx.hash;
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (error) {
      console.error('Unbond failed:', error);
      const errorMessage = error.message || 'Failed to unbond tokens';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [provider, account, validateInputs, storeTxHistory]);

  /**
   * Withdraw unbonded tokens (normal unstake - step 2)
   * @returns {Promise<string>} Transaction hash
   */
  const withdraw = useCallback(async () => {
    try {
      validateInputs();
      setLoading(true);
      setError(null);
      
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(NATIVE_STAKING_ADDRESS, stakingABI, signer);
      
      console.log('Checking withdraw eligibility...');
      
      // First check if withdraw is possible using callStatic
      try {
        await contract.withdrawUnbonded.staticCall(0);
        console.log('✅ Withdraw is eligible');
      } catch (staticError) {
        console.log('❌ Withdraw not eligible:', staticError.message);
        throw new Error('Not yet withdrawable. Please wait for the unbonding period to end.');
      }
      
      console.log('Withdrawing unbonded tokens...');
      
      // Execute actual withdraw
      const tx = await contract.withdrawUnbonded(0);
      console.log(`Withdraw transaction sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        console.log('✅ Withdraw successful');
        setLastTx(tx.hash);
        storeTxHistory('withdraw', tx.hash);
        return tx.hash;
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (error) {
      console.error('Withdraw failed:', error);
      const errorMessage = error.message || 'Failed to withdraw tokens';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [provider, account, validateInputs, storeTxHistory]);

  /**
   * Register for fast unstake
   * @returns {Promise<string>} Transaction hash
   */
  const fastUnstake = useCallback(async () => {
    try {
      validateInputs();
      setLoading(true);
      setError(null);
      
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(FAST_UNSTAKE_ADDRESS, FAST_UNSTAKE_ABI, signer);
      
      console.log('Registering for fast unstake...');
      
      // Call registerFastUnstake
      const tx = await contract.registerFastUnstake();
      console.log(`Fast unstake registration sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        console.log('✅ Fast unstake registration successful');
        setLastTx(tx.hash);
        storeTxHistory('fast-unstake', tx.hash);
        return tx.hash;
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (error) {
      console.error('Fast unstake failed:', error);
      let errorMessage = error.message || 'Failed to register for fast unstake';
      
      // Handle specific fast unstake errors
      if (errorMessage.includes('NotEligible') || errorMessage.includes('not eligible')) {
        errorMessage = 'Not eligible for Fast Unstake. You may have active nominations or recent staking activity.';
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [provider, account, validateInputs, storeTxHistory]);

  /**
   * Cancel fast unstake registration
   * @returns {Promise<string>} Transaction hash
   */
  const cancelFastUnstake = useCallback(async () => {
    try {
      validateInputs();
      setLoading(true);
      setError(null);
      
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(FAST_UNSTAKE_ADDRESS, FAST_UNSTAKE_ABI, signer);
      
      console.log('Canceling fast unstake registration...');
      
      // Call deregister
      const tx = await contract.deregister();
      console.log(`Fast unstake cancellation sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        console.log('✅ Fast unstake cancellation successful');
        setLastTx(tx.hash);
        storeTxHistory('deregister', tx.hash);
        return tx.hash;
      } else {
        throw new Error('Transaction failed');
      }
      
    } catch (error) {
      console.error('Cancel fast unstake failed:', error);
      const errorMessage = error.message || 'Failed to cancel fast unstake';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [provider, account, validateInputs, storeTxHistory]);

  /**
   * Check if withdraw is available (using callStatic)
   * @returns {Promise<boolean>}
   */
  const canWithdraw = useCallback(async () => {
    try {
      validateInputs();
      
      const contract = new ethers.Contract(NATIVE_STAKING_ADDRESS, stakingABI, provider);
      
      // Use callStatic to check if withdraw would succeed
      await contract.withdrawUnbonded.staticCall(0);
      return true;
    } catch (error) {
      return false;
    }
  }, [provider, account, validateInputs]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setLastTx(null);
  }, []);

  // Return hook interface
  return {
    // Functions
    unbond,
    withdraw,
    fastUnstake,
    cancelFastUnstake,
    getStakeInfo,
    canWithdraw,
    clearError,
    reset,
    
    // State
    loading,
    error,
    lastTx,
    
    // Utilities
    isConnected: !!(provider && account)
  };
};

export default useUnstake;
