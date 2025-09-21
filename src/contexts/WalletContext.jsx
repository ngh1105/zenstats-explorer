import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

// ZenChain Testnet configuration
const ZENCHAIN_CONFIG = {
  chainId: '0x20D8', // 8408 in hex
  chainName: 'ZenChain Testnet',
  rpcUrls: ['https://zenchain-testnet.api.onfinality.io/public'],
  blockExplorerUrls: ['https://zentrace.io'],
  nativeCurrency: {
    name: 'ZTC',
    symbol: 'ZTC',
    decimals: 18,
  },
};

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const checkConnection = async () => {
    try {
      if (!window.ethereum) {
        setError('MetaMask not detected');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      
      if (accounts.length > 0) {
        const account = accounts[0].address;
        setAccount(account);
        setProvider(provider);
        setIsConnected(true);
        setError(null);
      }
    } catch (err) {
      console.error('Error checking connection:', err);
      setError(err.message);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected
      setAccount(null);
      setProvider(null);
      setIsConnected(false);
    } else {
      // User switched accounts
      setAccount(accounts[0]);
    }
  };

  const handleChainChanged = (chainId) => {
    // Reload the page when chain changes
    window.location.reload();
  };

  const addZenChainNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [ZENCHAIN_CONFIG],
      });
    } catch (err) {
      console.error('Error adding ZenChain network:', err);
      throw new Error('Failed to add ZenChain network');
    }
  };

  const switchToZenChain = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ZENCHAIN_CONFIG.chainId }],
      });
    } catch (err) {
      if (err.code === 4902) {
        // Chain not added, add it
        await addZenChainNetwork();
      } else {
        console.error('Error switching to ZenChain:', err);
        throw new Error('Failed to switch to ZenChain network');
      }
    }
  };

  const connectWallet = async () => {
    // If already connected, disconnect
    if (account) {
      disconnectWallet();
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error('MetaMask not detected. Please install MetaMask.');
      }

      // Request account access
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const account = accounts[0];
      
      // Switch to ZenChain Testnet
      await switchToZenChain();

      // Set state
      setAccount(account);
      setProvider(provider);
      setIsConnected(true);
      setError(null);

      console.log('Wallet connected:', account);
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setIsConnected(false);
    setError(null);
  };

  const value = {
    account,
    provider,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
