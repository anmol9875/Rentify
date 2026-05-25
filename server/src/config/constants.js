// Shared constants used throughout the server for collections, roles, and statuses.
export const DB_COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  RENTALS: 'rentals',
  DAMAGE_REPORTS: 'damageReports',
  TRANSACTIONS: 'transactions',
  WALLET_HISTORIES: 'walletHistories',
}

export const USER_ROLES = {
  BUYER: 'buyer',
  SELLER: 'seller',
}

export const RENTAL_STATUS = {
  ACTIVE: 'Active',
  UNDER_INSPECTION: 'Under Inspection',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  PENDING: 'Pending',
}

export const DAMAGE_SEVERITY = {
  MINOR: 'Minor',
  MAJOR: 'Major',
  CRITICAL: 'Critical',
  NO_DAMAGE: 'No Damage',
}

export const TRANSACTION_TYPES = {
  RENTAL: 'rental',
  REFUND: 'refund',
  SECURITY_DEPOSIT: 'security_deposit',
  PENALTY: 'penalty',
  WITHDRAWAL: 'withdrawal',
}

export const SECURITY_DEPOSIT = 100 // USD
export const TAX_PERCENTAGE = 0.1 // 10%
export const RENTAL_DURATION = 5 // days
