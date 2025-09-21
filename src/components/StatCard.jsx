import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  CircularProgress, 
  Button,
  Alert
} from '@mui/material';
import { Refresh } from '@mui/icons-material';

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  iconBg, 
  loading, 
  error, 
  onRetry 
}) => {
  // Common card styles
  const cardStyles = {
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(0, 255, 136, 0.3)',
    boxShadow: '0 0 20px rgba(0, 255, 136, 0.1)',
    height: '100%',
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
        background: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mr: 2
      }}>
        <Typography sx={{ color: 'white', fontWeight: 'bold' }}>{icon}</Typography>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
    </Box>
  );

  if (loading) {
    return (
      <Card sx={cardStyles}>
        <CardContent>
          <CardHeader />
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={40} sx={{ color: '#00ff88' }} />
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Loading...
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
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Alert severity="error" sx={{ backgroundColor: 'rgba(244, 67, 54, 0.1)', color: 'white' }}>
              Failed to load data
            </Alert>
            <Button 
              variant="contained" 
              startIcon={<Refresh />}
              onClick={onRetry}
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

  return (
    <Card sx={cardStyles}>
      <CardContent>
        <CardHeader />
        <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          color: '#00ff88', 
          mb: 1,
          textShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
        }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatCard;
