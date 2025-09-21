import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Chip
} from '@mui/material';
import { 
  AccountBalanceWallet, 
  ContentCopy,
  History,
  Logout,
  ExpandMore,
  CheckCircle,
  CollectionsBookmark
} from '@mui/icons-material';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';
import { shortenAddress } from '../utils/helpers';

const WalletMenu = ({ onNavigateToActivity, onNavigateToNFT }) => {
  const { account, isConnected, isConnecting, connectWallet, error } = useWallet();
  const { showSuccessToast, showInfoToast } = useToast();
  const [anchorEl, setAnchorEl] = useState(null);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);

  const handleClick = (event) => {
    if (isConnected) {
      setAnchorEl(event.currentTarget);
    } else {
      connectWallet();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      showSuccessToast('✅ Address copied to clipboard!');
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
      
      handleClose();
    } catch (error) {
      console.error('Failed to copy address:', error);
      showSuccessToast('Failed to copy address');
    }
  };

  const handleMyActivity = () => {
    console.log('My Activity clicked!');
    if (onNavigateToActivity) {
      console.log('Calling onNavigateToActivity...');
      onNavigateToActivity();
    } else {
      console.log('onNavigateToActivity not provided!');
    }
    handleClose();
  };

  const handleMyNFT = () => {
    console.log('My NFT clicked!');
    if (onNavigateToNFT) {
      console.log('Calling onNavigateToNFT...');
      onNavigateToNFT();
    } else {
      console.log('onNavigateToNFT not provided!');
    }
    handleClose();
  };

  const handleDisconnect = () => {
    // Clear wallet state (this would need to be implemented in WalletContext)
    showInfoToast('ℹ️ Wallet disconnected');
    handleClose();
    // Note: Actual disconnect logic would need to be implemented in WalletContext
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (anchorEl) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [anchorEl]);

  return (
    <Box sx={{ position: 'relative' }} ref={menuRef}>
      {/* Network Badge */}
      <Chip 
        label="ZenChain Testnet" 
        sx={{
          backgroundColor: 'rgba(0, 255, 136, 0.2)',
          border: '1px solid rgba(0, 255, 136, 0.5)',
          color: '#00ff88',
          fontWeight: 600,
          mr: 2,
          '&:hover': {
            backgroundColor: 'rgba(0, 255, 136, 0.3)',
          }
        }}
      />

      {/* Wallet Button/Dropdown */}
      <Button
        onClick={handleClick}
        disabled={isConnecting}
        endIcon={isConnected ? <ExpandMore /> : null}
        startIcon={
          isConnected ? (
            <Box sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: '#00ff88' 
            }} />
          ) : (
            <AccountBalanceWallet />
          )
        }
        sx={{
          background: isConnected 
            ? 'rgba(0, 255, 136, 0.2)'
            : 'linear-gradient(45deg, #00ff88, #00bfff)',
          border: isConnected 
            ? '1px solid rgba(0, 255, 136, 0.5)'
            : '1px solid rgba(0, 255, 136, 0.5)',
          color: isConnected ? '#00ff88' : 'white',
          fontWeight: 600,
          px: 3,
          py: 1,
          transition: 'all 0.3s ease',
          '&:hover': {
            background: isConnected 
              ? 'rgba(0, 255, 136, 0.3)'
              : 'linear-gradient(45deg, #00ff88, #00bfff)',
            borderColor: isConnected 
              ? 'rgba(0, 255, 136, 0.7)'
              : 'rgba(0, 255, 136, 0.5)',
            boxShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
            transform: 'translateY(-2px) scale(1.05)',
          },
          '&:disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
          }
        }}
      >
        {isConnecting ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} color="inherit" />
            <span>Connecting...</span>
          </Box>
        ) : account ? (
          shortenAddress(account)
        ) : (
          'CONNECT WALLET'
        )}
      </Button>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 255, 136, 0.3)',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 255, 136, 0.2)',
            '& .MuiMenuItem-root': {
              color: 'white',
              py: 1.5,
              px: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                color: '#00ff88',
                '& .MuiListItemIcon-root': {
                  color: '#00ff88',
                }
              }
            }
          }
        }}
      >
        {/* Wallet Address Display */}
        <Box sx={{ 
          px: 2, 
          py: 1, 
          borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
          mb: 1
        }}>
          <Chip
            label={account}
            size="small"
            sx={{
              bgcolor: 'rgba(0, 255, 136, 0.2)',
              color: '#00ff88',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              maxWidth: '100%',
              '& .MuiChip-label': {
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }
            }}
          />
        </Box>

        {/* Copy Address */}
        <MenuItem onClick={handleCopyAddress}>
          <ListItemIcon>
            {copied ? (
              <CheckCircle sx={{ color: '#22c55e', fontSize: 20 }} />
            ) : (
              <ContentCopy sx={{ fontSize: 20 }} />
            )}
          </ListItemIcon>
          <ListItemText 
            primary={copied ? "Copied!" : "Copy Address"}
            primaryTypographyProps={{
              fontWeight: 500,
              color: copied ? '#22c55e' : 'inherit'
            }}
          />
        </MenuItem>

        {/* My Activity */}
        <MenuItem onClick={handleMyActivity}>
          <ListItemIcon>
            <History sx={{ fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText 
            primary="My Activity"
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </MenuItem>

        {/* My NFT */}
        <MenuItem onClick={handleMyNFT}>
          <ListItemIcon>
            <CollectionsBookmark sx={{ fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText 
            primary="My NFT"
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </MenuItem>

        <Divider sx={{ borderColor: 'rgba(0, 255, 136, 0.2)', my: 1 }} />

        {/* Disconnect */}
        <MenuItem onClick={handleDisconnect}>
          <ListItemIcon>
            <Logout sx={{ fontSize: 20, color: '#ef4444' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Disconnect"
            primaryTypographyProps={{ 
              fontWeight: 500,
              color: '#ef4444'
            }}
          />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default WalletMenu;
