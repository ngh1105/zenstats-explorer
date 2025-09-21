import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Button, 
  Chip, 
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import { AccountBalanceWallet, Error as ErrorIcon } from '@mui/icons-material';
import { useWallet } from '../contexts/WalletContext';
import { shortenAddress } from '../utils/helpers';
import WalletMenu from './WalletMenu';

const Navbar = ({ onNavigateToActivity, onNavigateToNFT }) => {
  const { account, isConnected, isConnecting, connectWallet, error } = useWallet();

  return (
    <>
      <AppBar 
        position="static" 
        sx={{ 
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 255, 136, 0.3)',
          boxShadow: '0 0 20px rgba(0, 255, 136, 0.1)',
          zIndex: 1,
          transition: 'all 0.3s ease',
          '&:hover': {
            borderBottom: '3px solid #00ff88',
            boxShadow: '0 0 30px rgba(0, 255, 136, 0.3)',
          }
        }}
      >
        <Toolbar>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 2 }}>
            <img 
              src="/zenchain.png" 
              alt="ZenChain Logo" 
              style={{ 
                height: '32px', 
                width: 'auto',
                filter: 'drop-shadow(0 0 8px rgba(0, 255, 136, 0.5))'
              }} 
            />
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(45deg, #00ff88, #00bfff)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
              }}
            >
              ZenStats Explorer
            </Typography>
          </Box>

          {/* Right side */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <WalletMenu 
              onNavigateToActivity={onNavigateToActivity}
              onNavigateToNFT={onNavigateToNFT}
            />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Error Message */}
      {error && (
        <Box sx={{ p: 2 }}>
          <Alert 
            severity="error" 
            icon={<ErrorIcon />}
            sx={{ 
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              color: '#ff5722',
              '& .MuiAlert-icon': { color: '#ff5722' }
            }}
          >
            {error}
          </Alert>
        </Box>
      )}
    </>
  );
};

export default Navbar;
