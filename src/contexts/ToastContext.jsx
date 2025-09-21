import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  Snackbar, 
  Alert, 
  Button, 
  Box,
  IconButton,
  Slide
} from '@mui/material';
import { 
  Close,
  ContentCopy,
  CheckCircle
} from '@mui/icons-material';

const ToastContext = createContext();

// Slide transition component
const SlideTransition = (props) => {
  return <Slide {...props} direction="left" />;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', options = {}) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type,
      ...options,
      autoHide: options.autoHide !== false, // Default to true
      duration: options.duration || (type === 'error' ? 6000 : 4000)
    };

    setToasts(prev => [...prev, toast]);

    // Auto-dismiss
    if (toast.autoHide) {
      setTimeout(() => {
        hideToast(id);
      }, toast.duration);
    }

    return id;
  }, []);

  const hideToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccessToast = useCallback((message, options = {}) => {
    return showToast(message, 'success', options);
  }, [showToast]);

  const showErrorToast = useCallback((message, options = {}) => {
    return showToast(message, 'error', options);
  }, [showToast]);

  const showInfoToast = useCallback((message, options = {}) => {
    return showToast(message, 'info', options);
  }, [showToast]);

  const showTxToast = useCallback((message, txHash, options = {}) => {
    const copyHash = async () => {
      try {
        await navigator.clipboard.writeText(txHash);
        showSuccessToast('Hash copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    };

    const action = (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          size="small"
          startIcon={<ContentCopy />}
          onClick={copyHash}
          sx={{
            color: 'white',
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          Copy Hash
        </Button>
      </Box>
    );

    return showToast(
      `${message} Hash: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
      'success',
      { ...options, action }
    );
  }, [showToast, showSuccessToast]);

  return (
    <ToastContext.Provider value={{ 
      showToast, 
      hideToast, 
      showSuccessToast, 
      showErrorToast, 
      showInfoToast,
      showTxToast 
    }}>
      {children}
      
      {/* Toast Container */}
      <Box sx={{ 
        position: 'fixed', 
        top: 16, 
        right: 16, 
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        maxWidth: '400px',
        width: '100%'
      }}>
        {toasts.map((toast) => (
          <Snackbar
            key={toast.id}
            open={true}
            TransitionComponent={SlideTransition}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            sx={{ 
              position: 'relative',
              '& .MuiSnackbar-root': {
                position: 'relative'
              }
            }}
          >
            <Alert
              severity={toast.type}
              action={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {toast.action}
                  <IconButton
                    size="small"
                    onClick={() => hideToast(toast.id)}
                    sx={{ color: 'white' }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              }
              sx={{
                width: '100%',
                backgroundColor: toast.type === 'success' 
                  ? 'rgba(34, 197, 94, 0.9)'
                  : toast.type === 'error'
                  ? 'rgba(239, 68, 68, 0.9)'
                  : 'rgba(59, 130, 246, 0.9)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${
                  toast.type === 'success' 
                    ? '#22c55e'
                    : toast.type === 'error'
                    ? '#ef4444'
                    : '#3b82f6'
                }`,
                borderRadius: 2,
                color: 'white',
                boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px ${
                  toast.type === 'success' 
                    ? 'rgba(34, 197, 94, 0.3)'
                    : toast.type === 'error'
                    ? 'rgba(239, 68, 68, 0.3)'
                    : 'rgba(59, 130, 246, 0.3)'
                }`,
                '& .MuiAlert-icon': {
                  color: 'white'
                },
                '& .MuiAlert-message': {
                  color: 'white',
                  fontWeight: 500
                }
              }}
            >
              {toast.message}
            </Alert>
          </Snackbar>
        ))}
      </Box>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
