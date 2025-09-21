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
import { Refresh, LocalGasStation } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const GasFeeTrends = () => {
  const [gasData, setGasData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGasData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching gas data from API...');
      const response = await axios.get('https://zentrace.io/api/v2/stats');
      
      console.log('📊 Gas API response:', response.data);
      
      if (response.data && response.data.gas_prices) {
        const { gas_prices } = response.data;
        
        // Transform data for chart
        const chartData = [
          {
            type: 'Slow',
            value: gas_prices.slow || 0,
            gwei: `${gas_prices.slow || 0} Gwei`
          },
          {
            type: 'Average', 
            value: gas_prices.average || 0,
            gwei: `${gas_prices.average || 0} Gwei`
          },
          {
            type: 'Fast',
            value: gas_prices.fast || 0,
            gwei: `${gas_prices.fast || 0} Gwei`
          }
        ];
        
        setGasData(chartData);
      } else {
        setGasData([]);
      }
    } catch (err) {
      console.error('❌ Error fetching gas data:', err);
      setError(err.message || 'Failed to load gas fee trends');
      setGasData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGasData();
  }, []);

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{
          background: 'rgba(0, 0, 0, 0.9)',
          border: '1px solid #22c55e',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)'
        }}>
          <Typography sx={{ 
            color: '#22c55e', 
            fontWeight: 600,
            fontSize: '14px'
          }}>
            {`${label}: ${payload[0].value} Gwei`}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Common card styles
  const cardStyles = {
    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(20, 20, 20, 0.8) 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid #22c55e',
    boxShadow: '0 0 20px rgba(34, 197, 94, 0.2)',
    height: '400px',
    width: '100%',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'scale(1.05)',
      border: '2px solid #22c55e',
      boxShadow: '0 0 30px rgba(34, 197, 94, 0.4)',
    }
  };

  // Common header component
  const CardHeader = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box sx={{ 
        width: 40, 
        height: 40, 
        borderRadius: 2, 
        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mr: 2,
        boxShadow: '0 0 15px rgba(34, 197, 94, 0.3)'
      }}>
        <LocalGasStation sx={{ color: 'white', fontSize: 20 }} />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
        Gas Fee Trends
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
            <CircularProgress size={40} sx={{ color: '#22c55e' }} />
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Loading gas trends...
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
            <Alert severity="error" sx={{ 
              backgroundColor: 'rgba(244, 67, 54, 0.1)', 
              color: 'white',
              border: '1px solid rgba(244, 67, 54, 0.3)'
            }}>
              Failed to load gas fee trends
            </Alert>
            <Button 
              variant="contained" 
              startIcon={<Refresh />}
              onClick={fetchGasData}
              sx={{
                background: 'linear-gradient(45deg, #22c55e, #16a34a)',
                color: 'white',
                fontWeight: 600,
                '&:hover': { 
                  transform: 'scale(1.05)',
                  boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)'
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

  if (!gasData || gasData.length === 0) {
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
              No gas data available
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
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={gasData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255, 255, 255, 0.1)" 
              />
              <XAxis 
                dataKey="type" 
                tick={{ 
                  fill: 'rgba(255, 255, 255, 0.7)', 
                  fontSize: 12,
                  fontWeight: 600
                }}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
                tickLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
              />
              <YAxis 
                tick={{ 
                  fill: 'rgba(255, 255, 255, 0.7)', 
                  fontSize: 12 
                }}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
                tickLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
                label={{ 
                  value: 'Gwei', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { 
                    textAnchor: 'middle',
                    fill: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '12px'
                  }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ 
                  fill: '#22c55e', 
                  stroke: '#22c55e', 
                  strokeWidth: 2,
                  r: 6,
                  filter: 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.6))'
                }}
                activeDot={{ 
                  r: 8, 
                  fill: '#22c55e',
                  stroke: '#22c55e',
                  strokeWidth: 2,
                  filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.8))'
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GasFeeTrends;
