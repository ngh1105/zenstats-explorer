import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { Refresh, AccountBalance } from '@mui/icons-material';
import axios from 'axios';

const TopTokenHolders = () => {
  const [holders, setHolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to shorten address
  const shortenAddress = (hash) => {
    if (!hash || hash.length < 10) return "Unknown";
    return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
  };

  // Helper function to format numbers
  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "0";
    return Number(num).toLocaleString();
  };

  const fetchHolders = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching native coin holders from API...');
      const response = await axios.get('https://zentrace.io/api/v2/addresses');
      
      console.log('📊 Holders API response:', response.data);
      
      if (response.data && response.data.items && Array.isArray(response.data.items)) {
        setHolders(response.data.items);
      } else {
        setHolders([]);
      }
    } catch (err) {
      console.error('❌ Error fetching holders:', err);
      setError(err.message || 'Failed to load holders');
      setHolders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolders();
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
        <AccountBalance sx={{ color: 'white', fontSize: 20 }} />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Top Native Coin Holders
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
              Loading holders...
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
              Failed to load holders
            </Alert>
            <Button 
              variant="contained" 
              startIcon={<Refresh />}
              onClick={fetchHolders}
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

  if (!holders || holders.length === 0) {
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
              No holders data available
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
        <Box sx={{ 
          maxHeight: 280, 
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
            {holders.map((holder, index) => (
              <ListItem 
                key={holder.hash || index}
                sx={{ 
                  px: 0,
                  py: 1,
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  '&:last-child': {
                    borderBottom: 'none'
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ 
                    width: 32, 
                    height: 32, 
                    background: 'linear-gradient(135deg, #00ff88, #00bfff)',
                    boxShadow: '0 0 15px rgba(0, 255, 136, 0.5)',
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                  }}>
                    {index + 1}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600, 
                      color: 'white',
                      fontFamily: 'monospace',
                      mb: 0.5
                    }}>
                      {shortenAddress(holder.hash)}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '0.875rem'
                    }}>
                      {formatNumber(holder.coin_balance)} ZTC
                    </Typography>
                  }
                />
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-end',
                  minWidth: '80px'
                }}>
                  <Typography variant="body2" sx={{ 
                    color: '#00ff88',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}>
                    {formatNumber(holder.tx_count)} tx
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TopTokenHolders;