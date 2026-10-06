export const formatPercentage = (val) => {
  if (val === null || val === undefined) return 'N/A';
  return `${Number(val).toFixed(1)}%`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
