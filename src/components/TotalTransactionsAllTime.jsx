import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatCard from './StatCard';

const TotalTransactionsAllTime = () => {
  const [totalTx, setTotalTx] = useState("Loading...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "0";
    return Number(num).toLocaleString("en-US");
  };

  const fetchTotalTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('https://zentrace.io/api/v2/stats');
      const stats = response.data;
      
      if (stats?.total_transactions) {
        setTotalTx(formatNumber(Number(stats.total_transactions)));
      } else {
        setTotalTx("0");
      }
    } catch (err) {
      console.error('Error fetching total transactions:', err);
      setError(err.message || 'Failed to fetch total transactions');
      setTotalTx("Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTotalTransactions();
  }, []);

  return (
    <StatCard
      title="Total Transactions"
      value={totalTx}
      subtitle="ZenChain All-Time Total"
      icon="📈"
      iconBg="linear-gradient(135deg, #10b981, #059669)"
      loading={loading}
      error={error}
      onRetry={fetchTotalTransactions}
    />
  );
};

export default TotalTransactionsAllTime;