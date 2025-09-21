// Example usage of the useUnstake hook
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useUnstake } from '../hooks/useUnstake';

// Example 1: Basic hook usage in a React component
const BasicUnstakeExample = ({ provider, account }) => {
  const {
    unbond,
    withdraw,
    fastUnstake,
    cancelFastUnstake,
    getStakeInfo,
    canWithdraw,
    loading,
    error,
    lastTx
  } = useUnstake(provider, account);

  const [amount, setAmount] = useState('');
  const [stakeInfo, setStakeInfo] = useState(null);

  // Load stake info on component mount
  useEffect(() => {
    const loadInfo = async () => {
      try {
        const info = await getStakeInfo();
        setStakeInfo(info);
      } catch (error) {
        console.error('Failed to load stake info:', error);
      }
    };

    if (provider && account) {
      loadInfo();
    }
  }, [provider, account, getStakeInfo]);

  const handleUnbond = async () => {
    try {
      const amountWei = ethers.parseUnits(amount, 18);
      const txHash = await unbond(amountWei);
      console.log('Unbond successful:', txHash);
      setAmount('');
    } catch (error) {
      console.error('Unbond failed:', error);
    }
  };

  const handleWithdraw = async () => {
    try {
      const txHash = await withdraw();
      console.log('Withdraw successful:', txHash);
    } catch (error) {
      console.error('Withdraw failed:', error);
    }
  };

  return (
    <div>
      <h2>Unstake Example</h2>
      
      {stakeInfo && (
        <div>
          <p>Active: {stakeInfo.active} ZTC</p>
          <p>Pending: {stakeInfo.pending} ZTC</p>
          <p>Total: {stakeInfo.total} ZTC</p>
        </div>
      )}

      <div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount to unbond"
        />
        <button onClick={handleUnbond} disabled={loading}>
          {loading ? 'Processing...' : 'Unbond'}
        </button>
      </div>

      <button onClick={handleWithdraw} disabled={loading}>
        {loading ? 'Processing...' : 'Withdraw'}
      </button>

      <button onClick={fastUnstake} disabled={loading}>
        {loading ? 'Processing...' : 'Fast Unstake'}
      </button>

      <button onClick={cancelFastUnstake} disabled={loading}>
        {loading ? 'Processing...' : 'Cancel Fast Unstake'}
      </button>

      {error && <p style={{color: 'red'}}>Error: {error}</p>}
      {lastTx && <p>Last transaction: {lastTx}</p>}
    </div>
  );
};

// Example 2: Programmatic usage without React component
const programmaticExample = async (provider, account) => {
  // You can't use hooks outside of React components, but you can use the functions directly
  // This example shows how you might structure the logic
  
  try {
    console.log('=== Unstake Operations Example ===');
    
    // 1. Get stake information
    console.log('1. Getting stake information...');
    const contract = new ethers.Contract(
      "0x0000000000000000000000000000000000000800", 
      stakingABI, 
      provider
    );
    
    const stakeInfo = await contract.stake(account);
    const total = ethers.formatUnits(stakeInfo.total, 18);
    const active = ethers.formatUnits(stakeInfo.active, 18);
    const pending = (Number(total) - Number(active)).toFixed(18);
    
    console.log(`Active: ${active} ZTC`);
    console.log(`Pending: ${pending} ZTC`);
    console.log(`Total: ${total} ZTC`);
    
    // 2. Unbond some tokens
    if (Number(active) > 0) {
      console.log('2. Unbonding 1 ZTC...');
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      
      const amountWei = ethers.parseUnits('1', 18);
      const unbondTx = await contractWithSigner.unbond(amountWei);
      
      console.log(`Unbond transaction: ${unbondTx.hash}`);
      await unbondTx.wait();
      console.log('✅ Unbond successful');
    }
    
    // 3. Check if withdraw is available
    console.log('3. Checking withdraw availability...');
    try {
      await contract.withdrawUnbonded.staticCall(0);
      console.log('✅ Withdraw is available');
      
      // Execute withdraw
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      const withdrawTx = await contractWithSigner.withdrawUnbonded(0);
      
      console.log(`Withdraw transaction: ${withdrawTx.hash}`);
      await withdrawTx.wait();
      console.log('✅ Withdraw successful');
      
    } catch (error) {
      console.log('❌ Withdraw not available:', error.message);
    }
    
    // 4. Try fast unstake
    console.log('4. Attempting fast unstake...');
    try {
      const fastUnstakeContract = new ethers.Contract(
        "0x0000000000000000000000000000000000000801",
        [{"inputs": [], "name": "registerFastUnstake", "outputs": [], "stateMutability": "nonpayable", "type": "function"}],
        await provider.getSigner()
      );
      
      const fastUnstakeTx = await fastUnstakeContract.registerFastUnstake();
      console.log(`Fast unstake transaction: ${fastUnstakeTx.hash}`);
      await fastUnstakeTx.wait();
      console.log('✅ Fast unstake registration successful');
      
    } catch (error) {
      console.log('❌ Fast unstake failed:', error.message);
    }
    
  } catch (error) {
    console.error('Example failed:', error);
  }
};

// Example 3: Advanced hook usage with custom state management
const AdvancedUnstakeExample = ({ provider, account }) => {
  const unstakeHook = useUnstake(provider, account);
  const [stakeData, setStakeData] = useState({
    active: '0',
    pending: '0',
    total: '0',
    canWithdraw: false
  });
  
  // Custom refresh function
  const refreshData = async () => {
    try {
      const [stakeInfo, withdrawAvailable] = await Promise.all([
        unstakeHook.getStakeInfo(),
        unstakeHook.canWithdraw()
      ]);
      
      setStakeData({
        ...stakeInfo,
        canWithdraw: withdrawAvailable
      });
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  // Refresh data when transaction completes
  useEffect(() => {
    if (unstakeHook.lastTx) {
      // Wait a bit for blockchain to update
      setTimeout(refreshData, 2000);
    }
  }, [unstakeHook.lastTx]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUnbondWithValidation = async (amount) => {
    // Custom validation
    const amountNum = parseFloat(amount);
    const activeNum = parseFloat(stakeData.active);
    
    if (amountNum <= 0) {
      alert('Amount must be greater than 0');
      return;
    }
    
    if (amountNum > activeNum) {
      alert('Amount exceeds available stake');
      return;
    }
    
    try {
      const amountWei = ethers.parseUnits(amount.toString(), 18);
      await unstakeHook.unbond(amountWei);
      alert('Unbond successful!');
    } catch (error) {
      alert(`Unbond failed: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Advanced Unstake Example</h2>
      
      <div>
        <h3>Stake Information</h3>
        <p>Active: {stakeData.active} ZTC</p>
        <p>Pending: {stakeData.pending} ZTC</p>
        <p>Total: {stakeData.total} ZTC</p>
        <p>Can Withdraw: {stakeData.canWithdraw ? 'Yes' : 'No'}</p>
        <button onClick={refreshData}>Refresh</button>
      </div>

      <div>
        <h3>Operations</h3>
        <button 
          onClick={() => handleUnbondWithValidation('1')}
          disabled={unstakeHook.loading}
        >
          Unbond 1 ZTC
        </button>
        
        <button 
          onClick={unstakeHook.withdraw}
          disabled={unstakeHook.loading || !stakeData.canWithdraw}
        >
          Withdraw
        </button>
        
        <button 
          onClick={unstakeHook.fastUnstake}
          disabled={unstakeHook.loading}
        >
          Fast Unstake
        </button>
      </div>

      {unstakeHook.error && (
        <div style={{color: 'red'}}>
          Error: {unstakeHook.error}
          <button onClick={unstakeHook.clearError}>Clear</button>
        </div>
      )}

      {unstakeHook.lastTx && (
        <div>
          Last Transaction: 
          <a 
            href={`https://zentrace.io/tx/${unstakeHook.lastTx}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {unstakeHook.lastTx}
          </a>
        </div>
      )}
    </div>
  );
};

// Example 4: Hook with custom error handling
const ErrorHandlingExample = ({ provider, account }) => {
  const unstakeHook = useUnstake(provider, account);
  const [customError, setCustomError] = useState(null);

  const handleOperationWithCustomError = async (operation, operationName) => {
    try {
      setCustomError(null);
      await operation();
      alert(`${operationName} successful!`);
    } catch (error) {
      let userFriendlyMessage = error.message;
      
      // Custom error message mapping
      if (error.message.includes('insufficient funds')) {
        userFriendlyMessage = 'Insufficient balance for transaction fees';
      } else if (error.message.includes('user rejected')) {
        userFriendlyMessage = 'Transaction was rejected by user';
      } else if (error.message.includes('Not yet withdrawable')) {
        userFriendlyMessage = 'Tokens are still in unbonding period. Please wait.';
      } else if (error.message.includes('Not eligible for Fast Unstake')) {
        userFriendlyMessage = 'Your account is not eligible for fast unstake. Try normal unstake instead.';
      }
      
      setCustomError(userFriendlyMessage);
    }
  };

  return (
    <div>
      <h2>Error Handling Example</h2>
      
      <button 
        onClick={() => handleOperationWithCustomError(
          () => unstakeHook.unbond(ethers.parseUnits('1', 18)), 
          'Unbond'
        )}
        disabled={unstakeHook.loading}
      >
        Unbond 1 ZTC
      </button>

      <button 
        onClick={() => handleOperationWithCustomError(
          unstakeHook.withdraw, 
          'Withdraw'
        )}
        disabled={unstakeHook.loading}
      >
        Withdraw
      </button>

      <button 
        onClick={() => handleOperationWithCustomError(
          unstakeHook.fastUnstake, 
          'Fast Unstake'
        )}
        disabled={unstakeHook.loading}
      >
        Fast Unstake
      </button>

      {(customError || unstakeHook.error) && (
        <div style={{color: 'red', padding: '10px', border: '1px solid red', margin: '10px 0'}}>
          {customError || unstakeHook.error}
          <button onClick={() => {
            setCustomError(null);
            unstakeHook.clearError();
          }}>
            Clear Error
          </button>
        </div>
      )}
    </div>
  );
};

export {
  BasicUnstakeExample,
  programmaticExample,
  AdvancedUnstakeExample,
  ErrorHandlingExample
};
