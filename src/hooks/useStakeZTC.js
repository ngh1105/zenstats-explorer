import { useState } from 'react';
import { ethers } from 'ethers';

/**
 * Custom hook for staking ZTC tokens
 * @param {Object} stakingContract - Contract instance from ABI NativeStaking
 * @param {Object} signer - Ethers signer after wallet connection
 * @returns {Object} - { stakeZTC, loading, error, success }
 */
export const useStakeZTC = (stakingContract, signer) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  /**
   * Stake ZTC tokens
   * @param {string|number} amount - Amount to stake (e.g., "1000")
   */
  const stakeZTC = async (amount) => {
    if (!stakingContract || !signer) {
      setError('Contract or signer not available');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Get user address
      const userAddress = await signer.getAddress();
      
      // Convert amount to wei
      const value = ethers.parseUnits(amount.toString(), 18);

      // Check current staked balance
      const stakeInfo = await stakingContract.stake(userAddress);
      const totalStaked = stakeInfo[0]; // total staked amount

      let tx;
      if (totalStaked <= 0) {
        // First time staking - use bondWithRewardDestination
        console.log('First time staking, using bondWithRewardDestination');
        tx = await stakingContract.connect(signer).bondWithRewardDestination(value, 0); // 0 = Restake
      } else {
        // Already staked - add more using bondExtra
        console.log('Adding to existing stake, using bondExtra');
        tx = await stakingContract.connect(signer).bondExtra(value);
      }

      console.log('Stake transaction sent:', tx.hash);
      
      // Wait for confirmation
      await tx.wait();
      
      setSuccess('Stake thành công!');
      console.log('Stake successful!');
      
    } catch (err) {
      console.error('Stake error:', err);
      setError(`Stake thất bại: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    stakeZTC,
    loading,
    error,
    success
  };
};

/**
 * Standalone function for staking ZTC tokens
 * @param {Object} stakingContract - Contract instance from ABI NativeStaking
 * @param {Object} signer - Ethers signer after wallet connection
 * @param {string|number} amount - Amount to stake (e.g., "1000")
 */
export const stakeZTC = async (stakingContract, signer, amount) => {
  try {
    if (!stakingContract || !signer) {
      throw new Error('Contract or signer not available');
    }

    if (!amount || parseFloat(amount) <= 0) {
      throw new Error('Please enter a valid amount');
    }

    // Get user address
    const userAddress = await signer.getAddress();
    
    // Convert amount to wei
    const value = ethers.parseUnits(amount.toString(), 18);

    // Check current staked balance
    const stakeInfo = await stakingContract.stake(userAddress);
    const totalStaked = stakeInfo[0]; // total staked amount

    let tx;
    if (totalStaked <= 0) {
      // First time staking - use bondWithRewardDestination
      console.log('First time staking, using bondWithRewardDestination');
      tx = await stakingContract.connect(signer).bondWithRewardDestination(value, 0); // 0 = Restake
    } else {
      // Already staked - add more using bondExtra
      console.log('Adding to existing stake, using bondExtra');
      tx = await stakingContract.connect(signer).bondExtra(value);
    }

    console.log('Stake transaction sent:', tx.hash);
    
    // Wait for confirmation
    await tx.wait();
    
    console.log('Stake successful!');
    alert("Stake thành công!");
    
  } catch (err) {
    console.error("Stake error:", err);
    alert("Stake thất bại");
  }
};

export default useStakeZTC;
