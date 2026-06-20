/**
 * Format currency to Indonesian Rupiah
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format number with thousand separators
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('id-ID').format(value);
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Calculate margin percentage
 */
export const calculateMarginPercentage = (sellingPrice: number, cogs: number): number => {
  if (sellingPrice === 0) return 0;
  return ((sellingPrice - cogs) / sellingPrice) * 100;
};

/**
 * Calculate profit
 */
export const calculateProfit = (sellingPrice: number, cogs: number): number => {
  return sellingPrice - cogs;
};

/**
 * Calculate suggested price for target margin
 */
export const calculateSuggestedPrice = (cogs: number, targetMargin: number): number => {
  if (targetMargin >= 100) return 0;
  return cogs / (1 - targetMargin / 100);
};

/**
 * Generate transaction number
 */
export const generateTransactionNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `TRX${year}${month}${day}${random}`;
};

/**
 * Generate unique ID
 */
export const generateId = (prefix: string = ''): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
};

/**
 * Check if margin is below target
 */
export const isBelowTargetMargin = (
  actualMargin: number,
  targetMargin: number
): boolean => {
  return actualMargin < targetMargin;
};
