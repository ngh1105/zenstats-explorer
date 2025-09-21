import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useStakeZTC } from '../hooks/useStakeZTC';
import { useWallet } from '../contexts/WalletContext';
import stakingABI from '../abi/stakingABI.json';

const STAKING_CONTRACT = "0x0000000000000000000000000000000000000800";

const StakeZTCDemo = () => {
  const { account, provider } = useWallet();
  const [amount, setAmount] = useState("");
  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null);

  // Initialize contract and signer
  React.useEffect(() => {
    if (provider && account) {
      const contractInstance = new ethers.Contract(STAKING_CONTRACT, stakingABI, provider);
      setContract(contractInstance);
      
      provider.getSigner().then(setSigner);
    }
  }, [provider, account]);

  // Use the custom hook
  const { stakeZTC, loading, error, success } = useStakeZTC(contract, signer);

  const handleStake = async () => {
    if (!amount) {
      alert('Please enter an amount');
      return;
    }
    await stakeZTC(amount);
  };

  const handleMax = async () => {
    if (provider && account) {
      try {
        const balance = await provider.getBalance(account);
        const balanceInZTC = ethers.formatEther(balance);
        setAmount(balanceInZTC);
      } catch (err) {
        console.error('Error getting balance:', err);
      }
    }
  };

  if (!account || !provider) {
    return (
      <div className="p-6 bg-gray-900 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Stake ZTC Demo</h3>
        <p className="text-gray-400">Please connect your wallet to use staking features</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 rounded-lg border border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-4">🚀 Stake ZTC Demo</h3>
      
      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Amount to Stake (ZTC)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter ZTC amount..."
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            disabled={loading}
          />
          <button
            onClick={handleMax}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            disabled={loading}
          >
            MAX
          </button>
        </div>
      </div>

      {/* Stake Button */}
      <button
        onClick={handleStake}
        disabled={loading || !amount}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
          loading || !amount
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-500 text-white hover:transform hover:scale-105'
        }`}
      >
        {loading ? 'Staking...' : 'Stake ZTC'}
      </button>

      {/* Status Messages */}
      {error && (
        <div className="mt-4 p-3 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-900 bg-opacity-30 border border-green-500 rounded-lg">
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* Account Info */}
      <div className="mt-4 p-3 bg-gray-800 rounded-lg">
        <p className="text-xs text-gray-400">Connected Account:</p>
        <p className="text-sm text-blue-400 font-mono break-all">{account}</p>
      </div>
    </div>
  );
};

export default StakeZTCDemo;
