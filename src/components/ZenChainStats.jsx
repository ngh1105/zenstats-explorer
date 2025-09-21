import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  CircularProgress, 
  Alert,
  Button
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import axios from 'axios';

const ZenChainStats = () => {
  const [stats, setStats] = useState({
    avgBlockTime: '15.2s',
    avgGasPrice: '43.9',
    activeAddresses: '5,721'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hàm format có dấu phẩy
  const formatNumber = (num) => {
    if (!num && num !== 0) return "0";
    return Number(num).toLocaleString("en-US");
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching ZenChain stats from ZenTrace API...');
      const response = await axios.get('https://zentrace.io/api/v2/stats', {
        timeout: 10000,
        headers: {
          'User-Agent': 'ZenStats-Explorer/1.0'
        }
      });

      const data = response.data;
      console.log('✅ ZenTrace API response received:', data);

      // Trích xuất dữ liệu theo yêu cầu
      const newStats = {
        avgBlockTime: data.average_block_time ? 
          (data.average_block_time / 1000).toFixed(1) + 's' : '15.2s',
        avgGasPrice: data.gas_prices?.average ? 
          data.gas_prices.average.toString() : '43.9',
        activeAddresses: data.total_addresses ? 
          formatNumber(data.total_addresses) : '5,721'
      };

      console.log('📊 Stats processed:', newStats);
      setStats(newStats);

    } catch (err) {
      console.error('❌ Error fetching stats:', err.message);
      setError(err.message);
      
      // Giữ dữ liệu mặc định nếu API fail
      setStats({
        avgBlockTime: '15.2s',
        avgGasPrice: '43.9', 
        activeAddresses: formatNumber(5721)
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRetry = () => {
    fetchStats();
  };

  return {
    stats,
    loading,
    error,
    handleRetry
  };
};

export default ZenChainStats;
