import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Chip,
  Alert
} from '@mui/material';
import { 
  ContentCopy,
  CheckCircle,
  OpenInNew
} from '@mui/icons-material';

const TxHashBox = ({ hash, onCopy, type = 'success', label = 'Transaction Hash' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      if (onCopy) onCopy();
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const openInExplorer = () => {
    window.open(`https://zentrace.io/tx/${hash}`, '_blank');
  };

  if (!hash) return null;

  return (
    <Alert 
      severity={type}
      sx={{ 
        backgroundColor: type === 'success' 
          ? 'rgba(34, 197, 94, 0.1)' 
          : 'rgba(244, 67, 54, 0.1)',
        border: type === 'success' 
          ? '1px solid rgba(34, 197, 94, 0.3)' 
          : '1px solid rgba(244, 67, 54, 0.3)',
        color: 'white',
        borderRadius: 2,
        '& .MuiAlert-icon': { 
          color: type === 'success' ? '#22c55e' : '#ef4444' 
        },
        '& .MuiAlert-message': {
          width: '100%'
        }
      }}
    >
      <Box sx={{ width: '100%' }}>
        <Typography variant="body2" sx={{ 
          color: type === 'success' ? '#22c55e' : '#ef4444',
          fontWeight: 600,
          mb: 1
        }}>
          {type === 'success' ? '✅' : '❌'} {label}
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          flexWrap: 'wrap'
        }}>
          <Chip 
            label={`${hash.slice(0, 10)}...${hash.slice(-8)}`}
            sx={{ 
              bgcolor: type === 'success' 
                ? 'rgba(34, 197, 94, 0.2)' 
                : 'rgba(244, 67, 54, 0.2)',
              color: type === 'success' ? '#22c55e' : '#ef4444',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: `1px solid ${type === 'success' ? '#22c55e40' : '#ef444440'}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                bgcolor: type === 'success' 
                  ? 'rgba(34, 197, 94, 0.3)' 
                  : 'rgba(244, 67, 54, 0.3)',
              }
            }}
            onClick={openInExplorer}
          />
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={copied ? <CheckCircle /> : <ContentCopy />}
              onClick={handleCopy}
              sx={{
                minWidth: 'auto',
                px: 2,
                py: 0.5,
                fontSize: '0.75rem',
                backgroundColor: copied 
                  ? 'rgba(34, 197, 94, 0.2)' 
                  : 'rgba(0, 255, 136, 0.2)',
                color: copied ? '#22c55e' : '#00ff88',
                border: `1px solid ${copied ? '#22c55e' : '#00ff88'}`,
                fontWeight: 600,
                borderRadius: 1,
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: copied 
                    ? 'rgba(34, 197, 94, 0.3)' 
                    : 'rgba(0, 255, 136, 0.3)',
                  transform: 'scale(1.05)'
                }
              }}
            >
              {copied ? 'Copied!' : 'Copy Hash'}
            </Button>

            <Button
              size="small"
              startIcon={<OpenInNew />}
              onClick={openInExplorer}
              sx={{
                minWidth: 'auto',
                px: 2,
                py: 0.5,
                fontSize: '0.75rem',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                color: '#3b82f6',
                border: '1px solid #3b82f6',
                fontWeight: 600,
                borderRadius: 1,
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(59, 130, 246, 0.3)',
                  transform: 'scale(1.05)'
                }
              }}
            >
              Explorer
            </Button>
          </Box>
        </Box>
      </Box>
    </Alert>
  );
};

export default TxHashBox;
