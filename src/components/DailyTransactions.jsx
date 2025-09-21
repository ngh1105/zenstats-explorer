import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, Box, Typography, Button, CircularProgress } from '@mui/material';
import { ShowChart } from '@mui/icons-material';
import axios from 'axios';
import '../App.css';

const DailyTransactions = () => {
  const [chartData, setChartData] = useState([]);
  const [latestDayTransactions, setLatestDayTransactions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactionData();
  }, []);

  const fetchTransactionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try API first
      try {
        const response = await axios.get('https://zentrace.io/api/v2/stats/charts/transactions');
        
        if (response.data && response.data.chart_data) {
          const mappedData = response.data.chart_data.map(item => ({
            date: item.date,
            transactions: item.tx_count
          }));
          
          // Reverse the data to show oldest to newest (Aug 20 -> Sep 19)
          const reversedData = mappedData.reverse();
          setChartData(reversedData);
          
          if (reversedData.length > 0) {
            const latestDay = reversedData[reversedData.length - 1];
            setLatestDayTransactions(latestDay.transactions);
          }
        } else {
          throw new Error('No chart_data in response');
        }
      } catch (apiError) {
        console.log('API failed, using mock data:', apiError.message);
        // Fallback to mock data
        const mockData = Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          transactions: Math.floor(Math.random() * 1000) + 500
        }));
        
        // Reverse mock data to show oldest to newest
        const reversedMockData = mockData.reverse();
        setChartData(reversedMockData);
        setLatestDayTransactions(reversedMockData[reversedMockData.length - 1].transactions);
      }
    } catch (err) {
      console.error('Error fetching transaction data:', err);
      setError('Failed to load transaction data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          border: '1px solid #00ff88',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <Typography sx={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            fontSize: '14px',
            mb: 0.5
          }}>
            {`Date: ${formatDate(label)}`}
          </Typography>
          <Typography sx={{ 
            color: '#00ff88', 
            fontWeight: '600',
            fontSize: '16px',
            textShadow: '0 0 5px rgba(0, 255, 136, 0.5)'
          }}>
            {`Transactions: ${payload[0].value.toLocaleString()}`}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card sx={{ 
        background: 'rgba(16, 185, 129, 0.08)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        height: '400px'
      }}>
        <CardHeader
          avatar={<ShowChart color="primary" />}
          title="Daily ZTC Transactions"
          subheader="ZTC transaction volume over the last 30 days"
        />
        <CardContent sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: 280 
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 2 
          }}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary">
              Loading transaction data...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ 
        background: 'rgba(16, 185, 129, 0.08)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        height: '400px'
      }}>
        <CardHeader
          avatar={<ShowChart color="primary" />}
          title="Daily ZTC Transactions"
          subheader="ZTC transaction volume over the last 30 days"
        />
        <CardContent sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: 280 
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Button 
              onClick={fetchTransactionData}
              variant="contained"
              color="primary"
              sx={{
                backgroundColor: '#059669',
                '&:hover': {
                  backgroundColor: '#047857'
                }
              }}
            >
              Retry
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ 
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(0, 255, 136, 0.3)',
      boxShadow: '0 0 20px rgba(0, 255, 136, 0.1)',
      height: '500px',
      borderRadius: 3,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'scale(1.05)',
        border: '1px solid #00ff88',
        boxShadow: '0 0 25px rgba(0, 255, 136, 0.6), 0 4px 20px rgba(0, 255, 136, 0.3)',
      }
    }}>
      <CardHeader
        avatar={<ShowChart color="primary" />}
        title="Daily ZTC Transactions"
        subheader="ZTC transaction volume over the last 30 days"
      />
      <CardContent sx={{ height: 380, position: 'relative' }}>
        {/* Header with latest day transactions */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3 
        }}>
          <Box>
            <Typography variant="h3" sx={{ 
              fontWeight: 700, 
              color: '#00ff88', // Neon green
              fontSize: '2.5rem',
              textShadow: '0 0 10px rgba(0, 255, 136, 0.3)',
              mb: 1
            }}>
              {formatNumber(latestDayTransactions)}
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.875rem'
            }}>
              Latest day transactions
            </Typography>
          </Box>
        </Box>

        {/* Chart */}
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.8}/>
                  <stop offset="50%" stopColor="#00ff88" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0.05}/>
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 11 }}
                tickFormatter={formatDate}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
              />
              <YAxis 
                tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="transactions"
                stroke="#00ff88"
                strokeWidth={3}
                fill="url(#colorTransactions)"
                filter="url(#glow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>

      </CardContent>
    </Card>
  );
};

export default DailyTransactions;