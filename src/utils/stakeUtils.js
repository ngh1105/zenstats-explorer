import { ethers } from 'ethers';

/**
 * Stake ZTC tokens utility function
 * @param {Object} stakingContract - Contract instance from ABI NativeStaking
 * @param {Object} signer - Ethers signer after wallet connection
 * @param {string|number} amount - Amount to stake (e.g., "1000")
 * @returns {Promise<Object>} - Transaction result
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
    
    // Convert amount to wei using ethers v6 syntax
    const value = ethers.parseUnits(amount.toString(), 18);

    console.log(`Staking ${amount} ZTC (${value} wei) for address: ${userAddress}`);

    // Check current staked balance
    const stakeInfo = await stakingContract.stake(userAddress);
    const totalStaked = stakeInfo[0]; // total staked amount

    console.log('Current total staked:', ethers.formatEther(totalStaked), 'ZTC');

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
    const receipt = await tx.wait();
    
    console.log('Stake successful! Block:', receipt.blockNumber);
    
    return {
      success: true,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      message: 'Stake thành công!'
    };
    
  } catch (err) {
    console.error("Stake error:", err);
    throw new Error(`Stake thất bại: ${err.message}`);
  }
};

/**
 * Get staking information for a user
 * @param {Object} stakingContract - Contract instance
 * @param {string} userAddress - User wallet address
 * @returns {Promise<Object>} - Staking info
 */
export const getStakingInfo = async (stakingContract, userAddress) => {
  try {
    const stakeInfo = await stakingContract.stake(userAddress);
    const [total, active] = stakeInfo;
    
    return {
      total: ethers.formatEther(total),
      active: ethers.formatEther(active),
      totalWei: total,
      activeWei: active
    };
  } catch (err) {
    console.error('Error getting staking info:', err);
    throw new Error(`Failed to get staking info: ${err.message}`);
  }
};

/**
 * Check if user has staked before
 * @param {Object} stakingContract - Contract instance
 * @param {string} userAddress - User wallet address
 * @returns {Promise<boolean>} - True if user has staked before
 */
export const hasStakedBefore = async (stakingContract, userAddress) => {
  try {
    const stakeInfo = await stakingContract.stake(userAddress);
    const totalStaked = stakeInfo[0];
    return totalStaked > 0;
  } catch (err) {
    console.error('Error checking staking status:', err);
    return false;
  }
};

/**
 * Get bonding duration from contract
 * @param {Object} stakingContract - Contract instance
 * @returns {Promise<number>} - Bonding duration in eras
 */
export const getBondingDuration = async (stakingContract) => {
  try {
    const duration = await stakingContract.bondingDuration();
    return Number(duration);
  } catch (err) {
    console.error('Error getting bonding duration:', err);
    throw new Error(`Failed to get bonding duration: ${err.message}`);
  }
};

/**
 * Get active era from contract
 * @param {Object} stakingContract - Contract instance
 * @returns {Promise<number>} - Current active era
 */
export const getActiveEra = async (stakingContract) => {
  try {
    const era = await stakingContract.activeEra();
    return Number(era);
  } catch (err) {
    console.error('Error getting active era:', err);
    throw new Error(`Failed to get active era: ${err.message}`);
  }
};
