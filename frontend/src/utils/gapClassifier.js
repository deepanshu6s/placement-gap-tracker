/**
 * Classifies skill gaps according to architecture specification Section 8
 * Formatted with warm charcoal-and-orange palette
 */
export const getGapCategory = (gap) => {
  if (gap <= 0) return 'none';
  if (gap <= 15) return 'small';
  if (gap <= 35) return 'medium';
  return 'critical';
};

export const getGapBadgeClass = (category, isAssessed = true) => {
  if (!isAssessed) {
    return 'bg-[#241B16] text-[#A3978D] border-[#34271F]';
  }
  switch (category) {
    case 'none':
      return 'bg-[#191512] text-[#F5F0EB] border-[#34271F]';
    case 'small':
      return 'bg-[#241B16] text-[#C3B7AD] border-[#34271F]';
    case 'medium':
      return 'bg-[#FFC857]/15 text-[#FFC857] border-[#FFC857]/30';
    case 'critical':
      return 'bg-[#FF526F]/15 text-[#FF526F] border-[#FF526F]/30';
    default:
      return 'bg-[#191512] text-[#C3B7AD] border-[#34271F]';
  }
};
