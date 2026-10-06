/**
 * Classifies skill gaps according to architecture specification Section 8
 */
export const getGapCategory = (gap) => {
  if (gap <= 0) return 'none';
  if (gap <= 15) return 'small';
  if (gap <= 35) return 'medium';
  return 'critical';
};

export const getGapBadgeClass = (category, isAssessed = true) => {
  if (!isAssessed) {
    return 'bg-slate-700 text-slate-300 border-slate-600';
  }
  switch (category) {
    case 'none':
      return 'bg-emerald-950 text-emerald-400 border-emerald-800';
    case 'small':
      return 'bg-blue-950 text-blue-400 border-blue-800';
    case 'medium':
      return 'bg-amber-950 text-amber-400 border-amber-800';
    case 'critical':
      return 'bg-rose-950 text-rose-400 border-rose-800';
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700';
  }
};
