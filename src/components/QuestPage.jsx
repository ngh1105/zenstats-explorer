import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Grid,
  Container,
  Chip,
  Avatar
} from '@mui/material';
import { 
  Send, 
  Code, 
  Star,
  ArrowForward,
  Rocket
} from '@mui/icons-material';

const QuestPage = ({ onNavigate }) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const questCards = [
    {
      id: 'send-token',
      title: 'Send Token',
      description: 'Transfer ZTC to another wallet',
      icon: <Send sx={{ fontSize: 40, color: '#00ff88' }} />,
      route: '/quest/send-token',
      xp: 250,
      difficulty: 'Easy',
      color: '#00ff88',
      gradient: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 191, 255, 0.1) 100%)'
    },
    {
      id: 'deploy-contract',
      title: 'Deploy Contract',
      description: 'Deploy a simple smart contract to earn XP',
      icon: <Code sx={{ fontSize: 40, color: '#00bfff' }} />,
      route: '/quest/deploy',
      xp: 500,
      difficulty: 'Advanced',
      color: '#00bfff',
      gradient: 'linear-gradient(135deg, rgba(0, 191, 255, 0.1) 0%, rgba(138, 92, 246, 0.1) 100%)'
    }
  ];

  const handleStartQuest = (route) => {
    // Navigate using the provided onNavigate function
    if (onNavigate) {
      onNavigate(route);
    }
    
    // Store quest start in localStorage
    const questHistory = JSON.parse(localStorage.getItem('zenstats:questHistory') || '[]');
    const questData = {
      route,
      startedAt: Date.now(),
      status: 'started'
    };
    questHistory.unshift(questData);
    localStorage.setItem('zenstats:questHistory', JSON.stringify(questHistory.slice(0, 50)));
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ 
              bgcolor: 'transparent',
              width: 60, 
              height: 60,
              background: 'linear-gradient(135deg, #00ff88, #00bfff)',
              fontSize: '2rem'
            }}>
              🎯
            </Avatar>
          </Box>
          <Typography variant="h3" sx={{ 
            fontWeight: 700, 
            color: '#00ff88',
            textShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
            mb: 2
          }}>
            Quest Hub
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Complete quests to earn XP and learn about ZenChain. Start your blockchain journey today!
          </Typography>
        </Box>

        {/* Quest Cards - Responsive Grid Layout */}
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'center',
          mb: 6
        }}>
          <Grid 
            container 
            spacing={4} 
            sx={{ 
              maxWidth: '1000px',
              justifyContent: 'center'
            }}
          >
            {questCards.map((quest) => (
              <Grid 
                item 
                xs={12} 
                md={6} 
                key={quest.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <Card
                  onMouseEnter={() => setHoveredCard(quest.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  sx={{
                    width: '100%',
                    maxWidth: { xs: '100%', md: '400px' },
                    minHeight: '320px',
                    background: hoveredCard === quest.id 
                      ? quest.gradient
                      : 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: hoveredCard === quest.id 
                      ? `2px solid ${quest.color}`
                      : '1px solid rgba(0, 255, 136, 0.3)',
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: hoveredCard === quest.id 
                      ? 'translateY(-8px) scale(1.05)' 
                      : 'translateY(0) scale(1)',
                    boxShadow: hoveredCard === quest.id 
                      ? `0 25px 50px rgba(0, 0, 0, 0.4), 0 0 40px ${quest.color}60, inset 0 0 0 1px ${quest.color}40`
                      : '0 8px 32px rgba(0, 0, 0, 0.2)',
                    '&:hover': {
                      '& .quest-icon': {
                        transform: 'rotate(10deg) scale(1.15)',
                      },
                      '& .start-button': {
                        background: `linear-gradient(45deg, ${quest.color}, ${quest.color}cc)`,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${quest.color}50`,
                      }
                    }
                  }}
                >
                  <CardContent sx={{ 
                    p: 4, 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}>
                    {/* Top Badges */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      width: '100%',
                      mb: 3
                    }}>
                      <Chip 
                        label={quest.difficulty}
                        size="small"
                        sx={{
                          bgcolor: quest.difficulty === 'Easy' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: quest.difficulty === 'Easy' ? '#22c55e' : '#ef4444',
                          border: `1px solid ${quest.difficulty === 'Easy' ? '#22c55e40' : '#ef444440'}`,
                          fontWeight: 600
                        }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Star sx={{ fontSize: 16, color: '#fbbf24' }} />
                        <Typography variant="caption" sx={{ color: '#fbbf24', fontWeight: 600 }}>
                          {quest.xp} XP
                        </Typography>
                      </Box>
                    </Box>

                    {/* Icon */}
                    <Box 
                      className="quest-icon"
                      sx={{ 
                        p: 3, 
                        borderRadius: 3,
                        background: `${quest.color}20`,
                        border: `2px solid ${quest.color}40`,
                        transition: 'transform 0.3s ease',
                        mb: 3
                      }}
                    >
                      {quest.icon}
                    </Box>

                    {/* Content - Centered */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', mb: 3 }}>
                      <Typography variant="h5" sx={{ 
                        fontWeight: 700, 
                        color: 'white',
                        mb: 2,
                        textAlign: 'center'
                      }}>
                        {quest.title}
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)',
                        lineHeight: 1.6,
                        textAlign: 'center',
                        maxWidth: '280px',
                        mx: 'auto'
                      }}>
                        {quest.description}
                      </Typography>
                    </Box>

                    {/* Action Button */}
                    <Button
                      className="start-button"
                      variant="contained"
                      size="large"
                      endIcon={<ArrowForward />}
                      onClick={() => handleStartQuest(quest.route)}
                      sx={{
                        width: '100%',
                        maxWidth: '200px',
                        background: `linear-gradient(45deg, ${quest.color}80, ${quest.color}60)`,
                        border: `1px solid ${quest.color}`,
                        color: 'white',
                        fontWeight: 600,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: `linear-gradient(45deg, ${quest.color}, ${quest.color}cc)`,
                          boxShadow: `0 8px 25px ${quest.color}40`,
                        }
                      }}
                    >
                      Start Quest
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Quest Stats - Centered Bottom Section */}
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'center',
          px: 2
        }}>
          <Box sx={{ 
            textAlign: 'center', 
            p: { xs: 3, md: 5 }, 
            maxWidth: '800px',
            width: '100%',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 255, 136, 0.2)',
            borderRadius: 3,
            mx: 'auto'
          }}>
            <Typography variant="h5" sx={{ 
              color: '#00ff88', 
              mb: 3, 
              fontWeight: 700,
              textShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
            }}>
              🚀 Ready to Start Your Journey?
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ 
              mb: 4, 
              maxWidth: '600px', 
              mx: 'auto',
              lineHeight: 1.7,
              fontSize: '1.1rem'
            }}>
              Complete quests to earn XP, learn about blockchain technology, and become a ZenChain expert. 
              Each quest teaches you something new while rewarding your progress.
            </Typography>
            
            {/* Stats Grid - Centered */}
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Grid container spacing={3} sx={{ maxWidth: '500px', justifyContent: 'center' }}>
                <Grid item xs={4}>
                  <Box sx={{ 
                    p: 2,
                    borderRadius: 2,
                    background: 'rgba(0, 255, 136, 0.1)',
                    border: '1px solid rgba(0, 255, 136, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 8px 25px rgba(0, 255, 136, 0.2)'
                    }
                  }}>
                    <Typography variant="h3" sx={{ 
                      color: '#00ff88', 
                      fontWeight: 700,
                      textShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
                    }}>
                      2
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Available Quests
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={4}>
                  <Box sx={{ 
                    p: 2,
                    borderRadius: 2,
                    background: 'rgba(0, 191, 255, 0.1)',
                    border: '1px solid rgba(0, 191, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 8px 25px rgba(0, 191, 255, 0.2)'
                    }
                  }}>
                    <Typography variant="h3" sx={{ 
                      color: '#00bfff', 
                      fontWeight: 700,
                      textShadow: '0 0 10px rgba(0, 191, 255, 0.5)'
                    }}>
                      750
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Total XP
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={4}>
                  <Box sx={{ 
                    p: 2,
                    borderRadius: 2,
                    background: 'rgba(251, 191, 36, 0.1)',
                    border: '1px solid rgba(251, 191, 36, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 8px 25px rgba(251, 191, 36, 0.2)'
                    }
                  }}>
                    <Typography variant="h3" sx={{ 
                      color: '#fbbf24', 
                      fontWeight: 700,
                      textShadow: '0 0 10px rgba(251, 191, 36, 0.5)'
                    }}>
                      ∞
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Learning
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default QuestPage;
