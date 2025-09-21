import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Paper,
  Grid,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Badge,
  Tooltip,
  Fade,
  Slide,
  ListItemButton,
  ListItemIcon,
  Stack
} from '@mui/material';
import {
  AccountBalanceWallet,
  Language,
  SwapHoriz,
  Token,
  Timeline,
  Visibility,
  Close,
  CheckCircle,
  Error,
  Warning,
  Info,
  TrendingUp,
  Person,
  Speed,
  LocalGasStation,
  Analytics,
  AccountBalance,
  ShowChart,
  Refresh
} from '@mui/icons-material';
import DailyTransactions from './components/DailyTransactions';
import ZenQuestDemo from './components/ZenQuestDemo';
import MyZenQuestPage from './components/MyZenQuestPage';
import 'bootstrap/dist/css/bootstrap.min.css';

// Dynamic Material UI Theme
const createDynamicTheme = (isDark) => createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },
  palette: {
    mode: isDark ? 'dark' : 'light',
    primary: {
      main: isDark ? '#10b981' : '#059669', // ZenChain green
      light: isDark ? '#34d399' : '#10b981',
      dark: isDark ? '#047857' : '#065f46',
    },
    secondary: {
      main: isDark ? '#3b82f6' : '#2563eb', // Blue accent
      light: isDark ? '#60a5fa' : '#3b82f6',
      dark: isDark ? '#1e40af' : '#1d4ed8',
    },
    background: {
      default: isDark ? '#0a0a0a' : '#f8fafc',
      paper: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.95)',
    },
    text: {
      primary: isDark ? '#ffffff' : '#0a0a0a',
      secondary: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(10, 10, 10, 0.7)',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#047857',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#1e40af',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2rem',
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h5: {
      fontWeight: 700,
      fontSize: '1.5rem',
      '@media (max-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
      '@media (max-width:600px)': {
        fontSize: '1.1rem',
      },
    },
    body1: {
      fontSize: '1rem',
      '@media (max-width:600px)': {
        fontSize: '0.875rem',
      },
    },
    body2: {
      fontSize: '0.875rem',
      '@media (max-width:600px)': {
        fontSize: '0.8rem',
      },
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          '@media (max-width:600px)': {
            borderRadius: '12px',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 0,
          marginBottom: 0,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            fontSize: '0.875rem',
            padding: '8px 16px',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            fontSize: '0.75rem',
            height: '24px',
          },
        },
      },
    },
  },
});

// Zenchain Testnet Contract Configuration

const ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

// Danh sách các ví wallet được hỗ trợ
const WALLET_PROVIDERS = [
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    provider: 'walletconnect',
    detect: () => false, // WalletConnect cần setup riêng
    status: 'qr_code'
  },
  {
    id: 'okx',
    name: 'OKX Wallet',
    icon: '⭕',
    provider: 'okxwallet',
    detect: () => window.okxwallet,
    status: 'installed'
  },
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    provider: 'ethereum',
    detect: () => window.ethereum && window.ethereum.isMetaMask,
    status: 'installed'
  },
  {
    id: 'phantom',
    name: 'Phantom',
    icon: '👻',
    provider: 'phantom',
    detect: () => window.phantom,
    status: 'installed'
  },
  {
    id: 'openwallet',
    name: 'OpenWallet',
    icon: '🔷',
    provider: 'openwallet',
    detect: () => window.openwallet,
    status: 'installed'
  },
  {
    id: 'bitget',
    name: 'Bitget Wallet',
    icon: '🔵',
    provider: 'bitget',
    detect: () => window.bitget,
    status: 'not_installed'
  },
  {
    id: 'bitget_lite',
    name: 'Bitget Wallet Lite',
    icon: '🔵',
    provider: 'bitget_lite',
    detect: () => window.bitgetLite,
    status: 'not_installed'
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    provider: 'coinbaseWallet',
    detect: () => window.coinbaseWallet,
    status: 'installed'
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    icon: '🛡️',
    provider: 'ethereum',
    detect: () => window.ethereum && window.ethereum.isTrust,
    status: 'installed'
  }
];

function App() {
  const [info, setInfo] = useState({});
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [availableWallets, setAvailableWallets] = useState([]);
  const [showWalletList, setShowWalletList] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState(null);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [currentContract, setCurrentContract] = useState(null);
  const [currentTab, setCurrentTab] = useState('analytics');
  
  // Analytics data states
  const [dailyTxStats, setDailyTxStats] = useState([]);
  const [topHolders, setTopHolders] = useState([]);
  const [gasStats, setGasStats] = useState([]);
  const [blockStats, setBlockStats] = useState([]);
  const [blockTimes, setBlockTimes] = useState([]); // Array of recent block times
  const [currentBlockNumber, setCurrentBlockNumber] = useState(0);
  const [lastBlockTimestamp, setLastBlockTimestamp] = useState(0);
  const [loadingHolders, setLoadingHolders] = useState(true);
  const [networkHealth, setNetworkHealth] = useState({
    totalTx: 0,
    avgBlockTime: 0,
    avgGasPrice: 0,
    activeAddresses: 0
  });

  // Fetch top holders from API
  const fetchTopHolders = async () => {
    setLoadingHolders(true);
    try {
      // Ví dụ dùng API block explorer (nếu có endpoint chính thức)
      const res = await fetch("https://explorer.zenchain.io/api/top-holders?limit=5");
      const data = await res.json();
      setTopHolders(data);
    } catch (error) {
      console.error("Error fetching top holders:", error);
      // Fallback to mock data if API fails
      const mockHolders = Array.from({ length: 5 }, (_, i) => ({
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        balance: Math.floor(Math.random() * 50000000) + 1000000,
        percentage: (Math.random() * 15 + 1).toFixed(2)
      })).sort((a, b) => b.balance - a.balance);
      setTopHolders(mockHolders);
    } finally {
      setLoadingHolders(false);
    }
  };

  // Block production monitoring
  const monitorBlockProduction = async (provider) => {
    try {
      if (!provider) return;
      
      // Get current block
      const currentBlock = await provider.getBlock('latest');
      const currentBlockNumber = currentBlock.number;
      const currentTimestamp = currentBlock.timestamp;
      
      setCurrentBlockNumber(currentBlockNumber);
      
      // If we have a previous block timestamp, calculate block time
      if (lastBlockTimestamp > 0) {
        const blockTime = (currentTimestamp - lastBlockTimestamp) * 1000; // Convert to milliseconds
        const blockTimeSeconds = blockTime / 1000;
        
        // Add to block times array (keep last 50 blocks)
        setBlockTimes(prev => {
          const newTimes = [...prev, blockTimeSeconds];
          return newTimes.slice(-50); // Keep only last 50 block times
        });
        
        // Calculate average block time
        setBlockTimes(prev => {
          const avgTime = prev.reduce((sum, time) => sum + time, 0) / prev.length;
          setNetworkHealth(prevHealth => ({
            ...prevHealth,
            avgBlockTime: avgTime
          }));
          return prev;
        });
      }
      
      setLastBlockTimestamp(currentTimestamp);
      
    } catch (error) {
      console.error("Error monitoring block production:", error);
    }
  };

  // Analytics data generation
  const generateAnalytics = () => {
    // Mock daily transaction stats (last 30 days)
    const mockDailyTx = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      transactions: Math.floor(Math.random() * 1000) + 500,
      volume: Math.floor(Math.random() * 10000) + 5000
    }));
    
    // Mock gas stats
    const mockGas = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      gasPrice: Math.floor(Math.random() * 50) + 20,
      gasUsed: Math.floor(Math.random() * 1000000) + 500000
    }));
    
    // Mock block stats
    const mockBlocks = Array.from({ length: 100 }, (_, i) => ({
      number: 1000000 + i,
      timestamp: Date.now() - (99 - i) * 15000, // 15 seconds per block
      gasUsed: Math.floor(Math.random() * 1000000) + 500000,
      transactions: Math.floor(Math.random() * 50) + 10
    }));
    
    setDailyTxStats(mockDailyTx);
    setGasStats(mockGas);
    setBlockStats(mockBlocks);
    setNetworkHealth({
      totalTx: mockDailyTx.reduce((sum, day) => sum + day.transactions, 0),
      avgBlockTime: 15.2,
      avgGasPrice: mockGas.reduce((sum, hour) => sum + hour.gasPrice, 0) / mockGas.length,
      activeAddresses: Math.floor(Math.random() * 10000) + 5000
    });
    
    // Fetch real top holders data
    fetchTopHolders();
  };

  // Detect các ví có sẵn khi component mount
  useEffect(() => {
    const detectWallets = () => {
      const wallets = [];
      
      WALLET_PROVIDERS.forEach(wallet => {
        const isDetected = wallet.detect();
        const walletWithStatus = {
          ...wallet,
          status: isDetected ? 'installed' : wallet.status
        };
        wallets.push(walletWithStatus);
      });
      
      setAvailableWallets(wallets);
    };

    detectWallets();
    generateAnalytics();
  }, []);

  // Monitor block production when connected
  useEffect(() => {
    if (isConnected && provider) {
      // Initial block monitoring
      monitorBlockProduction(provider);
      
      // Set up interval to monitor every 5 seconds
      const interval = setInterval(() => {
        monitorBlockProduction(provider);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isConnected, provider, lastBlockTimestamp]);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showWalletList && !event.target.closest('.wallet-selector')) {
        setShowWalletList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showWalletList]);

  // Theo dõi thay đổi tài khoản MetaMask
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          // Người dùng đã ngắt kết nối
          setIsConnected(false);
          setAccount("");
          setSelectedWallet(null);
        } else if (accounts[0] !== account) {
          // Tài khoản đã thay đổi
      const provider = new ethers.BrowserProvider(window.ethereum);
          await accountChangedHandler(provider);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, [account]);

  // Function để kết nối ví đã chọn
  const connectWallet = async (wallet = selectedWallet) => {
    if (!wallet) {
      alert("Vui lòng chọn ví để kết nối!");
      return;
    }

    if (wallet.status === 'not_installed') {
      alert(`${wallet.name} chưa được cài đặt! Vui lòng cài đặt extension.`);
      return;
    }

    if (wallet.status === 'qr_code') {
      alert(`${wallet.name} cần kết nối qua QR code. Tính năng này sẽ được phát triển sau.`);
      return;
    }

    setConnectingWallet(wallet);
    setIsLoading(true);
    try {
      // Sử dụng logic kết nối MetaMask như bạn cung cấp
      if (wallet.id === 'metamask') {
        await connectMetaMaskHandler(wallet);
      } else {
        // Logic cho các ví khác
        await connectOtherWallet(wallet);
      }
    } catch (error) {
      console.error("❌ Lỗi khi kết nối ví:", error);
      alert(`Không thể kết nối ${wallet.name}. Vui lòng thử lại.`);
    } finally {
      setIsLoading(false);
      setConnectingWallet(null);
    }
  };

  // Function kết nối MetaMask
  const connectMetaMaskHandler = async (wallet) => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      await accountChangedHandler(provider);
      
      setSelectedWallet(wallet);
      setShowWalletModal(false);
    } else {
      alert("Vui lòng cài đặt MetaMask!");
    }
  };

  // Function xử lý khi tài khoản thay đổi
  const accountChangedHandler = async (provider) => {
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    setAccount(address);
    setIsConnected(true);
    await loadContractData(provider);
  };

  // Function kết nối các ví khác
  const connectOtherWallet = async (wallet) => {
    let provider;
    if (wallet.id === 'trust') {
      provider = window.ethereum;
    } else if (wallet.id === 'phantom') {
      provider = window.phantom?.ethereum;
    } else {
      provider = window[wallet.provider];
    }

    if (!provider) {
      alert(`${wallet.name} chưa được cài đặt! Vui lòng cài đặt extension.`);
      return;
    }

    const ethersProvider = new ethers.BrowserProvider(provider);
    const accounts = await ethersProvider.send("eth_requestAccounts", []);
    
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      setIsConnected(true);
      setSelectedWallet(wallet);
      setShowWalletModal(false);
      await loadContractData(ethersProvider);
    }
  };

  // Function để chọn ví
  const selectWallet = (wallet) => {
    setSelectedWallet(wallet);
    setShowWalletList(false);
    connectWallet(wallet);
  };

  // Function để load dữ liệu contract
  const loadContractData = async (provider) => {
    try {
      const contract = new ethers.Contract(ZENCHAIN_CONFIG.contractAddress, ABI, provider);
      setCurrentContract(contract);
      
        const name = await contract.name();
        const symbol = await contract.symbol();
        const decimals = await contract.decimals();
        const supply = await contract.totalSupply();
  
      setInfo({ 
        name, 
        symbol, 
        decimals, 
        supply: supply.toString(),
        network: networkConfig.name,
        contractAddress: contractAddress
      });

      // Subscribe sự kiện Transfer
      contract.on("Transfer", (from, to, value) => {
        setLogs((prev) => [
          { 
            type: "Transfer",
            from, 
            to, 
            value: value.toString(),
            timestamp: new Date().toLocaleTimeString()
          },
          ...prev,
        ]);
      });

      // Subscribe sự kiện BridgeTransfer
      contract.on("BridgeTransfer", (from, to, amount, chainId) => {
        setLogs((prev) => [
          { 
            type: "BridgeTransfer",
            from, 
            to, 
            value: amount.toString(),
            chainId: chainId.toString(),
            timestamp: new Date().toLocaleTimeString()
          },
          ...prev,
        ]);
      });

      // Subscribe sự kiện TokenBridged
      contract.on("TokenBridged", (token, user, amount, targetChainId) => {
        setLogs((prev) => [
          { 
            type: "TokenBridged",
            token, 
            user, 
            value: amount.toString(),
            targetChainId: targetChainId.toString(),
            timestamp: new Date().toLocaleTimeString()
          },
          ...prev,
        ]);
      });
    } catch (err) {
      console.error("❌ Lỗi khi đọc token info:", err);
    }
    };
  
  
  const theme = createDynamicTheme(isDarkTheme);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        width: '100vw',
        background: isDarkTheme 
          ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f172a 100%)'
          : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: isDarkTheme 
            ? 'radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.15) 1px, transparent 0)'
            : 'radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.1) 1px, transparent 0)',
          backgroundSize: '20px 20px',
          opacity: 0.3,
          zIndex: 0
        }
      }}>
          {/* Header */}
          <AppBar position="static" elevation={0} sx={{ 
            background: isDarkTheme 
              ? 'rgba(16, 185, 129, 0.1)' 
              : 'rgba(16, 185, 129, 0.05)',
            backdropFilter: 'blur(20px)',
            border: isDarkTheme 
              ? '1px solid rgba(16, 185, 129, 0.3)' 
              : '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 0,
            marginBottom: 0
          }}>
            <Toolbar sx={{ 
              justifyContent: 'space-between', 
              py: { xs: 1, sm: 1.5, md: 2 },
              px: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8 },
              minHeight: { xs: '56px !important', sm: '64px !important', md: '72px !important' },
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              gap: { xs: 1, sm: 2 },
              maxWidth: '1400px',
              width: '100%',
              mx: 'auto'
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 1, sm: 2 },
                minWidth: 0,
                flex: { xs: '1 1 auto', sm: '0 0 auto' }
              }}>
                <Avatar sx={{ 
                  bgcolor: 'primary.main',
                  width: { xs: 36, sm: 44, md: 48, lg: 52 },
                  height: { xs: 36, sm: 44, md: 48, lg: 52 },
                  fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem', lg: '1.7rem' }
                }}>
                  📊
                </Avatar>
                <Typography variant="h4" component="h1" sx={{ 
                  fontWeight: 700,
                  fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem', lg: '1.8rem', xl: '2rem' },
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  letterSpacing: '-0.025em'
                }}>
                  ZenStats Explorer
                </Typography>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 1, sm: 2, md: 3, lg: 4 },
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                justifyContent: { xs: 'flex-end', sm: 'flex-start' },
                width: { xs: '100%', sm: 'auto' },
                mt: { xs: 1, sm: 0 }
              }}>
                {/* Navigation Tabs */}
                <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                  <Button
                    variant={currentTab === 'analytics' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setCurrentTab('analytics')}
                    sx={{ 
                      textTransform: 'none',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      px: { xs: 1, sm: 2 }
                    }}
                  >
                    Analytics
                  </Button>
                  <Button
                    variant={currentTab === 'zenquest' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setCurrentTab('zenquest')}
                    sx={{ 
                      textTransform: 'none',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      px: { xs: 1, sm: 2 }
                    }}
                  >
                    ZenQuest
                  </Button>
                  <Button
                    variant={currentTab === 'myzenquest' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setCurrentTab('myzenquest')}
                    sx={{ 
                      textTransform: 'none',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      px: { xs: 1, sm: 2 }
                    }}
                  >
                    MyZenQuest
                  </Button>
                </Box>
                <Chip 
                  label={ZENCHAIN_CONFIG.name}
                  color="primary"
                  size="small"
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: '32px'
                  }}
                />
                <IconButton 
                  onClick={() => setIsDarkTheme(!isDarkTheme)}
                  sx={{ 
                    color: 'text.primary',
                    bgcolor: isDarkTheme 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'rgba(0, 0, 0, 0.1)',
                    '&:hover': { 
                      bgcolor: isDarkTheme 
                        ? 'rgba(255, 255, 255, 0.2)' 
                        : 'rgba(0, 0, 0, 0.2)' 
                    }
                  }}
                >
                  {isDarkTheme ? '🌙' : '☀️'}
                </IconButton>
                {!isConnected ? (
                  <Button
                    variant="contained"
                    onClick={() => setShowWalletModal(true)}
                    disabled={isLoading}
                    size="small"
                    startIcon={isLoading ? <CircularProgress size={16} /> : <AccountBalanceWallet />}
                    sx={{
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      minWidth: { xs: 'auto', sm: '120px' },
                      whiteSpace: 'nowrap',
                      textTransform: 'none',
                      px: { xs: 1, sm: 1.5 },
                      py: { xs: 0.5, sm: 0.75 }
                    }}
                  >
                    {isLoading ? 'Connecting...' : 'Connect Wallet'}
                  </Button>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: { xs: 0.5, sm: 1 },
                    flexWrap: 'wrap',
                    justifyContent: 'flex-end'
                  }}>
                    <Chip
                      avatar={<Avatar sx={{ 
                        width: { xs: 20, sm: 24 }, 
                        height: { xs: 20, sm: 24 }, 
                        fontSize: { xs: '0.7rem', sm: '0.8rem' } 
                      }}>{selectedWallet?.icon}</Avatar>}
                      label={selectedWallet?.name}
                      variant="outlined"
                      color="primary"
                      size="small"
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                    />
                    <Chip
                      label={`${account.slice(0, 6)}...${account.slice(-4)}`}
                      variant="filled"
                      color="success"
                      size="small"
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                    />
                  </Box>
                )}
              </Box>
            </Toolbar>
          </AppBar>

          {/* Main Content Area */}
          <Box sx={{ 
            flex: 1, 
            px: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8 },
            py: { xs: 2, sm: 3, md: 4 },
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 2, sm: 3, md: 4 },
            minHeight: 0,
            maxWidth: '1400px',
            width: '100%',
            mx: 'auto'
          }}>
            {currentTab === 'zenquest' ? (
              <ZenQuestDemo />
            ) : currentTab === 'myzenquest' ? (
              <MyZenQuestPage />
            ) : currentTab === 'analytics' && isConnected ? (
              <Grid container spacing={{ xs: 2, sm: 3, md: 4, lg: 5 }} sx={{ flex: 1, minHeight: 0 }}>
                {/* Contract Info Card */}
                <Grid item xs={12} lg={6}>
                <Card elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardHeader
                    avatar={<Avatar sx={{ 
                      bgcolor: 'primary.main',
                      width: { xs: 32, sm: 40 },
                      height: { xs: 32, sm: 40 },
                      fontSize: { xs: '1rem', sm: '1.25rem' }
                    }}>📊</Avatar>}
                    title="Bridge Contract"
                    titleTypographyProps={{ 
                      variant: 'h6', 
                      fontWeight: 600,
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                    }}
                    sx={{ pb: { xs: 1, sm: 2 } }}
                  />
                  <CardContent sx={{ flex: 1, pt: 0 }}>
                    <List dense>
                      <ListItem sx={{ px: { xs: 0, sm: 1 } }}>
                        <ListItemText 
                          primary="Network" 
                          secondary={info.network || "Loading..."}
                          primaryTypographyProps={{ 
                            fontSize: { xs: '0.875rem', sm: '0.9rem' },
                            fontWeight: 600
                          }}
                          secondaryTypographyProps={{ 
                            color: 'text.primary', 
                            fontWeight: 500,
                            fontSize: { xs: '0.8rem', sm: '0.875rem' }
                          }}
                        />
                      </ListItem>
                      <Divider sx={{ mx: { xs: 0, sm: 1 } }} />
                      <ListItem sx={{ px: { xs: 0, sm: 1 } }}>
                        <ListItemText 
                          primary="Contract Address" 
                          secondary={
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontFamily: 'monospace', 
                                color: 'success.main',
                                wordBreak: 'break-all',
                                fontSize: { xs: '0.75rem', sm: '0.8rem' }
                              }}
                            >
                              {info.contractAddress || "Loading..."}
                            </Typography>
                          }
                          primaryTypographyProps={{ 
                            fontSize: { xs: '0.875rem', sm: '0.9rem' },
                            fontWeight: 600
                          }}
                        />
                      </ListItem>
                      <Divider sx={{ mx: { xs: 0, sm: 1 } }} />
                      <ListItem sx={{ px: { xs: 0, sm: 1 } }}>
                        <ListItemText 
                          primary="Token" 
                          secondary={`${info.name || "Loading..."} (${info.symbol || "..."})`}
                          primaryTypographyProps={{ 
                            fontSize: { xs: '0.875rem', sm: '0.9rem' },
                            fontWeight: 600
                          }}
                          secondaryTypographyProps={{ 
                            color: 'text.primary', 
                            fontWeight: 500,
                            fontSize: { xs: '0.8rem', sm: '0.875rem' }
                          }}
                        />
                      </ListItem>
                      <Divider sx={{ mx: { xs: 0, sm: 1 } }} />
                      <ListItem sx={{ px: { xs: 0, sm: 1 } }}>
                        <ListItemText 
                          primary="Total Supply" 
                          secondary={info.supply || "Loading..."}
                          primaryTypographyProps={{ 
                            fontSize: { xs: '0.875rem', sm: '0.9rem' },
                            fontWeight: 600
                          }}
                          secondaryTypographyProps={{ 
                            color: 'text.primary', 
                            fontWeight: 500,
                            fontSize: { xs: '0.8rem', sm: '0.875rem' }
                          }}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

                {/* Events Card */}
                <Grid item xs={12} lg={6}>
                <Card elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardHeader
                    avatar={<Avatar sx={{ 
                      bgcolor: 'secondary.main',
                      width: { xs: 32, sm: 40 },
                      height: { xs: 32, sm: 40 },
                      fontSize: { xs: '1rem', sm: '1.25rem' }
                    }}>📈</Avatar>}
                    title="Bridge Events"
                    action={
                      <Chip 
                        label={logs.length} 
                        color="primary" 
                        size="small"
                        sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: '0.7rem', sm: '0.75rem' }
                        }}
                      />
                    }
                    titleTypographyProps={{ 
                      variant: 'h6', 
                      fontWeight: 600,
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                    }}
                    sx={{ pb: { xs: 1, sm: 2 } }}
                  />
                  <CardContent sx={{ flex: 1, pt: 0 }}>
                    {logs.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 4 } }}>
                        <Typography variant="h2" sx={{ 
                          mb: 2,
                          fontSize: { xs: '3rem', sm: '4rem' }
                        }}>📭</Typography>
                        <Typography 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                          No bridge events yet
                        </Typography>
                      </Box>
                    ) : (
                      <List dense>
                        {logs.slice(0, 5).map((log, i) => (
                          <ListItem key={i} sx={{ px: { xs: 0, sm: 1 } }}>
                            <ListItemAvatar>
                              <Avatar sx={{ 
                                bgcolor: log.type === 'BridgeTransfer' ? 'primary.main' : 
                                        log.type === 'TokenBridged' ? 'warning.main' : 'success.main',
                                width: { xs: 28, sm: 32 },
                                height: { xs: 28, sm: 32 },
                                fontSize: { xs: '0.8rem', sm: '1rem' }
                              }}>
                                {log.type === 'BridgeTransfer' ? '🌉' : 
                                 log.type === 'TokenBridged' ? '🔗' : '➡'}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                              primary={
                                <Box sx={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center',
                                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                                  gap: { xs: 1, sm: 0 }
                                }}>
                                  <Typography 
                                    variant="body2" 
                                    color="primary" 
                                    sx={{ 
                                      fontWeight: 600,
                                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                    }}
                                  >
                                    {log.type || 'Transfer'}
                                  </Typography>
                                  <Chip 
                                    label={log.value} 
                                    size="small" 
                                    color="warning"
                                    variant="outlined"
                                    sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
                                  />
                                </Box>
                              }
                              secondary={
                                <Typography 
                                  sx={{ 
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                    color: 'text.secondary'
                                  }}
                                >
                                  {log.timestamp}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                    {logs.length > 5 && (
                      <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Button 
                          variant="outlined"
                          size="small"
                          sx={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            px: { xs: 2, sm: 3 },
                            py: { xs: 0.5, sm: 0.75 },
                            textTransform: 'none'
                          }}
                        >
                          View All Events
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Detailed Events Section */}
              {logs.length > 0 && (
            <Card elevation={0}>
              <CardHeader
                avatar={<Avatar sx={{ bgcolor: 'info.main' }}><Timeline /></Avatar>}
                title="Recent Bridge Activity"
                action={
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                        {logs.filter(log => log.type === 'BridgeTransfer').length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Bridges
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="warning.main" sx={{ fontWeight: 700 }}>
                        {logs.filter(log => log.type === 'TokenBridged').length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Tokens
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="success.main" sx={{ fontWeight: 700 }}>
                        {logs.filter(log => log.type === 'Transfer').length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Transfers
                      </Typography>
                    </Box>
                  </Box>
                }
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
              />
              <CardContent>
                <List>
        {logs.map((log, i) => (
                    <React.Fragment key={i}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            bgcolor: log.type === 'BridgeTransfer' ? 'primary.main' : 
                                    log.type === 'TokenBridged' ? 'warning.main' : 'success.main'
                          }}>
                            {log.type === 'BridgeTransfer' ? '🌉' : 
                             log.type === 'TokenBridged' ? '🔗' : '➡'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 600 }}>
                                {log.type || 'Transfer'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {log.timestamp}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              {log.type === 'BridgeTransfer' ? (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                                  <Chip 
                                    label={`${log.from?.slice(0, 6)}...${log.from?.slice(-4)}`} 
                                    size="small" 
                                    variant="outlined"
                                  />
                                  <Typography variant="body2" color="success.main">→</Typography>
                                  <Chip 
                                    label={`${log.to?.slice(0, 6)}...${log.to?.slice(-4)}`} 
                                    size="small" 
                                    variant="outlined"
                                  />
                                  <Chip 
                                    label={`${log.value} ${info.symbol}`} 
                                    size="small" 
                                    color="warning"
                                  />
                                  <Chip 
                                    label={`Chain: ${log.chainId}`} 
                                    size="small" 
                                    color="info"
                                    variant="outlined"
                                  />
                                </Box>
                              ) : log.type === 'TokenBridged' ? (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                                  <Chip 
                                    label={`Token: ${log.token?.slice(0, 6)}...${log.token?.slice(-4)}`} 
                                    size="small" 
                                    variant="outlined"
                                  />
                                  <Chip 
                                    label={`User: ${log.user?.slice(0, 6)}...${log.user?.slice(-4)}`} 
                                    size="small" 
                                    variant="outlined"
                                  />
                                  <Chip 
                                    label={`${log.value} tokens`} 
                                    size="small" 
                                    color="warning"
                                  />
                                  <Chip 
                                    label={`Target: ${log.targetChainId}`} 
                                    size="small" 
                                    color="info"
                                    variant="outlined"
                                  />
                                </Box>
                              ) : (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                                  <Chip 
                                    label={`${log.from?.slice(0, 6)}...${log.from?.slice(-4)}`} 
                                    size="small" 
                                    variant="outlined"
                                  />
                                  <Typography variant="body2" color="success.main">→</Typography>
                                  <Chip 
                                    label={`${log.to?.slice(0, 6)}...${log.to?.slice(-4)}`} 
                                    size="small" 
                                    variant="outlined"
                                  />
                                  <Chip 
                                    label={`${log.value} ${info.symbol}`} 
                                    size="small" 
                                    color="warning"
                                  />
                                </Box>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {i < logs.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
              )}
            </Box>

          {/* Analytics Dashboard */}
          <Box sx={{ 
            px: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8 },
            py: { xs: 3, sm: 4, md: 6 },
            maxWidth: '1400px',
            margin: '0 auto',
            width: '100%',
            flex: 1
          }}>
            
            {/* ZTC Token Info Header */}
            <Box sx={{ 
              mb: 4, 
              textAlign: 'center',
              p: 3,
              borderRadius: 2,
              background: 'rgba(16, 185, 129, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                zIndex: -1
              }
            }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                Zenchain (ZTC) Analytics
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Real-time on-chain analytics for Zenchain native token (ZTC) - Monitor network health, token distribution, and transaction metrics
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label={`Contract: ${ZENCHAIN_CONFIG.contractAddress.slice(0, 6)}...${ZENCHAIN_CONFIG.contractAddress.slice(-4)}`}
                  variant="outlined"
                  size="small"
                />
                <Chip 
                  label={`Chain ID: ${ZENCHAIN_CONFIG.chainId}`}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>
            
            {/* Network Health Overview */}
            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'rgba(16, 185, 129, 0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  height: '100%'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TrendingUp color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                        ZTC Transactions
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {networkHealth.totalTx.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Last 30 days
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'rgba(16, 185, 129, 0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  height: '100%'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Speed color="secondary" sx={{ mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                        Avg Block Time
                      </Typography>
                      {isConnected && (
                        <Box sx={{ 
                          ml: 1, 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          background: networkHealth.avgBlockTime > 0 ? '#10b981' : '#f59e0b',
                          animation: 'pulse 2s infinite'
                        }} />
                      )}
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                      {networkHealth.avgBlockTime > 0 
                        ? `${networkHealth.avgBlockTime.toFixed(2)}s` 
                        : '15.2s'
                      }
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {networkHealth.avgBlockTime > 0 ? 'Live average' : 'Estimated'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'rgba(16, 185, 129, 0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  height: '100%'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocalGasStation color="warning" sx={{ mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                        Avg Gas Price
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                      {networkHealth.avgGasPrice.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Gwei
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  background: 'rgba(16, 185, 129, 0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  height: '100%'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Person color="success" sx={{ mr: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                        Active Addresses
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {networkHealth.activeAddresses.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Daily active
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
              
              {/* Daily Transactions Chart */}
              <Grid item xs={12} lg={8}>
                <DailyTransactions />
              </Grid>

              {/* Top Holders */}
              <Grid item xs={12} lg={4}>
                <Card sx={{ 
                  background: 'rgba(16, 185, 129, 0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  height: '400px'
                }}>
                  <CardHeader
                    avatar={<AccountBalance color="primary" />}
                    title="Top ZTC Holders"
                    subheader="Largest Zenchain (ZTC) wallet balances"
                    action={
                      <IconButton 
                        onClick={fetchTopHolders}
                        disabled={loadingHolders}
                        size="small"
                        sx={{ color: 'primary.main' }}
                      >
                        <Refresh />
                      </IconButton>
                    }
                  />
                  <CardContent sx={{ height: 280, overflow: 'auto' }}>
                    {loadingHolders ? (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        justifyContent: 'center',
                        height: 200,
                        gap: 2
                      }}>
                        <CircularProgress size={40} />
                        <Typography variant="body2" color="text.secondary">
                          Loading top holders...
                        </Typography>
                      </Box>
                    ) : (
                      <List sx={{ p: 0 }}>
                        {topHolders.length > 0 ? (
                          topHolders.map((holder, index) => (
                            <ListItem key={holder.address} sx={{ px: 0 }}>
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                                  {index + 1}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={`${holder.address.slice(0, 6)}...${holder.address.slice(-4)}`}
                                secondary={`${holder.balance.toLocaleString()} ZTC${holder.percentage ? ` (${holder.percentage}%)` : ''}`}
                                primaryTypographyProps={{ fontSize: '0.875rem' }}
                                secondaryTypographyProps={{ fontSize: '0.75rem' }}
                              />
                            </ListItem>
                          ))
                        ) : (
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            height: 200,
                            color: 'text.secondary'
                          }}>
                            <Typography>No holders data available</Typography>
                          </Box>
                        )}
                      </List>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Gas Fee History */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  background: 'rgba(16, 185, 129, 0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  height: '300px'
                }}>
                  <CardHeader
                    avatar={<LocalGasStation color="warning" />}
                    title="Gas Fee Trends"
                    subheader="Last 24 hours"
                  />
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      height: 180,
                      color: 'text.secondary'
                    }}>
                      <Typography>⛽ Gas Chart Placeholder</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Block Speed */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  background: 'rgba(16, 185, 129, 0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  height: '300px'
                }}>
                  <CardHeader
                    avatar={<Speed color="secondary" />}
                    title="Block Production Speed"
                    subheader={`Current Block: #${currentBlockNumber.toLocaleString()}`}
                  />
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center',
                      height: 180,
                      gap: 2
                    }}>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 700, 
                        color: 'secondary.main',
                        mb: 1
                      }}>
                        {networkHealth.avgBlockTime > 0 
                          ? `${networkHealth.avgBlockTime.toFixed(2)}s` 
                          : 'Calculating...'
                        }
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Average Block Time
                      </Typography>
                      
                      {/* Simple block time chart */}
                      <Box sx={{ 
                        width: '100%', 
                        height: 60,
                        display: 'flex',
                        alignItems: 'end',
                        gap: 0.5,
                        px: 1
                      }}>
                        {blockTimes.slice(-20).map((time, index) => (
                          <Box
                            key={index}
                            sx={{
                              flex: 1,
                              height: `${Math.min((time / 20) * 100, 100)}%`,
                              background: time < 15 
                                ? 'linear-gradient(to top, #10b981, #34d399)' 
                                : time < 30 
                                ? 'linear-gradient(to top, #f59e0b, #fbbf24)'
                                : 'linear-gradient(to top, #ef4444, #f87171)',
                              borderRadius: '2px 2px 0 0',
                              minHeight: '4px',
                              transition: 'all 0.3s ease'
                            }}
                          />
                        ))}
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                        Last 20 blocks • Green: &lt;15s • Yellow: 15-30s • Red: &gt;30s
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
            ) : currentTab === 'analytics' ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: '400px',
                textAlign: 'center',
                gap: 2
              }}>
                <Typography variant="h5" color="text.secondary">
                  Please connect your wallet to view analytics
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setShowWalletModal(true)}
                  startIcon={<AccountBalanceWallet />}
                >
                  Connect Wallet
                </Button>
              </Box>
            ) : null}

          {/* Analytics Dashboard - Always visible when on analytics tab */}
          {currentTab === 'analytics' && (
            <Box sx={{ 
              px: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8 },
              py: { xs: 3, sm: 4, md: 6 },
              maxWidth: '1400px',
              margin: '0 auto',
              width: '100%',
              flex: 1
            }}>
          <Dialog
            open={showWalletModal}
            onClose={() => setShowWalletModal(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: '16px',
                background: isDarkTheme ? '#1a1a1a' : '#ffffff',
                border: isDarkTheme ? '1px solid #333' : '1px solid #e5e7eb',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                maxWidth: '400px',
                m: 2
              }
            }}
          >
            <DialogTitle sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              borderBottom: isDarkTheme ? '1px solid #333' : '1px solid #e5e7eb',
              p: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 24,
                  height: 24,
                  background: isDarkTheme ? '#333' : '#f3f4f6',
                  color: isDarkTheme ? '#999' : '#6b7280',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 'bold'
                }}>
                  ?
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.125rem' }}>
                  Connect Wallet
                </Typography>
              </Box>
              <IconButton onClick={() => setShowWalletModal(false)} size="small">
                ×
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0, position: 'relative' }}>
              {connectingWallet && (
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  flexDirection: 'column',
                  gap: 2
                }}>
                  <CircularProgress />
                  <Typography color="white">
                    Connecting to {connectingWallet.name}...
                  </Typography>
                </Box>
              )}
              
              <List sx={{ p: 0 }}>
                {availableWallets.map((wallet, index) => (
                  <ListItemButton
                    key={wallet.id}
                    onClick={() => !connectingWallet && wallet.status === 'installed' && connectWallet(wallet)}
                    disabled={wallet.status !== 'installed' || Boolean(connectingWallet)}
                    sx={{
                      borderBottom: isDarkTheme ? '1px solid #333' : '1px solid #e5e7eb',
                      '&:last-child': { borderBottom: 'none' },
                      '&:hover': {
                        backgroundColor: isDarkTheme ? '#262626' : '#f9fafb'
                      },
                      '&.Mui-disabled': {
                        opacity: 0.5
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 56 }}>
                      {connectingWallet?.id === wallet.id ? (
                        <CircularProgress size={32} />
                      ) : (
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            background: wallet.id === 'metamask' ? '#F6851B' :
                                       wallet.id === 'walletconnect' ? '#3B99FC' :
                                       wallet.id === 'phantom' ? '#9945FF' :
                                       wallet.id === 'openwallet' ? '#4285F4' :
                                       wallet.id === 'okx' ? '#000000' :
                                       wallet.id === 'bitget' ? '#00D4FF' :
                                       '#6B7280',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            color: 'white'
                          }}
                        >
                          {wallet.icon}
                        </Box>
                      )}
                    </ListItemIcon>
                    
                    <ListItemText 
                      primary={wallet.name}
                      primaryTypographyProps={{
                        sx: { fontWeight: 500, fontSize: '1rem' }
                      }}
                    />
                    
                    <Box>
                      <Chip
                        label={
                          wallet.status === 'installed' ? 'INSTALLED' :
                          wallet.status === 'qr_code' ? 'QR CODE' :
                          'NOT INSTALLED'
                        }
                        size="small"
                        sx={{
                          backgroundColor: 
                            wallet.status === 'installed' ? '#10b981' :
                            wallet.status === 'qr_code' ? '#3b82f6' :
                            '#6b7280',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      />
                    </Box>
                  </ListItemButton>
                ))}
              </List>
              
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                p: 2,
                borderTop: isDarkTheme ? '1px solid #333' : '1px solid #e5e7eb',
                color: isDarkTheme ? '#999' : '#6b7280',
                fontSize: '0.875rem'
              }}>
                <Typography>⋯</Typography>
                <Typography>All Wallets</Typography>
                <Chip 
                  label="90+" 
                  size="small"
                  sx={{
                    backgroundColor: isDarkTheme ? '#333' : '#f3f4f6',
                    color: isDarkTheme ? '#999' : '#6b7280',
                    fontSize: '0.75rem'
                  }}
                />
              </Box>
            </DialogContent>
          </Dialog>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
