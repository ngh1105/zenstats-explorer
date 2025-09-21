import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatCard from './StatCard';

const TotalAddresses = () => {
  const [totalAddr, setTotalAddr] = useState("Loading...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "0";
    return Number(num).toLocaleString("en-US");
  };

  const fetchTotalAddresses = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('https://zentrace.io/api/v2/stats');
      const stats = response.data;
      
      if (stats?.total_addresses) {
        setTotalAddr(formatNumber(Number(stats.total_addresses)));
      } else {
        setTotalAddr("0");
      }
    } catch (err) {
      console.error('Error fetching total addresses:', err);
      setError(err.message || 'Failed to fetch total addresses');
      setTotalAddr("Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTotalAddresses();
  }, []);

  return (
    <StatCard
      title="Total Addresses"
      value={totalAddr}
      subtitle="ZenChain All-Time Addresses"
      icon="👤"
      iconBg="linear-gradient(135deg, #8b5cf6, #7c3aed)"
      loading={loading}
      error={error}
      onRetry={fetchTotalAddresses}
    />
  );
};

export default TotalAddresses;