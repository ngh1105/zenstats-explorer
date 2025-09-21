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
  Alert
} from '@mui/material';
import { 
  CollectionsBookmark,
  Refresh,
  ContentCopy,
  OpenInNew
} from '@mui/icons-material';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';

const NFTDemo = () => {
  const { account, provider, isConnected } = useWallet();
  const { showSuccessToast, showErrorToast, showInfoToast } = useToast();
  
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState(0);

  // Contract address từ user
  const CONTRACT_ADDRESS = "0x4E89fbfAc2fCcbD96f2D29961822F1e589b3C3ae";
  
  // ERC-721 ABI
  const ERC721_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function name() view returns (string)",
    "function symbol() view returns (string)"
  ];

  // Fetch metadata từ URI
  const fetchMetadata = async (uri) => {
    try {
      let metadataUrl = uri;
      if (uri.startsWith('ipfs://')) {
        metadataUrl = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
      }
      
      const response = await fetch(metadataUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const metadata = await response.json();
      
      // Fix IPFS image URLs
      if (metadata.image && metadata.image.startsWith('ipfs://')) {
        metadata.image = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
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

  // Fetch NFTs sử dụng balanceOf + tokenOfOwnerByIndex
  const fetchNFTs = async () => {
    if (!isConnected || !provider || !account) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setNfts([]);
      setBalance(0);
      
      console.log('Fetching NFTs for account:', account);
      showInfoToast('🔍 Fetching your NFT collection...');
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ERC721_ABI, provider);
      
      // Kiểm tra contract có tồn tại không
      const code = await provider.getCode(CONTRACT_ADDRESS);
      if (!code || code === '0x') {
        throw new Error('Contract does not exist or has no code');
      }

      // Lấy balance
      const balanceResult = await contract.balanceOf(account);
      const balanceNum = Number(balanceResult);
      setBalance(balanceNum);
      
      console.log(`User balance: ${balanceNum} NFTs`);

      if (balanceNum === 0) {
        showInfoToast('No NFTs found in your wallet');
        return;
      }

      const myNFTs = [];

      // Loop qua từng token index
      for (let i = 0; i < balanceNum; i++) {
        try {
          console.log(`Processing token ${i + 1}/${balanceNum}`);
          
          // Lấy tokenId từ index
          const tokenId = await contract.tokenOfOwnerByIndex(account, i);
          const tokenIdStr = tokenId.toString();
          
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
            contractAddress: CONTRACT_ADDRESS,
            tokenURI: uri,
            metadata,
            name: metadata.name || `NFT #${tokenIdStr}`,
            description: metadata.description || 'No description available',
            image: metadata.image
          });

        } catch (tokenError) {
          console.error(`Error processing token at index ${i}:`, tokenError);
          // Continue with next token
        }
      }
      
      setNfts(myNFTs);
      
      if (myNFTs.length > 0) {
        showSuccessToast(`✅ Found ${myNFTs.length} NFTs!`);
      } else {
        showInfoToast('No NFTs found in your wallet');
      }
      
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      setError(error.message || 'Failed to fetch NFTs');
      showErrorToast('❌ Failed to fetch NFT collection');
    } finally {
      setLoading(false);
    }
  };

  // Load NFTs khi component mount hoặc account thay đổi
  useEffect(() => {
    if (isConnected && account) {
      fetchNFTs();
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

  const openInExplorer = (tokenId) => {
    const explorerUrl = `https://zentrace.io/token/${CONTRACT_ADDRESS}?a=${tokenId}`;
    window.open(explorerUrl, '_blank');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
            <CollectionsBookmark sx={{ fontSize: 48, color: '#8b5cf6' }} />
          </Box>
          <Typography variant="h3" sx={{ 
            fontWeight: 700, 
            color: '#8b5cf6',
            textShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
            mb: 2
          }}>
            NFT Collection Demo
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Contract: {CONTRACT_ADDRESS}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Using balanceOf() + tokenOfOwnerByIndex() method
          </Typography>
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
                  Your NFTs ({balance})
                </Typography>
                {balance > 0 && (
                  <Chip
                    label={`${balance} NFTs Found`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(34, 197, 94, 0.2)',
                      color: '#22c55e',
                      fontWeight: 600
                    }}
                  />
                )}
              </Box>
              
              <Button
                variant="outlined"
                size="small"
                startIcon={<Refresh />}
                onClick={fetchNFTs}
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
                <CollectionsBookmark sx={{ fontSize: 64, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No NFTs Found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  You don't have any NFTs in this contract yet
                </Typography>
                <Button
                  variant="outlined"
                  onClick={fetchNFTs}
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
              </Box>
            ) : (
              <Grid container spacing={3}>
                {nfts.map((nft, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={nft.tokenId}>
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
                          <CollectionsBookmark sx={{ fontSize: 48, color: '#8b5cf6' }} />
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
                          
                          <Button
                            size="small"
                            startIcon={<OpenInNew />}
                            onClick={() => openInExplorer(nft.tokenId)}
                            sx={{
                              backgroundColor: 'rgba(0, 191, 255, 0.2)',
                              color: '#00bfff',
                              border: '1px solid rgba(0, 191, 255, 0.3)',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 191, 255, 0.3)'
                              }
                            }}
                          >
                            View
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default NFTDemo;
