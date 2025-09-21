// Helper function to shorten wallet address
export const shortenAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Helper function to format number with commas
export const formatNumber = (num) => {
  if (!num || num === '0') return '0';
  return Number(num).toLocaleString();
};

// Helper function to format ZTC amount
export const formatZTC = (amount) => {
  if (!amount || amount === '0') return '0';
  return Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
};
