import { ethers } from 'ethers';
import stakingABI from '../abi/stakingABI.json';

// NativeStaking precompile address
const NATIVE_STAKING_ADDRESS = "0x0000000000000000000000000000000000000800";

/**
 * Claim rewards for a nominator across all their nominated validators
 * @param {ethers.BrowserProvider} provider - Ethers provider (MetaMask)
 * @param {string} account - Connected wallet address
 * @returns {Promise<string[]>} Array of successful transaction hashes
 */
export const claimRewards = async (provider, account) => {
  try {
    console.log('Starting rewards claim for account:', account);
    
    // Validate inputs
    if (!provider || !account) {
      throw new Error('Provider and account are required');
    }

    // Get signer
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(NATIVE_STAKING_ADDRESS, stakingABI, signer);
    const readOnlyContract = new ethers.Contract(NATIVE_STAKING_ADDRESS, stakingABI, provider);

    // Get current era and calculate era to claim (currentEra - 1)
    const currentEra = await readOnlyContract.currentEra();
    const eraToClaim = Number(currentEra) - 1;
    
    console.log(`Current era: ${currentEra}, Era to claim: ${eraToClaim}`);

    // Validate era to claim
    if (eraToClaim <= 0) {
      throw new Error('No valid era to claim rewards from');
    }

    // Get nominator preferences to find nominated validators
    let nominatorPrefs;
    try {
      nominatorPrefs = await readOnlyContract.nominatorPrefs(account);
    } catch (err) {
      console.error('Error getting nominator preferences:', err);
      throw new Error('Failed to get nomination data. You may not have any nominations.');
    }

    const nominatedValidators = nominatorPrefs.targets;
    
    if (!nominatedValidators || nominatedValidators.length === 0) {
      throw new Error('No nominated validators found. You need to nominate validators to earn rewards.');
    }

    console.log(`Found ${nominatedValidators.length} nominated validators:`, nominatedValidators);

    const successfulTxHashes = [];
    const errors = [];

    // Process each nominated validator
    for (let i = 0; i < nominatedValidators.length; i++) {
      const validator = nominatedValidators[i];
      console.log(`Processing validator ${i + 1}/${nominatedValidators.length}: ${validator}`);

      try {
        // Get the number of pages for this validator in the era
        const nominatorInfo = await readOnlyContract.erasValidatorNominatorsCount(eraToClaim, validator);
        const numPages = Number(nominatorInfo.numPages);
        
        console.log(`Validator ${validator} has ${numPages} pages to check`);

        if (numPages === 0) {
          console.log(`No pages found for validator ${validator}, skipping`);
          continue;
        }

        // Process each page for this validator
        for (let page = 0; page < numPages; page++) {
          try {
            console.log(`Checking page ${page} for validator ${validator}`);

            // Use callStatic to check if the payout is valid before sending transaction
            await contract.payoutStakersByPage.staticCall(validator, eraToClaim, page);
            
            console.log(`Page ${page} is valid, sending payout transaction...`);

            // Send the actual transaction
            const tx = await contract.payoutStakersByPage(validator, eraToClaim, page);
            
            console.log(`Transaction sent: ${tx.hash}`);

            // Wait for confirmation
            const receipt = await tx.wait();
            
            if (receipt.status === 1) {
              successfulTxHashes.push(tx.hash);
              console.log(`✅ Successfully claimed rewards for validator ${validator}, page ${page}`);
              
              // Store transaction in history
              storeTxHistory({
                type: 'claim',
                hash: tx.hash,
                ts: Date.now(),
                validator,
                era: eraToClaim,
                page
              });
            } else {
              console.log(`❌ Transaction failed for validator ${validator}, page ${page}`);
              errors.push(`Transaction failed for ${validator} page ${page}`);
            }

          } catch (pageError) {
            // This is expected for already claimed rewards or invalid pages
            const errorMessage = pageError.message || pageError.toString();
            
            if (errorMessage.includes('AlreadyClaimed') || 
                errorMessage.includes('already claimed') ||
                errorMessage.includes('InvalidPage') ||
                errorMessage.includes('invalid page')) {
              console.log(`⏭️ Page ${page} for validator ${validator} already claimed or invalid, skipping`);
            } else {
              console.error(`Error processing page ${page} for validator ${validator}:`, pageError);
              errors.push(`Error on ${validator} page ${page}: ${errorMessage}`);
            }
          }
        }

      } catch (validatorError) {
        console.error(`Error processing validator ${validator}:`, validatorError);
        errors.push(`Error processing validator ${validator}: ${validatorError.message}`);
      }
    }

    console.log(`Rewards claim completed. Successful transactions: ${successfulTxHashes.length}`);
    
    if (errors.length > 0) {
      console.warn('Some errors occurred:', errors);
    }

    return successfulTxHashes;

  } catch (error) {
    console.error('Rewards claim failed:', error);
    throw error;
  }
};

/**
 * Store transaction in localStorage history
 * @param {Object} txData - Transaction data to store
 */
const storeTxHistory = (txData) => {
  try {
    const historyKey = 'zenstats:txHistory';
    let history = [];
    
    // Get existing history
    const existingHistory = localStorage.getItem(historyKey);
    if (existingHistory) {
      history = JSON.parse(existingHistory);
    }
    
    // Add new transaction
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
};

/**
 * Get transaction history from localStorage
 * @returns {Array} Array of transaction history
 */
export const getTxHistory = () => {
  try {
    const historyKey = 'zenstats:txHistory';
    const history = localStorage.getItem(historyKey);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting transaction history:', error);
    return [];
  }
};

/**
 * Check if rewards can be claimed (era validation)
 * @param {ethers.BrowserProvider} provider - Ethers provider
 * @returns {Promise<{canClaim: boolean, eraToClaim: number, currentEra: number}>}
 */
export const canClaimRewards = async (provider) => {
  try {
    const contract = new ethers.Contract(NATIVE_STAKING_ADDRESS, stakingABI, provider);
    const currentEra = await contract.currentEra();
    const eraToClaim = Number(currentEra) - 1;
    
    return {
      canClaim: eraToClaim > 0,
      eraToClaim,
      currentEra: Number(currentEra)
    };
  } catch (error) {
    console.error('Error checking rewards eligibility:', error);
    return {
      canClaim: false,
      eraToClaim: 0,
      currentEra: 0
    };
  }
};

/**
 * Check if user has nominations
 * @param {ethers.BrowserProvider} provider - Ethers provider  
 * @param {string} account - User account address
 * @returns {Promise<{hasNominations: boolean, validators: string[]}>}
 */
export const checkNominations = async (provider, account) => {
  try {
    const contract = new ethers.Contract(NATIVE_STAKING_ADDRESS, stakingABI, provider);
    const nominatorPrefs = await contract.nominatorPrefs(account);
    
    return {
      hasNominations: nominatorPrefs.targets && nominatorPrefs.targets.length > 0,
      validators: nominatorPrefs.targets || []
    };
  } catch (error) {
    console.error('Error checking nominations:', error);
    return {
      hasNominations: false,
      validators: []
    };
  }
};
