import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardHeader,
  Typography, 
  Button, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Container,
  Chip,
  Avatar,
  IconButton,
  Paper,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  History,
  Download,
  OpenInNew,
  ContentCopy,
  Refresh,
  FileDownload,
  ArrowBack,
  Close
} from '@mui/icons-material';
import { useToast } from '../contexts/ToastContext';

const MyActivityPage = ({ onClose }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showSuccessToast, showErrorToast } = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Load transaction history
  const loadTransactions = () => {
    try {
      const history = localStorage.getItem('zenstats:txHistory');
      const txHistory = history ? JSON.parse(history) : [];
      setTransactions(txHistory);
    } catch (error) {
      console.error('Error loading transaction history:', error);
      showErrorToast('Failed to load transaction history');
      setTransactions([]);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  // Format transaction type
  const formatType = (type) => {
    const typeMap = {
      'stake': { label: 'Stake', color: '#00ff88', icon: '📈' },
      'unstake': { label: 'Unstake', color: '#ff6b6b', icon: '📉' },
      'unbond': { label: 'Unbond', color: '#ff9800', icon: '🔓' },
      'withdraw': { label: 'Withdraw', color: '#4caf50', icon: '💰' },
      'send': { label: 'Send', color: '#00bfff', icon: '📤' },
      'deploy': { label: 'Deploy', color: '#8b5cf6', icon: '🚀' },
      'claim': { label: 'Claim', color: '#ffc107', icon: '🎁' },
      'fast-unstake': { label: 'Fast Unstake', color: '#ff5722', icon: '⚡' },
      'deregister': { label: 'Cancel Fast', color: '#9e9e9e', icon: '❌' }
    };
    return typeMap[type] || { label: type, color: '#666', icon: '📄' };
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Copy hash to clipboard
  const copyHash = async (hash) => {
    try {
      await navigator.clipboard.writeText(hash);
      showSuccessToast('Transaction hash copied to clipboard!');
    } catch (error) {
      showErrorToast('Failed to copy hash');
    }
  };

  // Open in explorer
  const openInExplorer = (hash) => {
    const explorerUrl = 'https://zentrace.io/tx/';
    window.open(`${explorerUrl}${hash}`, '_blank');
  };

  // Export to CSV
  const exportToCSV = () => {
    try {
      const headers = ['Type', 'Amount', 'Hash', 'Address', 'Time'];
      const csvContent = [
        headers.join(','),
        ...transactions.map(tx => [
          tx.type || '',
          tx.amount || '',
          tx.hash || '',
          tx.address || tx.contractAddress || '',
          formatTime(tx.ts)
        ].map(field => `"${field}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `zenstats-activity-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccessToast('CSV file downloaded successfully!');
    } catch (error) {
      showErrorToast('Failed to export CSV');
    }
  };

  // Export to JSON
  const exportToJSON = () => {
    try {
      const jsonContent = JSON.stringify(transactions, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `zenstats-activity-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccessToast('JSON file downloaded successfully!');
    } catch (error) {
      showErrorToast('Failed to export JSON');
    }
  };

  // Clear all history
  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all transaction history?')) {
      localStorage.removeItem('zenstats:txHistory');
      setTransactions([]);
      showSuccessToast('Transaction history cleared');
    }
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
                background: 'linear-gradient(135deg, #00ff88, #00bfff)',
                fontSize: '2rem'
              }}>
                📊
              </Avatar>
            </Box>
            <Typography variant="h3" sx={{ 
              fontWeight: 700, 
              color: '#00ff88',
              textShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
              mb: 2
            }}>
              My Activity
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              View and manage your transaction history on ZenChain
            </Typography>
          </Box>
        </Box>

        {/* Export Controls */}
        <Card sx={{
          mb: 4,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 255, 136, 0.3)',
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
                <History sx={{ color: '#00ff88' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Transaction History ({transactions.length})
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Refresh />}
                  onClick={loadTransactions}
                  disabled={loading}
                  sx={{
                    borderColor: '#00ff88',
                    color: '#00ff88',
                    '&:hover': {
                      borderColor: '#00ff88',
                      backgroundColor: 'rgba(0, 255, 136, 0.1)'
                    }
                  }}
                >
                  Refresh
                </Button>
                
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FileDownload />}
                  onClick={exportToCSV}
                  sx={{
                    borderColor: '#00bfff',
                    color: '#00bfff',
                    '&:hover': {
                      borderColor: '#00bfff',
                      backgroundColor: 'rgba(0, 191, 255, 0.1)'
                    }
                  }}
                >
                  Export CSV
                </Button>
                
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Download />}
                  onClick={exportToJSON}
                  sx={{
                    borderColor: '#8b5cf6',
                    color: '#8b5cf6',
                    '&:hover': {
                      borderColor: '#8b5cf6',
                      backgroundColor: 'rgba(139, 92, 246, 0.1)'
                    }
                  }}
                >
                  Export JSON
                </Button>

                {transactions.length > 0 && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={clearHistory}
                    sx={{
                      borderColor: '#ef4444',
                      color: '#ef4444',
                      '&:hover': {
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)'
                      }
                    }}
                  >
                    Clear All
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Transaction Table */}
        <Card sx={{
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 255, 136, 0.3)',
          borderRadius: 3
        }}>
          <CardContent sx={{ p: 0 }}>
            {transactions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <History sx={{ fontSize: 64, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No transactions yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start using ZenStats Explorer to see your activity here
                </Typography>
              </Box>
            ) : isMobile ? (
              // Mobile Card Layout
              <Box sx={{ p: 2 }}>
                {transactions.map((tx, index) => {
                  const typeInfo = formatType(tx.type);
                  return (
                    <Card key={`${tx.hash}-${index}`} sx={{
                      mb: 2,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(0, 255, 136, 0.3)'
                      }
                    }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Chip
                            label={typeInfo.label}
                            size="small"
                            sx={{
                              bgcolor: `${typeInfo.color}20`,
                              color: typeInfo.color,
                              border: `1px solid ${typeInfo.color}40`,
                              fontWeight: 600
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(tx.ts)}
                          </Typography>
                        </Box>
                        
                        {tx.amount && (
                          <Typography variant="body2" sx={{ mb: 1, color: 'white' }}>
                            Amount: {tx.amount} ZTC
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={`${tx.hash.slice(0, 10)}...${tx.hash.slice(-8)}`}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(0, 255, 136, 0.2)',
                              color: '#00ff88',
                              fontFamily: 'monospace',
                              fontSize: '0.75rem'
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => copyHash(tx.hash)}
                            sx={{ color: '#00ff88' }}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => openInExplorer(tx.hash)}
                            sx={{ color: '#00bfff' }}
                          >
                            <OpenInNew fontSize="small" />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            ) : (
              // Desktop Table Layout
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        color: '#00ff88', 
                        fontWeight: 600,
                        borderBottom: '1px solid rgba(0, 255, 136, 0.3)'
                      }}>
                        Type
                      </TableCell>
                      <TableCell sx={{ 
                        color: '#00ff88', 
                        fontWeight: 600,
                        borderBottom: '1px solid rgba(0, 255, 136, 0.3)'
                      }}>
                        Amount
                      </TableCell>
                      <TableCell sx={{ 
                        color: '#00ff88', 
                        fontWeight: 600,
                        borderBottom: '1px solid rgba(0, 255, 136, 0.3)'
                      }}>
                        Hash
                      </TableCell>
                      <TableCell sx={{ 
                        color: '#00ff88', 
                        fontWeight: 600,
                        borderBottom: '1px solid rgba(0, 255, 136, 0.3)'
                      }}>
                        Time
                      </TableCell>
                      <TableCell sx={{ 
                        color: '#00ff88', 
                        fontWeight: 600,
                        borderBottom: '1px solid rgba(0, 255, 136, 0.3)'
                      }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((tx, index) => {
                      const typeInfo = formatType(tx.type);
                      return (
                        <TableRow 
                          key={`${tx.hash}-${index}`}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(0, 255, 136, 0.05)',
                            },
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                          }}
                        >
                          <TableCell>
                            <Chip
                              label={typeInfo.label}
                              size="small"
                              sx={{
                                bgcolor: `${typeInfo.color}20`,
                                color: typeInfo.color,
                                border: `1px solid ${typeInfo.color}40`,
                                fontWeight: 600
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: 'white' }}>
                            {tx.amount ? `${tx.amount} ZTC` : '-'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${tx.hash.slice(0, 10)}...${tx.hash.slice(-8)}`}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(0, 255, 136, 0.2)',
                                color: '#00ff88',
                                fontFamily: 'monospace',
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                              }}
                              onClick={() => openInExplorer(tx.hash)}
                            />
                          </TableCell>
                          <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                            {formatTime(tx.ts)}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <IconButton
                                size="small"
                                onClick={() => copyHash(tx.hash)}
                                sx={{ 
                                  color: '#00ff88',
                                  '&:hover': { backgroundColor: 'rgba(0, 255, 136, 0.1)' }
                                }}
                              >
                                <ContentCopy fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => openInExplorer(tx.hash)}
                                sx={{ 
                                  color: '#00bfff',
                                  '&:hover': { backgroundColor: 'rgba(0, 191, 255, 0.1)' }
                                }}
                              >
                                <OpenInNew fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {transactions.length > 0 && (
          <Card sx={{
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 255, 136, 0.2)',
            borderRadius: 3
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: '#00ff88', mb: 3, fontWeight: 600 }}>
                📈 Activity Summary
              </Typography>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 2
              }}>
                {Object.entries(
                  transactions.reduce((acc, tx) => {
                    acc[tx.type] = (acc[tx.type] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([type, count]) => {
                  const typeInfo = formatType(type);
                  return (
                    <Box key={type} sx={{ 
                      textAlign: 'center',
                      p: 2,
                      borderRadius: 2,
                      background: `${typeInfo.color}10`,
                      border: `1px solid ${typeInfo.color}30`
                    }}>
                      <Typography variant="h4" sx={{ 
                        color: typeInfo.color, 
                        fontWeight: 700,
                        mb: 0.5
                      }}>
                        {count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {typeInfo.label}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default MyActivityPage;
