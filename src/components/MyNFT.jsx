import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardMedia,
  Typography, 
  Button, 
  Container,
  Grid,
  CircularProgress,
  Chip,
  Avatar,
  IconButton,
  Alert,
  Skeleton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  ArrowBack,
  ContentCopy,
  OpenInNew,
  Image as ImageIcon,
  CollectionsBookmark,
  Refresh,
  Add,
  Delete,
  Settings
} from '@mui/icons-material';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';

const MyNFT = ({ onClose }) => {
  const { account, provider, isConnected } = useWallet();
  const { showSuccessToast, showErrorToast, showInfoToast } = useToast();
  
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalBalance, setTotalBalance] = useState(0);
  const [customContracts, setCustomContracts] = useState([]);
  const [showAddContract, setShowAddContract] = useState(false);
  const [newContractAddress, setNewContractAddress] = useState('');
  const [newContractName, setNewContractName] = useState('');
  const [fetchMethod, setFetchMethod] = useState('enumerable'); // 'enumerable' or 'events'

  // Minimal ERC-721 ABI for both event-based and enumerable fetching
  const ERC721_ABI = [
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    "function balanceOf(address owner) view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function name() view returns (string)",
    "function symbol() view returns (string)"
  ];

  // Common NFT contract addresses on ZenChain (you may need to update these)
  const NFT_CONTRACTS = [
    {
      name: "ZenChain Test NFT",
      address: "0x4E89fbfAc2fCcbD96f2D29961822F1e589b3C3ae", // Contract address từ user
      symbol: "ZCT"
    }
  ];

  // Tìm deployment block của contract để tối ưu scan
  const findContractDeploymentBlock = async (contractAddress) => {
    try {
      // Binary search để tìm block đầu tiên có code
      let low = 0;
      let high = await provider.getBlockNumber();
      let deploymentBlock = high;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const code = await provider.getCode(contractAddress, mid);
        
        if (code && code !== '0x') {
          deploymentBlock = mid;
          high = mid - 1;
        } else {
          low = mid + 1;
        }
      }

      console.log(`Contract deployed at block: ${deploymentBlock}`);
      return deploymentBlock;
    } catch (error) {
      console.error('Error finding deployment block:', error);
      return 0;
    }
  };

  // Fetch NFT metadata from URI
  const fetchMetadata = async (uri) => {
    try {
      // Handle IPFS URIs - convert ipfs:// to https://ipfs.io/ipfs/
      let metadataUrl = uri;
      if (uri.startsWith('ipfs://')) {
        metadataUrl = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
      }
      
      console.log(`Fetching metadata from: ${metadataUrl}`);
      
      const response = await fetch(metadataUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const metadata = await response.json();
      
      // Handle IPFS image URLs in metadata
      if (metadata.image && metadata.image.startsWith('ipfs://')) {
        metadata.image = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
      }
      
      // Handle other IPFS URLs that might be in metadata
      if (metadata.animation_url && metadata.animation_url.startsWith('ipfs://')) {
        metadata.animation_url = metadata.animation_url.replace('ipfs://', 'https://ipfs.io/ipfs/');
      }
      
      return metadata;
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return {
        name: 'Unknown NFT',
        description: 'Metadata unavailable',
        image: null
      };
    }
  };

  // Fetch NFTs using balanceOf + tokenOfOwnerByIndex (phương pháp thay thế)
  const fetchNFTsFromContractEnumerable = async (contractInfo) => {
    try {
      const contract = new ethers.Contract(contractInfo.address, ERC721_ABI, provider);
      
      console.log(`Fetching NFTs from ${contractInfo.name} using Enumerable method`);

      // Kiểm tra contract có tồn tại không
      const code = await provider.getCode(contractInfo.address);
      if (!code || code === '0x') {
        console.log(`Contract ${contractInfo.address} does not exist or has no code`);
        return [];
      }

      // Lấy balance của user
      const balance = await contract.balanceOf(account);
      const balanceNum = Number(balance);
      
      console.log(`User balance: ${balanceNum} NFTs`);

      if (balanceNum === 0) {
        return [];
      }

      const myNFTs = [];

      // Loop qua từng token index
      for (let i = 0; i < balanceNum; i++) {
        try {
          // Lấy tokenId từ index
          const tokenId = await contract.tokenOfOwnerByIndex(account, i);
          const tokenIdStr = tokenId.toString();
          
          console.log(`Processing token ${i + 1}/${balanceNum}: ${tokenIdStr}`);

          // Lấy tokenURI
          let uri = await contract.tokenURI(tokenId);
          
          // Fix ipfs:// → https://ipfs.io/ipfs/
          if (uri.startsWith("ipfs://")) {
            uri = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
          }

          // Fetch metadata
          const metadata = await fetchMetadata(uri);
          
          myNFTs.push({
            tokenId: tokenIdStr,
            contractAddress: contractInfo.address,
            contractName: contractInfo.name,
            contractSymbol: contractInfo.symbol,
            tokenURI: uri,
            metadata,
            name: metadata.name || `${contractInfo.symbol} #${tokenIdStr}`,
            description: metadata.description || 'No description available',
            image: metadata.image
          });

        } catch (tokenError) {
          console.error(`Error processing token at index ${i}:`, tokenError);
          // Continue with next token
        }
      }
      
      console.log(`Successfully fetched ${myNFTs.length} NFTs from ${contractInfo.name} using Enumerable method`);
      return myNFTs;
      
    } catch (error) {
      console.error(`Error fetching NFTs from ${contractInfo.name} using Enumerable method:`, error);
      return [];
    }
  };

  // Fetch NFTs for a specific contract using Transfer events (chuẩn)
  const fetchNFTsFromContract = async (contractInfo) => {
    try {
      // Kiểm tra contract có tồn tại không
      const code = await provider.getCode(contractInfo.address);
      if (!code || code === '0x') {
        console.log(`Contract ${contractInfo.address} does not exist or has no code`);
        return [];
      }

      const contract = new ethers.Contract(contractInfo.address, ERC721_ABI, provider);
      
      console.log(`Fetching NFTs from ${contractInfo.name} (${contractInfo.address})`);

      // Tối ưu: Lấy deployment block của contract để scan nhanh hơn
      let fromBlock = 0;
      try {
        // Thử lấy deployment block từ contract creation
        const deploymentBlock = await provider.getCode(contractInfo.address, 'earliest');
        if (deploymentBlock && deploymentBlock !== '0x') {
          // Tìm block đầu tiên có code
          fromBlock = await findContractDeploymentBlock(contractInfo.address);
        }
      } catch (error) {
        console.log('Could not determine deployment block, scanning from block 0');
        fromBlock = 0;
      }

      console.log(`Scanning Transfer events from block ${fromBlock} to latest`);
      
      // Lấy toàn bộ event Transfer từ deployment block → latest
      const logs = await contract.queryFilter("Transfer", fromBlock, "latest");
      
      console.log(`Found ${logs.length} total Transfer events in contract`);

      // Nếu không có Transfer events, contract có thể chưa có token nào
      if (logs.length === 0) {
        console.log(`No Transfer events found in contract ${contractInfo.address}`);
        return [];
      }

      // Kiểm tra xem contract có phải ERC-721 không bằng cách thử gọi ownerOf
      try {
        // Thử gọi ownerOf với tokenId = 1 để kiểm tra
        await contract.ownerOf(1);
      } catch (error) {
        // Nếu không có token nào, vẫn tiếp tục scan events
        console.log(`Contract ${contractInfo.address} may not have tokens yet, continuing scan...`);
      }

      const myNFTs = [];
      const processedTokens = new Set(); // Tránh duplicate tokens

      // Lọc các event Transfer có 'to' = user address
      let processedCount = 0;
      for (let log of logs) {
        try {
          const { from, to, tokenId } = log.args;
          const tokenIdStr = tokenId.toString();

          if (to.toLowerCase() === account.toLowerCase()) {
            // Tránh xử lý cùng một token nhiều lần
            if (processedTokens.has(tokenIdStr)) {
              continue;
            }

            // Kiểm tra xem user có còn giữ token không
            const owner = await contract.ownerOf(tokenId);
            
            if (owner.toLowerCase() === account.toLowerCase()) {
              processedTokens.add(tokenIdStr);
              
              // Lấy tokenURI
              let uri = await contract.tokenURI(tokenId);
              
              // Fix ipfs:// → https://ipfs.io/ipfs/
              if (uri.startsWith("ipfs://")) {
                uri = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
              }

              // Fetch metadata
              const metadata = await fetchMetadata(uri);
              
              myNFTs.push({
                tokenId: tokenIdStr,
                contractAddress: contractInfo.address,
                contractName: contractInfo.name,
                contractSymbol: contractInfo.symbol,
                tokenURI: uri,
                metadata,
                name: metadata.name || `${contractInfo.symbol} #${tokenIdStr}`,
                description: metadata.description || 'No description available',
                image: metadata.image
              });

              processedCount++;
              
              // Log progress mỗi 10 tokens
              if (processedCount % 10 === 0) {
                console.log(`Processed ${processedCount} NFTs from ${contractInfo.name}...`);
              }
            }
          }
        } catch (tokenError) {
          console.error(`Error processing token ${log.args?.tokenId}:`, tokenError);
          // Continue with next token
        }
      }
      
      console.log(`Successfully fetched ${myNFTs.length} NFTs from ${contractInfo.name}`);
      return myNFTs;
      
    } catch (error) {
      console.error(`Error fetching NFTs from ${contractInfo.name}:`, error);
      return [];
    }
  };

  // Fetch all NFTs
  const fetchAllNFTs = async () => {
    if (!isConnected || !provider || !account) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setNfts([]);
      setTotalBalance(0);
      
      console.log('Fetching NFTs for account:', account);
      showInfoToast('🔍 Scanning for NFTs...');
      
      const allNFTs = [];
      let contractsScanned = 0;
      
      // Combine default and custom contracts
      const allContracts = [...NFT_CONTRACTS, ...customContracts];
      
      if (allContracts.length === 0) {
        showInfoToast('No NFT contracts configured. Add some contracts to scan for NFTs.');
        return;
      }
      
      // Fetch from all NFT contracts using selected method
      for (const contractInfo of allContracts) {
        try {
          console.log(`Scanning contract ${contractsScanned + 1}/${allContracts.length}: ${contractInfo.name}`);
          
          let contractNFTs = [];
          if (fetchMethod === 'enumerable') {
            contractNFTs = await fetchNFTsFromContractEnumerable(contractInfo);
          } else {
            contractNFTs = await fetchNFTsFromContract(contractInfo);
          }
          
          allNFTs.push(...contractNFTs);
          contractsScanned++;
          
          // Show progress
          if (contractNFTs.length > 0) {
            showInfoToast(`📦 Found ${contractNFTs.length} NFTs in ${contractInfo.name}`);
          }
        } catch (contractError) {
          console.error(`Error scanning ${contractInfo.name}:`, contractError);
          // Continue with other contracts even if one fails
        }
      }
      
      setNfts(allNFTs);
      setTotalBalance(allNFTs.length);
      
      if (allNFTs.length > 0) {
        showSuccessToast(`✅ Loaded ${allNFTs.length} NFTs from ${contractsScanned} contracts`);
      } else {
        showInfoToast('No NFTs found in your wallet');
      }
      
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      setError(error.message || 'Failed to fetch NFTs');
      showErrorToast('❌ Failed to fetch NFT metadata');
    } finally {
      setLoading(false);
    }
  };

  // Load NFTs when component mounts or account changes
  useEffect(() => {
    if (isConnected && account) {
      fetchAllNFTs();
    }
  }, [isConnected, account]);

  const copyTokenId = async (tokenId) => {
    try {
      await navigator.clipboard.writeText(tokenId);
      showSuccessToast(`Token ID ${tokenId} copied!`);
    } catch (error) {
      showErrorToast('Failed to copy token ID');
    }
  };

  const addCustomContract = async () => {
    if (!newContractAddress || !newContractName) {
      showErrorToast('Please enter both contract address and name');
      return;
    }

    // Validate address format
    if (!ethers.isAddress(newContractAddress)) {
      showErrorToast('Invalid contract address format');
      return;
    }

    // Check if contract already exists
    const allContracts = [...NFT_CONTRACTS, ...customContracts];
    if (allContracts.some(contract => contract.address.toLowerCase() === newContractAddress.toLowerCase())) {
      showErrorToast('Contract already added');
      return;
    }

    try {
      // Test if contract is valid by trying to get its name
      const contract = new ethers.Contract(newContractAddress, ERC721_ABI, provider);
      const contractName = await contract.name();
      const contractSymbol = await contract.symbol();

      const newContract = {
        name: newContractName,
        address: newContractAddress,
        symbol: contractSymbol || 'UNKNOWN'
      };

      setCustomContracts(prev => [...prev, newContract]);
      setNewContractAddress('');
      setNewContractName('');
      setShowAddContract(false);
      
      showSuccessToast(`✅ Added contract: ${contractName || newContractName}`);
    } catch (error) {
      console.error('Error validating contract:', error);
      showErrorToast('Invalid ERC-721 contract or network error');
    }
  };

  const removeCustomContract = (contractAddress) => {
    setCustomContracts(prev => prev.filter(contract => contract.address !== contractAddress));
    showInfoToast('Contract removed');
  };

  const openInExplorer = (contractAddress, tokenId) => {
    // Open NFT in block explorer (adjust URL as needed)
    const explorerUrl = `https://zentrace.io/token/${contractAddress}?a=${tokenId}`;
    window.open(explorerUrl, '_blank');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          {/* Back Button */}
          {onClose && (
            <Button
              startIcon={<ArrowBack />}
              onClick={onClose}
              sx={{
                color: '#00ff88',
                mb: 3,
                '&:hover': {
                  backgroundColor: 'rgba(0, 255, 136, 0.1)'
                }
              }}
            >
              Back to Dashboard
            </Button>
          )}
          
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ 
                bgcolor: 'transparent',
                width: 60, 
                height: 60,
                background: 'linear-gradient(135deg, #8b5cf6, #00bfff)',
                fontSize: '2rem'
              }}>
                🖼️
              </Avatar>
            </Box>
            <Typography variant="h3" sx={{ 
              fontWeight: 700, 
              color: '#8b5cf6',
              textShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
              mb: 2
            }}>
              My NFT Collection
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 2 }}>
              View your ERC-721 NFTs on ZenChain Testnet
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 2,
              flexWrap: 'wrap',
              mb: 2
            }}>
              <Chip
                label={`Contract: ${NFT_CONTRACTS[0]?.address.slice(0, 6)}...${NFT_CONTRACTS[0]?.address.slice(-4)}`}
                size="small"
                sx={{
                  bgcolor: 'rgba(139, 92, 246, 0.2)',
                  color: '#8b5cf6',
                  fontWeight: 600,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'rgba(139, 92, 246, 0.3)'
                  }
                }}
                onClick={() => {
                  navigator.clipboard.writeText(NFT_CONTRACTS[0]?.address);
                  showSuccessToast('Contract address copied!');
                }}
              />
              <Chip
                label={`Method: ${fetchMethod === 'enumerable' ? 'Enumerable (Fast)' : 'Events (Universal)'}`}
                size="small"
                sx={{
                  bgcolor: 'rgba(0, 191, 255, 0.2)',
                  color: '#00bfff',
                  fontWeight: 600
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Controls */}
        <Card sx={{
          mb: 4,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: 3
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CollectionsBookmark sx={{ color: '#8b5cf6' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  NFT Collection ({totalBalance})
                </Typography>
                {totalBalance > 0 && (
                  <Chip
                    label={`${totalBalance} NFTs Found`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(34, 197, 94, 0.2)',
                      color: '#22c55e',
                      fontWeight: 600
                    }}
                  />
                )}
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Method</InputLabel>
                  <Select
                    value={fetchMethod}
                    onChange={(e) => setFetchMethod(e.target.value)}
                    label="Method"
                    sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(139, 92, 246, 0.3)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(139, 92, 246, 0.5)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#8b5cf6',
                      },
                      '& .MuiSvgIcon-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                      }
                    }}
                  >
                    <MenuItem value="enumerable">Enumerable (Fast)</MenuItem>
                    <MenuItem value="events">Events (Universal)</MenuItem>
                  </Select>
                </FormControl>
                
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Settings />}
                  onClick={() => setShowAddContract(true)}
                  sx={{
                    borderColor: '#00bfff',
                    color: '#00bfff',
                    '&:hover': {
                      borderColor: '#00bfff',
                      backgroundColor: 'rgba(0, 191, 255, 0.1)'
                    }
                  }}
                >
                  Manage Contracts
                </Button>
                
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Refresh />}
                  onClick={fetchAllNFTs}
                  disabled={loading}
                  sx={{
                    borderColor: '#8b5cf6',
                    color: '#8b5cf6',
                    '&:hover': {
                      borderColor: '#8b5cf6',
                      backgroundColor: 'rgba(139, 92, 246, 0.1)'
                    }
                  }}
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4,
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              color: 'white',
              '& .MuiAlert-icon': { color: '#ff5722' }
            }}
          >
            {error}
          </Alert>
        )}

        {/* NFT Gallery */}
        <Card sx={{
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: 3
        }}>
          <CardContent sx={{ p: 4 }}>
            {!isConnected ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CollectionsBookmark sx={{ fontSize: 64, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  Connect Your Wallet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Connect your wallet to view your NFT collection
                </Typography>
              </Box>
            ) : loading ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CircularProgress size={60} sx={{ color: '#8b5cf6', mb: 3 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  Loading NFTs...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fetching your collection from ZenChain
                </Typography>
              </Box>
            ) : nfts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <ImageIcon sx={{ fontSize: 64, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No NFTs Found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                  {customContracts.length === 0 && NFT_CONTRACTS.length === 0 
                    ? "No NFT contracts configured. Click 'Manage Contracts' to add NFT contract addresses to scan."
                    : `You don't have any ERC-721 NFTs in contract ${NFT_CONTRACTS[0]?.address.slice(0, 6)}...${NFT_CONTRACTS[0]?.address.slice(-4)} yet`
                  }
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    onClick={fetchAllNFTs}
                    sx={{
                      borderColor: '#8b5cf6',
                      color: '#8b5cf6',
                      '&:hover': {
                        backgroundColor: 'rgba(139, 92, 246, 0.1)'
                      }
                    }}
                  >
                    Refresh Collection
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Settings />}
                    onClick={() => setShowAddContract(true)}
                    sx={{
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                      }
                    }}
                  >
                    Manage Contracts
                  </Button>
                </Box>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {nfts.map((nft, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={`${nft.contractAddress}-${nft.tokenId}`}>
                    <Card sx={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px) scale(1.02)',
                        border: '1px solid rgba(139, 92, 246, 0.5)',
                        boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)'
                      }
                    }}>
                      {/* NFT Image */}
                      <Box sx={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden' }}>
                        {nft.image ? (
                          <CardMedia
                            component="img"
                            image={nft.image}
                            alt={nft.name}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.3s ease',
                              '&:hover': {
                                transform: 'scale(1.1)'
                              }
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        
                        {/* Fallback when image fails to load */}
                        <Box sx={{
                          display: nft.image ? 'none' : 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          backgroundColor: 'rgba(139, 92, 246, 0.1)',
                          flexDirection: 'column',
                          gap: 1
                        }}>
                          <ImageIcon sx={{ fontSize: 48, color: '#8b5cf6' }} />
                          <Typography variant="caption" color="text.secondary">
                            No Image
                          </Typography>
                        </Box>

                        {/* Token ID Badge */}
                        <Chip
                          label={`#${nft.tokenId}`}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(0, 0, 0, 0.8)',
                            color: '#8b5cf6',
                            fontWeight: 600,
                            backdropFilter: 'blur(10px)'
                          }}
                        />
                      </Box>

                      {/* NFT Info */}
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600, 
                          color: 'white',
                          mb: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {nft.name}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ 
                          mb: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          minHeight: '2.5em'
                        }}>
                          {nft.description}
                        </Typography>

                        <Chip
                          label={nft.contractSymbol}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(139, 92, 246, 0.2)',
                            color: '#8b5cf6',
                            fontWeight: 600,
                            mb: 2
                          }}
                        />

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            startIcon={<ContentCopy />}
                            onClick={() => copyTokenId(nft.tokenId)}
                            sx={{
                              flex: 1,
                              fontSize: '0.75rem',
                              backgroundColor: 'rgba(139, 92, 246, 0.2)',
                              color: '#8b5cf6',
                              border: '1px solid rgba(139, 92, 246, 0.3)',
                              '&:hover': {
                                backgroundColor: 'rgba(139, 92, 246, 0.3)'
                              }
                            }}
                          >
                            Copy ID
                          </Button>
                          
                          <IconButton
                            size="small"
                            onClick={() => openInExplorer(nft.contractAddress, nft.tokenId)}
                            sx={{
                              color: '#00bfff',
                              border: '1px solid rgba(0, 191, 255, 0.3)',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 191, 255, 0.1)'
                              }
                            }}
                          >
                            <OpenInNew fontSize="small" />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>

        {/* Collection Summary */}
        {nfts.length > 0 && (
          <Card sx={{
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: 3
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: '#8b5cf6', mb: 3, fontWeight: 600 }}>
                📊 Collection Summary
              </Typography>
              
              <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(139, 92, 246, 0.1)', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Contract:</strong> {NFT_CONTRACTS[0]?.address}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>Method:</strong> {fetchMethod === 'enumerable' ? 'Enumerable (balanceOf + tokenOfOwnerByIndex)' : 'Events (Transfer event scanning)'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Network:</strong> ZenChain Testnet
                </Typography>
              </Box>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: 2
              }}>
                <Box sx={{ 
                  textAlign: 'center',
                  p: 2,
                  borderRadius: 2,
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.3)'
                }}>
                  <Typography variant="h4" sx={{ 
                    color: '#8b5cf6', 
                    fontWeight: 700,
                    mb: 0.5
                  }}>
                    {totalBalance}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Total NFTs
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  textAlign: 'center',
                  p: 2,
                  borderRadius: 2,
                  background: 'rgba(0, 191, 255, 0.1)',
                  border: '1px solid rgba(0, 191, 255, 0.3)'
                }}>
                  <Typography variant="h4" sx={{ 
                    color: '#00bfff', 
                    fontWeight: 700,
                    mb: 0.5
                  }}>
                    {new Set(nfts.map(nft => nft.contractAddress)).size}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Collections
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  textAlign: 'center',
                  p: 2,
                  borderRadius: 2,
                  background: 'rgba(0, 255, 136, 0.1)',
                  border: '1px solid rgba(0, 255, 136, 0.3)'
                }}>
                  <Typography variant="h4" sx={{ 
                    color: '#00ff88', 
                    fontWeight: 700,
                    mb: 0.5
                  }}>
                    {nfts.filter(nft => nft.image).length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    With Images
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Custom Contract Management Dialog */}
        <Dialog 
          open={showAddContract} 
          onClose={() => setShowAddContract(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: 3
            }
          }}
        >
          <DialogTitle sx={{ 
            color: '#8b5cf6', 
            fontWeight: 600,
            borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
            pb: 2
          }}>
            Manage NFT Contracts
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3 }}>
            {/* Add New Contract */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                Add Custom Contract
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Contract Name"
                  value={newContractName}
                  onChange={(e) => setNewContractName(e.target.value)}
                  placeholder="e.g., My Awesome NFT"
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(139, 92, 246, 0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(139, 92, 246, 0.5)' },
                      '&.Mui-focused fieldset': { borderColor: '#8b5cf6' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#8b5cf6' }
                  }}
                />
                
                <TextField
                  label="Contract Address"
                  value={newContractAddress}
                  onChange={(e) => setNewContractAddress(e.target.value)}
                  placeholder="0x..."
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': { borderColor: 'rgba(139, 92, 246, 0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(139, 92, 246, 0.5)' },
                      '&.Mui-focused fieldset': { borderColor: '#8b5cf6' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#8b5cf6' }
                  }}
                />
                
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={addCustomContract}
                  disabled={!newContractAddress || !newContractName}
                  sx={{
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                    }
                  }}
                >
                  Add Contract
                </Button>
              </Box>
            </Box>

            {/* Custom Contracts List */}
            {customContracts.length > 0 && (
              <Box>
                <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                  Custom Contracts ({customContracts.length})
                </Typography>
                
                <List sx={{ 
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: 2,
                  border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                  {customContracts.map((contract, index) => (
                    <ListItem key={contract.address} sx={{ borderBottom: '1px solid rgba(139, 92, 246, 0.1)' }}>
                      <ListItemText
                        primary={contract.name}
                        secondary={`${contract.address.slice(0, 6)}...${contract.address.slice(-4)} • ${contract.symbol}`}
                        primaryTypographyProps={{ color: 'white', fontWeight: 600 }}
                        secondaryTypographyProps={{ color: 'rgba(255, 255, 255, 0.7)' }}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => removeCustomContract(contract.address)}
                          sx={{ color: '#ef4444' }}
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Default Contracts Info */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0, 191, 255, 0.1)', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Default Contracts:</strong> {NFT_CONTRACTS.length} pre-configured NFT contracts are automatically scanned.
              </Typography>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <Button
              onClick={() => setShowAddContract(false)}
              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default MyNFT;
