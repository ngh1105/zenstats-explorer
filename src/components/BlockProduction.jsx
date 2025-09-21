import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  CircularProgress,
  Alert,
  Button,
  Tooltip
} from '@mui/material';
import { Refresh, Speed, ContentCopy } from '@mui/icons-material';
import axios from 'axios';

const BlockProduction = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avgBlockTime, setAvgBlockTime] = useState(0);

  // Helper function to shorten hash
  const shortenHash = (hash) => {
    if (!hash || hash.length < 10) return "Unknown";
    return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
  };

  // Helper function to format time
  const formatTime = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Helper function to copy hash to clipboard
  const copyToClipboard = (hash) => {
    navigator.clipboard.writeText(hash).then(() => {
      console.log('Hash copied to clipboard:', hash);
    }).catch(err => {
      console.error('Failed to copy hash:', err);
    });
  };

  const fetchBlocks = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching blocks from API...');
      const response = await axios.get('https://zentrace.io/api/v2/blocks?type=block%20%7C%20uncle%20%7C%20reorg&limit=20');
      
      console.log('📊 Blocks API response:', response.data);
      
      if (response.data && response.data.items && Array.isArray(response.data.items)) {
        const blocksData = response.data.items;
        setBlocks(blocksData);
        
        // Calculate average block time
        if (blocksData.length > 1) {
          const times = blocksData.map(b => new Date(b.timestamp).getTime());
          const diffs = times.slice(1).map((t, i) => (t - times[i]) / 1000);
          const avgTime = diffs.reduce((a, b) => a + b, 0) / diffs.length;
          setAvgBlockTime(avgTime);
        }
      } else {
        setBlocks([]);
        setAvgBlockTime(0);
      }
    } catch (err) {
      console.error('❌ Error fetching blocks:', err);
      setError(err.message || 'Failed to load blocks');
      setBlocks([]);
      setAvgBlockTime(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  // Common card styles
  const cardStyles = {
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(0, 255, 136, 0.3)',
    boxShadow: '0 0 20px rgba(0, 255, 136, 0.1)',
    height: '400px',
    width: '100%',
    borderRadius: 3,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'scale(1.05)',
      border: '1px solid #00ff88',
      boxShadow: '0 0 25px rgba(0, 255, 136, 0.6), 0 4px 20px rgba(0, 255, 136, 0.3)',
    }
  };

  // Common header component
  const CardHeader = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box sx={{ 
        width: 40, 
        height: 40, 
        borderRadius: 2, 
        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mr: 2
      }}>
        <Speed sx={{ color: 'white', fontSize: 20 }} />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Block Production
      </Typography>
    </Box>
  );

  if (loading) {
    return (
      <Card sx={cardStyles}>
        <CardContent>
          <CardHeader />
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: 280,
            gap: 2
          }}>
            <CircularProgress size={40} sx={{ color: '#00ff88' }} />
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Loading blocks...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={cardStyles}>
        <CardContent>
          <CardHeader />
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: 280,
            gap: 2
          }}>
            <Alert severity="error" sx={{ backgroundColor: 'rgba(244, 67, 54, 0.1)', color: 'white' }}>
              Failed to load blocks
            </Alert>
            <Button 
              variant="contained" 
              startIcon={<Refresh />}
              onClick={fetchBlocks}
              sx={{
                background: 'linear-gradient(45deg, #00ff88, #00bfff)',
                color: 'white',
                fontWeight: 600,
                '&:hover': { transform: 'scale(1.05)' }
              }}
            >
              Retry
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!blocks || blocks.length === 0) {
    return (
      <Card sx={cardStyles}>
        <CardContent>
          <CardHeader />
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: 280,
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
            <Typography variant="body1">
              No blocks data available
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={cardStyles}>
      <CardContent>
        <CardHeader />
        
        {/* Average Block Time Display */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: 3,
          p: 2,
          background: 'rgba(0, 255, 136, 0.1)',
          borderRadius: 2,
          border: '1px solid rgba(0, 255, 136, 0.3)'
        }}>
          <Typography variant="h4" sx={{ 
            color: '#00ff88',
            fontWeight: 800,
            fontSize: '2rem',
            textShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
            mb: 1
          }}>
            {avgBlockTime.toFixed(1)}s
          </Typography>
          <Typography variant="body2" sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            fontWeight: 600
          }}>
            Average Block Time
          </Typography>
        </Box>

        {/* Blocks List */}
        <Box sx={{ 
          maxHeight: 200, 
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0, 255, 136, 0.5)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(0, 255, 136, 0.7)',
          }
        }}>
          <List sx={{ p: 0 }}>
            {blocks.slice(0, 10).map((block, index) => (
              <ListItem 
                key={block.hash || index}
                sx={{ 
                  px: 0,
                  py: 1,
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  '&:last-child': {
                    borderBottom: 'none'
                  }
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  width: '100%',
                  gap: 2
                }}>
                  {/* Block Height */}
                  <Box sx={{ 
                    minWidth: '60px',
                    textAlign: 'center'
                  }}>
                    <Typography variant="body2" sx={{ 
                      color: '#00ff88',
                      fontWeight: 700,
                      fontSize: '0.875rem'
                    }}>
                      #{block.height}
                    </Typography>
                  </Box>

                  {/* Time */}
                  <Box sx={{ 
                    minWidth: '80px',
                    textAlign: 'center'
                  }}>
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '0.875rem',
                      fontFamily: 'monospace'
                    }}>
                      {formatTime(block.timestamp)}
                    </Typography>
                  </Box>

                  {/* Hash with copy functionality */}
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      flex: 1
                    }}>
                      {shortenHash(block.hash)}
                    </Typography>
                    <Tooltip title="Copy hash">
                      <Box
                        onClick={() => copyToClipboard(block.hash)}
                        sx={{
                          cursor: 'pointer',
                          color: '#00ff88',
                          '&:hover': {
                            color: '#00ff88',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <ContentCopy sx={{ fontSize: 16 }} />
                      </Box>
                    </Tooltip>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BlockProduction;
