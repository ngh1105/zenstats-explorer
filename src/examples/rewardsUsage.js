// Example usage of the rewards claiming functionality
import { claimRewards, canClaimRewards, checkNominations, getTxHistory } from '../utils/rewards';

// Example 1: Basic rewards claiming
const handleClaimRewardsExample = async (provider, account) => {
  try {
    // Check if rewards can be claimed
    const eligibility = await canClaimRewards(provider);
    if (!eligibility.canClaim) {
      console.log('No rewards available to claim');
      return;
    }

    // Check if user has nominations
    const nominations = await checkNominations(provider, account);
    if (!nominations.hasNominations) {
      console.log('No nominations found. Please nominate validators first.');
      return;
    }

    // Claim rewards
    const txHashes = await claimRewards(provider, account);
    
    if (txHashes.length > 0) {
      console.log(`Successfully claimed rewards! Transactions: ${txHashes.join(', ')}`);
    } else {
      console.log('No new rewards to claim');
    }
    
  } catch (error) {
    console.error('Failed to claim rewards:', error.message);
  }
};

// Example 2: Get transaction history
const getRewardsHistory = () => {
  const history = getTxHistory();
  const rewardsClaims = history.filter(tx => tx.type === 'claim');
  
  console.log('Recent rewards claims:', rewardsClaims);
  return rewardsClaims;
};

// Example 3: Complete rewards check and claim flow
const completeRewardsFlow = async (provider, account) => {
  try {
    console.log('=== Rewards Claim Flow ===');
    
    // Step 1: Check eligibility
    console.log('1. Checking rewards eligibility...');
    const eligibility = await canClaimRewards(provider);
    console.log(`Current era: ${eligibility.currentEra}, Era to claim: ${eligibility.eraToClaim}`);
    
    if (!eligibility.canClaim) {
      console.log('❌ Cannot claim rewards - no valid era available');
      return { success: false, reason: 'No valid era' };
    }
    
    // Step 2: Check nominations
    console.log('2. Checking nominations...');
    const nominations = await checkNominations(provider, account);
    console.log(`Nominations found: ${nominations.hasNominations}`);
    console.log(`Validators: ${nominations.validators.join(', ')}`);
    
    if (!nominations.hasNominations) {
      console.log('❌ Cannot claim rewards - no nominations found');
      return { success: false, reason: 'No nominations' };
    }
    
    // Step 3: Claim rewards
    console.log('3. Claiming rewards...');
    const txHashes = await claimRewards(provider, account);
    
    if (txHashes.length > 0) {
      console.log(`✅ Successfully claimed rewards!`);
      console.log(`Transactions: ${txHashes.length}`);
      txHashes.forEach((hash, index) => {
        console.log(`  ${index + 1}. ${hash}`);
      });
      
      return { 
        success: true, 
        transactions: txHashes,
        count: txHashes.length
      };
    } else {
      console.log('ℹ️ No new rewards to claim');
      return { success: true, transactions: [], count: 0 };
    }
    
  } catch (error) {
    console.error('❌ Rewards claim failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Example 4: React component usage
const RewardsClaimButton = ({ provider, account }) => {
  const [loading, setLoading] = useState(false);
  const [txHashes, setTxHashes] = useState([]);
  const [canClaim, setCanClaim] = useState(false);
  const [hasNominations, setHasNominations] = useState(false);

  // Check eligibility on component mount
  useEffect(() => {
    const checkEligibility = async () => {
      if (!provider || !account) return;
      
      try {
        const [eligibility, nominations] = await Promise.all([
          canClaimRewards(provider),
          checkNominations(provider, account)
        ]);
        
        setCanClaim(eligibility.canClaim);
        setHasNominations(nominations.hasNominations);
      } catch (error) {
        console.error('Error checking eligibility:', error);
      }
    };
    
    checkEligibility();
  }, [provider, account]);

  const handleClaim = async () => {
    if (!canClaim || !hasNominations) return;
    
    try {
      setLoading(true);
      const hashes = await claimRewards(provider, account);
      setTxHashes(hashes);
      
      if (hashes.length > 0) {
        alert(`Successfully claimed rewards! ${hashes.length} transactions completed.`);
      } else {
        alert('No new rewards to claim.');
      }
    } catch (error) {
      alert(`Failed to claim rewards: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button 
        onClick={handleClaim}
        disabled={loading || !canClaim || !hasNominations}
      >
        {loading ? 'Claiming...' : 'Claim Rewards'}
      </button>
      
      {txHashes.length > 0 && (
        <div>
          <h3>Recent Claims:</h3>
          {txHashes.map((hash, index) => (
            <div key={index}>
              <a href={`https://zentrace.io/tx/${hash}`} target="_blank" rel="noopener noreferrer">
                {hash}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export {
  handleClaimRewardsExample,
  getRewardsHistory,
  completeRewardsFlow,
  RewardsClaimButton
};
