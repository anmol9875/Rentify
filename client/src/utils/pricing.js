export const SECURITY_DEPOSIT_PER_UNIT = 100

export const getTotalItemQuantity = (items = []) =>
  items.reduce((sum, item) => sum + Math.max(1, Number(item.quantity) || 1), 0)

export const getSecurityDeposit = (items = []) =>
  getTotalItemQuantity(items) * SECURITY_DEPOSIT_PER_UNIT
